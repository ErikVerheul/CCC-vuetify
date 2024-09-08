<template>
  <v-container>
    <v-row class="d-flex align-center justify-center">
      <AppBar :withActivator="false" />
      <v-card>
        <v-card-title>
          <span class="text-h5">Aan weeknummers toegekende quizzen</span>
        </v-card-title>
        <v-card-text>
          <v-list lines="one">
            <v-list-item v-for="item in state.quizMetaDataOverTime" :title="composeQuizLine(item)"></v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="purple" block @click="router.replace({ path: '/' })">Sluit</v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue'
import router from '@/router'
import { dbRef } from '../firebase'
import { child, get } from 'firebase/database'
import { useAppStore } from '../store/app.js'

const store = useAppStore()

onBeforeMount(() => {
  loadMetaData()
})

function loadMetaData() {
  get(child(dbRef, `/quizzes/metaData/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        store.metaObject = snapshot.val()
        sortMetaData()
      } else {
        console.log('Quiz meta data not found')
      }
    })
    .catch((error) => {
      console.error('Error while reading all available quizzes from database: ' + error.message)
    })
}

const state = reactive({
  quizMetaDataOverTime: []
})

function comparator(a, b) {
  if (Number(a.actionYear) > Number(b.actionYear)) return 1
  if (Number(a.actionYear) < Number(b.actionYear)) return -1
  if (Number(a.actionWeek) > Number(b.actionWeek)) return 1
  if (Number(a.actionWeek) < Number(b.actionWeek)) return -1
}

function sortMetaData() {
  const allQuizNumbers = Object.keys(store.metaObject)
  state.quizMetaDataOverTime = []
  for (const nr of allQuizNumbers) {
    const quizObj = store.metaObject[nr]
    if (quizObj.actionWeek == store.currentWeekNr)
      state.quizMetaDataOverTime.push({ actionYear: quizObj.actionYear, actionWeek: quizObj.actionWeek, quizNumber: nr, title: '!==== DIT IS DE QUIZ DIE DEZE WEEK ACTIEF IS ====!' })
    if (quizObj.actionWeek != 0)
      state.quizMetaDataOverTime.push({ actionYear: quizObj.actionYear, actionWeek: quizObj.actionWeek, quizNumber: nr, title: quizObj.title })
  }
  state.quizMetaDataOverTime.sort((a, b) => comparator(a, b))
}

function composeQuizLine(item) {
  return `${item.actionYear}/${item.actionWeek} quiz nummer: ${item.quizNumber} titel: ${item.title}`
}
</script>