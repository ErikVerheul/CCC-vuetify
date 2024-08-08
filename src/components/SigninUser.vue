<template>
  <v-container class="max-container-width d-flex flex-column h-100">
    <div class="flex-grow-1">
      <p class="mb-4">
        Heb je al <b>eerder</b> een schuilnaam aangemaakt op een <b>ander</b> apparaat zoals een PC, mobiel of
        tablet?<br />
        Haal dan <b>eerst schuilnaam en pincode</b> op van dat apparaat en voer hier onder in.
      </p>

      <div class="px-8">
        <p class="mb-2">
          <small>
            De schuilnaam en pincode vind je via het menu
            <v-icon>mdi-dots-vertical</v-icon> (rechtsboven)
          </small>
        </p>

        <v-autocomplete v-model="state.selectedAlias" :items="props.aliasesInUseInclAdmin" label="Uw schuilnaam" />

        <v-text-field v-model.trim="store.userData.PIN" label="PIN" :rules="state.pinRules" />
      </div>

      <p>
        De app <b>onthoudt</b> je schuilnaam en pincode <b>ook</b> op dit apparaat en login gaat dan <b>automatisch</b>
      </p>

      <p v-if="state.loginErrorMsg !== undefined">Controleer of uw schuilnaam en pin code kloppen en probeer opnieuw</p>
    </div>
    <div class="d-flex justify-space-between">
      <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('exit-signup')">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>

      <v-btn :disabled="!state.selectedAlias || !PINOK" flat append-icon="mdi-arrow-right" @click="doSigninUser">
        Verder
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.color-red {
  color: red;
}
</style>

<script setup>
import { computed, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import { dbRef } from '../firebase.js'
import { get, child, update } from 'firebase/database'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import Cookies from 'universal-cookie'

const props = defineProps(['isCelebrity', 'aliasesInUseInclAdmin'])
const emit = defineEmits(['signin-completed', 'exit-signup'])
const store = useAppStore()

const state = reactive({
  selectedAlias: '',
  pinRules: [
    (value) => {
      if (value) return true

      return 'Vul 4 of meer cijfers in.'
    },
    (value) => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    (value) => {
      if (value && value.length >= 4) return true

      return 'Vul minimaal 4 cijfers in.'
    },
  ],
  loginErrorMsg: undefined,
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
      get(child(dbRef, `users/` + store.firebaseUser.uid))
        .then((snapshot) => {
          if (snapshot.exists()) {
            // get the user data in the store including its alias
            store.userData = snapshot.val()
            if (state.selectedAlias !== store.userData.alias) {
              console.log(
                'doSigninUser: SOMETHING WENT WRONG: the alias of the retrieved user is different from the selected alias. STOP'
              )
              return
            }
            // save a cookie for auto login next time
            const cookies = new Cookies()
            cookies.set(
              'speelMee',
              { alias: store.userData.alias, fpw: fakePassword },
              { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true }
            )
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
        })
        .catch((error) => {
          console.error(`While reading child ${store.userData.alias} from database: error message = ` + error.message)
        })
    })
    .catch((error) => {
      console.error('Firebase signin: error message = ' + error.message)
      state.loginErrorMsg = error.message
    })
}
</script>
