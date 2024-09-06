<template>
  <ReportFbError v-if="store.rqActive === 'onError'" />
  <ReportWarning v-else-if="store.rqActive === 'onWarning'" />
<<<<<<< HEAD
  <ViewQExplanation
    v-else-if="state.doActivate === 'showExpl'"
    :questionObject="state.questionObject"
    @view-over="state.doActivate = undefined"
  ></ViewQExplanation>
  <v-card v-else>
    <v-card-title v-if="!store.isArchivedQuiz"
      >Je hebt de quiz van week {{ store.currentWeekNr }} voltooid</v-card-title
    >
    <v-card-title v-else
      >Je hebt de quiz van het jaar {{ store.quizObject.actionYear }} en week
      {{ store.quizObject.actionWeek }} voltooid</v-card-title
    >
    <v-card-text>Je had {{ countGood() }} van de {{ countAll() }} antwoorden goed</v-card-text>
    <v-card-title class="text-center">{{ appreciationText() }}</v-card-title>
    <v-card-text>Bekijk nu de verhalen achter de vragen. Of ga verder met de ranglijst.</v-card-text>
    <v-row>
      <v-col cols="12">
        <v-list lines="one">
          <v-list-item
            v-for="item in state.questionIndexData"
            :title="getText(item)"
            @click="showExplanation(item)"
          ></v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-divider></v-divider>
      </v-col>
    </v-row>
=======
  <ViewQExplanation v-else-if="state.doActivate === 'showExpl'" :quizExplanation="state.quizExplanation" @view-over="state.doActivate = undefined">
  </ViewQExplanation>
  <v-card v-else color="#FEF1E5" min-height="100vh">
    <v-card-title v-if="!store.isArchivedQuiz" class="text-center">Je hebt de quiz van week {{ store.currentWeekNr }} voltooid</v-card-title>
    <v-card-title v-else class="text-center">Je hebt de quiz voltooid</v-card-title>
    <v-card-text>Je had {{ countGood() }} van de {{ countAll() }} antwoorden goed</v-card-text>
    <v-card-title class="text-center">{{ appreciationText() }}</v-card-title>
    <v-btn @click="state.doActivate = 'showExpl'">Bekijk nu de toelichting op de quiz</v-btn>
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
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
import ReportFbError from './ReportFbError.vue'
import ReportWarning from './ReportWarning.vue'
<<<<<<< HEAD
=======

const store = useAppStore()
const emit = defineEmits(['return-to-base'])
const emptyQuillValue = '<p><br></p>'
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c

const state = reactive({
  quizExplanation: undefined,
  doActivate: undefined,
<<<<<<< HEAD
  questionIndexData: [],
  questionObject: {},
=======
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
})

onBeforeMount(() => {
  loadQuizExplanation()
})

function countAll() {
  if (store.compactResult) return store.compactResult.length
  return 0
}

function countGood() {
  if (store.compactResult) {
    let count = 0
    store.compactResult.forEach((el) => {
      if (el === true) count++
    })
    return count
  }
  return 0
}

function appreciationText() {
  const ratio = countGood() / countAll()
  if (ratio >= 0.9) return 'Uitstekend!'
  if (ratio >= 0.8) return 'Goed!'
  if (ratio >= 0.6) return 'Redelijk'
  return 'Dat kan beter'
}

<<<<<<< HEAD
function loadQuizQuestionsIndex() {
  // get all question index data for the current quiz
  get(child(dbRef, `/quizzes/questions/index/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.indexObject = snapshot.val()
        const indexObjectKeys = Object.keys(state.indexObject)
        // get the question numbers of the questions assigned to this quiz
        state.questionIndexData = []
        indexObjectKeys.forEach((key) => {
          // get the question with currentQuizNumber
          if (Number(state.indexObject[key].quizNumber) === store.currentQuizNumber) {
            // add this data to these objects
            state.indexObject[key].qNumber = key
            state.questionIndexData.push(state.indexObject[key])
          }
        })
      } else {
        store.problemText = `Kan de index van alle quiz vragen vinden`
        store.problemCause = `De index is leeg`
        store.tipToResolve = `Vraag de redacteur om een of meerdere quiz vragen aan te maken`
        store.rqActive = 'onWarning'
      }
    })
    .catch((error) => {
      store.firebaseError = error
      store.fbErrorContext = `De fout is opgetreden bij het lezen van de index van alle quiz vragen`
      store.rqActive = 'onError'
    })
}

function getText(item) {
  if (item.ankeiler && item.ankeiler.length > 2) return item.ankeiler
  return item.title
}

function showExplanation(item) {
  get(child(dbRef, `/quizzes/questions/${Number(item.qNumber)}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.questionObject = snapshot.val()
        state.questionObject.qTitle = item.title
        state.doActivate = 'showExpl'
      } else {
        store.problemText = `Kan de quiz vraag niet vinden`
        store.problemCause = `De quiz vraag met nummer ${item.qNumber} bestaat niet.`
        store.tipToResolve = `Vraag de redacteur om deze quiz vraag aan te maken`
        store.rqActive = 'onWarning'
      }
    })
    .catch((error) => {
      store.rqActive = 'onError'
      store.firebaseError = error
      store.fbErrorContext = `De fout is opgetreden bij het lezen van quiz vraag met nummer ${item.qNumber}`
    })
}
=======
function loadQuizExplanation() {
  get(child(dbRef, `/quizzes/themes/${store.currentQuizNumber}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const explanation = snapshot.val()
        if (explanation === emptyQuillValue || explanation === '') {
          state.quizExplanation = '<p>De toelichting is nog niet beschikbaar'
        } else state.quizExplanation = explanation
      } else state.quizExplanation = '<p>De toelichting is nog niet beschikbaar'
    })
    .catch((error) => {
      store.firebaseError = error
      store.fbErrorContext = `De fout is opgetreden bij het lezen van de toelichting op de quiz`
      store.rqActive = 'onError'
    })
}
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
</script>
