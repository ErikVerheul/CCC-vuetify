<template>
  <v-card variant="text">
    <v-card-title>Login met schuilnaam en PIN code</v-card-title>
    <v-text-field v-model.trim="state.alias" label="Uw schuilnaam" :rules="state.nameRules" />
    <v-text-field v-model.trim="state.pinCode" label="PIN" :rules="state.pinRules" />
    <v-btn class="my-6" v-if="aliasOK && PINOK" type="submit" color="black" @click='doSigninUser' rounded="l" size="large">Login</v-btn>
    <template v-if="state.loginErrorMsg !== undefined">
      <div class="py-4" />
      <h2>Er is een fout opgetreden. Fout: {{ state.loginErrorMsg }}</h2>
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
const props = defineProps(['assignedUserIds'])
const emit = defineEmits(['signin-completed', 'change-to-signup'])

const PINOK = computed(() => {
  return !isNaN(state.pinCode) && state.pinCode.length >= 4
})

// user must have an assigned userId or the user is 'admin'
const aliasOK = computed(() => {
  if (state.alias === undefined) return false
  return state.alias.length > 0 && props.assignedUserIds.includes(userId()) || state.alias === 'admin'
})

const state = reactive({
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

// convenience method to derive user id
function userId() {
  if (state.alias === undefined) return undefined
  return state.alias.toUpperCase()
}

function doSigninUser() {
  if (aliasOK && PINOK) {
    const fakeEmail = state.alias + '@speelmee.app'
    const fakePassword = (Number(state.pinCode + state.pinCode) * 7).toString()
    const auth = getAuth();
    signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
      .then((userCredential) => {
        // Signed in 
        const firebaseUser = userCredential.user
        // get user data from the database
        get(child(dbRef, `users/` + state.alias.toUpperCase())).then((snapshot) => {
          if (snapshot.exists()) {
            //... store user data from database
            state.lastLogin = snapshot.val().lastLogin
            // save a cookie for auto login next time
            const cookies = new Cookies()
            cookies.set('speelMee', { user: userId(), alias: state.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
            // save the login date/time
            const updates = {}
            updates['/users/' + userId() + '/lastLogin'] = Date.now()
            update(dbRef, updates)
            emit('signin-completed', state.alias, state.pinCode, firebaseUser, state.lastLogin)
          } else {
            console.log(`doSigninUser: cannot find user ${userId()} in the database}`)
          }
        }).catch((error) => {
          console.error(`Error while reading child ${userId()} from database: ` + error)
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