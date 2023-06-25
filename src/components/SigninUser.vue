<template>
  <v-card variant="text">
    <v-card-title>Login met uw schuilnaam en PIN code</v-card-title>
    <v-text-field v-model.trim="state.alias" label="Uw schuilnaam" :rules="state.nameRules" />
    <v-text-field v-model.trim="state.pinCode" label="PIN" :rules="state.pinRules" />
    <v-btn class="my-6" v-if="aliasOK && PINOK" type="submit" color="black" @click='doSigninUser' rounded="l" size="large">Login</v-btn>
    <v-btn type="button" variant="text" @click="emit('change-to-signup')">Ga naar nieuwe aanmelding</v-btn>
  </v-card>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { dbRef } from '../firebase'
import { get, child } from "firebase/database"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import Cookies from 'universal-cookie'
const props = defineProps(['assignedUserIds'])
const emit = defineEmits(['signin-completed', 'change-to-signup'])

const PINOK = computed(() => {
  return !isNaN(state.pinCode) && state.pinCode.length >= 4
})

const aliasOK = computed(() => {
  if (state.alias === undefined) return false
  return state.alias.length > 0 && props.assignedUserIds.includes(userId())
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
  PINverifiedOk: false,
})

// convenience method to derive user id
function userId() {
  if (state.alias === undefined) return undefined
  return state.alias.toUpperCase()
}

function doSigninUser() {
  state.PINverifiedOk = false
  if (aliasOK && PINOK) {
    const fakeEmail = state.alias + '@speelmee.app'
    const fakePassword = (Number(state.pinCode + state.pinCode) * 7).toString()
    const auth = getAuth();
    signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // get user data from the database
        get(child(dbRef, `users/` + state.alias.toUpperCase())).then((snapshot) => {
          if (snapshot.exists()) {
            //... store user data from database
            // save a cookie for auto login next time
            const cookies = new Cookies()
            cookies.set('speelMee', { user: userId(), alias: state.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
            emit('signin-completed', state.alias, state.pinCode)
          } else {
            console.log(`doSigninUser: cannot find user ${tate.alias.toUpperCase()} in the database}`)
          }
        }).catch((error) => {
          console.error(`Error while reading child ${retrievedCookie.user} from database: ` + error)
        })
      })
      .catch((error) => {
        console.log('Firebase signin: errorCode = ' + error.code)
        console.log('Firebase signin: errorMessage = ' + error.message)
      })
  }
}

</script>