<template>
  <ReportWarning v-if="store.rqActive === 'onWarning'" />
  <RunQuiz v-else-if="store.msActive === 'doQuiz'" :recoveryMode="state.recoveryMode" @quiz-is-done="store.msActive = 'showRecap'" />
  <QuizRecap v-else-if="store.msActive === 'showRecap'" @return-to-base="store.msActive = 'showResults'" />
  <QuizResults v-else-if="store.msActive === 'showResults'" @return-to-menu="restartPage" />
  <v-sheet v-else class="pa-0 mt-n6 text-center" color="#FEF1E5" :width="store.screenWidth" height="100vh">
    <v-row>
      <v-col cols="12">
        <h4>Hallo {{ store.userData.alias }}</h4>
        <h4>
          De vragen van deze week ({{ store.currentWeekNr }})<br />
          Per vraag krijg je 1 min de tijd
        </h4>
        <h3 class="text-red">Doe mee en win!</h3>
      </v-col>
      <v-col cols="12">
        <v-img :height="240" alt="Afbeelding mok" src="../assets/de-nieuwe-ster.png"></v-img>
      </v-col>
    </v-row>
    <v-row v-if="!state.userCompletedQuizBefore">
      <v-col cols="12">
        <h4 class="text-red">Elke vier weken een Nieuw Ster T-shirt</h4>
      </v-col>
      <v-col cols="2"></v-col>
      <v-col cols="8">
        <h4>Te verloten onder de spelers met de hoogste scores<br>Elke week nieuwe vragen</h4>
      </v-col>
      <v-col cols="2"></v-col>
      <v-col cols="10">
        <v-btn :disabled="!state.quizAvailable" color="purple" @click="startQuiz">Start</v-btn>
      </v-col>
    </v-row>
    <v-row v-else class="mr-2">
      <v-col cols="1"></v-col>
      <v-col cols="8" class="text-left">
        <p>Je hebt de quiz van deze week ({{ store.currentWeekNr }}) al gedaan. Zie de scores</p>
      </v-col>
      <v-col cols="3">
        <v-btn color="purple" @click="store.msActive = 'showRecap'">Toon</v-btn>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import { dbRef } from '../firebase'
import { child, get } from 'firebase/database'
import RunQuiz from './RunQuiz.vue'
import QuizRecap from './QuizRecap.vue'
import QuizResults from './QuizResults.vue'
import Cookies from 'universal-cookie'
import ReportWarning from './ReportWarning.vue'

const emit = defineEmits(['quiz-is-done', 'logout-app'])

const store = useAppStore()
const cookies = new Cookies()

const state = reactive({
  quizAvailable: false,
  problemText: '',
  problemCause: '',
  tipToResolve: '',
  recoveryMode: false,
  userCompletedQuizBefore: false,
})

onBeforeMount(() => {
  loadMetaData()
})

function loadMetaData() {
  get(child(dbRef, `/quizzes/metaData/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        store.metaObject = snapshot.val()
        const quizStrNumbers = Object.keys(store.metaObject)
        // get the quiz with quizNumbers converted to integers
        getQuiz(quizStrNumbers.map((strNr) => Number(strNr)))
      } else {
        console.log('Quiz meta data not found')
      }
    })
    .catch((error) => {
      console.error('Error while reading all available quizzes from database: ' + error.message)
    })
}

function getQuiz(allQuizNumbers) {
  // get the quiz meta data and store it in quizObject
  function storeQuizMetaData(quizNumber) {
    const quizDataObject = store.metaObject[quizNumber]
    if (quizDataObject) {
      store.quizObject = quizDataObject
    } else {
      store.rqActive = 'onWarning'
      store.problemText = `Kan quiz niet vinden`
      store.problemCause = `De quiz met nummer ${store.currentQuizNumber} bestaat niet in de database. Als het quiz nummer 'undefined' is, is er geen quiz voor deze week of geen enkele quiz om te oefenen.`
      store.tipToResolve = `Vraag de redacteur om een quiz voor deze week aan te maken of een oefen quiz toe te voegen.`
    }
  }

  /* Set the quiz number and check if a quiz is available for this week */
  for (const qNr of allQuizNumbers) {
    if (qNr !== 0) {
      // skip dummy quiz
      if (Number(store.metaObject[qNr].actionWeek) === store.currentWeekNr) {
        // if more quizzes are set to the current week number, pick the first
        storeQuizMetaData(qNr)
        store.currentQuizNumber = qNr
        state.quizAvailable = true
        break
      }
    }
  }

  /* Override the quiz number from unfinished quiz data if available */
  const unfinishedCookieData = cookies.get(`speelMee${store.userData.alias}`)
  if (unfinishedCookieData && unfinishedCookieData.alias === store.userData.alias && Object.keys(unfinishedCookieData.quizResult).length > 0) {
    // remove cookie and reset app when the last session ended in an error condition
    const errorConditions = [unfinishedCookieData.msActive, unfinishedCookieData.rqActive]
    if (errorConditions.includes('onError') || errorConditions.includes('onWarning')) {
      emit('logout-app')
    }
    // set recovery mode
    state.recoveryMode = true
    storeQuizMetaData(unfinishedCookieData.quizNumber)
    store.currentQuizNumber = unfinishedCookieData.quizNumber
    // continue with the unfinished quiz IMMEDIATELY
    store.msActive = 'doQuiz'
  }
}

/* Start the action week quiz if not completed before*/
function startQuiz() {
  if (store.userData.alias !== 'admin' && store.userData.completedQuizNumbers && store.userData.completedQuizNumbers.includes(store.currentQuizNumber)) {
    // admin can run a quiz multiple times but not take part in a competition
    state.userCompletedQuizBefore = true
  } else {
    state.userCompletedQuizBefore = false
    store.msActive = 'doQuiz'
  }
}

function restartPage() {
  loadMetaData()
  store.msActive = undefined
}
</script>
