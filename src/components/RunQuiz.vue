<template>
  <v-sheet class="pa-2" :min-height="getHeight()" :width="store.screenWidth">
    <template v-if="!state.showExplanation">
      <v-row no-gutters>
        <div v-html="state.currentQuestion.body"></div>
      </v-row>
      <v-row no-gutters>
        <v-list lines="two" density="compact">
          <v-list-item v-for="(num, index) in state.currentQuestion.statementsArray" :subtitle="composeStatement(index)"
            @click="qAnswer(index)" :style="{ 'background-color': bgColor }"></v-list-item>
        </v-list>
      </v-row>
    </template>
    <template v-else>
      <h4 class="py-3">Toelichting</h4>
      <v-row no-gutters>
        <div v-html="state.currentQuestion.resultInfo"></div>
      </v-row>
    </template>
  </v-sheet>
  <v-sheet v-if="!state.showExplanation" class="pa-2" height="60" width="414">
    <v-row v-if="!state.done">
      <v-col v-if="state.playerStarted" cols="9">
        <v-btn @click="finishQuestion()">{{ getReadyText() }}</v-btn>
      </v-col>
      <v-col v-else cols="9">
        <p>{{ state.currentQuestion.gameRules }}<br>Binnen 3 min</p>
      </v-col>
      <v-col cols="3">
        {{ state.clockValue }}
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="9">
        {{ state.wrapupMsg }}
      </v-col>
      <v-col cols="3">
        {{ state.clockValue }}
      </v-col>
    </v-row>
  </v-sheet>

  <v-divider></v-divider>
  <v-row class="mt-2">
    <v-col>
      <v-btn :disabled="true" flat prepend-icon="mdi-arrow-left">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>
    <v-col>
      <v-btn :disabled="!state.done" flat append-icon="mdi-arrow-right" @click="nextStep()">
        Door
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { onBeforeMount, computed, reactive, watch } from 'vue'
import { useAppStore } from '../store/app.js'
import { db, dbRef } from '../firebase'
import { ref, child, get, set, remove, update } from 'firebase/database'

const props = defineProps({
  quizNumber: {
    type: Number,
    required: true
  },
  isArchivedQuiz: {
    type: Boolean,
    required: true
  }
})
const store = useAppStore()
const emit = defineEmits(['quiz-continue'])

// must be non-reactive
let bgColor = undefined

onBeforeMount(() => {
  loadQuiz(props.quizNumber)
})

const state = reactive({
  quizObject: {},
  indexObject: {},
  questionIds: [],
  currentQuestionIdx: 0,
  currentQuestion: {},
  quizQAnswers: [],
  playerStarted: false,
  seconds: 0,
  timerId: undefined,
  overDue: false,
  done: false,
  wrapupMsg: '',
  showExplanation: false,
  counterHeight: 60
})

function getReadyText() {
  if (props.isArchivedQuiz) return 'Onthul het resultaat'
  return 'Verzend jouw antwoord'
}

function getHeight() {
  if (!state.showExplanation) return store.screenHeight - store.backContinueHeight - state.counterHeight
  return store.screenHeight - store.backContinueHeight
}

function loadQuiz(quizNumber) {
  // get the quiz
  get(child(dbRef, `/quizzes/metaData/${quizNumber}`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.quizObject = snapshot.val()
      loadQuestionIds(quizNumber)
    } else {
      console.log("Quiz not found")
    }
  }).catch((error) => {
    console.error(`Error while reading quiz ${quizNumber} from database: ` + error.message)
  })
}

function loadQuestionIds(quizNumber) {
  get(child(dbRef, `/quizzes/questions/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.indexObject = snapshot.val()
      const allQuestionKeys = Object.keys(state.indexObject)
      state.questionIds = []
      for (const key of allQuestionKeys) {
        // allow type casting although isNaN says both are numbers
        if (state.indexObject[key].quizNumber == quizNumber) {
          state.questionIds.push(key)
        }
      }
      if (state.questionIds.length > 0) {
        // load the first question
        state.currentQuestionIdx = 0
        loadQuestion()
      } else {
        console.log(`No questions found for quiz ${quizNumber}`)
        // ToDo: show warning and exit
      }
    } else {
      console.log("No quiz-questions available")
    }
  }).catch((error) => {
    console.error('Error while reading all available quiz-question names from database: ' + error.message)
  })
}

function loadQuestion() {
  const questionId = state.questionIds[state.currentQuestionIdx]
  store.screenName = state.indexObject[questionId].title
  get(child(dbRef, `/quizzes/questions/${Number(questionId)}`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.currentQuestion = snapshot.val()
      // initialize answers to false
      for (let i = 0; i < state.currentQuestion.statementsArray.length; i++) {
        state.quizQAnswers[i] = false
      }
      startTimer()
    } else {
      console.log("No quiz-question data available")
    }
  }).catch((error) => {
    console.error('While reading the quiz-question data from database: error message = ' + error.message)
  })
}

function composeStatement(idx) {
  if (idx > 12) return "Fout: Meer dan 12 vragen?"
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
  bgColor = 'white'
  if (state.quizQAnswers[idx]) {
    bgColor = 'aqua'
  }
  return `${letters[idx]}. ` + state.currentQuestion.statementsArray[idx]
}

function qAnswer(idx) {
  state.playerStarted = true
  if (state.quizQAnswers[idx]) {
    state.quizQAnswers[idx] = false
  } else {
    state.quizQAnswers[idx] = true
  }
}
function numberOfStatemenst() {
  if (state.currentQuestion.statementsArray === undefined) return 0
  return state.currentQuestion.statementsArray.length
}

function numberOfCorrectStatements() {
  if (state.currentQuestion.answers === undefined) return 0
  const keys = Object.keys(state.currentQuestion.answers)
  let count = 0
  keys.forEach(k => {
    if (state.currentQuestion.answers[k] === true) count++
  })
  return count
}

function countCorrectAnswers() {
  if (state.currentQuestion.answers === undefined) return 0
  const keys = Object.keys(state.currentQuestion.answers)
  let count = 0
  keys.forEach(k => {
    if (state.currentQuestion.answers[k] === true && state.quizQAnswers[k] === true) count++
  })
  return count
}

function countWrongAnswers() {
  let count = 0
  for (let ind = 0; ind < state.quizQAnswers.length; ind++) {
    if (state.quizQAnswers[ind] === true && state.currentQuestion.answers[ind] !== true) count++
  }
  return count
}

function startTimer() {
  // reset value from previous timer
  state.seconds = 0
  state.timerId = setInterval(() => {
    state.seconds++
    const minutes = Math.floor(state.seconds / 60)
    const seconds = state.seconds - minutes * 60
    let secondsStr = seconds.toString()
    if (secondsStr.length === 1) secondsStr = '0' + secondsStr
    state.clockValue = `${minutes}:${secondsStr}`
  }, 1000)
}

function finishQuestion() {
  state.done = true
  // stop the timer
  clearInterval(state.timerId)
  if (countCorrectAnswers() === numberOfCorrectStatements() && countWrongAnswers() === 0) {
    state.wrapupMsg = 'Je antwoord was GOED en binnen de tijd!'
  } else {
    state.wrapupMsg = 'Je antwoord was FOUT'
  }
}

function startNextQuestion() {
  state.currentQuestionIdx++
  if (state.currentQuestionIdx < state.questionIds.length) {
    state.done = false
    state.showExplanation = false
    state.clockValue = `0:00`
    state.playerStarted = false
    loadQuestion()
    return true
  }
  return false
}

function nextStep() {
  if (state.showExplanation) {
    if (!startNextQuestion()) emit('quiz-continue')
  } else {
    state.showExplanation = true
  }
}

watch(() => state.seconds, () => {
  if (state.seconds >= 300) {
    // stop the timer
    clearInterval(state.timerId)
    state.done = true
    state.overDue = true
    state.wrapupMsg = 'Je antwoord was niet binnen de tijd'
  }
})

</script>