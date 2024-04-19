<template>
  <QuizResults v-if="state.showResults" @return-to-menu="state.showResults = false"></QuizResults>
  <v-sheet v-else-if="!state.doQuiz" class="text-center" :max-width="store.screenWidth">
    <v-row>
      <v-col cols="12" class="my-0 py-0">
        <h4>Hallo {{ store.userData.alias }}</h4>
        <h4>De vijf vragen van deze week ({{ store.currentWeekNr }})<br>
          Per vraag krijg je 1 min de tijd</h4>
        <h3 class="text-red">Doe mee en win!</h3>
      </v-col>
      <v-col cols="12">
        <v-img :height="240" src="../assets/mok.png"></v-img>
      </v-col>
      <v-col cols="12" class="my-0 py-0">
        <h3 class="text-red">Unieke erfgoed beker</h3>
      </v-col>
    </v-row>
    <v-row v-if="!state.quizWasCompleted">
      <v-col cols="1"></v-col>
      <v-col cols="8" class="my-0 py-0 text-left">
        <h4>Elke vier weken met nieuwe opdruk *)<br>Te verloten onder de spelers met de hoogste scores. Elke week nieuwe vragen.</h4>
      </v-col>
      <v-col cols="2">
        <v-btn :disabled="!quizAvailable()" color="purple" @click="startQuiz">Start</v-btn>
      </v-col>
      <v-col cols="1"></v-col>
      <v-col cols="12">
        <p>*) Voor 12.50 ook verkrijgbaar bij CoffeeLovers</p>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="1"></v-col>
      <v-col cols="8" class="text-left">
        <p>Je hebt de quiz van deze week ({{ store.currentWeekNr }}) al gedaan. Zie de scores </p>
      </v-col>
      <v-col cols="3">
        <v-btn color="purple" @click="state.showResults = true">Toon</v-btn>
      </v-col>
    </v-row>
  </v-sheet>
  <RunQuiz v-else :quizNumber="state.qNumber" :isArchivedQuiz="state.isArchivedQuiz" @quiz-continue="showResultsData"></RunQuiz>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import { dbRef } from '../firebase'
import { child, get } from 'firebase/database'
import RunQuiz from './RunQuiz.vue'
import QuizResults from './QuizResults.vue'

const store = useAppStore()

const state = reactive({
  metaObject: {},
  quizNumbers: [],
  doQuiz: false,
  qNumber: undefined,
  isArchivedQuiz: false,
  quizWasCompleted: false,
  showResults: false
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

function quizAvailable() {
  for (const qNr of state.quizNumbers)
    if (qNr !== 0) {
      // skip dummy quiz
      if (Number(state.metaObject[qNr].actionWeek) === store.currentWeekNr) {
        // if more quizzez are set to the current week number, pick the first
        state.qNumber = qNr
        return true
      }
    }
  return false
}

function startQuiz() {
  if (store.userData.alias !== 'admin' && store.userData.completedQuizNumbers && store.userData.completedQuizNumbers.includes(state.qNumber)) {
    // admin can run a quiz multiple times but not take part in a competition
    state.quizWasCompleted = true
  } else {
    state.quizWasCompleted = false
    state.doQuiz = true
    state.isArchivedQuiz = false
  }
}

function showResultsData() {
  state.doQuiz = false
  state.showResults = true
}
</script>