<template>
  <ReportFbError v-if="state.onError" :firebaseError="state.firebaseError" :fbErrorContext="state.fbErrorContext" @return-to="emit('quiz-is-done')"></ReportFbError>
  <ReportWarning v-else-if="state.onWarning" :problemText="state.problemText" :problemCause="state.problemCause" :tipToResolve="state.tipToResolve" @return-to="emit('quiz-is-done')"></ReportWarning>
  <template v-else>
    <v-sheet class="ma-2" :max-width="store.screenWidth">
      <template v-if="!state.showExplanation">
        <v-row no-gutters>
          <div v-html="state.currentQuestion.body"></div>
        </v-row>
        <v-row no-gutters>
          <v-list lines="two" density="compact">
            <v-list-item v-for="(num, index) in state.currentQuestion.statementsArray" :subtitle="composeStatement(index)" @click="qAnswer(index)"
              :style="{ 'background-color': bgColor }"></v-list-item>
          </v-list>
        </v-row>
      </template>
      <template v-else>
        <p>Je antwoord was <b>{{ getResultText() }}</b></p>
        <p v-if="state.correctStatements.length === 1">Het juiste antwoord is:</p>
        <p v-else>De juiste antwoorden zijn:</p>
        <v-list lines="two" density="compact">
          <v-list-item v-for="(num, index) in state.correctStatements" :subtitle="composeCorrectAnswers(index)" :style="{ 'background-color': '#DCEDC8' }"></v-list-item>
        </v-list>
        <p v-if="isTextAvailable()" v-html="state.currentQuestion.correctAnswer"></p>
        <h3 v-if="!isTextAvailable()" class="py-12">Sorry, de toelichting is niet beschikbaar</h3>
        <p class="py-2">Meer hierover na afloop van de quiz</p>
      </template>
    </v-sheet>

    <v-sheet v-if="!state.showExplanation" class="pa-2" :height="state.counterHeight" :max-width="store.screenWidth">
      <v-row v-if="!state.done">
        <v-col v-if="state.timerStarted" cols="7">
          <v-btn @click="finishQuestion()">{{ getReadyText() }}</v-btn>
        </v-col>
        <v-col v-else cols="7">
          <p>{{ state.currentQuestion.gameRules }}<br>Binnen 1 min</p>
        </v-col>
        <v-col cols="5">
          <p class="text-right">Resterende tijd</p>
          <p class="text-right color-red">{{ state.clockValue }}</p>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="7">
          {{ state.wrapupMsg }}
        </v-col>
        <v-col cols="5">
          <p class="text-right">Resterende tijd<br>{{ state.clockValue }}</p>
        </v-col>
      </v-row>
    </v-sheet>

    <v-divider></v-divider>
    <v-row class="mt-2">
      <v-col class="text-right">
        <v-btn :disabled="!state.done" flat append-icon="mdi-arrow-right" @click="nextStep()">
          Verder
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
  </template>
</template>

<style scoped>
.color-red {
  color: red
}
</style>

// to allow to exit the app and return to the state where left, the needed data is collected in the object state.progress and saved in the cookie spleelmee-progress

<script setup>
import { onBeforeMount, reactive, watch } from 'vue'
import { useAppStore } from '../store/app.js'
import { db, dbRef } from '../firebase'
import { ref, child, get, set } from 'firebase/database'
import ReportFbError from "./ReportFbError.vue"
import ReportWarning from "./ReportWarning.vue"
import Cookies from 'universal-cookie'

const store = useAppStore()
const emit = defineEmits(['quiz-is-done'])

// must be non-reactive
let bgColor = undefined

onBeforeMount(() => {
  loadQuiz(store.currentQNumber)
})

const cookies = new Cookies()

const state = reactive({
  onError: false,
  onWarning: false,
  firebaseError: {},
  problemText: '',
  fbErrorContext: '',
  problemCause: '',
  tipToResolve: '',
  quizObject: {},
  indexObject: {},
  questionIds: [],
  currentQuestionIdx: 0,
  currentQuestion: {},
  correctStatements: [],
  answerIsRight: false,
  userAnswers: [],
  timerStarted: false,
  seconds: 0,
  timerId: undefined,
  timeout: 60,
  done: false,
  wrapupMsg: '',
  showExplanation: false,
  counterHeight: 60,
  quizResult: {},
  lastCookieQuestionResult: null,
  quizProgress: {}
})

function getReadyText() {
  if (store.isArchivedQuiz) return 'Onthul resultaat'
  return 'Verzend antwoord'
}

function getResultText() {
  if (state.answerIsRight) return 'goed!'
  return 'fout!'
}

function loadQuiz(quizNumber) {
  store.compactResult = []
  // start with registering progress
  state.quizProgress.alias = store.userData.alias
  state.quizProgress.quizNumber = quizNumber
  // get the unfinished quiz data if available
  const retrievedCookie = cookies.get('speelMeeProgress')
  if (retrievedCookie) {
    state.showExplanation = retrievedCookie.showExplanation
    const cookieQuizResults = retrievedCookie.quizResult
    if (cookieQuizResults) {
      const allKeys = Object.keys(cookieQuizResults)
      if (allKeys.length > 0) {
        const lastKey = allKeys.slice(-1)[0]
        state.lastCookieQuestionResult = cookieQuizResults[lastKey]
        // assign the unfinished quiz results to the running quiz results
        state.quizResult = cookieQuizResults
        createRightOrWrongMessage(state.lastCookieQuestionResult.correctAnswer)
        if (state.lastCookieQuestionResult.time) {
          state.clockValue = state.timeout - state.lastCookieQuestionResult.time
        } else {
          // time was overdue
          state.clockValue = 0
        }
      }
    } else {
      state.onWarning = true
      state.problemText = `De cookie met de gegevens van de afgebroken sessie is niet compleet`
      state.problemCause = `De voorlopige resultaten zijn niet beschikbaar`
      state.tipToResolve = `De cookie wordt nu verwijderd. Start de app opnieuw`
      cookies.remove('speelMeeProgress', { sameSite: true })
    }
  }
  // get the quiz
  const quizDataObject = store.metaObject[quizNumber]
  if (quizDataObject) {
    store.quizObject = quizDataObject
    loadQuestionIds(quizNumber, retrievedCookie)
  } else {
    state.onWarning = true
    state.problemText = `Kan quiz niet vinden`
    state.problemCause = `De quiz met nummer ${quizNumber} bestaat niet in de database. Als het quiz nummer 'undefined' is, is er geen quiz voor deze week of geen enkele quiz om te oefenen.`
    state.tipToResolve = `Vraag de redacteur om een quiz voor deze week aan te maken of een oefen quiz toe te voegen.`
  }
}

function loadQuestionIds(quizNumber, unfinishedQuizData) {
  get(child(dbRef, `/quizzes/questions/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.indexObject = snapshot.val()
      const indexObjectKeys = Object.keys(state.indexObject)
      // get the question numbers of the questions assigned to this quiz
      state.questionIds = []
      indexObjectKeys.forEach((key) => {
        if (Number(state.indexObject[key].quizNumber) === quizNumber) {
          state.questionIds.push(key)
        }
      })

      /* Process the data from the cookie saved when the quiz was started but unfinished only if picked up by the same user and the quiz id had not changed.
       * E.g. the user signed out and signed in with another alias.
       * E.g. during the lifetime of the cookie another action week was started with another quiz.
       */
      if (unfinishedQuizData && unfinishedQuizData.alias === store.userData.alias && unfinishedQuizData.quizNumber === quizNumber) {
        // continue unfinished quiz
        state.quizProgress.questionId = unfinishedQuizData.questionId
        // find the current question index
        for (let i = 0; i < state.questionIds.length; i++) {
          if (state.questionIds[i] === unfinishedQuizData.questionId) state.currentQuestionIdx = i
        }
        // find the last answered questionIdx
        const lastQuestionIdxAnswered = Number(Object.keys(unfinishedQuizData.quizResult).splice(-1)[0])
        state.done = lastQuestionIdxAnswered === state.currentQuestionIdx
        state.quizProgress.showExplanation = unfinishedQuizData.showExplanation
        loadQuestion()
      } else {
        // start quiz from start
        if (state.questionIds.length > 0) {
          // load the first question
          state.currentQuestionIdx = 0
          state.quizProgress.showExplanation = false
          loadQuestion()
        } else {
          state.onWarning = true
          state.problemText = `Kan geen vragen vinden voor deze quiz`
          state.problemCause = `De quiz met nummer ${quizNumber} bestaat maar er zijn geen vragen voor gemaakt.`
          state.tipToResolve = `Vraag de redacteur om voor deze quiz vragen aan te maken`
        }
      }
    } else {
      state.onWarning = true
      state.problemText = `De app kan geen enkele vraag vinden voor geen enkele quiz`
      state.problemCause = `De database is corrupt of werkt niet naar behoren`
      state.tipToResolve = `Probeer het later nog een keer.`
    }
  }).catch((error) => {
    state.onError = true
    state.firebaseError = error
    state.fbErrorContext = `De fout is opgetreden bij het lezen van de index van alle quiz vragen`
  })
}

function loadQuestion() {
  const questionId = state.questionIds[state.currentQuestionIdx]
  state.quizProgress.questionId = questionId
  saveProgress()
  get(child(dbRef, `/quizzes/questions/${Number(questionId)}`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.currentQuestion = snapshot.val()
      // store the correct statements
      state.correctStatements = []
      const answerKeys = Object.keys(state.currentQuestion.answers)
      answerKeys.forEach((key) => {
        if (state.currentQuestion.answers[key] === true) {
          state.correctStatements.push(state.currentQuestion.statementsArray[key])
        }
      })
      // initialize user answers to false (not selected)
      state.userAnswers = []
      const statementKeys = Object.keys(state.currentQuestion.statementsArray)
      statementKeys.forEach(() => {
        state.userAnswers.push(false)
      })

      if (state.done && state.lastCookieQuestionResult && !state.lastCookieQuestionResult.overdue) {
        // restore answers of last question
        state.userAnswers = state.lastCookieQuestionResult.answers
      }
      if (!state.done) startTimer()
      // show data when loaded
      state.showExplanation = false
    } else {
      state.onWarning = true
      state.problemText = `Kan de quiz vraag niet vinden`
      state.problemCause = `De quiz vraag met nummer ${questionId} bestaat niet.`
      state.tipToResolve = `Vraag de redacteur om deze quiz vraag aan te maken`
    }
  }).catch((error) => {
    state.onError = true
    state.firebaseError = error
    state.fbErrorContext = `De fout is opgetreden bij het lezen van quiz vraag met nummer ${questionId}`
  })
}

function composeStatement(idx) {
  if (idx > 12) return "Fout: Meer dan 12 vragen?"
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
  bgColor = 'white'
  if (state.userAnswers[idx]) {
    bgColor = 'aqua'
  }
  return `${letters[idx]}. ` + state.currentQuestion.statementsArray[idx]
}

function composeCorrectAnswers(idx) {
  if (idx > 12) return "Fout: Meer dan 12 vragen?"
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
  return `${letters[idx]}. ` + state.correctStatements[idx]
}

function qAnswer(idx) {
  if (state.done) return
  state.userAnswers[idx] = !state.userAnswers[idx]
  state.timerStarted = true
}

function numberOfCorrectAnswers() {
  if (state.currentQuestion.answers === undefined) return 0
  const keys = Object.keys(state.currentQuestion.answers)
  let count = 0
  keys.forEach(k => {
    if (state.currentQuestion.answers[k] === true) count++
  })
  return count
}

function countUserSelectedCorrectAnswers() {
  if (state.currentQuestion.answers === undefined) return 0
  const keys = Object.keys(state.currentQuestion.answers)
  let count = 0
  keys.forEach(k => {
    if (state.currentQuestion.answers[k] === true && state.userAnswers[k] === true) count++
  })
  return count
}

function countUserSelectedWrongAnswers() {
  let count = 0
  state.userAnswers.forEach(ind => {
    if (state.userAnswers[ind] === true && state.currentQuestion.answers[ind] !== true) count++
  })
  return count
}

function startTimer() {
  // reset value from previous timer
  state.seconds = 0
  state.timerId = setInterval(() => {
    state.seconds++
    const minutesLeft = Math.floor((state.timeout - state.seconds) / 60)
    const secondsLeft = state.timeout - state.seconds - minutesLeft * 60
    let secondsStr = secondsLeft.toString()
    if (secondsStr.length === 1) secondsStr = '0' + secondsStr
    state.clockValue = `${minutesLeft}:${secondsStr}`
  }, 1000)
}

function createRightOrWrongMessage(val) {
  if (val === undefined) {
    state.wrapupMsg = 'Je antwoord was niet binnen de tijd'
  } else
    if (val) {
      state.wrapupMsg = 'Je antwoord was GOED en binnen de tijd!'
    } else state.wrapupMsg = 'Je antwoord was FOUT'
}
/* Save the progress in a cookie with a lifterime of 1 hour */
function saveProgress() {
  // save the collected progress and the answers of all answered questions so far
  state.quizProgress.quizResult = state.quizResult
  cookies.set('speelMeeProgress', state.quizProgress, { path: '/', maxAge: 60 * 60, sameSite: true })
}

function finishQuestion() {
  state.done = true
  // stop the timer
  clearInterval(state.timerId)
  state.quizResult[state.currentQuestionIdx] = {}
  state.quizResult[state.currentQuestionIdx].answers = state.userAnswers.slice()
  state.quizResult[state.currentQuestionIdx].time = state.seconds
  if (countUserSelectedCorrectAnswers() === numberOfCorrectAnswers() && countUserSelectedWrongAnswers() === 0) {
    state.answerIsRight = true
    createRightOrWrongMessage(true)
    store.compactResult.push(true)
    state.quizResult[state.currentQuestionIdx].correctAnswer = true
  } else {
    state.answerIsRight = false
    createRightOrWrongMessage(false)
    store.compactResult.push(false)
    state.quizResult[state.currentQuestionIdx].correctAnswer = false
  }
  saveProgress()
}

function nextStep() {
  if (state.showExplanation) {
    if (state.currentQuestionIdx < state.questionIds.length - 1) {
      state.quizProgress.showExplanation = false
      state.currentQuestionIdx++
      state.done = false
      state.clockValue = `1:00`
      state.timerStarted = false
      loadQuestion()
    } else {
      // the user finished the quiz; remove the cookie containing the progress as it is obsolete now that the user finished the quiz to the end
      cookies.remove('speelMeeProgress', { sameSite: true })
      // save quiz result only if not an archived quiz and it is not admin who is playing
      if (!store.isArchivedQuiz && store.userData.alias !== 'admin') saveResults()
      emit('quiz-is-done')
    }
  } else {
    state.showExplanation = true
    state.quizProgress.showExplanation = true
    saveProgress()
  }
}

function isTextAvailable() {
  return (state.currentQuestion.correctAnswer && state.currentQuestion.correctAnswer.length > 7) || false
}

watch(() => state.seconds, () => {
  if (state.seconds >= state.timeout) {
    // stop the timer
    clearInterval(state.timerId)
    state.done = true
    state.wrapupMsg = 'Je antwoord was niet binnen de tijd'
    state.quizResult[state.currentQuestionIdx] = {}
    state.quizResult[state.currentQuestionIdx].overdue = true
    store.compactResult.push(false)
    saveProgress()
  }
})

function saveResults() {
  // save the results of this quiz for presentation purposes
  set(ref(db, `/quizzes/results/${store.currentYear}/${store.userData.alias}/${store.quizObject.actionWeek}/`), state.quizResult)
  // save this quiz number as completed to user data
  if (store.userData.completedQuizNumbers) {
    store.userData.completedQuizNumbers.push(store.currentQNumber)
  } else store.userData.completedQuizNumbers = [store.currentQNumber]
  set(ref(db, `users/${store.firebaseUser.uid}/completedQuizNumbers`), store.userData.completedQuizNumbers)
}

</script>