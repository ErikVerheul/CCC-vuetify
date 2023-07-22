<template>
  <v-sheet>
    <v-row class="d-flex align-center justify-center">
      <h2>Onderhoud quiz gegevens</h2>
    </v-row>
    <v-row>
      <v-col>
        <v-btn @click="selectLoadQuiz">Laad een bestaande quiz</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn @click="createNew">Maak een nieuwe quiz</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn color="red" @click="removeQuiz">Verwijder een quiz</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-text-field v-model="state.headText" label="Kop tekst" />
    </v-row>
    <v-row>
      <v-col cols="12">
        <p>Body met optionele afbeelding:</p>
        <quill-editor v-model:value="state.content"></quill-editor>
      </v-col>
    </v-row>
    <v-row class="py-15">
      <v-text-field v-model="state.quizQuestion" :label="qLabel" />
    </v-row>

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
    <v-row>
      <v-col cols="12">
        <v-textarea v-model="state.resultInfo" label="Toelichting op goed/fout antwoord" />
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="state.gameRules" label="Spelregels (optioneel)" />
      </v-col>
      <v-col cols="6">
        <v-text-field v-model="state.explanationUrl" :rules="state.urlRules" placeholder="https://speelmee.app/toelichting1"
          label="URL naar meer info (optioneel)" />
      </v-col>
    </v-row>
  </v-sheet>
  <v-row v-if="countGoodAnswers() === 0">
    <v-col cols="12">
      <p>Klik op de vragen in de preview om de goede antwoorden te selecteren.</p>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-btn prepend-icon="mdi-arrow-left" @click="emit('m-done')">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Cancel
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>
    <v-col>
      <v-btn :disabled="state.questionsArray.length < 1 || countGoodAnswers() === 0" append-icon="mdi-arrow-right"
        @click="state.showSaveQuiz = true">
        Bewaar Quiz
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>

  <v-row justify="space-around">
    <v-col cols="6" md="4">
      <p>Preview 414 x 1792 px (2 x schermhoogte)</p>
      <v-sheet class="pa-2" color="grey-lighten-3" height="1792" width="414">
        <v-row no-gutters>
          <h3>{{ state.headText }}</h3>
        </v-row>
        <v-row no-gutters>
          <div v-html="state.content"></div>
        </v-row>
        <v-row no-gutters>
          <v-list lines="two" density="compact">
            <v-list-item v-for="(num, index) in state.questionsArray" :subtitle="composeQuestion(index)" @click="qAnswer(index)"
              :style="{ 'background-color': bgColor }"></v-list-item>
          </v-list>
        </v-row>
        <v-row v-if="state.gameRules !== ''" no-gutters>
          <p class="py-2">{{ state.gameRules }}</p>
        </v-row>
        <h4 class="py-3">Toelichting op goed/fout antwoord:</h4>
        <v-row>
          <v-col cols="12">
            <p>{{ state.resultInfo }}</p>
          </v-col>
        </v-row>
      </v-sheet>
    </v-col>
    <v-col cols="6" md="4">
      <p>Preview 375 x 1624 px (2 x schermhoogte)</p>
      <v-sheet class="pa-2" color="grey-lighten-3" height="1624" width="375">
        <v-row no-gutters>
          <h3>{{ state.headText }}</h3>
        </v-row>
        <v-row no-gutters>
          <div v-html="state.content"></div>
        </v-row>
        <v-row no-gutters>
          <v-list lines="two" density="compact">
            <v-list-item v-for="(num, index) in state.questionsArray" :subtitle="composeQuestion(index)" @click="qAnswer(index)"
              :style="{ 'background-color': bgColor }"></v-list-item>
          </v-list>
        </v-row>
        <v-row v-if="state.gameRules !== ''" no-gutters>
          <p class="py-2">{{ state.gameRules }}</p>
        </v-row>
        <h4 class="py-3">Toelichting op goed/fout antwoord:</h4>
        <v-row>
          <v-col cols="12">
            <p>{{ state.resultInfo }}</p>
          </v-col>
        </v-row>
      </v-sheet>
    </v-col>
  </v-row>

  <v-dialog v-model="state.showQuizSelect" width="50%">
    <v-card>
      <v-card-title>Kies een bestaande quiz</v-card-title>
      <v-select :items="state.allQuizNames" v-model="state.quizName" label="Bestaande quiz naam"></v-select>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="quitQuizSelect">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn append-icon="mdi-arrow-right" @click="doLoadQuiz">
              Door
              <template v-slot:append>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.showQuizRemove" width="50%">
    <v-card>
      <v-card-title>Kies een te verwijderen quiz</v-card-title>
      <v-select :items="state.allQuizNames" v-model="state.quizNameToRemove" label="Te verwijderen quiz naam"></v-select>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="quitRemoveQuizSelect">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn append-icon="mdi-arrow-right" @click="doRemoveQuiz">
              Door
              <template v-slot:append>
                <v-icon size="x-large" color="red"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.showSaveQuiz" width="50%">
    <v-card>
      <v-card-title>Bewaar de quiz</v-card-title>
      <v-text-field v-model="state.quizName" :rules="state.saveQuizNameRules" label="Unieke quiz naam"></v-text-field>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="state.showSaveQuiz = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn append-icon="mdi-arrow-right" @click="saveQuiz">
              Bewaar Quiz
              <template v-slot:append>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onBeforeMount, computed, reactive } from 'vue'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, remove } from 'firebase/database'
const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadQuizNames()
})

const state = reactive({
  indexObject: {},
  allQuizNames: [],
  showQuizSelect: false,
  showQuizRemove: false,
  quizName: '',
  quizNameToRemove: '',
  showSaveQuiz: false,
  headText: '',
  content: undefined,
  questionNumber: 0,
  quizQuestion: '',
  questionsArray: [],
  gameRules: '',
  quizAnswers: {},
  resultInfo: '',
  explanationUrl: '',
  urlRules: [
    value => {
      const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}/gm
      return regex.test(value) || 'Onjuist url formaat'
    }
  ],
  saveQuizNameRules: [
    value => {
      return state.allQuizNames.includes(value) || 'Quiz naam niet genonden. Nieuwe quiz?'
    }
  ]
})

function loadQuizNames() {
  // get all available quiz names
  get(child(dbRef, `/quizes/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.indexObject = snapshot.val()
      state.allQuizNames = Object.keys(state.indexObject)
      console.log('loadQuizNames: state.allQuizNames = ' + state.allQuizNames)
    } else {
      console.log("No quiz names available")
    }
  }).catch((error) => {
    console.error('While reading all available quiz names from database: error message = ' + error.message)
  })
}

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

function selectLoadQuiz() {
  state.showQuizSelect = true
}

function removeQuiz() {
  state.showQuizRemove = true
}

function doLoadQuiz() {
  state.showQuizSelect = false
  // get all the quiz data
  get(child(dbRef, `/quizes/` + state.quizName)).then((snapshot) => {
    if (snapshot.exists()) {
      const quizObject = snapshot.val()
      state.headText = quizObject.headText
      state.content = quizObject.body || ''
      state.questionsArray = quizObject.questionsArray
      state.quizAnswers = quizObject.answers
      state.resultInfo = quizObject.resultInfo
      state.gameRules = quizObject.gameRules
      state.explanationUrl = quizObject.explanationUrl
      state.questionNumber = state.questionsArray.length - 1
    } else {
      console.log("No quiz data available")
    }
  }).catch((error) => {
    console.error('While reading the quiz data from database: error message = ' + error.message)
  })
}

function doRemoveQuiz() {
  get(child(dbRef, `/quizes/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      // refresh data from database
      state.indexObject = snapshot.val()
      state.allQuizNames = Object.keys(state.indexObject)

      state.showQuizRemove = false
      remove(child(dbRef, '/quizes/' + state.quizNameToRemove)).then(() => {
        // remove the quiz from the array
        state.allQuizNames = state.allQuizNames.filter(q => q !== state.quizNameToRemove)
        console.log('state.allQuizNames = ' + state.allQuizNames)
        // update the index
        const newIndexObject = {}
        for (const el of state.allQuizNames) {
          if (state.indexObject[el]) {
            //copy existing entries
            newIndexObject[el] = state.indexObject[el]
          }
        }
        console.log('newIndexObject = ' + JSON.stringify(newIndexObject, null, 2))
        set(ref(db, '/quizes/index/'), newIndexObject)
        if (state.quizName === state.quizNameToRemove) {
          // the current quiz was removed
          clearAll()
        }
        state.quizNameToRemove = ''
      }).catch((error) => {
        console.error('The quiz remove failed, error message = ' + error.message)
      })
    } else {
      console.log("No quiz names available")
    }
  }).catch((error) => {
    console.error('While reading all available quiz names from database: error message = ' + error.message)
  })
}

function quitQuizSelect() {
  state.showQuizSelect = false
}

function quitRemoveQuizSelect() {
  state.showQuizRemove = false
}

function clearAll() {
  state.quizName = ''
  state.questionNumber = 0
  state.quizQuestion = ''
  state.headText = ''
  state.content = undefined
  state.questionsArray = []
  state.quizAnswers = []
  state.resultInfo = ''
  state.gameRules = ''
  state.explanationUrl = ''
}

function createNew() {
  clearAll()
}

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
  if (state.quizAnswers === undefined) return 0
  const answers = Object.keys(state.quizAnswers)
  let count = 0
  for (const el of answers) {
    if (state.quizAnswers[el]) count++
  }
  return count
}

function saveQuiz() {
  // note: Using set() overwrites data at the specified location, including any child nodes.
  set(ref(db, '/quizes/' + state.quizName), {
    "headText": state.headText,
    "body": state.content || '',
    "questionsArray": state.questionsArray,
    "answers": state.quizAnswers,
    "resultInfo": state.resultInfo,
    "gameRules": state.gameRules,
    "explanationUrl": state.explanationUrl
  })

  // update the index
  if (!state.allQuizNames.includes(state.quizName)) {
    state.allQuizNames.push(state.quizName)
  }
  const newIndexObject = {}
  for (const el of state.allQuizNames) {
    if (state.indexObject[el]) {
      //copy existing entry
      newIndexObject[el] = state.indexObject[el]
    } else {
      // create new entry
      newIndexObject[el] = { 'state': 'created' }
    }
  }
  set(ref(db, '/quizes/index/'), newIndexObject)
  state.showSaveQuiz = false
  clearAll()
}

</script> 

