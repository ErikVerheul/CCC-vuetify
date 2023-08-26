<template>
  <ReportFbError v-if="state.onError" :firebaseError="state.firebaseError" :fbErrorContext="state.fbErrorContext"
    @return-to="emit('exit-signup')"></ReportFbError>
  <v-sheet v-else :min-height="getHeight()" :max-width="store.screenWidth">
    <v-row>
      <v-col cols="12" class="text-center">
        <h1>Hallo -{{ store.userData.alias }} </h1>
        <h3>Vervolg aanmelding</h3>
      </v-col>
      <v-col cols="12" class="py-3 text-left">
        <p class="ml-5">De volgende vragen zijn optioneel:</p>
      </v-col>
      <v-col cols="5" offset="1">
        <v-text-field density="compact" label="Geboorte Jaar" v-model.trim="state.yearOfBirth" :rules="state.yearOfBirthRules" />
      </v-col>
      <v-col cols="6" align-self="end">
        <v-btn size="x-small" color="yellow-lighten-3" @click="state.showWhy = !state.showWhy">Waarom deze informatie?</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="state.showWhy">
      <v-col>
        <p class="ml-5">Het geboortejaar is nodig om uw prestaties in een leeftijds-categorie te plaatsen. Zonder geboortejaar komt u
          terecht in de categorie 'Alle leeftijden'. Om de zelfde reden willen we weten of u man, vrouw of iets anders bent.
        </p>
      </v-col>
    </v-row>
    <v-row class="d-flex align-center justify-center">
      <v-col cols="12" class="ml-5">
        <v-btn-toggle v-model="state.gender" variant="outlined" group>
          <v-btn value="0">
            Man
          </v-btn>
          <v-btn value="1">
            Vrouw
          </v-btn>
          <v-btn value="2">
            Anders
          </v-btn>
          <v-btn value="3">
            Sla over
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="8">
        <p class="ml-5">Wil je maandelijks via de app op de hoogte gehouden worden van nieuws over het speelmee.app platform?</p>
      </v-col>
      <v-col cols="4">
        <v-switch :label="newsFeedLabel" v-model="state.newsFeed"></v-switch>
      </v-col>
    </v-row>
  </v-sheet>
  <v-divider></v-divider>
  <v-row>
    <v-col>
      <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('exit-signup')">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>
    <v-col>
      <v-btn :disabled="!yearOfBirthOk" flat append-icon="mdi-arrow-right" @click="doSignupUser">
        Door
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import { db, dbRef } from '../firebase'
import { ref, set, update } from "firebase/database"
import Cookies from 'universal-cookie'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import ReportFbError from "./ReportFbError.vue"

const emit = defineEmits(['signup-completed', 'exit-signup'])
const store = useAppStore()

const state = reactive({
  showWhy: false,
  yearOfBirth: undefined,
  gender: -1,
  yearOfBirthRules: [
    value => {
      if (value) return true

      return 'Vul 4 cijfers in.'
    },
    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value > 0) return true

      return 'Kan niet negatief zijn.'
    },
    value => {
      if (value && value.length === 4) return true

      return 'Vul 4 cijfers in.'
    },
    value => {
      if (store.currentYear - Number(value) <= 130) return true

      return 'U bent meer dan 130 jaar oud?'
    },
    value => {
      if (Number(value) <= tore.currentYear) return true

      return 'U bent nog niet geboren'
    }
  ],
  newsFeed: false,
  onError: false,
  firebaseError: {},
  fbErrorContext: ''
})

const yearOfBirthOk = computed(() => {
  return state.yearOfBirth === undefined || (Number((store.currentYear) - state.yearOfBirth <= 130) && state.yearOfBirth <= store.currentYear)
})

const newsFeedLabel = computed(() => {
  if (state.newsFeed) return 'Ja'
  return 'Nee'
})

function getHeight() {
  return store.screenHeight - store.backContinueHeight
}

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

// an undefined year of birth is stored as 0; an undefined gender as -1
function doSignupUser() {
  const fakeEmail = replaceSpacesForHyphen(store.userData.alias) + '@speelmee.app'
  const fakePassword = (Number(store.userData.PIN + store.userData.PIN) * 7).toString()
  const auth = getAuth()
  createUserWithEmailAndPassword(auth, fakeEmail, fakePassword)
    .then((userCredential) => {
      // signed in as user
      store.firebaseUser = userCredential.user
      const now = Date.now()
      // create user data and store in database
      store.userData.gender = Number(state.gender)
      store.userData.lastLogin = now
      store.userData.newsFeed = state.newsFeed
      store.userData.subscriptionDate = now
      store.userData.yearOfBirth = state.yearOfBirth === undefined ? -1 : Number(state.yearOfBirth)
      set(ref(db, 'users/' + store.firebaseUser.uid), store.userData)
      // set this alias as in use
      const updates = {}
      updates['aliases/' + store.userData.alias + '/inUse'] = true
      update(dbRef, updates)
      // set cookie for auto-signin next time
      const cookies = new Cookies()
      cookies.set('speelMee', { alias: store.userData.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
      emit('signup-completed')
    })
    .catch((error) => {
      state.onError = true
      state.firebaseError = error
      state.fbErrorContext = `Mogelijk heeft een andere speler deze schuilnaam net gekozen. Kies een andere schuilnaam`
    })
}

</script>