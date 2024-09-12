<template>
  <ReportFbError v-if="store.rqActive === 'onError'" />
  <ReportWarning v-else-if="store.rqActive === 'onWarning'" />
  <template v-else>
    <v-container :max-width="store.screenWidth">
      <v-sheet v-if="state.showExplanation" class="ma-2">
        <p>
          Je antwoord was <b>{{ getResultText() }}</b>
        </p>
        <p v-if="state.correctStatements.length === 1">Het juiste antwoord is:</p>
        <p v-else>De juiste antwoorden zijn:</p>
        <v-list lines="two" density="compact">
          <v-list-item v-for="(dummy, index) in state.correctStatements" :subtitle="state.correctStatements[index]"
            :style="{ 'background-color': '#DCEDC8' }"></v-list-item>
        </v-list>
        <p v-if="isTextAvailable()" v-html="state.currentQuestion.correctAnswer"></p>
        <h3 v-if="!isTextAvailable()" class="py-12">Sorry, de toelichting is niet beschikbaar</h3>
        <p class="py-2">Meer hierover na afloop van de quiz</p>
      </v-sheet>
      <template v-else>
        <v-sheet class="mt-6 ml-2 mr-2" :max-width="store.screenWidth">
          <template v-if="!state.showExplanation">
            <v-row class="mt-n6" no-gutters>
              <div class="small-font">{{ getProgressIndicator() }}</div>
            </v-row>
            <v-row class="mt-2" no-gutters>
              <div v-html="state.currentQuestion.body"></div>
            </v-row>
            <v-row no-gutters>
              <v-list lines="two" density="compact">
                <v-list-item v-for="(dummy, index) in state.currentQuestion.statementsArray" :subtitle="composeStatement(index)" @click="qAnswer(index)"
                  :style="{ 'background-color': bgColor }"></v-list-item>
              </v-list>
            </v-row>
          </template>
        </v-sheet>
        <v-sheet class="pa-2" :height="state.counterHeight">
          <v-row v-if="!state.questionDone">
            <v-col cols="7">
              <p>{{ state.currentQuestion.gameRules }}<br />Binnen 1 min</p>
            </v-col>
            <v-col cols="5">
              <p class="text-right">Resterende tijd</p>
              <p class="text-right color-red">{{ state.clockValue }}</p>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12">
              {{ state.wrapupMsg }}
            </v-col>
          </v-row>
        </v-sheet>
      </template>

      <v-divider></v-divider>
      <v-row class="mt-2">
        <v-col cols="12" class="text-right">
          <v-btn :disabled="!canProceed" flat append-icon="mdi-arrow-right" @click="nextStep">
            Verder
            <template v-slot:append>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </template>
</template>

<style scoped>
.small-font {
  font-size: 12px;
}

.color-red {
  color: red;
}
</style>

/* To allow to exit the app and return to the state where left, the needed data is collected in the object state.progress and saved in the cookie
spleelmee-progress */

<script setup>
import { computed, onBeforeMount, reactive, watch } from 'vue'
import { useAppStore } from '../store/app.js'
import { db, dbRef } from '../firebase'
import { ref, child, get, set } from 'firebase/database'
import ReportFbError from './ReportFbError.vue'
import ReportWarning from './ReportWarning.vue'
import Cookies from 'universal-cookie'

const store = useAppStore()
const props = defineProps(['recoveryMode'])
const emit = defineEmits(['quiz-is-done'])

// must be non-reactive
let bgColor = undefined

onBeforeMount(() => {
  loadQuestionNumbers()
})

const cookies = new Cookies()

const state = reactive({
  firebaseError: {},
  problemText: '',
  fbErrorContext: '',
  problemCause: '',
  tipToResolve: '',
  indexObject: {},
  questionNumbers: [],
  currentQuestionIdx: 0,
  currentQuestion: {},
  correctStatements: [],
  answerIsRight: false,
  userAnswers: [],
  answerClicked: false,
  seconds: 0,
  timerId: undefined,
  timeout: 60,
  isLastAnswerOverdue: false,
  questionDone: false,
  wrapupMsg: '',
  showExplanation: false,
  counterHeight: 60,
  quizResult: {},
  lastCookieQuestionResult: null,
})

const canProceed = computed(() => {
  return state.showExplanation || state.isLastAnswerOverdue || numberOfCorrectAnswers() === numberOfSelectedAnswers()
})

function loadQuestionNumbers() {
  get(child(dbRef, `/quizzes/questions/index/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.indexObject = snapshot.val()
        const allQuestionNumbers = Object.keys(state.indexObject)
        // get the question numbers of the questions assigned to this quiz
        state.questionNumbers = []
        allQuestionNumbers.forEach((key) => {
          if (Number(state.indexObject[key].quizNumber) === store.currentQuizNumber) {
            state.questionNumbers.push(key)
          }
        })
        if (state.questionNumbers.length > 0) {
          checkForRecovery()
        } else {
          store.problemText = `Kan geen vragen vinden voor quiz ${store.currentQuizNumber}`
          store.problemCause = `Er zijn geen vragen toegewezen aan quiz ${store.currentQuizNumber}`
          store.tipToResolve = `Vraag de redacteur om voor deze quiz vragen aan te maken`
          store.rqActive = 'onWarning'
        }
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

function checkForRecovery() {
  if (props.recoveryMode) {
    // get and process the unfinished quiz data if available
    const unfinishedCookieData = cookies.get(`speelMee${store.userData.alias}`)
    if (unfinishedCookieData && unfinishedCookieData.alias === store.userData.alias) {
      // continue unfinished quiz
      state.showExplanation = unfinishedCookieData.showExplanation
      const cookieQuizResults = unfinishedCookieData.quizResult
      if (cookieQuizResults) {
        // assign the unfinished quiz results to the running quiz results
        state.quizResult = cookieQuizResults
        const allKeys = Object.keys(cookieQuizResults)
        if (allKeys.length > 0) {
          const lastKey = allKeys.slice(-1)[0]
          state.lastCookieQuestionResult = cookieQuizResults[lastKey]
          createRightOrWrongMessage(state.lastCookieQuestionResult.correctAnswer)
          // restore the timer
          if (state.lastCookieQuestionResult.time) {
            state.clockValue = state.timeout - state.lastCookieQuestionResult.time
          } else {
            // time was overdue
            state.clockValue = 0
          }
          // process the data from the cookie saved when the quiz was started but unfinished and initiate the quiz progress
          store.quizProgress.alias = store.userData.alias
          store.quizProgress.quizNumber = store.currentQuizNumber
          // find the last answered questionIdx and set the current question number index
          const lastQuestionIdxAnswered = Number(Object.keys(unfinishedCookieData.quizResult).slice(-1)[0])
          state.currentQuestionIdx = lastQuestionIdxAnswered
          state.questionDone = true
          loadQuestion(!unfinishedCookieData.showExplanation)
        }
      } else {
        store.problemText = `De cookie met de gegevens van de afgebroken sessie is niet compleet`
        store.problemCause = `De voorlopige resultaten zijn niet beschikbaar`
        store.tipToResolve = `De cookie wordt nu verwijderd. Start de app opnieuw`
        store.rqActive = 'onWarning'
        cookies.remove(`speelMee${store.userData.alias}`, { sameSite: true })
      }
    }
  } else startNewQuiz()
}

function startNewQuiz() {
  store.compactResult = []
  // start quiz from start
  if (state.questionNumbers.length > 0) {
    // load the first question
    state.currentQuestionIdx = 0
    loadQuestion(true)
  } else {
    store.problemText = `Kan geen vragen vinden voor deze quiz`
    store.problemCause = `De quiz met nummer ${store.currentQuizNumber} bestaat maar er zijn geen vragen voor gemaakt.`
    store.tipToResolve = `Vraag de redacteur om voor deze quiz vragen aan te maken`
    store.rqActive = 'onWarning'
  }
}

function getProgressIndicator() {
  return `(${state.currentQuestionIdx + 1}/${state.questionNumbers.length})`
}

function createRightOrWrongMessage(val) {
  if (val === undefined) {
    state.wrapupMsg = 'Je antwoord was niet binnen de tijd'
  } else if (val) {
    state.wrapupMsg = 'Je antwoord was GOED en binnen de tijd!'
  } else state.wrapupMsg = 'Je antwoord was FOUT'
}

/* Save the progress in a cookie with a lifetime of 1 hour */
function saveProgress() {
  // save the active component, the collected progress and the answers of all answered questions so far
  store.quizProgress.msActive = store.msActive || null
  store.quizProgress.rqActive = store.rqActive || null
  store.quizProgress.showExplanation = state.showExplanation
  store.quizProgress.compactResult = store.compactResult
  store.quizProgress.quizResult = state.quizResult
  cookies.set(`speelMee${store.userData.alias}`, store.quizProgress, { path: '/', maxAge: 60 * 60, sameSite: true })
}

function loadQuestion(resetShowExplanation) {
  const questId = state.questionNumbers[state.currentQuestionIdx]
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
  if (!store.isArchivedQuiz) {
    store.quizProgress.alias = store.userData.alias
    store.quizProgress.quizNumber = store.currentQuizNumber
    store.quizProgress.showExplanation = false
  }
  get(child(dbRef, `/quizzes/questions/${Number(questId)}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.currentQuestion = snapshot.val()
        // collect the correct statements
        state.correctStatements = []
        const answerKeys = Object.keys(state.currentQuestion.answers)
        answerKeys.forEach((key) => {
          if (state.currentQuestion.answers[key] === true) {
            const line = `${letters[key]}. ${state.currentQuestion.statementsArray[key]}`
            state.correctStatements.push(line)
          }
        })
        // initialize user answers to false (not selected)
        state.userAnswers = []
        const statementKeys = Object.keys(state.currentQuestion.statementsArray)
        statementKeys.forEach(() => {
          state.userAnswers.push(false)
        })

        if (props.recoveryMode) {
          if (state.questionDone && state.lastCookieQuestionResult && !state.lastCookieQuestionResult.overdue) {
            // restore answers of last question
            state.userAnswers = state.lastCookieQuestionResult.answers
          }
        }
        if (!state.questionDone) startTimer()
        // show data when loaded
        if (resetShowExplanation) state.showExplanation = false
      } else {
        store.problemText = `Kan de quiz vraag niet vinden`
        store.problemCause = `De quiz vraag met nummer ${questId} bestaat niet.`
        store.tipToResolve = `Vraag de redacteur om deze quiz vraag aan te maken`
        store.rqActive = 'onWarning'
      }
    })
    .catch((error) => {
      store.rqActive = 'onError'
      store.firebaseError = error
      store.fbErrorContext = `De fout is opgetreden bij het lezen van quiz vraag met nummer ${questId}`
    })
}

function getResultText() {
  if (state.isLastAnswerOverdue) return 'te laat'
  if (state.answerIsRight) return 'goed!'
  return 'fout!'
}

function composeStatement(idx) {
  if (idx > 12) return 'Fout: Meer dan 12 statements?'
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
  bgColor = 'white'
  if (state.userAnswers[idx]) {
    bgColor = 'aqua'
  }
  return `${letters[idx]}. ` + state.currentQuestion.statementsArray[idx]
}

function qAnswer(idx) {
  if (state.questionDone) return
  state.userAnswers[idx] = !state.userAnswers[idx]
  state.answerClicked = true
}

function numberOfSelectedAnswers() {
  let count = 0
  state.userAnswers.forEach((a) => {
    if (a === true) count++
  })
  return count
}

function numberOfCorrectAnswers() {
  if (state.currentQuestion.answers === undefined) return 0
  const keys = Object.keys(state.currentQuestion.answers)
  let count = 0
  keys.forEach((k) => {
    if (state.currentQuestion.answers[k] === true) count++
  })
  return count
}

function countUserSelectedCorrectAnswers() {
  if (state.currentQuestion.answers === undefined) return 0
  const keys = Object.keys(state.currentQuestion.answers)
  let count = 0
  keys.forEach((k) => {
    if (state.currentQuestion.answers[k] === true && state.userAnswers[k] === true) count++
  })
  return count
}

function countUserSelectedWrongAnswers() {
  let count = 0
  state.userAnswers.forEach((ind) => {
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

function finishQuestion() {
  state.questionDone = canProceed.value
  // stop the timer
  clearInterval(state.timerId)
  state.answerClicked = false
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
  state.showExplanation = true
  if (!store.isArchivedQuiz) saveProgress()
}

function nextQuestion() {
  state.isLastAnswerOverdue = false
  state.currentQuestionIdx++
  if (state.currentQuestionIdx < state.questionNumbers.length) {
    store.quizProgress.showExplanation = false
    state.questionDone = false
    state.clockValue = `1:00`
    loadQuestion(true)
  } else {
    // the user finished the quiz; remove the cookie containing the progress as it is obsolete now that the user finished the quiz to the end
    cookies.remove(`speelMee${store.userData.alias}`, { sameSite: true })
    // save quiz result only if not an archived quiz and it is not admin who is playing
    if (!store.isArchivedQuiz && store.userData.alias !== 'admin') saveResults()
    emit('quiz-is-done')
  }
}

function nextStep() {
  if (state.showExplanation) {
    nextQuestion()
  } else finishQuestion()
}

function isTextAvailable() {
  return (state.currentQuestion.correctAnswer && state.currentQuestion.correctAnswer.length > 7) || false
}

watch(
  () => state.seconds,
  () => {
    if (state.seconds >= state.timeout) {
      // stop the timer
      clearInterval(state.timerId)
      state.questionDone = true
      state.wrapupMsg = 'Je antwoord was niet binnen de tijd'
      state.quizResult[state.currentQuestionIdx] = {}
      state.quizResult[state.currentQuestionIdx].overdue = true
      state.isLastAnswerOverdue = true
      store.compactResult.push(false)
      if (!store.isArchivedQuiz) saveProgress()
    }
  },
)

function saveResults() {
  // save the results of this quiz for presentation purposes
  set(ref(db, `/quizzes/results/${store.currentYear}/${store.userData.alias}/${store.quizObject.actionWeek}/`), state.quizResult)
  // save this quiz number as completed to user data
  if (store.userData.completedQuizNumbers) {
    store.userData.completedQuizNumbers.push(store.currentQuizNumber)
  } else store.userData.completedQuizNumbers = [store.currentQuizNumber]
  set(ref(db, `users/${store.firebaseUser.uid}/completedQuizNumbers`), store.userData.completedQuizNumbers)
}
</script>
