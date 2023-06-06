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
        <h3>Verbeter spelenderwijs<br>je kennis en conditie<br>en geniet van cultuur.<br><br></h3>
        <h4>Even aanmelden: kies<br>een alias en pin code<br><br>
          Dat is alles om te kunnen meedoen!
        </h4>
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
</template>

<script setup>
import { reactive } from 'vue'
const props = defineProps(['showOpeningScreen'])
const emit = defineEmits(['exit-opening-screen'])
</script>