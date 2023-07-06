<template>
  <v-card variant="text">
    <v-card-title>Login met schuilnaam en PIN code</v-card-title>
    <v-text-field v-model.trim="state.userAliasInput" label="Uw schuilnaam" />
    <v-text-field v-model.trim="state.pinCode" label="PIN" :rules="state.pinRules" />
    <v-btn class="my-6" v-if="aliasOK && PINOK" type="submit" color="black" @click='doSigninUser' rounded="l" size="large">Login</v-btn>
    <template v-if="state.loginErrorMsg !== undefined">
      <div class="py-4" />
      <h2>Er is een fout opgetreden. Fout: {{ state.loginErrorMsg }}</h2>
      <v-btn @click="resetLogin">Click om opnieuw te proberen</v-btn>
    </template>
    <v-btn type="button" variant="text" @click="emit('change-to-signup')">Ga naar nieuwe aanmelding</v-btn>
  </v-card>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { dbRef } from '../firebase'
import { get, child, update } from "firebase/database"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import Cookies from 'universal-cookie'
const props = defineProps(['aliasesInUse'])
const emit = defineEmits(['signin-completed', 'change-to-signup'])

const PINOK = computed(() => {
  return !isNaN(state.pinCode) && state.pinCode.length >= 4
})

// user must have an assigned userId or the user is ADMIN
const aliasOK = computed(() => {
  if (state.userAliasInput === '') return false
  return isKnownAlias(state.userAliasInput)
})

function isKnownAlias(input) {
  for (const el of props.aliasesInUse) {
    if (el === input.toUpperCase()) {
      return true
    }
  }
  return state.alias = 'admin'
}

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

function resetLogin() {
  state.userAliasInput = ''
  state.pinCode = ''
  state.loginErrorMsg = undefined
}

const state = reactive({
  userAliasInput: '',
  alias: undefined,
  pinCode: '',
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
  loginErrorMsg: undefined
})

function doSigninUser() {
  if (aliasOK && PINOK) {
    const fakeEmail = replaceSpacesForHyphen(state.userAliasInput) + '@speelmee.app'
    const fakePassword = (Number(state.pinCode + state.pinCode) * 7).toString()
    const auth = getAuth()
    signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
      .then((userCredential) => {
        // Signed in 
        const firebaseUser = userCredential.user
        // get user data from the database
        get(child(dbRef, `users/` + firebaseUser.uid)).then((snapshot) => {
          if (snapshot.exists()) {
            //... store user data from database
            state.lastLogin = snapshot.val().lastLogin
            // set the alias as written in the users record
            state.alias = snapshot.val().alias
            // save a cookie for auto login next time
            const cookies = new Cookies()
            cookies.set('speelMee', { alias: state.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
            // save the login date/time
            const updates = {}
            updates['/users/' + firebaseUser.uid + '/lastLogin'] = Date.now()
            update(dbRef, updates)
            emit('signin-completed', state.alias, state.pinCode, firebaseUser, state.lastLogin)
          } else {
            console.log(`doSigninUser: cannot find user ${state.alias} in the database}`)
          }
        }).catch((error) => {
          console.error(`Error while reading child ${state.alias} from database: ` + error)
        })
      })
      .catch((error) => {
        console.log('Firebase signin: errorCode = ' + error.code)
        console.log('Firebase signin: errorMessage = ' + error.message)
        state.loginErrorMsg = error.message
      })
  }
}

</script>