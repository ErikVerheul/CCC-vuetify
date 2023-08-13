<template>
  <v-sheet width="window.innerWidth">
    <v-row class="d-flex justify-center ">
      <v-col cols="auto">
        <v-img :width="300" src="../assets/Faliezusterklooster.png"></v-img>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="1">
      </v-col>
      <v-col cols="10">
        <h3>Het voormalig Faliezusterklooster ligt vlakbij de Minderbroederkerk, de Pater Vinktoren, de Jeker en de oude stadsmuur. Waaraan danken de faliezusters hun naam?</h3>
      </v-col>
      <v-col cols="1">
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn size="small">
          a.Omdat ze op hun falie kregen van<br>het stadsbestuur
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn size="small">
          b.Aan hun zwarte hoofdsluier
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn size="small">
          c.Aan de naam van Sint Phalius
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn size="small">
          d.Aan de naam van de oprichtster
        </v-btn>
      </v-col>
    </v-row>
    <h4 class="py-5">Meer over kloosterleven in Maastricht Museum</h4>
    <v-row class="py-3 justify-start">
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