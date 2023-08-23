<template>
  <v-sheet :min-height="getHeight()">
    <v-container>
      <v-row>
        <p><b>Zondag 13:00 wordt de ranglijst definitief</b></p>
      </v-row>
      <v-row>
        <!-- density has no effect (yet) -->
        <v-data-table density="compact" v-model:items-per-page="state.itemsPerPage" :headers="getHeaders()" :items="state.scores"
          item-value="name">
        </v-data-table>
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
    <v-spacer></v-spacer>
    <v-col>
      <v-btn flat append-icon="mdi-arrow-right" @click="emit('return-to-menu')">
        Door
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue'
import { useAppStore } from '../store/app.js'
// VDataTable is experimental
import { VDataTable } from 'vuetify/labs/VDataTable'
import { dbRef } from '../firebase'
import { child, get } from 'firebase/database'

const store = useAppStore()
const emit = defineEmits(['return-to-menu'])

const state = reactive({
  itemsPerPage: 5,
  yearScores: {},
  scores: []
})

onBeforeMount(() => {
  loadResultsData()
})

function getHeight() {
  return store.screenHeight - store.backContinueHeight
}

function loadResultsData() {
  get(child(dbRef, `/quizzes/results/${store.currentYear}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const yearsObj = snapshot.val()
      const aliasArray = Object.keys(yearsObj)

      let yearScores = {}
      aliasArray.forEach(alias => {
        yearScores[alias] = {}
        const aliasObj = yearsObj[alias]
        const weeksArray = Object.keys(aliasObj)
        weeksArray.forEach(weekNr => {
          // calculate the score
          const weekObj = aliasObj[weekNr]
          const answersArray = Object.keys(weekObj)
          let score = 0
          answersArray.forEach(answerNr => {
            const answerObj = weekObj[answerNr]
            if (answerObj.correctAnswer) score++
          })
          yearScores[alias][weekNr] = { score }
        })
      })
      state.scores = createScoresArray(yearScores)
    } else {
      console.log('QuizResults: no results data available')
    }
  }).catch((error) => {
    console.log('QuizResults: An eror ocurred while reading the results data: ' + error.message)
  })
}

function getHeaders() {
  return [
    {
      title: 'Week',
      align: 'start',
      sortable: false,
      key: 'name',
    },
    // for now skip one column
    // { title: store.currentWeekNr - 3, align: 'end', key: 'week_3' },
    { title: store.currentWeekNr - 2, align: 'end', key: 'week_2' },
    { title: store.currentWeekNr - 1, align: 'end', key: 'week_1' },
    { title: store.currentWeekNr, align: 'end', key: 'week_0' },
    { title: 'tot', align: 'end', key: 'sum' },
  ]
}

/* 
Create an array of weeknumbers to report about. 
Weeknumbers in the previous year are not included and undefined. 
*/
function calcWeeks() {
  const weekArray = []
  if (store.currentWeekNr - 3 > 0) {
    weekArray.push(store.currentWeekNr - 3)
  } else weekArray.push(undefined)
  if (store.currentWeekNr - 2 > 0) {
    weekArray.push(store.currentWeekNr - 2)
  } else weekArray.push(undefined)
  if (store.currentWeekNr - 1 > 0) {
    weekArray.push(store.currentWeekNr - 1)
  } else weekArray.push(undefined)
  weekArray.push(store.currentWeekNr)
  console.log('calcWeeks = ' + weekArray)
  return weekArray
}

function createScoresArray(yearScores) {
  let scores = []
  const weeks = calcWeeks()
  const names = Object.keys(yearScores)
  names.forEach(n => {
    let obj = { 'name': n }
    let sum = 0
    let scoreFound = false
    for (let i = 0; i < weeks.length; i++) {
      if (weeks[i] && yearScores[n][weeks[i]]) {
        obj[`week_${weeks.length - i - 1}`] = yearScores[n][weeks[i]].score
        sum += yearScores[n][weeks[i]].score
        scoreFound = true
      } else obj[`week_${weeks.length - i - 1}`] = '-'
    }
    obj.sum = sum
    if (scoreFound) scores.push(obj)
  })
  console.log('createScoresArray = ' + JSON.stringify(scores, null, 2))
  return scores
}
</script>