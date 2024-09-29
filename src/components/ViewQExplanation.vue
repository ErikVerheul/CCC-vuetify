<template>
  <v-card>
    <!-- do not limit the width for easy reading on the desktop -->
    <v-card-title class="text-center">Quiz toelichting</v-card-title>
    <v-row justify="space-around">
      <v-col cols="12" md="8">
        <v-sheet class="pa-2" color="grey-lighten-3">
          <v-row no-gutters>
            <div v-html="props.quizExplanation"></div>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-divider></v-divider>

    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn prepend-icon="mdi-arrow-left" @click="readyReading">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            Terug
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { useAppStore } from '../store/app.js'
import Cookies from 'universal-cookie'
const emit = defineEmits(['view-over'])
const props = defineProps(['quizExplanation'])
const store = useAppStore()
const cookies = new Cookies()

// store the state again now that the user has reached the quiz theme explanation
onBeforeMount(() => {
  if (!store.isArchivedQuiz && store.userData.alias !== 'admin') {
    store.quizProgress.compactResult = store.compactResult
    store.quizProgress.viewQExplanation = true
    cookies.set(`speelMee${store.userData.alias}`, store.quizProgress, { path: '/', maxAge: 60 * 60, sameSite: true })
  }
})

// remove the cookie so that the user can start another quiz
function readyReading() {
  cookies.remove(`speelMee${store.userData.alias}`, { sameSite: true })
  emit('view-over')
}

</script>
