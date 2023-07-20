<template>
  <h2>Onderhoud quiz gegevens</h2>
  <v-sheet>
    <v-text-field v-model="state.headText" label="Kop tekst" />
    <p>Body met optionele afbeelding:</p>
    <quill-editor v-model:value="state.content"></quill-editor>
    <v-text-field v-model="state.quizQuestion" :label="qLabel" />
    <v-row no-gutters>
      <v-col>
        <v-btn :disabled="state.questionNumber <= 0" flat prepend-icon="mdi-arrow-up" @click="qBack">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Edit vorige
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn flat append-icon="mdi-arrow-down" @click="qSave">
          Sla op
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn flat append-icon="mdi-arrow-right" @click="qOpenNext">
          Nieuwe vraag
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn :disabled="state.questionNumber >= state.questionsArray.length - 1" flat append-icon="mdi-arrow-down" @click="qForward">
          Edit volgende
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
    <v-text-field v-model="state.gameRules" label="Spelregels (optioneel)" />
  </v-sheet>

  <v-row justify="space-around">
    <v-col cols="6" md="4">
      <p>Preview 414 x 896 px</p>
      <v-sheet class="pa-2" color="grey-lighten-3" height="896" width="414">
        <v-row no-gutters>
          {{ state.headText }}
        </v-row>
        <v-row no-gutters>
          <div v-html="state.content"></div>
        </v-row>
        <v-row no-gutters>
          <v-list lines="one" density="compact">
            <v-list-item v-for="(num, index) in state.questionsArray" :subtitle="composeQuestion(index)" @click="qAnswer(index)"
              :style="{'background-color': bgColor}"></v-list-item>
          </v-list>
        </v-row>
        <v-row v-if="state.gameRules !== ''" no-gutters>
          {{ state.gameRules }}
        </v-row>
      </v-sheet>
    </v-col>
    <v-col cols="6" md="4">
      <p>Preview 375 x 812 px</p>
      <v-sheet class="pa-2" color="grey-lighten-3" height="812" width="375">
        <v-row no-gutters>
          {{ state.headText }}
        </v-row>
        <v-row no-gutters>
          <div v-html="state.content"></div>
        </v-row>
        <v-row no-gutters>
          <v-list lines="one" density="compact">
            <v-list-item v-for="(num, index) in state.questionsArray" :subtitle="composeQuestion(index)" @click="qAnswer(index)"
              :style="{'background-color': bgColor}"></v-list-item>
          </v-list>
        </v-row>
        <v-row v-if="state.gameRules !== ''" no-gutters>
          {{ state.gameRules }}
        </v-row>
      </v-sheet>
    </v-col>
  </v-row>
  <v-row v-if="countGoodAnswers() < 1">
    <p>Klik op de vragen in de preview om de goede antwoorden te selecteren.</p>
  </v-row>

  <v-row>
    <v-col>
      <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('m-done')">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Cancel
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>
    <v-col>
      <v-btn :disabled="state.questionsArray.length < 1 || countGoodAnswers() < 1" flat append-icon="mdi-arrow-right" @click="saveQuiz">
        Bewaar Quiz
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, reactive } from 'vue'
const emit = defineEmits(['m-done'])

const state = reactive({
  headText: '',
  questionNumber: 0,
  quizQuestion: '',
  questionsArray: [],
  gameRules: '',
  quizAnswers: {},
})

// must be non-reactive
let bgColor = undefined

const qLabel = computed(() => {
  return 'Quiz vraag ' + (state.questionNumber + 1)
})

const editMode = computed(() => {
  if (state.questionNumber < state.questionsArray.length) {
    return "change"
  } else return "add"
})

function composeQuestion(idx) {
  if (idx > 12) return "Fout: Meer dan 12 vragen?"
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
  bgColor = 'white' 
  if (state.quizAnswers[idx]) {
    bgColor = 'aqua'
  }
  return `${letters[idx]}. ` + state.questionsArray[idx]
}

function qBack() {
  if (state.questionNumber > 0) {
    state.questionNumber--
    state.quizQuestion = state.questionsArray[state.questionNumber]
  }
}

function qOpenNext() {
  state.questionNumber = state.questionsArray.length
  state.quizQuestion = ''
}

function qSave() {
  if (state.quizQuestion !== '') {
    if (editMode.value === 'add') state.questionsArray.push(state.quizQuestion)
    if (editMode.value === 'change') state.questionsArray[state.questionNumber] = state.quizQuestion
  } else {
    if (editMode.value === 'change') {
      // remove this question
      state.questionsArray.splice(state.questionNumber, 1)
    }
  }
}

function qForward() {
  if (state.questionNumber < state.questionsArray.length - 1) {
    state.questionNumber++
    state.quizQuestion = state.questionsArray[state.questionNumber]
  }
}

function qAnswer(idx) {
  if (state.quizAnswers[idx]) {
    state.quizAnswers[idx] = false   
  } else {
    state.quizAnswers[idx] = true
  }
}

function countGoodAnswers() {
  const anwwers = Object.keys(state.quizAnswers)
  let count = 0
  for (const el of anwwers) {
    if (el) count++
  }
  return count
}

function saveQuiz() {
  console.log('countGoodAnswers = ' + countGoodAnswers)
}

</script> 

