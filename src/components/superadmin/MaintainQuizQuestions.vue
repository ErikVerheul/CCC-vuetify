<template>
  <p>state.quizNumber = {{ state.quizNumber }}</p>
  <p>state.questionNumber = {{ state.questionNumber }}</p>
  <v-sheet>
    <v-row class="d-flex align-center justify-center">
      <h2 v-if="state.quizNumber && state.questionNumber !== ''">Onderhoud quiz-vraag {{ state.questionNumber }} voor quiz {{ state.quizNumber
      }}</h2>
      <h2 v-else>Onderhoud quiz-vraag gegevens</h2>
    </v-row>
    <v-row>
      <v-col>
        <v-btn @click="changeQuestion()">Laad een bestaande quiz-vraag</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn @click="createNewQuestion()">Maak een nieuwe quiz-vraag</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn color="red" @click="removeQuestion()">Verwijder een quiz-vraag</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="state.showCreateQuestion">
      <v-col cols="12">
        <v-text-field v-model="state.questionNumber" :rules="state.questionNumberRules" label="Nieuw quiz-vraag nummer" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-select v-model="state.selectedQuizItem" :items="state.quizItems" item-value="key" return-object single-line />
      </v-col>
      <v-col cols="6">
        <v-text-field v-model="state.questionTitle" label="Quiz-vraag titel" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="state.headText" label="Kop tekst" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <p>Body met optionele afbeelding:</p>
        <quill-editor v-model:value="state.content"></quill-editor>
      </v-col>
    </v-row>
    <v-row class="py-15">
      <v-col cols="12">
        <v-text-field v-model="state.quizStatement" :label="sLabel" />
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col>
        <v-btn :disabled="state.statementNumber <= 0" flat prepend-icon="mdi-arrow-up" @click="sBack">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Edit vorige
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn flat append-icon="mdi-arrow-down" @click="sSave">
          Sla stelling op
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn flat append-icon="mdi-arrow-right" @click="sOpenNext">
          Nieuwe stelling
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn :disabled="state.statementNumber >= state.statementsArray.length - 1" flat append-icon="mdi-arrow-down" @click="sForward">
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
      <p>Klik op de stellingen in de preview om de goede antwoorden te selecteren.</p>
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
    <v-col class="text-right">
      <v-btn :disabled="state.statementsArray.length < 1 || countGoodAnswers() === 0" append-icon="mdi-arrow-right"
        @click="state.showSaveQuestion = true">
        Bewaar Quiz-vraag
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
            <v-list-item v-for="(num, index) in state.statementsArray" :subtitle="composeStatement(index)" @click="qAnswer(index)"
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
            <v-list-item v-for="(num, index) in state.statementsArray" :subtitle="composeStatement(index)" @click="qAnswer(index)"
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

  <v-dialog v-model="state.showQuestionSelect" width="50%">
    <v-card>
      <v-card-title>Kies een bestaande quiz-vraag</v-card-title>
      <v-select :items="state.questionItems" item-value="key" v-model="state.selectedQuestionItem" return-object single-line />
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="state.showQuestionSelect = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn :disabled="!canLoad()" append-icon="mdi-arrow-right" @click="doLoadQuestion">
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

  <v-dialog v-model="state.showQuestionRemove" width="50%">
    <v-card>
      <v-card-title>Kies een te verwijderen quiz-vraag</v-card-title>
      <v-select :items="state.questionItems" item-value="key" v-model="state.selectedQuestionItem" return-object single-line />
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="state.showQuestionRemove = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn :disabled="!canRemove()" append-icon="mdi-arrow-right" @click="doRemoveQuestion">
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

  <v-dialog v-model="state.showSaveQuestion" width="50%">
    <v-card>
      <v-card-title>Bewaar de quiz-vraag</v-card-title>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="state.showSaveQuestion = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn :disabled="!canSave()" append-icon="mdi-arrow-right" @click="doSaveQuestion">
              Bewaar Quiz-vraag
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
import { onBeforeMount, computed, reactive, watch } from 'vue'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, remove } from 'firebase/database'
const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  doLoadMetaData()
})

const state = reactive({
  quizzesObject: {},
  indexObject: {},
  allQuizNumbers: [],
  allQuestionNumbers: [],

  quizNumber: 0,
  quizTitle: '',
  quizItems: [],
  selectedQuizItem: { "key": 0, "title": "Kies of verander de quiz voor deze vraag" },

  questionNumber: undefined,
  questionTitle: '',
  questionItems: [],
  selectedQuestionItem: { "key": undefined, "title": "Kies een quiz-vraag" },

  showCreateQuestion: false,
  showQuestionSelect: false,
  showQuestionRemove: false,
  showSaveQuestion: false,

  headText: '',
  content: undefined,
  statementNumber: 0,
  quizStatement: '',
  statementsArray: [],
  gameRules: '',
  quizQAnswers: {},
  resultInfo: '',
  explanationUrl: '',
  questionNumberRules: [
    value => {
      if (value) return true

      return 'Vul 1 of meer cijfers in.'
    },
    value => {
      if (value.length >= 1) return true

      return 'Vul minimaal 1 cijfer in.'
    },

    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value >= 0) return true

      return 'Mag geen negatief getal zijn.'
    },
    value => {
      if (!state.allQuestionNumbers.includes(value)) return true

      return 'Dit quiz-vraag nummer bestaat al'
    }
  ],
  urlRules: [
    value => {
      const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}/gm
      return regex.test(value) || 'Onjuist url formaat'
    }
  ]
})

// must be non-reactive
let bgColor = undefined

const sLabel = computed(() => {
  return 'Quiz-stelling ' + (state.statementNumber + 1)
})

const editMode = computed(() => {
  if (state.statementNumber < state.statementsArray.length) {
    return "change"
  } else return "add"
})

function clearAll() {
  state.showCreateQuestion = false
  state.showQuestionSelect = false
  state.showQuestionRemove = false
  state.showSaveQuestion = false

  state.selectedQuizItem = { "key": 0, "title": "Kies of verander de quiz voor deze vraag" }
  state.selectedQuestionItem = { "key": undefined, "title": "Kies een quiz-vraag" }
  state.questionNumber = ''
  state.questionTitle = ''
  state.statementNumber = 0
  state.quizStatement = ''
  state.headText = ''
  state.content = undefined
  state.statementsArray = []
  state.quizQAnswers = []
  state.resultInfo = ''
  state.gameRules = ''
  state.explanationUrl = ''
  state.quizNumber = ''
}

function createNewQuestion() {
  clearAll()
  state.showCreateQuestion = true
}

function changeQuestion() {
  clearAll()
  state.showQuestionSelect = true
}

function removeQuestion() {
  clearAll()
  state.showQuestionRemove = true
}

function createQuizItems(quizzesObject, allQuizNumbers) {
  state.quizItems = []
  allQuizNumbers.forEach(el => {
    state.quizItems.push({ 'key': el, 'title': `(${el}) ${quizzesObject[el].title}` })
  })
}

function createQuestionItems(questionObject, allQuestionNumbers) {
  state.questionItems = []
  allQuestionNumbers.forEach(el => {
    state.questionItems.push({ 'key': el, 'title': `(${el}) ${questionObject[el].title}` })
  })
}

/* Get quiz and questions meta data */
function doLoadMetaData() {
  clearAll()
  get(child(dbRef, `/quizzes/metaData/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.quizzesObject = snapshot.val()
      state.allQuizNumbers = Object.keys(state.quizzesObject)
      createQuizItems(state.quizzesObject, state.allQuizNumbers)
      // get all available question numbers and titles
      get(child(dbRef, `/quizzes/questions/index/`)).then((snapshot) => {
        if (snapshot.exists()) {
          state.indexObject = snapshot.val()
          state.allQuestionNumbers = Object.keys(state.indexObject)
          createQuestionItems(state.indexObject, state.allQuestionNumbers)
        } else {
          console.log("No quiz-questions available")
        }
      }).catch((error) => {
        console.error('Error while reading all available quiz-questions from database: ' + error.message)
      })
    } else {
      console.log("No quizzes available")
    }
  }).catch((error) => {
    console.error('Error while reading all available quizzes from database: ' + error.message)
  })
}

/* Return true if questionNumber is defined, is a number and valid */
function canLoad() {
  return !isNaN(state.questionNumber) && state.allQuestionNumbers.includes(state.questionNumber)
}

/* Get the quiz-question data */
function doLoadQuestion() {
  state.showQuestionSelect = false
  get(child(dbRef, `/quizzes/questions/` + state.questionNumber)).then((snapshot) => {
    if (snapshot.exists()) {
      const quizObject = snapshot.val()
      state.headText = quizObject.headText
      state.content = quizObject.body || ''
      state.statementsArray = quizObject.statementsArray
      state.quizQAnswers = quizObject.answers
      state.resultInfo = quizObject.resultInfo
      state.gameRules = quizObject.gameRules
      state.explanationUrl = quizObject.explanationUrl
      state.statementNumber = state.statementsArray.length - 1
      // assign the quiz number
      state.quizNumber = state.indexObject[state.questionNumber].quizNumber
      // preset the quiz select
      state.selectedQuizItem = state.quizItems.filter((q => q.key === state.quizNumber))[0]
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
  return `${letters[idx]}. ` + state.statementsArray[idx]
}

function sBack() {
  if (state.statementNumber > 0) {
    state.statementNumber--
    state.quizStatement = state.statementsArray[state.statementNumber]
  }
}

function sOpenNext() {
  state.statementNumber = state.statementsArray.length
  state.quizStatement = ''
}

function sSave() {
  if (state.quizStatement !== '') {
    if (editMode.value === 'add') state.statementsArray.push(state.quizStatement)
    if (editMode.value === 'change') state.statementsArray[state.statementNumber] = state.quizStatement
  } else {
    if (editMode.value === 'change') {
      // remove this question
      state.statementsArray.splice(state.statementNumber, 1)
    }
  }
}

function sForward() {
  if (state.statementNumber < state.statementsArray.length - 1) {
    state.statementNumber++
    state.quizStatement = state.statementsArray[state.statementNumber]
  }
}

function qAnswer(idx) {
  if (state.quizQAnswers[idx]) {
    state.quizQAnswers[idx] = false
  } else {
    state.quizQAnswers[idx] = true
  }
}

function countGoodAnswers() {
  if (state.quizQAnswers === undefined) return 0
  const answers = Object.keys(state.quizQAnswers)
  let count = 0
  for (const el of answers) {
    if (state.quizQAnswers[el]) count++
  }
  return count
}

/* Return true if quizNumber and questionNumber are defined and a number, 
the quizNumber represents an existing quiz and the question title is not empty */
function canSave() {
  return !isNaN(state.quizNumber) && !isNaN(state.questionNumber) &&
    state.allQuizNumbers.includes(state.quizNumber) &&
    state.questionTitle && state.questionTitle.length > 0
}

function doSaveQuestion() {
  // note: Using set() overwrites data at the specified location, including any child nodes.
  set(ref(db, '/quizzes/questions/' + state.questionNumber), {
    "headText": state.headText,
    "body": state.content || '',
    "statementsArray": state.statementsArray,
    "answers": state.quizQAnswers,
    "resultInfo": state.resultInfo,
    "gameRules": state.gameRules,
    "explanationUrl": state.explanationUrl
  }).then(() => {
    const newIndexObject = { 'quizNumber': state.quizNumber, 'title': state.questionTitle, 'creationDate': Number(new Date()) }
    set(ref(db, '/quizzes/questions/index/' + state.questionNumber.toString()), newIndexObject).then(() => {
      // reset current activity and refresh the meta data
      doLoadMetaData()
    }).catch((error) => {
      console.error('The write of the index data failed: ' + error.message)
    })
  }).catch((error) => {
    console.error('The write of the question data failed: ' + error.message)
  })
}

/* Return true if quiestionNumber is defined and a number */
function canRemove() {
  return !isNaN(state.questionNumber) && state.questionNumber > 0
}

function doRemoveQuestion() {
  remove(child(dbRef, `/quizzes/questions/index/` + state.questionNumber)).then(() => {
    remove(child(dbRef, '/quizzes/questions/' + state.questionNumber)).then(() => {
      state.showQuestionRemove = false
      doLoadMetaData()
    }).catch((error) => {
      console.error('The removal of the quiz-question failed: ' + error.message)
    })
  }).catch((error) => {
    console.error('The removal of the index entry of the quiz-question failed: ' + error.message)
  })
}

watch(
  () => state.selectedQuizItem,
  () => {
    // fires only when state.someObject is replaced
    if (state.selectedQuizItem.key) {
      // suppress events not coming from v-select
      state.quizNumber = state.selectedQuizItem.key
      state.quizTitle = state.quizzesObject[state.quizNumber].title
    }
  }
)

watch(
  () => state.selectedQuestionItem,
  () => {
    // fires only when state.someObject is replaced
    if (state.selectedQuestionItem.key) {
      // suppress events not coming from v-select
      state.questionNumber = state.selectedQuestionItem.key
      state.questionTitle = state.indexObject[state.questionNumber].title
    }
  }
)
</script> 

