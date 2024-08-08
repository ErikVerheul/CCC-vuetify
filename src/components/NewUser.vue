<template>
  <v-container class="max-container-width text-center">
    <p>Gebruik je deze app voor het eerst?</p>
    <v-btn color="blue" @click="emit('change-to-signup')">Kies dan een schuilnaam</v-btn>
    <p><small>Dan houdt de app je score bij!</small></p>
    <v-img src="../assets/brug.png"></v-img>
    <p><i>Test je kennis over historie en natuur</i></p>
    <v-btn class="my-6" color="blue" @click="emit('change-to-signin')">Heb je al een schuilnaam?</v-btn>
    <p>
      <small
        >Lees het <router-link to="/Privacybeleid">privacybeleid</router-link> nu of later.<br />
        Geen gebruikelijke juridische bla bla!</small
      >
    </p>
  </v-container>
</template>
<style scoped>
p {
  margin-bottom: 1em;
}
</style>

<script setup>
import { useAppStore } from '../store/app.js'

const props = defineProps(['aliasesInUseInclAdmin'])
const emit = defineEmits(['change-to-signup', 'change-to-signin', 'exit-signin'])
const store = useAppStore()
</script>
