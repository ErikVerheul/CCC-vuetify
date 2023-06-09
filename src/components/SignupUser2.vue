<template>
  <v-sheet max-width="414px">
    <v-row>
      <v-col cols="12" class="text-center">
        <h1>Hallo -{{ props.userData.alias }} </h1>
        <h3>Vervolg aanmelding</h3>
      </v-col>
      <div class="py-3" />
      <v-col cols="12" class="text-left">
        <p>De volgende vragen zijn optioneel:</p>
      </v-col>
      
      <v-col cols="5" offset="1">
        <v-text-field density="compact" label="Geboorte Jaar" v-model.trim="state.yearOfBirth" :rules="state.yearOfBirthRules" />
      </v-col>
      <v-col cols="6" align-self="end">
        <v-btn size="x-small" color="yellow-lighten-3" @click="state.showWhy = !state.showWhy">Waarom deze informatie?</v-btn>
      </v-col>
      <v-row v-if="state.showWhy" class="d-flex align-center justify-center">
        <v-col cols="7" offset="1">
          <p>Het geboortejaar is nodig om uw prestaties in een leeftijds-categorie te plaatsen. Zonder geboortejaar komt u
            terecht in de categorie 'Alle leeftijden'. Om de zelfde reden willen we weten of u man, vrouw of iets anders bent.
          </p>
        </v-col>
      </v-row>
      <v-col cols="12" class="text-left">
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
        <p>Wil je maandelijks via de app op de hoogte gehouden worden van nieuws over het speelmee.app platform?</p>
      </v-col>
      <v-col cols="4">
        <v-switch :label="newsFeedLabel" v-model="state.newsFeed"></v-switch>
      </v-col>
    </v-row>
    <v-row class="justify-start">
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
  </v-sheet>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { db, dbRef } from '../firebase'
import { ref, set, update } from "firebase/database"
import Cookies from 'universal-cookie'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

const props = defineProps(['userData'])
const emit = defineEmits(['signup-completed', 'exit-signup'])

const state = reactive({
  showWhy: false,
  currentYear: new Date().getFullYear(),
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
      if (value.length === 4) return true

      return 'Vul 4 cijfers in.'
    },
    value => {
      if (Number((state.currentYear) - Number(value)) <= 130) return true

      return 'U bent meer dan 130 jaar oud?'
    },
    value => {
      if (Number(value) <= Number(state.currentYear)) return true

      return 'U bent nog niet geboren'
    }
  ],
  lastLogin: Date.now(),
  newsFeed: false
})

const yearOfBirthOk = computed(() => {
  return state.yearOfBirth === undefined || (Number((state.currentYear) - state.yearOfBirth <= 130) && state.yearOfBirth <= Number(state.currentYear))
})

const newsFeedLabel = computed(() => {
  if (state.newsFeed) return 'Ja'
  return 'Nee'
})

function replaceSpacesForHyphen(name) {
  return name.replaceAll(' ', '-')
}

// an undefined year of birth is stored as 0; an undefined gender as -1
function doSignupUser() {
  const fakeEmail = replaceSpacesForHyphen(props.userData.alias) + '@speelmee.app'
  const fakePassword = (Number(props.userData.pinCode + props.userData.pinCode) * 7).toString()
  const auth = getAuth()
  createUserWithEmailAndPassword(auth, fakeEmail, fakePassword)
    .then((userCredential) => {
      // Signed in 
      const firebaseUser = userCredential.user;
      // save user data in database
      set(ref(db, 'users/' + firebaseUser.uid), {
        PIN: props.userData.pinCode,
        alias: props.userData.alias,
        subscriptionDate: state.lastLogin,
        lastLogin: state.lastLogin,
        yearOfBirth: state.yearOfBirth === undefined ? -1 : Number(state.yearOfBirth),
        gender: Number(state.gender),
        newsFeed: state.newsFeed
      })
      // set this alias as in use
      const updates = {}
      updates['aliases/' + props.userData.alias + '/inUse'] = true
      update(dbRef, updates)
      // set cookie for auto-signin next time
      const cookies = new Cookies()
      cookies.set('speelMee', { alias: props.userData.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
      emit('signup-completed', firebaseUser, state.lastLogin)
    })
    .catch((error) => {
      console.error('Firebase signup: errorMessage = ' + error.message)
    })
}

</script>