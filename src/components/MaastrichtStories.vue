<template>
  <QuizResults v-if="state.showResults" @return-to-menu="emit('return-to-menu')"></QuizResults>
  <v-sheet v-else-if="!state.doQuiz" class="pa-2 text-center mx-auto" :max-width="store.screenWidth">
    <v-row>
      <v-col class="mt-8 pl-12 text-left">
        <h4>De vijf vragen van deze week ({{ store.currentWeekNr }})<br>
          Per vraag krijg je 1 min de tijd</h4>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-center">
        <h3 class="py-3 text-red">Doe mee en win!</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-avatar class="ml-12" size="300" rounded="0">
        <v-img src="../assets/mok34.png"></v-img>
      </v-avatar>
    </v-row>
    <v-row>
      <v-col>
        <h3 class="text-red">Unieke erfgoed beker</h3>
      </v-col>
    </v-row>
    <template v-if="!state.quizWasCompleted">
      <v-row>
        <v-col cols="9" class="pl-12 text-left">
          <h4>Elke vier weken met nieuwe opdruk. Te verloten onder de spelers met de hoogste scores. Elke week nieuwe vragen.</h4>
        </v-col>
        <v-col cols="3">
          <v-btn :disabled="!quizAvailable()" color="purple" @click="startQuiz">Start</v-btn>
        </v-col>
      </v-row>
    </template>
    <v-row v-else>
      <v-col cols="9" class="pl-12 text-left">
        <p>U hebt de quiz van deze week ({{ store.currentWeekNr }}) al gedaan. Zie de scores </p>
      </v-col>
      <v-col cols="3">
        <v-btn color="purple" @click="state.showResults = true">Toon</v-btn>
      </v-col>
    </v-row>
    <v-row>
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
  <RunQuiz v-else :quizNumber="state.qNumber" :isArchivedQuiz="state.isArchivedQuiz" @quiz-continue="showResultsData"></RunQuiz>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import { db, dbRef } from '../firebase'
import { ref, child, get, set, remove, update } from 'firebase/database'
import RunQuiz from './RunQuiz.vue'
import QuizResults from './QuizResults.vue'
const emit = defineEmits(['return-to-menu'])
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
      if (Number(state.metaObject[qNr].actionWeek) === store.currentWeekNr) return true
    }
  return false
}

function startQuiz() {
  const currentWeekQnumbers = state.quizNumbers.filter(qNr => Number(state.metaObject[qNr].actionWeek) === store.currentWeekNr)
  state.qNumber = currentWeekQnumbers[0]
  if (store.userData.alias !== 'admin' && store.userData.completedQuizNumbers && store.userData.completedQuizNumbers.includes(state.qNumber)) {
    // admin can run a quiz multiple times
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