<template>
  <v-sheet max-width="640" width="100%">
    <v-container>
      <AppBar :is-authenticated="state.isAuthenticated" :user-alias="state.userData.alias" :PIN="state.userData.pinCode"
        :screen-name="state.screenName" :firebase-user="state.firebaseUser" @logout-app="returnToLogin" @reset-app="resetApp"
        @app-settings="doAppSettings" />
      <template v-if="state.loginErrorMsg !== undefined">
        <div class="py-4" />
        <h2>Er is een fout opgetreden. Fout: {{ state.loginErrorMsg }}</h2>
      </template>
      <div v-if="!nowPlaying && !nowOther">
        <div v-if="state.isAuthenticated">
          <MainMenu :last-login="state.userData.lastLogin" @menu-item-selected="doGame"></MainMenu>
        </div>
        <div v-else>
          <Speelmee :show-opening-screen="state.showOpeningScreen" @exit-opening-screen="loginOrSignIn" />
          <v-row class="d-flex align-center justify-center">
            <v-col cols="auto">
              <v-card variant="text">
                <template v-if="state.userEntryMode === 'login'">
                  <SigninUser :assigned-user-ids="state.assignedUserIds" @signin-completed="finishSignin"
                    @change-to-signup="switchToSignup" />
                </template>
                <template v-if="state.userEntryMode === 'signup'">
                  <template v-if="state.userData.alias === undefined">
                    <SelectAlias :assigned-user-ids="state.assignedUserIds" :all-aliases="state.allAliases" :alias-occupied="state.alert"
                      @alias-clicked="aliasClicked" @alias-selected="setSelectedAlias" @reset-signup="returnToLogin">
                    </SelectAlias>
                    <v-alert v-model="state.alert" border="start" variant="tonal" type="warning" title="Schuilnaam bezet">
                      Deze schuilnaam is al gekozen door een andere gebruiker. Kies een andere schuilnaam.
                    </v-alert>
                  </template>
                  <template v-else>
                    <div class="py-2" />
                    <SignupUser :userId="userId()" :alias="state.userData.alias" @signup-completed="finishSignup"
                      @exit-signup="returnToLogin" />
                  </template>
                </template>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
      <div else>
        <template v-if="state.maastrichtStoriesActive">
          <MaastrichtStories :user-id="userId()" :alias="state.userData.alias" @return-to-menu="showMenu"></MaastrichtStories>
        </template>
        <template v-if="state.userSettingsActive">
          <AppSettings :userId="userId()" @return-to-menu="showMenu"></AppSettings>
        </template>
      </div>
    </v-container>
  </v-sheet>
</template>

<script setup>
import { onBeforeMount, reactive, computed, watch } from 'vue'
import Speelmee from './Speelmee.vue'
import SelectAlias from './SelectAlias.vue'
import Cookies from 'universal-cookie'
import MainMenu from './MainMenu.vue'
import SignupUser from './SignupUser.vue'
import SigninUser from './SigninUser.vue'
import { dbRef } from '../firebase'
import { child, get, update } from "firebase/database"
import MaastrichtStories from './MaastrichtStories.vue'
import AppSettings from './AppSettings.vue'
import { getAuth, signInWithEmailAndPassword, signOut, fetchSignInMethodsForEmail } from "firebase/auth"

const auth = getAuth()

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
          state.allAliases = snapshot.val()
        } else {
          console.log("No available aliases data available")
        }
        // get the allready assigned users
        get(child(dbRef, `users/`)).then((snapshot) => {
          if (snapshot.exists()) {
            // create the array with already assigned users
            Object.keys(snapshot.val()).forEach(el => state.assignedUserIds.push(el))
          } else {
            console.log("No assigned aliases data available")
          }
          signOut(auth).then(() => {
            // automatically signin from cookie, if set
            const cookies = new Cookies()
            const retrievedCookie = cookies.get('speelMee')
            if (retrievedCookie !== undefined) {
              const fakeEmail = retrievedCookie.alias + '@speelmee.app'
              const fakePassword = retrievedCookie.fpw
              signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
                .then((userCredential) => {
                  // Signed in as user
                  state.firebaseUser = userCredential.user
                  // get other user data from the database
                  get(child(dbRef, `users/` + retrievedCookie.user)).then((snapshot) => {
                    if (snapshot.exists()) {
                      state.userData = snapshot.val()
                      // the user is authenticated by having this cookie
                      state.isAuthenticated = true
                      // refresh cookie to maintain a year long subscription
                      cookies.remove('speelMee', { sameSite: true })
                      cookies.set('speelMee', { user: retrievedCookie.user, alias: retrievedCookie.alias, fpw: retrievedCookie.fpw }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
                      state.screenName = 'Menu'
                      // save the login date/time
                      const updates = {}
                      updates['/users/' + retrievedCookie.user + '/lastLogin'] = Date.now()
                      update(dbRef, updates)
                    } else {
                      // No data available; cookie does not match in the database; remove cookie and start manual login or signup
                      cookies.remove('speelMee', { sameSite: true })
                      state.showOpeningScreen = true
                      state.screenName = 'Welkom'
                    }
                  }).catch((error) => {
                    console.error(`Error while reading child ${retrievedCookie.user} from database: ` + error)
                  })
                })
                .catch((error) => {
                  console.log('Firebase auto-signin: errorCode = ' + error.code)
                  console.log('Firebase auto-signin: errorMessage = ' + error.message)
                  state.loginErrorMsg = error.message
                });
            } else {
              // no cookie available; manual login or signup needed
              state.showOpeningScreen = true
              state.screenName = 'Welkom'
            }
          }).catch((error) => {
            console.log('Firebase signOut: errorCode = ' + error.code)
            console.log('Firebase signOut: errorMessage = ' + error.message)
            state.loginErrorMsg = error.message
          })
        }).catch((error) => {
          console.error('Error while reading all assignedUserIds from database: ' + error)
        });
      }).catch((error) => {
        console.error('Error while reading all availablealiases from database: ' + error)
      });
    }).catch((error) => {
      state.loginErrorMsg = error.message
    })
})

const state = reactive({
  screenName: '',
  lastScreenName: '',
  isAuthenticated: false,
  firebaseUser: {},
  userData: {},
  showOpeningScreen: undefined,
  alert: false,
  userEntryMode: undefined,
  nameRules: [
    value => {
      if (state.assignedUserIds.includes(value.toUpperCase())) return true

      return 'Schuilnaam onbekend.'
    },
  ],
  pinRules: [
    value => {
      if (value) return true

      return 'Vul 4 of meer cijfers in.'
    },
    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value.length >= 4) return true

      return 'Vul minimaal 4 cijfers in.'
    },
  ],
  allAliases: [],
  assignedUserIds: [], // in uppercase
  maastrichtStoriesActive: false,
  userSettingsActive: false,
  loginErrorMsg: undefined
})

// returns true if any of the games is active
const nowPlaying = computed(() => {
  return state.maastrichtStoriesActive
})

// returns true if any other activity is active (not login or signin)
const nowOther = computed(() => {
  return state.userSettingsActive
})

// save the last screenName before changing
// See watching a getter in https://vuejs.org/api/reactivity-core.html#watch
watch(() => state.screenName, (oldVal, newVal) => {
  state.lastScreenName = oldVal
})

// convenience method to derive user id
function userId() {
  if (state.userData.alias === undefined) return undefined
  return state.userData.alias.toUpperCase()
}

function doAppSettings() {
  console.log('doAppSettings selected')
  state.screenName = 'Instellingen'
  state.userSettingsActive = true
}

function doGame(game) {
  state.screenName = 'Verhalen van Maastricht'
  state.maastrichtStoriesActive = true
}

function loginOrSignIn() {
  state.showOpeningScreen = false
  state.userEntryMode = 'login'
  state.screenName = 'Inloggen'
}

function returnToLogin() {
  if (state.isAuthenticated) {
    signOut(auth).then(() => {
      state.isAuthenticated = false
      state.userData.pinCode = ''
      state.userData.alias = undefined
      state.userEntryMode = 'login'
      state.screenName = state.lastScreenName
      console.log('Sign-out successful')
    }).catch((error) => {
      console.log('signOut: An error happened, error = ' + error)
    })
  } else {
    state.userData.pinCode = ''
    state.userData.alias = undefined
    state.userEntryMode = 'login'
    state.screenName = state.lastScreenName
  }
}

function switchToSignup() {
  state.userData.pinCode = ''
  state.userData.alias = undefined
  state.userEntryMode = 'signup'
  state.screenName = 'Aanmelden'
}

function finishSignin(alias, pin, userData, lastLogin) {
  state.userData.alias = alias
  state.userData.pinCode = pin
  state.firebaseUser = userData
  state.userData.lastLogin = lastLogin
  state.isAuthenticated = true
  state.screenName = state.lastScreenName
}

function finishSignup(alias, pin, firebaseUser, lastLogin) {
  state.userData.alias = alias
  state.userData.pinCode = pin
  state.firebaseUser = firebaseUser
  state.userData.lastLogin = lastLogin
  // add new alias to current array
  state.assignedUserIds.push(userId())

  state.isAuthenticated = true
  state.screenName = state.lastScreenName
}

// check for newly assigned aliases since login
async function aliasClicked(tmpAlias) {
  const tmpUserId = tmpAlias.toUpperCase()
  let signInMethods = await fetchSignInMethodsForEmail(auth, tmpAlias + '@speelmee.app')
  if (signInMethods.length > 0) {
    state.assignedUserIds.push(tmpUserId)
  }

  state.alert = state.assignedUserIds.includes(tmpUserId)
  if (state.alert) {
    state.screenName = 'Schuilnaam bezet'
  } else state.screenName = 'Schuilnaam geselecteerd'
}

function setSelectedAlias(alias) {
  if (alias === undefined) return
  if (!state.assignedUserIds.includes(alias.toUpperCase())) {
    state.userData.alias = alias
  }
}

function showMenu() {
  state.userSettingsActive = false
  state.maastrichtStoriesActive = false
  state.screenName = 'Menu'
}

function resetApp() {
  state.isAuthenticated = false
  // remove from assignedUserIds
  state.assignedUserIds = state.assignedUserIds.filter(a => a !== state.userData.alias.toUpperCase())
  state.userData.alias = undefined
  state.userData.pinCode = ''
  state.userEntryMode = undefined
  state.showOpeningScreen = true
  state.screenName = 'Welkom'
}
</script>