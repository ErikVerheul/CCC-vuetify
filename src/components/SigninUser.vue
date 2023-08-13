<template>
  <v-row class="d-flex align-center justify-center">
    <v-col cols="auto">
      <v-card variant="text">
        <v-card-title>Gebruikt u deze app voor het eerst?</v-card-title>
        <v-btn size="x-large" variant="outlined" @click="emit('change-to-signup')">Ga naar nieuwe aanmelding</v-btn>
      </v-card>
    </v-col>
  </v-row>
  <v-row class="d-flex align-center justify-center">
    <v-col cols="12">
      <p>of hebt u al een account</p>
    </v-col>
  </v-row>
  <v-row class="d-flex align-center justify-center">
    <v-col cols="auto">
      <v-card variant="text">
        <v-card-title>Login met schuilnaam en PIN code</v-card-title>
        <v-text-field v-model="store.userData.alias" label="Uw schuilnaam" />
        <v-text-field v-model.trim="store.userData.PIN" label="PIN" :rules="state.pinRules" />
        <v-btn class="my-6" v-if="state.aliasOk && PINOK" type="submit" color="purple" @click='doSigninUser' rounded="l"
          size="large">Login</v-btn>
        <template v-if="state.loginErrorMsg !== undefined">
          <h2 class="py-4">Fout: {{ state.loginErrorMsg }}</h2>
          <h3 class="py-4">Controleer of uw schuilnaam en pincode kloppen en probeer opnieuw</h3>
        </template>
      </v-card>
    </v-col>
  </v-row>
  <v-row class="py-12">
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
import { useAppStore } from '../store/app.js'
import { dbRef } from '../firebase'
import { get, child, update } from "firebase/database"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import Cookies from 'universal-cookie'
const props = defineProps(['aliasesInUseInclAdmin'])
const emit = defineEmits(['signin-completed', 'change-to-signup', 'exit-signin'])
const store = useAppStore()

const state = reactive({
  aliasOk: false,
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
  return !isNaN(store.userData.PIN) && store.userData.PIN.length >= 4
})

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

// autocomplete the alias name
watch(() => store.userData.alias, () => {
  state.aliasOk = false
  const inputLen = store.userData.alias.length
  let lastMatch = undefined
  let exactMatch = false
  let matchcount = 0
  for (const el of props.aliasesInUseInclAdmin) {
    if (el.substring(0, inputLen).toUpperCase() === store.userData.alias.toUpperCase()) {
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
    store.userData.alias = lastMatch.trim()
  }
})

function doSigninUser() {
  const fakeEmail = replaceSpacesForHyphen(store.userData.alias) + '@speelmee.app'
  const fakePassword = (Number(store.userData.PIN + store.userData.PIN) * 7).toString()
  const auth = getAuth()
  signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
    .then((userCredential) => {
      // signed in as user
      store.firebaseUser = userCredential.user
      // get user data from the database
      get(child(dbRef, `users/` + store.firebaseUser.uid)).then((snapshot) => {
        if (snapshot.exists()) {
          store.userData = snapshot.val()
          // save a cookie for auto login next time
          const cookies = new Cookies()
          cookies.set('speelMee', { alias: store.userData.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
          // update the login date/time
          const now = Date.now()
          store.userData.lastLogin = now
          const updates = {}
          updates['/users/' + store.firebaseUser.uid + '/lastLogin'] = now
          update(dbRef, updates)
          emit('signin-completed')
        } else {
          console.log(`doSigninUser: cannot find user ${store.userData.alias} in the database}`)
        }
      }).catch((error) => {
        console.error(`While reading child ${store.userData.alias} from database: error message = ` + error.message)
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