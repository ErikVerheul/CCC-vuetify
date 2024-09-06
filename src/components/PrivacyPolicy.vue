<template>
  <AppBar :withActivator="false" />
  <v-container class="max-container-width">
    <h2>Privacy functies</h2>

    <h3>Verwijder alle gegevens</h3>
    <p>
<<<<<<< HEAD
      Gegevens en media die je op het speelmee.app platform hebt achtergelaten worden vewijderd. Via de app krijg je een
      bevestiging; daarna kennen we je niet meer.<br />
=======
      Gegevens en media die je op het speelmee.app platform hebt achtergelaten worden vewijderd. Via de app krijg je een bevestiging; daarna kennen we je niet
      meer.<br />
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
      De schuilnaam komt direct beschikbaar voor anderen.
    </p>

    <h3>Prestaties kunnen eventueel worden gepubliceerd</h3>
    <p>
<<<<<<< HEAD
      Prestaties kunnen in de app gepubliceerd worden. Waarom vragen naar je geboortedatum en/of geslacht? Voor
      eventuele vermelding op de "hall of fame" lijsten.
=======
      Prestaties kunnen in de app gepubliceerd worden. Waarom vragen naar je geboortedatum en/of geslacht? Voor eventuele vermelding op de "hall of fame"
      lijsten.
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
    </p>

    <h3>Tegenhouden van een publicatie</h3>
    <p>Prestaties van fysieke uitdagingen kunnen met een knop verwijderd worden.</p>

    <h3>Video</h3>
<<<<<<< HEAD
    <p>
      Selfie- en sprint- video worden na 15 min. verwijderd. De deelnemer kan die video zelf delen naar een social
      netwerk naar keuze.
    </p>

    <h3>Echte naam en profiel foto</h3>
    <p>
      Het speelmee.app-platform beschouwt een echte naam en profielfoto als gevoelige gegevens. Deze gegevens kunnen
      uitsluited door speelmee.app administratie ingevoerd worden.
=======
    <p>Selfie- en sprint- video worden na 15 min. verwijderd. De deelnemer kan die video zelf delen naar een social netwerk naar keuze.</p>

    <h3>Echte naam en profiel foto</h3>
    <p>
      Het speelmee.app-platform beschouwt een echte naam en profielfoto als gevoelige gegevens. Deze gegevens kunnen uitsluited door speelmee.app administratie
      ingevoerd worden.
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
    </p>

    <h3>Transparant</h3>
    <p>
      Het hele systeem is in te zien op:
      <a href="https://t.ly/vtCMQ">GitHub</a>
    </p>
    <v-divider class="mt-5"></v-divider>
    <v-row class="py-5 justify-start">
      <v-col cols="auto">
        <v-btn flat prepend-icon="mdi-arrow-left" @click="router.go(-1)">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import router from '@/router'
import { useAppStore } from '../store/app.js'

const store = useAppStore()
</script>

<style scoped>
h2 {
  color: rgb(53, 28, 92);
}

h3 {
  color: rgb(53, 28, 92);
  margin-top: 10px;
}
</style>
