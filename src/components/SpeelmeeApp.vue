<template>
  <v-app>  
    <v-main>
      <AppBar :is-authenticated="state.isAuthenticated" :withActivator=true @logout-app="returnToLogin" @reset-app="resetApp" @show-alias-info="showAliasInfo" />
      <v-row>
        <v-col cols="auto">
          <h2 v-if="state.loginErrorMsg !== undefined" class="py-4">Er is een fout opgetreden. Fout: {{ state.loginErrorMsg }}</h2>
        </v-col>
      </v-row>
      <v-row v-if="state.isInitDone" class="d-flex justify-center">
        <v-col cols="auto">
          <template v-if="!nowPlaying && state.showAliasInfoActive">
            <ShowCelebrity @return-to="state.showAliasInfoActive = false" />
          </template>
          <MaastrichtStories v-else-if="state.isAuthenticated" />
          <template v-else>
            <NewUser v-if="state.userEntryMode === 'login'" :aliases-in-use-incl-admin="aliasesInUseInclAdmin()" @change-to-signin="switchToSignin" @change-to-signup="switchToSignup"
              @exit-signin="resetApp" />
            <!-- Sign up a new user -->
            <SelectAlias v-if="state.userEntryMode === 'signup'" :aliases-not-in-use="state.aliasesNotInUse" @alias-selected="doCreateUser" @reset-signup="returnToLogin" />
            <!-- Sign in an existing user -->
            <SigninUser v-if="state.userEntryMode === 'signin'" :aliases-in-use-incl-admin="aliasesInUseInclAdmin()" :isCelebrity="state.isCelebrity" @signin-completed="continueSignup" @exit-signup="returnToLogin" />
          </template>         
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script setup>
import { onBeforeMount, reactive, computed } from 'vue'
import { useAppStore } from '../store/app.js'
import SelectAlias from './SelectAlias.vue'
import Cookies from 'universal-cookie'
import SigninUser from './SigninUser.vue'
import NewUser from './NewUser.vue'
import { db, dbRef } from '../firebase'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { child, get, ref, set, update } from "firebase/database"
import MaastrichtStories from './MaastrichtStories.vue'
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
                    // save the login date/time
                    const updates = {}
                    updates['/users/' + store.firebaseUser.uid + '/lastLogin'] = Date.now()
                    update(dbRef, updates)
                  } else {
                    // no data available; cookie does not match user data in the database; remove cookie and start manual login or signup
                    cookies.remove('speelMee', { sameSite: true })
                  }
                  state.isInitDone = true
                }).catch((error) => {
                  console.error(`Reading child ${store.firebaseUser.uid} from database: error message = ` + error)
                })
              })
              .catch((error) => {
                console.error('Firebase auto-signin: error message = ' + error.message)
                // ToDo: log the error
                // no account available; cookie does not match an account in the database; remove cookie and start manual login or signup
                cookies.remove('speelMee', { sameSite: true })
              })
          } else {
            // no cookie available; manual login or signup needed
            state.isInitDone = true
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
  isInitDone: false,
  isAuthenticated: false,
  alert: false,
  userEntryMode: 'login',
  aliasesNotInUse: [],
  aliasesInUse: [],
  isCelebrity: false,
  maastrichtStoriesActive: false,
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

function showAliasInfo() {
  store.screenName = 'Scuilnaam info'
  state.showAliasInfoActive = true
}

function doGame(game) {
  state.maastrichtStoriesActive = true
}

function returnToLogin() {
  store.userData = {}
  state.userEntryMode = 'login'
  state.maastrichtStoriesActive = false
  if (state.isAuthenticated) {
    signOut(auth).then(() => {
      state.isAuthenticated = false
    }).catch((error) => {
      console.error('signOut: An error happened: ' + error.message)
    })
  }
}

function switchToSignin() {
  store.userData = {}
  state.userEntryMode = 'signin'
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function switchToSignup() {
  store.userData = {}
  store.userData.PIN = getRandomInt(10000, 99999).toString()
  state.userEntryMode = 'signup'
}

function continueSignup() {
  state.isAuthenticated = true
}

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

function doCreateUser(alias) {
  store.userData.alias = alias
  const fakeEmail = replaceSpacesForHyphen(store.userData.alias) + '@speelmee.app'
  const fakePassword = (Number(store.userData.PIN + store.userData.PIN) * 7).toString()
  const auth = getAuth()
  createUserWithEmailAndPassword(auth, fakeEmail, fakePassword)
    .then((userCredential) => {
      // signed in as user
      store.firebaseUser = userCredential.user
      const now = Date.now()
      // create user data and store in database
      store.userData.lastLogin = now
      set(ref(db, 'users/' + store.firebaseUser.uid), store.userData)
      // set this alias as in use
      const updates = {}
      updates['aliases/' + store.userData.alias + '/inUse'] = true
      update(dbRef, updates)
      // set cookie for auto-signin next time
      const cookies = new Cookies()
      cookies.set('speelMee', { alias: store.userData.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
      // remove from aliases not in use
      state.aliasesNotInUse = state.aliasesNotInUse.filter(a => a !== store.userData.alias)
      // add new alias to aliases in use
      state.aliasesInUse.push(store.userData.alias)
      state.isAuthenticated = true
    })
    .catch((error) => {
      state.onError = true
      state.firebaseError = error
      state.fbErrorContext = `Mogelijk heeft een andere speler deze schuilnaam net gekozen. Kies een andere schuilnaam`
      console.log('doCreateUser: error = ' + error)
    })
}

function resetApp() {
  state.isAuthenticated = false
  // remove from aliases in use
  state.aliasesInUse = state.aliasesInUse.filter(a => a !== store.userData.alias)
  // add alias to aliases not in use
  state.aliasesNotInUse.push(store.userData.alias)
  store.userData = {}
  state.userEntryMode = 'login'
}
</script>