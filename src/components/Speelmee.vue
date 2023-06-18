<template>
  <div v-if="showOpeningScreen && !state.showPrivacyScreen">
    <v-row class="d-flex align-center justify-center">
      <v-col cols="auto">
        <h1>speelmee.app<br><br></h1>
        <h3>Verbeter spelenderwijs<br>je kennis en conditie<br>en geniet van cultuur.<br><br></h3>
        <h4>Even aanmelden: kies<br>een schuilnaam en pin code<br><br>
          Dat is alles om te kunnen meedoen!
        </h4>
        <div class="py-4" />
        <v-btn size="x-small" color="yellow-lighten-3" @click="state.showHowTo = !state.showHowTo">Heb je al een account
          op een ander apparaat?</v-btn>
        <template v-if="state.showHowTo">
          <div class="py-4" />
          <p>Als u al een account hebt op een ander apparaat log dan in met uw schuilnaam en pin code. Die kunt u
            terugvinden op het andere apparaat door op
            <v-icon>mdi-dots-vertical</v-icon> rechtsboven te tikken en 'Inloggen op ander apparaat' te kiezen.
          </p>
        </template>
        <div class="py-4" />
      </v-col>
    </v-row>

    <v-row align="center" justify="start">
      <v-col cols="auto">
        <p>Lees het privacybeleid nu of later.<br>
          Geen gebruikelijke juridische bla bla!</p>
      </v-col>
      <v-col cols="auto">
        <v-btn icon="mdi-open-in-new" size="x-small" @click="state.showPrivacyScreen = true"></v-btn>
      </v-col>
    </v-row>

    <div class="py-14" />
    <v-row class="justify-end">
      <v-col cols="auto">
        <v-btn flat append-icon="mdi-arrow-right" @click="emit('exit-opening-screen')">
          Doorgaan
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
    <div class="py-14" />
  </div>
  <PrivacyBeleid :show-privacy-screen="state.showPrivacyScreen" @exit-privacy-screen="state.showPrivacyScreen = false" />
</template>

<script setup>
import { reactive } from 'vue'
import PrivacyBeleid from './PrivacyBeleid.vue'
const props = defineProps(['showOpeningScreen'])
const emit = defineEmits(['exit-opening-screen'])

const state = reactive({
  showPrivacyScreen: false,
  showHowTo: false
})
</script>

<style scoped>
.titleLine {
  background-color: purple;
  color: white;
  text-align: center
}
</style>