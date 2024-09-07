<template>
  <ReportFbError v-if="store.rqActive === 'onError'" />
  <ReportWarning v-else-if="store.rqActive === 'onWarning'" />
  <ViewQExplanation v-else-if="state.doActivate === 'showExpl'" :quizExplanation="state.quizExplanation" @view-over="state.doActivate = undefined">
  </ViewQExplanation>
  <v-card v-else color="#FEF1E5" :width="store.screenWidth" min-height="100vh">
    <v-card-title v-if="!store.isArchivedQuiz" class="text-center">Je hebt de quiz van week {{ store.currentWeekNr }} voltooid</v-card-title>
    <v-card-title v-else class="text-center">Je hebt de quiz voltooid</v-card-title>
    <v-card-text>Je had {{ countGood() }} van de {{ countAll() }} antwoorden goed</v-card-text>
    <v-card-title class="text-center">{{ appreciationText() }}</v-card-title>
    <v-btn @click="state.doActivate = 'showExpl'">Bekijk nu de toelichting op de quiz</v-btn>
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

const store = useAppStore()
const emit = defineEmits(['return-to-base'])
const emptyQuillValue = '<p><br></p>'

const state = reactive({
  quizExplanation: undefined,
  doActivate: undefined,
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
</script>
