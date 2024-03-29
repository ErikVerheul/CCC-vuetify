<template>
  <v-app :max-width="store.screenWidth">
    <AppBar :is-authenticated="state.isAuthenticated" @logout-app="returnToLogin" @reset-app="resetApp" @app-settings="doAppSettings"
      @show-alias-info="showAliasInfo" />
    <v-main>
      <v-row class="d-flex justify-center">
        <v-col cols="auto">
          <template v-if="state.loginErrorMsg !== undefined">
            <h2 class="py-4">Er is een fout opgetreden. Fout: {{ state.loginErrorMsg }}</h2>
          </template>
          <div v-if="!nowPlaying && !nowOther">
            <div v-if="state.isAuthenticated">
              <MainMenu @menu-item-selected="doGame" />
            </div>
            <div v-else>
              <Speelmee v-if="state.showOpeningScreen" @exit-opening-screen="loginOrSignIn" />
              <template v-if="state.userEntryMode === 'login'">
                <SigninUser :aliases-in-use-incl-admin="aliasesInUseInclAdmin()" @signin-completed="finishSignin"
                  @change-to-signup="switchToSignup" @exit-signin="resetApp">
                </SigninUser>
              </template>
              <template v-if="state.userEntryMode === 'signup'">
                <template v-if="store.userData.alias === undefined">
                  <SelectAlias :aliases-not-in-use="state.aliasesNotInUse" @alias-selected="setSelectedAlias" @reset-signup="returnToLogin" />
                </template>
                <template v-else>
                  <template class="py-2" v-if="state.signupStep === 1">
                    <SignupUser :isCelebrity="state.isCelebrity" @signup-continue="continueSignup" @exit-signup="returnToLogin" />
                  </template>
                  <template v-if="state.signupStep === 2">
                    <SignupUser2 @signup-completed="finishSignup" @exit-signup="returnToLogin" />
                  </template>
                </template>
              </template>
            </div>
          </div>
          <div else>
            <MaastrichtStories v-if="state.maastrichtStoriesActive" @return-to-menu="showMenu" />
            <AppSettings v-if="state.userSettingsActive" @return-to-menu="showMenu" />
            <ShowCelebrity v-if="state.showAliasInfoActive" @return-to="showMenu"></ShowCelebrity>
          </div>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script setup>
import { onBeforeMount, reactive, computed } from 'vue'
import { useAppStore } from '../store/app.js'
import Speelmee from './Speelmee.vue'
import SelectAlias from './SelectAlias.vue'
import Cookies from 'universal-cookie'
import MainMenu from './MainMenu.vue'
import SignupUser from './SignupUser.vue'
import SignupUser2 from './SignupUser2.vue'
import SigninUser from './SigninUser.vue'
import { dbRef } from '../firebase'
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { child, get, update } from "firebase/database"
import MaastrichtStories from './MaastrichtStories.vue'
import AppSettings from './AppSettings.vue'
import ShowCelebrity from './ShowCelebrity.vue'


const auth = getAuth()
const store = useAppStore()

onBeforeMount(() => {
  // get the assigned aliases using system user credentials
  const sysEmail = 'system@speelmee.app'
  const sysPw = 'a7&tegV$ujd'

  // Signin as system first
  signInWithEmailAndPassword(auth, sysEmail, sysPw)
    .then(() => {
      // get all available aliases
      get(child(dbRef, `aliases/`)).then((snapshot) => {
        if (snapshot.exists()) {
          store.aliasesObject = snapshot.val()
          const allAliases = Object.keys(store.aliasesObject)
          // extract the aliases not in use
          state.aliasesNotInUse = allAliases.filter(el => !store.aliasesObject[el].inUse)
          // extract the aliases in use
          state.aliasesInUse = allAliases.filter(el => store.aliasesObject[el].inUse)
        } else {
          console.log("No aliases data available")
        }
        // sign-out from system id and sign-in user
        signOut(auth).then(() => {
          // automatically sign-in from cookie, if set
          const cookies = new Cookies()
          const retrievedCookie = cookies.get('speelMee')
          if (retrievedCookie !== undefined) {
            const fakeEmail = replaceSpacesForHyphen(retrievedCookie.alias) + '@speelmee.app'
            const fakePassword = retrievedCookie.fpw
            signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
              .then((userCredential) => {
                // signed in as user
                store.firebaseUser = userCredential.user
                // get other user data from the database
                get(child(dbRef, `users/` + store.firebaseUser.uid)).then((snapshot) => {
                  if (snapshot.exists()) {
                    store.userData = snapshot.val()
                    // the user is authenticated by having this cookie
                    state.isAuthenticated = true
                    // refresh cookie to maintain a year long subscription
                    cookies.remove('speelMee', { sameSite: true })
                    cookies.set('speelMee', { alias: retrievedCookie.alias, fpw: retrievedCookie.fpw }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
                    store.screenName = 'Menu'
                    // save the login date/time
                    const updates = {}
                    updates['/users/' + store.firebaseUser.uid + '/lastLogin'] = Date.now()
                    update(dbRef, updates)
                  } else {
                    // no data available; cookie does not match user data in the database; remove cookie and start manual login or signup
                    cookies.remove('speelMee', { sameSite: true })
                    state.showOpeningScreen = true
                    store.screenName = 'Welkom'
                  }
                }).catch((error) => {
                  console.error(`Reading child ${store.firebaseUser.uid} from database: error message = ` + error)
                })
              })
              .catch((error) => {
                console.error('Firebase auto-signin: error message = ' + error.message)
                // ToDo: log the error
                // no account available; cookie does not match an account in the database; remove cookie and start manual login or signup
                cookies.remove('speelMee', { sameSite: true })
                state.showOpeningScreen = true
                store.screenName = 'Welkom'
              })
          } else {
            // no cookie available; manual login or signup needed
            state.showOpeningScreen = true
            store.screenName = 'Welkom'
          }
        }).catch((error) => {
          console.error('Firebase signOut: error message = ' + error.message)
          state.loginErrorMsg = error.message
        })
      }).catch((error) => {
        console.error('Reading all available aliases from database: error message = ' + error.message)
      })
    }).catch((error) => {
      console.error('The system account could not login: error message = ' + error.message)
      state.loginErrorMsg = error.message
    })
})

const state = reactive({
  signupStep: 1,
  isAuthenticated: false,
  showOpeningScreen: undefined,
  alert: false,
  userEntryMode: undefined,
  aliasesNotInUse: [],
  aliasesInUse: [],
  isCelebrity: false,
  maastrichtStoriesActive: false,
  userSettingsActive: false,
  showAliasInfoActive: false,
  loginErrorMsg: undefined
})

function aliasesInUseInclAdmin() {
  // make a shallow copy
  const copy = [...state.aliasesInUse]
  copy.push('admin')
  return copy
}

// returns true if any of the games is active
const nowPlaying = computed(() => {
  return state.maastrichtStoriesActive
})

// returns true if any other activity is active (not login or signin)
const nowOther = computed(() => {
  return state.userSettingsActive || state.showAliasInfoActive
})

function doAppSettings() {
  store.screenName = 'Instellingen'
  state.userSettingsActive = true
}

function showAliasInfo() {
  store.screenName = 'Scuilnaam info'
  state.showAliasInfoActive = true
}

function doGame(game) {
  store.screenName = 'Verborgen verhalen van Maastricht'
  state.maastrichtStoriesActive = true
}

function loginOrSignIn() {
  state.showOpeningScreen = false
  state.userEntryMode = 'login'
  store.screenName = 'Inloggen'
}

function returnToLogin() {
  store.userData = {}
  state.userEntryMode = 'login'
  state.signupStep = 1
  store.screenName = 'Inloggen'
  state.maastrichtStoriesActive = false
  if (state.isAuthenticated) {
    signOut(auth).then(() => {
      state.isAuthenticated = false
    }).catch((error) => {
      console.error('signOut: An error happened: ' + error.message)
    })
  }
}

function switchToSignup() {
  store.userData = {}
  state.userEntryMode = 'signup'
  store.screenName = 'Aanmelden'
}

function finishSignin() {
  state.isAuthenticated = true
  store.screenName = 'Menu'
}

function continueSignup() {
  state.signupStep = 2
}

function finishSignup() {
  // remove from aliases not in use
  state.aliasesNotInUse = state.aliasesNotInUse.filter(a => a !== store.userData.alias)
  // add new alias to aliases in use
  state.aliasesInUse.push(store.userData.alias)
  // reset signup step
  state.signupStep = 1
  state.isAuthenticated = true
  store.screenName = 'Menu'
}

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

function setSelectedAlias(alias) {
  store.userData.alias = alias
}

function showMenu() {
  state.maastrichtStoriesActive = false
  state.userSettingsActive = false
  state.showAliasInfoActive = false
  store.screenName = 'Menu'
}

function resetApp() {
  state.isAuthenticated = false
  // remove from aliases in use
  state.aliasesInUse = state.aliasesInUse.filter(a => a !== store.userData.alias)
  // add alias to aliases not in use
  state.aliasesNotInUse.push(store.userData.alias)
  store.userData = {}
  state.userEntryMode = undefined
  state.showOpeningScreen = true
  store.screenName = 'Welkom'
}
</script>