<template>
  <div v-if="showOpeningScreen">
    <v-row class="d-flex align-start justify-center">
      <v-col cols="12">
        <v-card color="purple">
          <v-card-title class="text-h3">
            Welkom
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="d-flex align-center justify-center">
      <v-col cols="auto">
        <h1>speelmee app<br><br></h1>
        <h3>Meet spelenderwijs<br>je kennis en conditie<br>en geniet van cultuur.</h3>
        <div class="py-3" />
        <h4>Even aanmelden: kies<br>een alias en pin code</h4>
        <div class="py-3" />
        <v-btn block density="compact" append-icon="mdi-arrow-right" @click="emit('exit-opening-screen')">
          Ik heb al een alias en pin code
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
        <div class="py-3" />
        <h4>Dat is alles om te kunnen meedoen!</h4>
      </v-col>
    </v-row>
    <div class="py-10" />
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
    <div class="py-3" />
    <p class="text-left">Het privacybeleid lees nu of later<br>
      Geen gebruikelijke juridische bla bla!</p>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const props = defineProps(['showOpeningScreen'])
const emit = defineEmits(['exit-opening-screen'])
</script>