<template>
  <ViewQExplanation v-if="state.showExpl" :questionObject="state.questionObject" @view-over="state.showExpl=false"></ViewQExplanation>
  <v-card v-else width="store.screenWidth">
    <v-card-title v-if="!store.isArchivedQuiz">Je hebt de quiz van week {{ store.currentWeekNr }} voltooid</v-card-title>
    <v-card-title v-else>Je hebt de quiz van het jaar {{ store.quizObject.actionYear }} en week {{ store.quizObject.actionWeek }} voltooid</v-card-title>
    <v-card-text>
      <p>Je had {{ countGood() }} van de {{ countAll() }} antwoorden goed<br></p>
      <p>Bekijk nu de verhalen achter de vragen. Of ga verder met de ranglijst.</p>
    </v-card-text>
    <v-row>
      <v-col cols="12">
        <v-list lines="one">
          <v-list-item v-for="item in state.questionIndexData" :title="item.title" @click="showExplanation(item)"></v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-card-actions>
      <v-row>
        <v-col cols="12" class="text-right">
          <v-btn flat append-icon="mdi-arrow-right" @click="emit('return-to-base')">
            Verder
            <template v-slot:append>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { dbRef } from '../firebase'
import { child, get } from 'firebase/database'
import { onBeforeMount, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import ViewQExplanation from './ViewQExplanation.vue'

const state = reactive({
  showExpl: false,
  questionIndexData: [],
  questionObject: {}
})

onBeforeMount(() => {
  loadQuizQuestions()
})

const emit = defineEmits(['return-to-base'])
const store = useAppStore()

function countAll() {
  if (store.compactResult) return store.compactResult.length
  return 0
}

function countGood() {
  if (store.compactResult) {
    let count = 0
    store.compactResult.forEach(el => {
      if (el === true) count++
    })
    return count
  }
  return 0
}

function loadQuizQuestions() {
  // get all question index data for the current quiz
  get(child(dbRef, `/quizzes/questions/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.indexObject = snapshot.val()
      const indexObjectKeys = Object.keys(state.indexObject)
      // get the question numbers of the questions assigned to this quiz
      state.questionIndexData = []
      indexObjectKeys.forEach((key) => {
        // get the question with currentQNumber
        if (Number(state.indexObject[key].quizNumber) === store.currentQNumber) {
          // add this data to these objects
          state.indexObject[key].qNumber = key
          state.questionIndexData.push(state.indexObject[key])
        }
      })
    } else {
      console.log("No quizzes available")
    }
  }).catch((error) => {
    console.error('Error while reading all available quizzes from database: ' + error.message)
  })
}

function showExplanation(item) {
  get(child(dbRef, `/quizzes/questions/${Number(item.qNumber)}`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.questionObject = snapshot.val()
      state.questionObject.qTitle = item.title
      state.showExpl = true
    } else {
      console.log("No quiz-question data available")
    }
  }).catch((error) => {
    console.error('While reading the quiz-question data from database: error message = ' + error.message)
  })
}

</script>