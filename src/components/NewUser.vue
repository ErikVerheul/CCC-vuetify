<template>
  <v-container class="pa-0 mt-n6">
    <v-card flat class="text-center" color="#FEF1E5" :width="store.screenWidth" height="100vh">
      <v-card-text>Gebruik je deze app voor het eerst?</v-card-text>
      <v-btn color="blue" @click="emit('change-to-signup')">Kies dan een schuilnaam</v-btn>
      <v-card-text><small>Dan houdt de app je score bij!</small></v-card-text>
      <v-img src="../assets/brug.png"></v-img>
      <v-card-text><i>Test je kennis over historie en natuur</i></v-card-text>
      <v-btn color="blue" @click="emit('change-to-signin')">Heb je al een schuilnaam?</v-btn>
      <v-card-text><small>Lees het <router-link to="/Privacybeleid">privacybeleid</router-link> nu of later.<br>
          Geen gebruikelijke juridische bla bla!</small></v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { useAppStore } from '../store/app.js'

const props = defineProps(['aliasesInUseInclAdmin'])
const emit = defineEmits(['change-to-signup', 'change-to-signin', 'exit-signin'])
const store = useAppStore()

</script>