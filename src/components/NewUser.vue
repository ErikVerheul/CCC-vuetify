<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card color="yellow-lighten-3" theme="dark" :width="store.screenWidth">
          <v-card-text>Gebruik je deze app voor het eerst?</v-card-text>
          <v-btn color="blue" @click="emit('change-to-signup')">Kies dan een schuilnaam</v-btn>
          <v-card-text><small>Dan houdt de app je score bij! [screenwidth={{ store.screenWidth }}]</small></v-card-text>
          <v-img src="../assets/brug.png"></v-img>
          <v-card-text><i>Test je kennis over historie en natuur</i></v-card-text>
          <v-btn class="my-6" color="blue" @click="emit('change-to-signin')">Heb je al een schuilnaam?</v-btn>
          <p><small>Lees het <router-link to="/Privacybeleid">privacybeleid</router-link> nu of later.<br>
              Geen gebruikelijke juridische bla bla!</small></p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAppStore } from '../store/app.js'

const props = defineProps(['aliasesInUseInclAdmin'])
const emit = defineEmits(['change-to-signup', 'change-to-signin', 'exit-signin'])
const store = useAppStore()

</script>