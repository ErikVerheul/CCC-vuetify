<template>
  <v-sheet class="pa-2 text-center mx-auto" v-if="!state.doQuiz"  :max-width="store.screenWidth">
    <h3 class="py-3 text-red">Doe mee en win!</h3>
    <v-row>
      <v-col cols="9" class="text-left">       
        <p>Vijf vragen van deze week (37)<br>
          Per vraag krijg je 3 min de tijd</p>
      </v-col>
      <v-col cols="3">
        <v-btn color="purple" @click="startQuiz">Start</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-avatar class="ma-3" size="300" rounded="0">
        <v-img src="../assets/mok2.jpg"></v-img>
      </v-avatar>     
    </v-row>
    <v-row>
      <v-col>
        <h3 class="text-red">Unieke mok met historische opdruk</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9" class="text-left">
        <p>Het vragen archief<br>
          Om te oefenen</p>
      </v-col>
      <v-col cols="3">
        <v-btn color="purple" @click="">Start</v-btn>
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
  <RunQuiz v-else :quizNumber='1' @quiz-continue="state.doQuiz = false"></RunQuiz>
</template>

<script setup>
import { reactive } from 'vue'
import RunQuiz from './RunQuiz.vue'
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