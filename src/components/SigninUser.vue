<template>
  <v-sheet class="ma-2" :max-width="store.screenWidth">
    <v-row class="d-flex align-center justify-center">
      <v-col cols="12">
        <v-card variant="text">
          <v-card-title>Gebruikt u deze app voor het eerst?</v-card-title>
          <v-btn size="x-large" variant="outlined" @click="emit('change-to-signup')">Ga naar nieuwe aanmelding</v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <p>of hebt u al een account</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card variant="text">
          <v-card-title>Login met schuilnaam en PIN code</v-card-title>
          <v-autocomplete v-model="state.selectedAlias" :items="props.aliasesInUseInclAdmin" label="Uw schuilnaam" />
          <v-text-field v-model.trim="store.userData.PIN" label="PIN" :rules="state.pinRules" />
          <!-- check for state.selectedAlias not null after backspacing && PINOK -->
          <v-btn class="my-6" v-if="state.selectedAlias && PINOK" type="submit" color="purple" @click='doSigninUser' rounded="l"
            size="large">Login</v-btn>
          <v-card-text v-if="state.loginErrorMsg !== undefined">
            <h3>Controleer of uw schuilnaam en pin code kloppen en probeer opnieuw</h3>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="py-12">
      <v-col cols="12">
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('exit-signin')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import { dbRef } from '../firebase'
import { get, child, update } from "firebase/database"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import Cookies from 'universal-cookie'
const props = defineProps(['aliasesInUseInclAdmin'])
const emit = defineEmits(['signin-completed', 'change-to-signup', 'exit-signin'])
const store = useAppStore()

const state = reactive({
  selectedAlias: '',
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
      if (value && value.length >= 4) return true

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

function doSigninUser() {
  const fakeEmail = replaceSpacesForHyphen(state.selectedAlias) + '@speelmee.app'
  const fakePassword = (Number(store.userData.PIN + store.userData.PIN) * 7).toString()
  const auth = getAuth()
  signInWithEmailAndPassword(auth, fakeEmail, fakePassword)
    .then((userCredential) => {
      // signed in as user
      store.firebaseUser = userCredential.user
      // get user data from the database
      get(child(dbRef, `users/` + store.firebaseUser.uid)).then((snapshot) => {
        if (snapshot.exists()) {
          // save the user data in the store including its alias
          store.userData = snapshot.val()
          if (state.selectedAlias !== store.userData.alias) {
            console.log('doSigninUser: SOMETHING WENT WRONG: the alias of the retrieved user is different from the selected alias. STOP')
            return
          }
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
          console.log(`doSigninUser: cannot find user ${store.userData.alias} in the database`)
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