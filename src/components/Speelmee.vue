<template>
  <div v-if="showOpeningScreen">
    <v-row class="d-flex align-center justify-center">
      <v-col cols="auto">
        <h1>speelmee.app</h1>
      </v-col>
    </v-row>
    <div class="py-2" />
    <v-row class="d-flex align-center justify-center">
      <v-col cols="3"></v-col>        
      <v-col cols="9">       
        <h3>Test spelenderwijs<br>je kennis en conditie<br>en geniet van cultuur.<br><br></h3>
        <h4>Even aanmelden: kies een<br>schuilnaam en pincode<br><br>
          Dat is alles om te kunnen meedoen!
        </h4>
        <div class="py-4" />
        <v-btn size="x-small" color="yellow-lighten-3" @click="state.showHowTo = !state.showHowTo">Heb al account
          op ander apparaat?</v-btn>
        <template v-if="state.showHowTo">
          <div class="py-4" />
          <p>Als u al een account hebt op een ander apparaat log dan in met uw schuilnaam en pin code. Die kunt u
            terugvinden op het andere apparaat door op
            <v-icon>mdi-dots-vertical</v-icon> rechtsboven te tikken en 'Inloggen op ander apparaat' te kiezen.
          </p>
        </template>       
      </v-col>
    </v-row>
    <div class="py-4" />
    <v-row justify="start">
      <v-col cols="auto">
        <p>Lees het <router-link to="/Privacybeleid">privacybeleid</router-link> nu of later.<br>
          Geen gebruikelijke juridische bla bla!</p>
      </v-col>
    </v-row>

    <div class="py-5" />
    <v-row class="justify-end">
      <v-col cols="auto">
        <v-btn flat append-icon="mdi-arrow-right" @click="emit('exit-opening-screen')">
          Door
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
    <div class="py-14" />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const props = defineProps(['showOpeningScreen'])
const emit = defineEmits(['exit-opening-screen'])

const state = reactive({
  showHowTo: false
})
</script>

<style scoped>
h1 {
  font-size: 50px;
}
</style>