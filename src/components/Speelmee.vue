<template>
  <v-row class="d-flex align-center justify-center">
    <v-col cols="auto">
      <h1>speelmee.app</h1>
    </v-col>
  </v-row>
  <v-row class="py-2 d-flex align-center justify-center">
    <v-col cols="auto" class="text-center">
      <h3>Test spelenderwijs<br>je kennis en conditie<br>en geniet van cultuur<br><br></h3>
      <h4>Even aanmelden: kies een schuilnaam en pin code<br><br>
        Dat is alles om te kunnen meedoen!</h4>
      <v-btn class="mt-3 pt-2 pb-4" size="small" color="yellow-lighten-3" @click="state.showHowTo = !state.showHowTo">Heb al account
        op ander apparaat?</v-btn>
    </v-col>
  </v-row>
  <v-row v-if="state.showHowTo" class="d-flex align-center justify-center">
    <v-col>
      <p class="ml-3">Als u al een account hebt op een ander apparaat log dan in met uw schuilnaam en pin code. Die kunt u
        terugvinden op het andere apparaat door op <v-icon>mdi-dots-vertical</v-icon> rechtsboven te tikken en 'Inloggen op ander apparaat'
        te kiezen.
      </p>
    </v-col>
  </v-row>
  <v-row class="py-2 d-flex align-center justify-center">
    <v-col cols="auto">
      <p class="ml-3">Lees het <router-link to="/Privacybeleid">privacybeleid</router-link> nu of later.<br>
        Geen gebruikelijke juridische bla bla!</p>
    </v-col>
  </v-row>

  <v-row class="py-5 justify-end">
    <v-col cols="auto">
      <v-btn flat append-icon="mdi-arrow-right" @click="emit('exit-opening-screen')">
        Door
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { reactive } from 'vue'
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