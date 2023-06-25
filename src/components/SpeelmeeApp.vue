<template>
  <v-container>
    <v-responsive>
      <AppBar :is-authenticated="state.isAuthenticated" :user-name="state.alias" :PIN="state.PIN" :screen-name="state.screenName"
        :firebase-user="state.firebaseUser" @logout-app="returnToLogin" @reset-app="resetApp" @app-settings="doAppSettings" />

      <div v-if="!nowPlaying && !nowOther">
        <div v-if="state.isAuthenticated">
          <MainMenu :firebase-user="state.firebaseUser" @menu-item-selected="doGame"></MainMenu>
        </div>
        <div v-else>
          <Speelmee :show-opening-screen="state.showOpeningScreen" @exit-opening-screen="loginOrSignIn" />
          <v-row class="d-flex align-center justify-center">
            <v-col cols="auto">
              <v-card variant="text">
                <template v-if="state.userEntryMode === 'login'">
                  <SigninUser :assigned-user-ids="state.assignedUserIds" @signin-completed="finishSignin"
                    @change-to-signup="switchToSignup" @firebase-user="setFirebaseUser"/>
                </template>
                <template v-if="state.userEntryMode === 'signup'">
                  <template v-if="state.alias === undefined">
                    <SelectAlias :assigned-user-ids="state.assignedUserIds" :all-aliases="state.allAliases" @alias-clicked="aliasClicked"
                      @alias-selected="setSelectedAlias" @reset-signup="returnToLogin">
                    </SelectAlias>
                    <v-alert v-model="state.alert" border="start" variant="tonal" type="warning" title="Schuilnaam bezet">
                      Deze schuilnaam is al gekozen door een andere gebruiker. Kies een andere schuilnaam.
                    </v-alert>
                  </template>
                  <template v-else>
                    <div class="py-2" />
                    <SignupUser :userId="userId()" :alias="state.alias" @signup-completed="finishSignup" @exit-signup="returnToLogin" />
                  </template>
                </template>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
      <div else>
        <template v-if="state.maastrichtStoriesActive">
          <MaastrichtStories :user-id="userId()" :alias="state.alias" @return-to-menu="showMenu"></MaastrichtStories>
        </template>
        <template v-if="state.userSettingsActive">
          <AppSettings :userId="userId()" @return-to-menu="showMenu"></AppSettings>
        </template>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { onBeforeMount, reactive, computed } from 'vue'
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
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"

const auth = getAuth()

onBeforeMount(() => {
  // get the assigned aliases using system user credentials
  const sysEmail = 'system@speelmee.app'
  const sysPw = 'a7&tegV$ujd'

  // Do not remove: One time function to create sys user authorisation
  // createUserWithEmailAndPassword(auth, sysEmail, sysPw)
  //   .then((userCredential) => {
  //     // Signed in 
  //     const user = userCredential.user;
  //     // ...
  //     console.log('Create sys user: user = ' + JSON.stringify(user, null, 2))
  //     signOut(auth).then(() => {
  //       console.log('Sign-out successful')
  //     }).catch((error) => {
  //       console.log('signOut: An error happened, error = ' + error)
  //     });
  //   })
  //   .catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     console.log('Firebase signin: errorCode = ' + errorCode)
  //     console.log('Firebase signin: errorMessage = ' + errorMessage)
  //   });




  signInWithEmailAndPassword(auth, sysEmail, sysPw)
    .then((userCredential) => {
      // Signed in as system
      get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
          // create the array with already assigned users
          Object.keys(snapshot.val()).forEach(el => state.assignedUserIds.push(el))
        } else {
          console.log("No assigned aliases data available");
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
                console.log('state.firebaseUser.metadata.lastLoginAt = ' + state.firebaseUser.metadata.lastLoginAt)
                // get other user data from the database
                get(child(dbRef, `users/` + retrievedCookie.user)).then((snapshot) => {
                  if (snapshot.exists()) {
                    state.alias = snapshot.val().alias
                    state.PIN = snapshot.val().PIN
                    state.subscriptionDate = snapshot.val().subscriptionDate
                    // the user is authenticated by having this cookie
                    state.isAuthenticated = true
                    // refresh cookie to maintain a year long subscription
                    cookies.remove('speelMee', { sameSite: true })
                    cookies.set('speelMee', { user: retrievedCookie.user, alias: retrievedCookie.alias, fpw: retrievedCookie.fpw }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
                    state.screenName = 'Menu'
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
              });
          } else {
            // no cookie available; manual login or signup needed
            state.showOpeningScreen = true
            state.screenName = 'Welkom'
          }
        }).catch((error) => {
          console.log('Firebase signOut: errorCode = ' + error.code)
          console.log('Firebase signOut: errorMessage = ' + error.message)
        })
      }).catch((error) => {
        console.log('Sign-out system account: An error happened, error = ' + error)
      });
    }).catch((error) => {
      console.error('Error while reading all assignedUserIds from database: ' + error)
    })
})

function setFirebaseUser(userData) {
  state.firebaseUser = userData
} 

const state = reactive({
  screenName: '',
  isAuthenticated: false,
  firebaseUser: {},
  showOpeningScreen: undefined,
  alias: undefined,
  subscriptionDate: undefined,
  alert: false,
  userEntryMode: undefined,
  nameRules: [
    value => {
      if (state.assignedUserIds.includes(value.toUpperCase())) return true

      return 'Schuilnaam onbekend.'
    },
  ],
  PIN: '',
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
  allAliases: ['Alain', 'Alberto', 'Aldo', 'Alessandro', 'Alexander', 'Alfred', 'Alice', 'Alla', 'Anastasiya', 'Anatoliy', 'Andre', 'Andrea', 'Andreas', 'Andrew', 'Andriy', 'Angelo', 'Anne', 'Anthony', 'Antonio', 'Armando', 'Arthur', 'Bartolomeo', 'Bas', 'Benedetto', 'Bernard', 'Bernd', 'Bernhard', 'Bjorn', 'Bohdan', 'Bram', 'Brian', 'Bruno', 'Carl', 'Carlo', 'Caroline', 'Cas', 'Catherine', 'Charles', 'Christian', 'Christine', 'Christopher', 'Claude', 'Claudio', 'Corinne', 'Corrado', 'Daan', 'Daniel', 'Daniele', 'David', 'Davide', 'Denis', 'Dennis', 'Dieter', 'Dirk', 'Dmytro', 'Domenico', 'Donald', 'Douglas', 'Dylan', 'Edward', 'Emanuele', 'Emiliano', 'Emilio', 'Emmanuel', 'Enrico', 'Eric', 'Erich', 'Ernst', 'Fabio', 'Fabrice', 'Federico', 'Filippo', 'Florence', 'Floris', 'Francesco', 'Frank', 'Franz', 'Frederic', 'Freek', 'Fritz', 'Gabriele', 'Gaetano', 'Gary', 'Georg', 'George', 'Gerard', 'Giacomo', 'Gianni', 'Gijs', 'Gilbert', 'Giorgio', 'Giovanni', 'Giuseppe', 'Gregory', 'Günter', 'Gustav', 'Halyna', 'Hanna', 'Hans', 'Hans-Peter', 'Harold', 'Heinz', 'Helmut', 'Hendrik', 'Henk', 'Henry', 'Hermann', 'Horst', 'Ihor', 'Ingo', 'Inna', 'Iryna', 'Isabelle', 'Ivan', 'Jacob', 'Jacques', 'James', 'Jan', 'Jarno', 'Jason', 'Jean', 'Jeffrey', 'Jelle', 'Jelte', 'Jerome', 'Jerry', 'Jesse', 'Joachim', 'Joep', 'Johannes', 'John', 'Joost', 'Joris', 'Jose', 'Josef', 'Joseph', 'Joshua', 'Julie', 'Jürgen', 'Karl', 'Kateryna', 'Kenneth', 'Kevin', 'Khrystyna', 'Klaas', 'Klaus', 'Kurt', 'Larry', 'Lars', 'Larysa', 'Laurence', 'Laurens', 'Lennard', 'Lothar', 'Luc', 'Luca', 'Lucas', 'Luciano', 'Luigi', 'Lyubov', 'Lyudmyla', 'Maarten', 'Manfred', 'Marc', 'Marcello', 'Marco', 'Marie', 'Mario', 'Mariya', 'Mark', 'Markus', 'Martijn', 'Martin', 'Martine', 'Mary', 'Maryna', 'Massimo', 'Matthew', 'Matthias', 'Matthijs', 'Max', 'Michael', 'Michel', 'Milan', 'Monique', 'Mykhailo', 'Mykola', 'Myroslav', 'Nadiya', 'Nataliya', 'Nathalie', 'Nicolas', 'Nicolo', 'Niels', 'Oksana', 'Oleh', 'Oleksandr', 'Oleksiy', 'Olha', 'Orest', 'Otto', 'Paolo', 'Patrick', 'Paul', 'Pavlo', 'Peter', 'Petro', 'Philippe', 'Pierre', 'Pieter', 'Pietro', 'Raffaele', 'Raymond', 'Reinhold', 'Riccardo', 'Richard', 'Robert', 'Roberto', 'Robin', 'Roger', 'Roland', 'Rolf', 'Roman', 'Ronald', 'Ruben', 'Rudolf', 'Ryan', 'Salvatore', 'Sam', 'Sandrine', 'Scott', 'Sebastien', 'Sem', 'Sergio', 'Serhiy', 'Simone', 'Sophie', 'Stefan', 'Stefano', 'Stepan', 'Stephane', 'Stephen', 'Steven', 'Stijn', 'Sven', 'Svitlana', 'Taras', 'Tetyana', 'Teun', 'Thijs', 'Thomas', 'Tim', 'Timothy', 'Tom', 'Tommaso', 'Uliana', 'Umberto', 'Uwe', 'Vasyl', 'Viktor', 'Viktoriya', 'Vincenzo', 'Virginie', 'Volker', 'Volodymyr', 'Walter', 'Werner', 'Willem', 'Willi', 'William', 'Wolfgang', 'Wouter', 'Xavier', 'Yana', 'Yevhen', 'Yosyp', 'Yuliana', 'Yuliya', 'Yuriy', 'Yves'],
  assignedUserIds: [], // in uppercase
  maastrichtStoriesActive: false,
  userSettingsActive: false,
})

// returns true if any of the games is active
const nowPlaying = computed(() => {
  return state.maastrichtStoriesActive
})

// returns true if any other activity is active (not login or signin)
const nowOther = computed(() => {
  return state.userSettingsActive
})

// convenience method to derive user id
function userId() {
  if (state.alias === undefined) return undefined
  return state.alias.toUpperCase()
}

function doAppSettings() {
  console.log('doAppSettings selected')
  state.screenName = 'Instellingen'
  state.userSettingsActive = true
}

function doGame(game) {
  console.log('doeSpel = ' + game)
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
      state.PIN = ''
      state.alias = undefined
      state.userEntryMode = 'login'
      state.screenName = 'Inloggen'
      console.log('Sign-out successful')
    }).catch((error) => {
      console.log('signOut: An error happened, error = ' + error)
    })
  } else {
    state.PIN = ''
    state.alias = undefined
    state.userEntryMode = 'login'
    state.screenName = 'Inloggen'
  }
}

function switchToSignup() {
  state.PIN = ''
  state.alias = undefined
  state.userEntryMode = 'signup'
  state.screenName = 'Aanmelden'
}

function finishSignin(alias, pin) {
  state.alias = alias
  state.PIN = pin
  state.isAuthenticated = true
  state.screenName = 'Menu'
}

function finishSignup(alias, pin, firebaseUser) {
  state.alias = alias
  state.PIN = pin
  state.firebaseUser = firebaseUser
  // add new alias to current array
  state.assignedUserIds.push(userId())

  state.isAuthenticated = true
  state.screenName = 'Menu'
}

function aliasClicked(tmpAlias) {
  // check for newly assigned aliases since login
  const tmpUserId = tmpAlias.toUpperCase()
  get(child(dbRef, `users/` + tmpUserId)).then((snapshot) => {
    if (snapshot.exists()) {
      state.assignedUserIds.push(tmpUserId)
    }
    state.alert = state.assignedUserIds.includes(tmpUserId)
    if (state.alert) {
      state.screenName = 'Schuilnaam bezet'
    } else state.screenName = 'Schuilnaam geselecteerd'
  }).catch((error) => {
    console.error(`Error while reading child ${tmpUserId} from database: ` + error)
  })
}

function setSelectedAlias(alias) {
  if (alias === undefined) return
  if (!state.assignedUserIds.includes(alias.toUpperCase())) {
    state.alias = alias
  }
}

function showMenu() {
  state.userSettingsActive = false
  state.maastrichtStoriesActive = false
  state.screenName = 'Menu'
}

function resetApp() {
  state.isAuthenticated = false
  state.alias = undefined
  state.PIN = ''
  state.userEntryMode = undefined
  state.showOpeningScreen = true
  state.screenName = 'Welkom'
}
</script>