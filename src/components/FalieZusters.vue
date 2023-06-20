<template>
  <v-sheet>
    <v-row class="d-flex justify-center align-center bg-grey-lighten-4">
      <v-col cols="auto">
        <v-img :width="350" src="../assets/Faliezusterklooster.png"></v-img>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="1">
      </v-col>
      <v-col cols="9">
        <h3>Het voormalig Faliezusterklooster ligt vlakbij de Minderbroederkerk, de Pater Vinktoren, de Jeker en de oude stadsmuur. Waaraan danken de faliezusters hun naam?</h3>
      </v-col>
      <v-col cols="2">
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn>
          a.Omdat ze op hun lie kregen van het stadsbestuur
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn>
          b.Aan hun zwarte hoofdsluier
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn>
          c.Aan de naam van Sint Phalius
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn>
          d.Aan de naam van de oprichtster
        </v-btn>
      </v-col>
    </v-row>
    <div class="py-8" />
    <h4>Meer over kloosterleven in Maastricht Museum</h4>
    <div class="py-5" />
    <v-row class="justify-start">
      <v-col cols="auto">
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('quit-quiz')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
const emit = defineEmits(['quit-quiz'])
</script>

<style scoped>
h4 {
  color: #F9A825;
}
</style>