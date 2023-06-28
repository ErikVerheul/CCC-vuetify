<template>
  <v-sheet width="window.innerWidth">
    <v-row>
      <v-col cols="12">
        <h1 class="titleLine">Hallo -{{ props.alias }} </h1>
        <h3>Kies een pin code</h3>
        <v-text-field v-model.trim="state.pinCode" label="pin code" :rules="state.pinRules" />
      </v-col>
    </v-row>
    <div class="py-3" />
    <v-row>
      <v-col cols="12" class="text-left">

        <p>De volgende vragen zijn optioneel:</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8" class="text-left">
        <v-text-field density="compact" label="Geboorte Jaar" v-model.trim="state.yearOfBirth" :rules="state.yearOfBirthRules" />
      </v-col>
      <v-col cols="4">
        <v-btn density="compact" icon="mdi-open-in-new"></v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn-toggle v-model="state.gender" rounded="0" color="deep-purple-accent-3" group>
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
            Niet opgegeven
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8">
        <p> Wil je maandelijks via de app op de<br>
          hoogte gehouden worden van nieuws<br>
          over het speelmee.app platform?
        </p>
      </v-col>
      <v-col cols="4">
        <v-switch :label="newsFeedLabel" v-model="state.newsFeed"></v-switch>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <p>De speelmee.app neemt Privacy serieus;<br>
          daarom maken we het mogelijk alle<br>
          persoonlijke data te wissen als je geen<br>
          gebruik meer wil maken van de app.</p>
      </v-col>
    </v-row>
    <v-row class="justify-start">
      <v-col cols="5">
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('exit-signup')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
      <v-col cols="7">
        <v-btn v-if="PINOK" flat append-icon="mdi-arrow-right" @click="doSignupUser">
          Sla op en ga door
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="PINOK" cols="auto">
        <v-card class="mx-auto" color="yellow-lighten-3" theme="dark" max-width="400">
          <v-card-title class="text-h5">
            Welkom in de Speelmee.app
          </v-card-title>
          <v-card-text>
            Uw schuilnaam is <b>{{ props.alias }}</b><br>
            Uw PIN is <b>{{ state.pinCode }}</b><br>
            Gebruik deze schuilnaam en pin code om op een ander apparaat in te loggen.
            Op dit apparaat wordt u automatisch ingelogd totdat u de app een jaar niet hebt gebruikt.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { db } from '../firebase'
import { ref, set } from "firebase/database"
import Cookies from 'universal-cookie'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

const props = defineProps(['alias'])
const emit = defineEmits(['signup-completed', 'exit-signup'])

const state = reactive({
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
    }
  ],
  lastLogin: Date.now(),
  newsFeed: false
})

const PINOK = computed(() => {
  return !isNaN(state.pinCode) && state.pinCode.length >= 4
})

const newsFeedLabel = computed(() => {
  if (state.newsFeed) return 'Ja'
  return 'Nee'
})

// an undefined year of birth is stored as 0; an undefined gender as -1
function doSignupUser() {
  // database
  const fakeEmail = props.alias + '@speelmee.app'
  const fakePassword = (Number(state.pinCode + state.pinCode) * 7).toString()
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, fakeEmail, fakePassword)
    .then((userCredential) => {
      // Signed in 
      const firebaseUser = userCredential.user;
      // save user data in database
      set(ref(db, 'users/' + props.alias.toUpperCase()), {
        PIN: state.pinCode,
        alias: props.alias,
        subscriptionDate: state.lastLogin,
        lastLogin: state.lastLogin,
        yearOfBirth: state.yearOfBirth === undefined ? -1 : state.yearOfBirth,
        gender: state.gender,
        newsFeed: state.newsFeed
      })
      // set cookie for auto-signin next time
      const cookies = new Cookies()
      cookies.set('speelMee', { user: props.alias.toUpperCase(), alias: props.alias, fpw: fakePassword }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
      emit('signup-completed', props.alias, state.pinCode, firebaseUser, state.lastLogin)
    })
    .catch((error) => {
      console.log('Firebase signup: errorCode = ' + error.code)
      console.log('Firebase signup: errorMessage = ' + error.message)
    })
}

</script>

<style scoped>
.titleLine {
  text-align: left;
}
</style>