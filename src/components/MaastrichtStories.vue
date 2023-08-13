<template>
  <v-sheet v-if="!state.doQuiz" max-width="600">
    <v-row justify="center">
      <v-col cols="auto">
        <h3 class="py-3 text-red">Doe mee en win!</h3>
        <ul class="py-3">
          <li @click="startQuiz">
            Vijf vragen van deze week (37)<br>
            Per vraag krijg je 3 min de tijd
          </li>
        </ul>
        <v-avatar class="ma-3" size="300" rounded="0">
          <v-img src="../assets/Faliezusterklooster.png"></v-img>
        </v-avatar>
        <h3 class="text-red">Unieke mok met historische opdruk</h3>
        <ul class="py-3">
          <li @click="">
            Het vragen archief:<br>
            om te oefenen
          </li>
        </ul>
      </v-col>
    </v-row>
    <v-row class="py-3 justify-start">
      <v-col cols="auto">
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('return-to-menu')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>
  <FalieZusters v-else @quit-quiz="state.doQuiz = false"></FalieZusters>
</template>

<script setup>
import { reactive } from 'vue'
import FalieZusters from './FalieZusters.vue'
import { useAppStore } from '../store/app.js'
const emit = defineEmits(['return-to-menu'])
const store = useAppStore()

const state = reactive({
  doQuiz: false
})

function startQuiz() {
  state.doQuiz = true
}
</script>