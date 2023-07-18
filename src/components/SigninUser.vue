<template>
  <v-row>
    <v-col cols="auto">
      <v-card variant="text">
        <v-card-title>Login met schuilnaam en PIN code</v-card-title>
        <v-text-field v-model="state.userAliasInput" label="Uw schuilnaam" />
        <v-text-field v-model.trim="state.pinCode" label="PIN" :rules="state.pinRules" />
        <v-btn class="my-6" v-if="state.aliasOk && PINOK" type="submit" color="purple" @click='doSigninUser' rounded="l"
          size="large">Login</v-btn>
        <template v-if="state.loginErrorMsg !== undefined">
          <div class="py-4" />
          <h2>Er is een fout opgetreden. Fout: {{ state.loginErrorMsg }}</h2>
          <div class="py-4" />
          <h3>Controleer of uw schuilnaam en pincode kloppen en probeer opnieuw. Of kies een andere schuilnaam en pincode met de knop
            hieronder.
          </h3>
        </template>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-if="state.loginErrorMsg === undefined" class="d-flex align-center justify-center">
    <v-col cols="auto">
      <p>of</p>
    </v-col>
  </v-row>
  <v-row class="d-flex align-center justify-center">
    <v-col cols="auto">
      <v-btn type="button" @click="emit('change-to-signup')">Ga naar nieuwe aanmelding</v-btn>
    </v-col>
  </v-row>
  <div class="py-12" />
  <v-row>
    <v-col cols="auto">
      <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('exit-signin')">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { dbRef } from '../firebase'
import { get, child, update } from "firebase/database"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import Cookies from 'universal-cookie'
const props = defineProps(['aliasesInUseInclAdmin'])
const emit = defineEmits(['signin-completed', 'change-to-signup', 'exit-signin'])

const state = reactive({
  userAliasInput: '',
  aliasOk: false,
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

const PINOK = computed(() => {
  return !isNaN(state.pinCode) && state.pinCode.length >= 4
})

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

function resetLogin() {
  state.userAliasInput = ''
  state.pinCode = ''
  state.loginErrorMsg = undefined
}

// autocomplete the alias name
watch(() => state.userAliasInput, () => {
  state.aliasOk = false
  const inputLen = state.userAliasInput.length
  let lastMatch = undefined
  let exactMatch = false
  let matchcount = 0
  for (const el of props.aliasesInUseInclAdmin) {
    if (el.substring(0, inputLen).toUpperCase() === state.userAliasInput.toUpperCase()) {
      lastMatch = el
      matchcount++
      // test on exact match
      exactMatch = el.length === inputLen
      if (exactMatch) break
    }
  }
  if (exactMatch || matchcount === 1) {
    // unique match found
    state.aliasOk = true
    state.userAliasInput = lastMatch.trim()
  }
})

function doSigninUser() {
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
          // save a cookie for auto login next time
          const cookies = new Cookies()
          cookies.set('speelMee', { alias: state.userAliasInput, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
          // save the login date/time
          const updates = {}
          updates['/users/' + firebaseUser.uid + '/lastLogin'] = Date.now()
          update(dbRef, updates)
          emit('signin-completed', state.userAliasInput, state.pinCode, firebaseUser, state.lastLogin)
        } else {
          console.log(`doSigninUser: cannot find user ${state.userAliasInput} in the database}`)
        }
      }).catch((error) => {
        console.error(`While reading child ${state.userAliasInput} from database: error message = ` + error.message)
      })
    })
    .catch((error) => {
      console.error('Firebase signin: error message = ' + error.message)
      state.loginErrorMsg = error.message
    })
}
</script>

<style scoped>
h3 {
  color: #311B92
}
</style>