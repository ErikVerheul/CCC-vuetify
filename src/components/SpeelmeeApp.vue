<template>
  <v-app max-width="414px">
    <AppBar :is-authenticated="state.isAuthenticated" :user-alias="state.userData.alias" :PIN="state.userData.pinCode"
      :screen-name="state.screenName" :firebase-user="state.firebaseUser" @logout-app="returnToLogin" @reset-app="resetApp"
      @app-settings="doAppSettings" />
    <v-main>
      <v-row class="d-flex justify-center">
        <v-col cols="auto">
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
              <template v-if="state.userEntryMode === 'login'">
                <SigninUser :aliases-in-use-incl-admin="aliasesInUseInclAdmin()" @signin-completed="finishSignin"
                  @change-to-signup="switchToSignup" @exit-signin="resetApp" />
              </template>
              <template v-if="state.userEntryMode === 'signup'">
                <template v-if="state.userData.alias === undefined">
                  <v-alert v-model="state.alert" border="start" variant="tonal" type="warning" title="Schuilnaam bezet">
                    Deze schuilnaam is al gekozen door een andere gebruiker. Kies een andere schuilnaam.
                  </v-alert>
                  <SelectAlias :aliases-in-use="state.aliasesInUse" :all-aliases="state.allAliases" :alias-occupied="state.alert"
                    @alias-clicked="aliasClicked" @alias-selected="setSelectedAlias" @reset-signup="returnToLogin">
                  </SelectAlias>
                </template>
                <template v-else>
                  <div class="py-2" />
                  <template v-if="state.signupStep === 1">
                    <SignupUser :alias="state.userData.alias" @signup-continue="continueSignup" @exit-signup="returnToLogin" />
                  </template>
                  <template v-if="state.signupStep === 2">
                    <SignupUser2 :userData="state.userData" @signup-completed="finishSignup" @exit-signup="returnToLogin" />
                  </template>
                </template>
              </template>
            </div>
          </div>
          <div else>
            <template v-if="state.maastrichtStoriesActive">
              <MaastrichtStories :user-id="state.userData.alias" :alias="state.userData.alias" @return-to-menu="showMenu">
              </MaastrichtStories>
            </template>
            <template v-if="state.userSettingsActive">
              <AppSettings :firebase-user="state.firebaseUser" :userAlias="state.userData.alias" @return-to-menu="showMenu"></AppSettings>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script setup>
import { onBeforeMount, reactive, computed, watch } from 'vue'
import Speelmee from './Speelmee.vue'
import SelectAlias from './SelectAlias.vue'
import Cookies from 'universal-cookie'
import MainMenu from './MainMenu.vue'
import SignupUser from './SignupUser.vue'
import SignupUser2 from './SignupUser2.vue'
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
      // const namen = ['Alain','Alberto','Aldo','Alessandro','Alexander','Alfred','Alice','Alla','Anastasiya','Anatoliy','Andre','Andrea','Andreas','Andrew','Andriy','Angelo','Anne','Anthony','Antonio','Armando','Arthur','Bartolomeo','Bas','Benedetto','Bernard','Bernd','Bernhard','Bjorn','Bohdan','Bram','Brian','Bruno','Carl','Carlo','Caroline','Cas','Catherine','Charles','Christian','Christine','Christopher','Claude','Claudio','Corinne','Corrado','Daan','Daniel','Daniele','David','Davide','Denis','Dennis','Dieter','Dirk','Dmytro','Domenico','Donald','Douglas','Dylan','Edward','Emanuele','Emiliano','Emilio','Emmanuel','Enrico','Eric','Erich','Ernst','Fabio','Fabrice','Federico','Filippo','Florence','Floris','Francesco','Frank','Franz','Frederic','Freek','Fritz','Gabriele','Gaetano','Gary','Georg','George','Gerard','Giacomo','Gianni','Gijs','Gilbert','Giorgio','Giovanni','Giuseppe','Gregory','Günter','Gustav','Halyna','Hanna','Hans','Hans-Peter','Harold','Heinz','Helmut','Hendrik','Henk','Henry','Hermann','Horst','Ihor','Ingo','Inna','Iryna','Isabelle','Ivan','Jacob','Jacques','James','Jan','Jarno','Jason','Jean','Jeffrey','Jelle','Jelte','Jerome','Jerry','Jesse','Joachim','Joep','Johannes','John','Joost','Joris','Jose','Josef','Joseph','Joshua','Julie','Jürgen','Karl','Kateryna','Kenneth','Kevin','Khrystyna','Klaas','Klaus','Kurt','Larry','Lars','Larysa','Laurence','Laurens','Lennard','Lothar','Luc','Luca','Lucas','Luciano','Luigi','Lyubov','Lyudmyla','Maarten','Manfred','Marc','Marcello','Marco','Marie','Mario','Mariya','Mark','Markus','Martijn','Martin','Martine','Mary','Maryna','Massimo','Matthew','Matthias','Matthijs','Max','Michael','Michel','Milan','Monique','Mykhailo','Mykola','Myroslav','Nadiya','Nataliya','Nathalie','Nicolas','Nicolo','Niels','Oksana','Oleh','Oleksandr','Oleksiy','Olha','Orest','Otto','Paolo','Patrick','Paul','Pavlo','Peter','Petro','Philippe','Pierre','Pieter','Pietro','Raffaele','Raymond','Reinhold','Riccardo','Richard','Robert','Roberto','Robin','Roger','Roland','Rolf','Roman','Ronald','Ruben','Rudolf','Ryan','Salvatore','Sam','Sandrine','Scott','Sebastien','Sem','Sergio','Serhiy','Simone','Sophie','Stefan','Stefano','Stepan','Stephane','Stephen','Steven','Stijn','Sven','Svitlana','Taras','Tetyana','Teun','Thijs','Thomas','Tim','Timothy','Tom','Tommaso','Uliana','Umberto','Uwe','Vasyl','Viktor','Viktoriya','Vincenzo','Virginie','Volker','Volodymyr','Walter','Werner','Willem','Willi','William','Wolfgang','Wouter','Xavier','Yana','Yevhen','Yosyp','Yuliana','Yuliya','Yuriy','Yves']
      // let newAliasObject = {}
      // for (const naam of namen) {
      //   newAliasObject[naam] = {
      //     "inUse": false
      //   }
      // }
      // console.log('newAliasObject = ' + JSON.stringify(newAliasObject, null, 2))

      // // save the data
      // const updates = {}
      // updates['aliases/'] = newAliasObject
      // update(dbRef, updates).then(() => {
      // }).catch((error) => {
      //   console.error('The write failed, error message = ' + error.message)
      // })

      // get all available aliases
      get(child(dbRef, `aliases/`)).then((snapshot) => {
        if (snapshot.exists()) {
          const aliasObject = snapshot.val()
          state.allAliases = Object.keys(aliasObject)
          // extract the aliases in use
          state.aliasesInUse = []
          state.allAliases.forEach(el => {
            if (aliasObject[el].inUse) state.aliasesInUse.push(el)
          })
        } else {
          console.log("No aliases data available")
        }
        signOut(auth).then(() => {
          // automatically signin from cookie, if set
          const cookies = new Cookies()
          const retrievedCookie = cookies.get('speelMee')
          if (retrievedCookie !== undefined) {
            const fakeEmail = replaceSpacesForHyphen(retrievedCookie.alias) + '@speelmee.app'
            const fakePassword = retrievedCookie.fpw
            signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
              .then((userCredential) => {
                // Signed in as user
                state.firebaseUser = userCredential.user
                // get other user data from the database
                get(child(dbRef, `users/` + state.firebaseUser.uid)).then((snapshot) => {
                  if (snapshot.exists()) {
                    state.userData = snapshot.val()
                    // the user is authenticated by having this cookie
                    state.isAuthenticated = true
                    // refresh cookie to maintain a year long subscription
                    cookies.remove('speelMee', { sameSite: true })
                    cookies.set('speelMee', { alias: retrievedCookie.alias, fpw: retrievedCookie.fpw }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
                    state.screenName = 'Menu'
                    // save the login date/time
                    const updates = {}
                    updates['/users/' + state.firebaseUser.uid + '/lastLogin'] = Date.now()
                    update(dbRef, updates)
                  } else {
                    // No data available; cookie does not match user data in the database; remove cookie and start manual login or signup
                    cookies.remove('speelMee', { sameSite: true })
                    state.showOpeningScreen = true
                    state.screenName = 'Welkom'
                  }
                }).catch((error) => {
                  console.error(`Reading child ${state.firebaseUser.uid} from database: error message = ` + error)
                })
              })
              .catch((error) => {
                console.error('Firebase auto-signin: error message = ' + error.message)
                // ToDo: log the error
                // no account available; cookie does not match an account in the database; remove cookie and start manual login or signup
                cookies.remove('speelMee', { sameSite: true })
                state.showOpeningScreen = true
                state.screenName = 'Welkom'
              })
          } else {
            console.log('No cookie found')
            // no cookie available; manual login or signup needed
            state.showOpeningScreen = true
            state.screenName = 'Welkom'
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
  screenName: '',
  lastScreenName: '',
  signupStep: 1,
  isAuthenticated: false,
  firebaseUser: {},
  userData: {},
  showOpeningScreen: undefined,
  alert: false,
  userEntryMode: undefined,
  allAliases: [],
  aliasesInUse: [],
  maastrichtStoriesActive: false,
  userSettingsActive: false,
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
  return state.userSettingsActive
})

// save the last screenName before changing
// See watching a getter in https://vuejs.org/api/reactivity-core.html#watch
watch(() => state.screenName, (oldVal) => {
  state.lastScreenName = oldVal
})

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
      console.log('Sign-out successful')
    }).catch((error) => {
      console.error('signOut: An error happened, error message = ' + error.message)
    })
  }
  state.userData.pinCode = ''
  state.userData.alias = undefined
  state.userEntryMode = 'login'
  state.signupStep = 1
  state.screenName = 'Inloggen'
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

function continueSignup(alias, pin) {
  state.userData.alias = alias
  state.userData.pinCode = pin
  state.signupStep = 2
}

function finishSignup(firebaseUser, lastLogin) {
  state.firebaseUser = firebaseUser
  state.userData.lastLogin = lastLogin
  // add new alias to current arrays
  state.aliasesInUse.push(state.userData.alias)
  // reset signup step
  state.signupStep = 1
  state.isAuthenticated = true
  state.screenName = state.lastScreenName
}

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

function isAliasInUse(alias) {
  for (const el of state.aliasesInUse) {
    if (el.toUpperCase() === alias.toUpperCase()) {
      return true
    }
  }
  return false
}

// check for newly assigned aliases since login
async function aliasClicked(aliasClicked) {
  let signInMethods = await fetchSignInMethodsForEmail(auth, replaceSpacesForHyphen(aliasClicked) + '@speelmee.app')
  if (signInMethods.length > 0) {
    state.aliasesInUse.push(aliasClicked)
  }
  state.alert = isAliasInUse(aliasClicked)
}

function setSelectedAlias(alias) {
  state.userData.alias = alias
}

function showMenu() {
  state.userSettingsActive = false
  state.maastrichtStoriesActive = false
  state.screenName = 'Menu'
}

function resetApp() {
  state.isAuthenticated = false
  // remove from aliasesInUse
  state.aliasesInUse = state.aliasesInUse.filter(a => a !== state.userData.alias)
  state.userData.alias = undefined
  state.userData.pinCode = ''
  state.userEntryMode = undefined
  state.showOpeningScreen = true
  state.screenName = 'Welkom'
}
</script>