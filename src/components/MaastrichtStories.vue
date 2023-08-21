<template>
  <v-sheet class="pa-2 text-center mx-auto" v-if="!state.doQuiz" :max-width="store.screenWidth">
    <h3 class="py-3 text-red">Doe mee en win!</h3>
    <v-row>
      <v-col cols="9" class="text-left">
        <p>Vijf vragen van deze week ({{ getWeekNumber() }})<br>
          Per vraag krijg je 3 min de tijd</p>
      </v-col>
      <v-col cols="3">
        <v-btn :disabled="!quizAvailable()" color="purple" @click="startQuiz">Start</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-avatar class="ma-3" size="300" rounded="0">
        <v-img src="../assets/mok34.png"></v-img>
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
        <v-btn :disabled="!historyAvailable()" color="purple" @click="startOldQuiz">Start</v-btn>
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
  <RunQuiz v-else :quizNumber="state.qNumber" :isArchivedQuiz= "state.isArchivedQuiz" @quiz-continue="state.doQuiz = false"></RunQuiz>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue'
import { db, dbRef } from '../firebase'
import { ref, child, get, set, remove, update } from 'firebase/database'
import RunQuiz from './RunQuiz.vue'
import { useAppStore } from '../store/app.js'
const emit = defineEmits(['return-to-menu'])
const store = useAppStore()

const state = reactive({
  metaObject: {},
  quizNumbers: [],
  doQuiz: false,
  qNumber: undefined,
  isArchivedQuiz: false
})

onBeforeMount(() => {
  loadMetaData()
})

function loadMetaData() {
  get(child(dbRef, `/quizzes/metaData/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.metaObject = snapshot.val()
      const quizStrNumbers = Object.keys(state.metaObject)
      state.quizNumbers = quizStrNumbers.map((strNr) => Number(strNr))
    } else {
      console.log("Quiz meta data not found")
    }
  }).catch((error) => {
    console.error(`Error while reading quiz meta data from database: ` + error.message)
  })
}

/* See https://www.geeksforgeeks.org/calculate-current-week-number-in-javascript/ */
function getWeekNumber() {
  const currentDate = new Date()
  const startDate = new Date(currentDate.getFullYear(), 0, 1)
  const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000))
  return Number(Math.ceil(days / 7))
}

function quizAvailable() {
  for (const qNr of state.quizNumbers)
    if (qNr !== 0) {
      // skip dummy quiz
      if (Number(state.metaObject[qNr].actionWeek) === getWeekNumber()) return true
    }
  return false
}

function historyAvailable() {
  for (const qNr of state.quizNumbers)
    if (qNr !== 0) {
      // skip dummy quiz
      if (Number(state.metaObject[qNr].actionWeek) < getWeekNumber()) return true
    }
  return false
}


function startQuiz() {
  const currentWeekQnumbers = state.quizNumbers.filter(qNr => Number(state.metaObject[qNr].actionWeek) === getWeekNumber())
  state.qNumber = currentWeekQnumbers[0]
  state.doQuiz = true
  state.isArchivedQuiz = false
}

function startOldQuiz() {
  const oldWeekQnumbers = state.quizNumbers.filter(qNr => Number(state.metaObject[qNr].actionWeek) < getWeekNumber())
  state.qNumber = oldWeekQnumbers[Math.round(Math.random() * (oldWeekQnumbers.length - 1))]
  state.doQuiz = true
  state.isArchivedQuiz = true
}
</script>