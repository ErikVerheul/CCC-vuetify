<template>
  <template v-if="!state.playOldQuiz">
    <v-sheet :min-height="getHeight()">
      <v-container>
        <v-row>
          <p><b>Zondag 13:00 wordt de ranglijst definitief</b></p>
        </v-row>
        <v-row>
          <v-data-table density="compact" v-model:items-per-page="state.itemsPerPage" v-model:sort-by="state.sortBy" :headers="getHeaders()"
            :items="state.scores" item-value="name">
          </v-data-table>
        </v-row>
        <v-row v-if="historyAvailable()">
          <v-col cols="9">
            <p>Zin om een oude quiz te spelen?<br>Telt niet voor de competitie</p>
          </v-col>
          <v-col cols="3">
            <v-btn @click="startOldQuiz" color="purple">Start</v-btn>
          </v-col>
          <v-col v-if="countAll() > 0" cols="12">
            <p><b>U heeft {{ countGood() }} van de {{ countAll() }} antwoorden goed</b></p>
          </v-col>
        </v-row>
        <v-row>
          <p v-if="state.showWinners">Bij gelijke scrore wint de speler die de minste tijd nodig had</p>
        </v-row>
      </v-container>
    </v-sheet>
    <v-divider></v-divider>
    <v-row>
      <v-col>
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('return-to-menu')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
      <template v-if="state.showWinners === false">
        <v-spacer></v-spacer>
        <v-col>
          <v-btn flat append-icon="mdi-arrow-right" @click="showWinners">
            Toon winnaars
            <template v-slot:append>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
          </v-btn>
        </v-col>
      </template>
    </v-row>
  </template>
  <RunQuiz v-else :quizNumber="state.qNumber" :isArchivedQuiz="true" @quiz-continue="stopOldQuiz"></RunQuiz>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
// VDataTable is experimental
import { VDataTable } from 'vuetify/labs/VDataTable'
import { dbRef } from '../firebase'
import { child, get } from 'firebase/database'
import RunQuiz from './RunQuiz.vue'

const store = useAppStore()
const emit = defineEmits(['return-to-menu'])

const state = reactive({
  metaObject: {},
  quizNumbers: [],
  playOldQuiz: false,
  compactResult: [],
  qNumber: undefined,
  itemsPerPage: 7,
  yearScores: {},
  scores: [],
  sortBy: [{ key: 'sum', order: 'desc' }],
  showWinners: false
})

onBeforeMount(() => {
  store.screenName = 'Stand competitie'
  loadResultsData()
  loadMetaData()
})

function getHeight() {
  return store.screenHeight - store.backContinueHeight
}

function loadResultsData() {
  get(child(dbRef, `/quizzes/results`)).then((snapshot) => {
    if (snapshot.exists()) {
      const resultsObj = snapshot.val()
      const yearsArray = Object.keys(resultsObj)
      let allScores = {}
      yearsArray.forEach(year => {
        const yearsObj = resultsObj[year]
        const aliasArray = Object.keys(yearsObj)
        aliasArray.forEach(alias => {
          allScores[alias] = {}
          allScores[alias][year] = {}
          const aliasObj = yearsObj[alias]
          const weeksArray = Object.keys(aliasObj)
          weeksArray.forEach(weekNr => {
            // calculate the score and time used
            const weekObj = aliasObj[weekNr]
            const answersArray = Object.keys(weekObj)
            let score = 0
            let time = 0
            answersArray.forEach(answerNr => {
              const answerObj = weekObj[answerNr]
              if (answerObj.correctAnswer) score++
              if (answerObj.time) time += answerObj.time
            })
            allScores[alias][year][weekNr] = { score, time }
          })
        })
      })
      console.log('allScores = ' + JSON.stringify(allScores, null, 2))
      state.scores = createScoresArray(allScores)
    } else {
      console.log('QuizResults: no results data available')
    }
  }).catch((error) => {
    console.log('QuizResults: An eror ocurred while reading the results data: ' + error.message)
  })
}

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

function getHeaders() {
  if (state.showWinners) {
    return [
      {
        title: 'Week',
        align: 'start',
        sortable: false,
        key: 'name',
      },
      { title: store.currentWeekNr - 3, align: 'end', key: 'week_3' },
      { title: store.currentWeekNr - 2, align: 'end', key: 'week_2' },
      { title: store.currentWeekNr - 1, align: 'end', key: 'week_1' },
      { title: store.currentWeekNr, align: 'end', key: 'week_0' },
      { title: 'tot', align: 'end', key: 'sum' },
      // prepare for showing the winners
      { title: 'Mok', align: 'end', key: 'winner' },
    ]
  } else return [
    {
      title: 'Week',
      align: 'start',
      sortable: false,
      key: 'name',
    },
    { title: store.currentWeekNr - 3, align: 'end', key: 'week_3' },
    { title: store.currentWeekNr - 2, align: 'end', key: 'week_2' },
    { title: store.currentWeekNr - 1, align: 'end', key: 'week_1' },
    { title: store.currentWeekNr, align: 'end', key: 'week_0' },
    { title: 'tot', align: 'end', key: 'sum' },
  ]
}

function weeksInYear(year) {
  const getWeekFor = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    const utc = new Date(d.setUTCDate(d.getUTCDate() + 4 - dayNum));
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1)).getTime();
    return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
  }
  return getWeekFor(new Date(year, 11, 28))
}

/* 
Create an array of weeknumbers to report about. 
Weeknumbers in the previous year are accounted for. 
*/
function calcWeeks(year, finalWeekNr) {
  const weekArray = []
  for (let i = 3; i >= 0; i--) {
    if (finalWeekNr - i > 0) {
      weekArray.push({ 'year': year, 'weekNr': store.currentWeekNr - i })
    } else {
      weekArray.push({ 'year': year - 1, 'weekNr': weeksInYear(year - 1) + store.currentWeekNr - i })
    }
  }
  return weekArray
}

function createScoresArray(allScores) {
  let scores = []
  let highestScore = 0
  const weeks = calcWeeks(store.currentYear, store.currentWeekNr)
  const names = Object.keys(allScores)
  names.forEach(n => {
    let obj = { 'name': n }
    let totalScore = 0
    let totalTime = 0
    let scoreFound = false
    for (let i = 0; i < weeks.length; i++) {
      if (weeks[i] && allScores[n][weeks[i].year][weeks[i].weekNr]) {
        obj[`week_${weeks.length - i - 1}`] = allScores[n][weeks[i].year][weeks[i].weekNr].score
        totalScore += allScores[n][weeks[i].year][weeks[i].weekNr].score
        totalTime += allScores[n][weeks[i].year][weeks[i].weekNr].time
        scoreFound = true
      } else obj[`week_${weeks.length - i - 1}`] = '-'
    }
    if (totalScore > highestScore) highestScore = totalScore
    obj.sum = totalScore
    obj.time = totalTime
    if (scoreFound) scores.push(obj)
  })
  // add the winners
  const maxWinners = scores.length < store.maxQuizWinners ? scores.length : store.maxQuizWinners
  let assignedWinners = 0
  let scoreNeeded = highestScore
  while (assignedWinners < maxWinners) {
    let candidates = []
    for (const obj of scores) {
      if (obj.sum === scoreNeeded) {
        // collect the candidates with equal score
        candidates.push(obj)
      }
    }
    // sort candidates ascending on lowest time
    let sortedCandidates = candidates.sort((c1, c2) => c1.time - c2.time)
    for (const obj of sortedCandidates) {
      obj.winner = `${String.fromCodePoint(128276)}`
      assignedWinners++
      if (assignedWinners === maxWinners) break
    }
    scoreNeeded--
  }
  console.log('scores = ' + JSON.stringify(scores, null, 2))
  return scores
}

function historyAvailable() {
  for (const qNr of state.quizNumbers)
    if (qNr !== 0) {
      // skip dummy quiz
      if (Number(state.metaObject[qNr].actionWeek) < store.currentWeekNr) return true
    }
  return false
}

function startOldQuiz() {
  state.compactResult = []
  const oldWeekQnumbers = state.quizNumbers.filter(qNr => Number(state.metaObject[qNr].actionWeek) < store.currentWeekNr)
  state.qNumber = oldWeekQnumbers[Math.round(Math.random() * (oldWeekQnumbers.length - 1))]
  state.playOldQuiz = true
}

function countAll() {
  return state.compactResult.length
}

function countGood() {
  let count = 0
  state.compactResult.forEach(el => {
    if (el === true) count++
  })
  return count
}

function stopOldQuiz(result) {
  state.compactResult = result
  console.log('stopOldQuiz: compactResult = ' + result)
  store.screenName = 'Stand competitie'
  state.playOldQuiz = false
}

function showWinners() {
  state.showWinners = true
}
</script>