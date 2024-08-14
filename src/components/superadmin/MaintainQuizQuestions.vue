<template>
  <PreviewQuestion v-if="state.showPreviewQuestion" :content="state.content" :statementsArray="state.statementsArray" :quizQAnswers="state.quizQAnswers"
    :gameRules="state.gameRules" :correctAnswer="state.correctAnswer" @return-to="state.showPreviewQuestion = false"></PreviewQuestion>
  <PreviewFullExplanation v-else-if="state.showFullExplanation" :resultInfo="state.resultInfo" @return-to="state.showFullExplanation = false">
  </PreviewFullExplanation>
  <v-sheet v-else>
    <v-row class="d-flex align-center justify-center">
      <h2 v-if="state.quizNumber && state.questionNumber !== ''">Onderhoud quiz-vraag {{ state.questionNumber }} voor quiz {{ state.quizNumber }}</h2>
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
    <template v-if="showInputFields()">
      <v-row>
        <v-col cols="6">
          <v-select v-model="state.selectedQuizItem" label="Kies of verander de quiz voor deze quiz-vraag" :items="state.quizItems" item-value="key"
            return-object />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="state.questionTitle" label="Quiz-vraag titel" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="state.ankeiler" label="Ankeiler tekst" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <p>Body met optionele afbeelding:</p>
          <QuillEditor v-model:content="state.content" contentType="html" :toolbar="editorToolbar"></QuillEditor>
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
          <p>Toelichting correcte antwoord</p>
          <QuillEditor v-model:content="state.correctAnswer" contentType="html" :toolbar="editorToolbar"></QuillEditor>
        </v-col>
        <v-col class="mt-12" cols="12">
          <v-text-field v-model="state.gameRules" label="Spelregels (verplicht)" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-list lines="two" density="compact">
          <v-list-item v-for="(num, index) in state.statementsArray" :subtitle="composeStatement(index)" @click="qAnswer(index)"
            :style="{ 'background-color': bgColor }"></v-list-item>
        </v-list>
      </v-row>
      <v-row v-if="countGoodAnswers() === 0">
        <v-col cols="12">
          <p>Klik op de stellingen in de preview om minstens 1 goed antwoord te selecteren</p>
        </v-col>
      </v-row>

      <v-divider class="my-5"></v-divider>
      <v-btn @click="state.showPreviewQuestion = true">Toon preview-kort</v-btn>
      <v-divider class="my-5"></v-divider>

      <v-row>
        <v-col cols="12">
          <p>Lange toelichting</p>
          <QuillEditor v-model:content="state.resultInfo" contentType="html" :toolbar="editorToolbar"></QuillEditor>
        </v-col>
      </v-row>

      <v-btn @click="state.showFullExplanation = true">Toon preview-lang</v-btn>
    </template>

    <v-divider class="my-8"></v-divider>

    <v-row>
      <v-col>
        <v-btn prepend-icon="mdi-arrow-left" @click="emit('m-done')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Cancel en terug naar menu
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="text-right">
        <v-btn :disabled="!canSave()" append-icon="mdi-arrow-right" @click="doSaveQuestion()">
          Bewaar Quiz-vraag
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>

  <v-dialog v-model="state.showQuestionSelect" width="70%">
    <v-card>
      <v-card-title>Kies een bestaande quiz-vraag</v-card-title>
      <v-select :items="state.questionItems" item-value="key" v-model="state.selectedQuestionItem" return-object single-line />
      <v-divider></v-divider>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="clearAll()">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn :disabled="!canLoad()" append-icon="mdi-arrow-right" @click="doLoadQuestion">
              Verder
              <template v-slot:append>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.showQuestionRemove" width="70%">
    <v-card>
      <v-card-title>Kies een te verwijderen quiz-vraag</v-card-title>
      <v-select :items="state.questionItems" item-value="key" v-model="state.selectedQuestionItem" return-object single-line />
      <v-divider></v-divider>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="clearAll()">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn :disabled="!canRemove()" append-icon="mdi-arrow-right" @click="doRemoveQuestion">
              Verder
              <template v-slot:append>
                <v-icon size="x-large" color="red"></v-icon>
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
import { useAppStore } from '../../store/app.js'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, remove } from 'firebase/database'
import PreviewQuestion from './PreviewQuestion.vue'
import PreviewFullExplanation from './PreviewFullExplanation.vue'

const store = useAppStore()
const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadMetaData()
})

const editorToolbar = [
  [{ header: [false, 1, 2, 3, 4, 5, 6] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  ['link', 'image', 'code-block'],
]

const state = reactive({
  showPreviewQuestion: false,
  showFullExplanation: false,

  indexObject: {},
  allQuizNumbers: [],
  indexObjectKeys: [],

  quizNumber: undefined,
  quizTitle: '',
  ankeiler: '',
  quizItems: [],
  selectedQuizItem: { key: 0, title: '' },

  questionNumber: undefined,
  questionTitle: '',
  questionItems: [],
  selectedQuestionItem: { key: undefined, title: 'Kies een quiz-vraag' },

  showCreateQuestion: false,
  showQuestionSelect: false,
  showQuestionRemove: false,

  content: undefined,
  statementNumber: 0,
  quizStatement: '',
  statementsArray: [],
  gameRules: '',
  quizQAnswers: {},
  correctAnswer: undefined,
  resultInfo: undefined,
  questionNumberRules: [
    (value) => {
      if (value) return true

      return 'Vul 1 of meer cijfers in.'
    },
    (value) => {
      if (value && value.length >= 1) return true

      return 'Vul minimaal 1 cijfer in.'
    },

    (value) => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    (value) => {
      if (value >= 0) return true

      return 'Mag geen negatief getal zijn.'
    },
    (value) => {
      if (!state.indexObjectKeys.includes(value)) return true

      return 'Dit quiz-vraag nummer bestaat al'
    },
  ],
  urlRules: [
    (value) => {
      const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}/gm
      return regex.test(value) || 'Onjuist url formaat'
    },
  ],
})

// must be non-reactive
let bgColor = undefined

const sLabel = computed(() => {
  return 'Quizvraag-stelling ' + (state.statementNumber + 1)
})

const editMode = computed(() => {
  if (state.statementNumber < state.statementsArray.length) {
    return 'change'
  } else return 'add'
})

function showInputFields() {
  return !isNaN(state.questionNumber) && state.questionNumber > 0
}

function clearAll() {
  state.showCreateQuestion = false
  state.showQuestionSelect = false
  state.showQuestionRemove = false

  state.selectedQuizItem = { key: 0, title: '' }
  state.selectedQuestionItem = { key: undefined, title: 'Kies een quiz-vraag' }
  state.questionNumber = ''
  state.questionTitle = ''
  state.ankeiler = ''
  state.statementNumber = 0
  state.quizStatement = ''
  state.content = undefined
  state.statementsArray = []
  state.quizQAnswers = []
  state.correctAnswer = undefined
  state.resultInfo = undefined
  state.gameRules = ''
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
  allQuizNumbers.forEach((el) => {
    state.quizItems.push({ key: el, title: `(${el}) ${quizzesObject[el].title}` })
  })
}

function createQuestionItems(questionObject, indexObjectKeys) {
  state.questionItems = []
  indexObjectKeys.forEach((el) => {
    state.questionItems.push({ key: el, title: `(${el}) ${questionObject[el].title}` })
  })
}

/* Get quiz and questions meta data */
function loadMetaData() {
  clearAll()
  state.allQuizNumbers = Object.keys(store.metaObject)
  createQuizItems(store.metaObject, state.allQuizNumbers)
  // get all available question numbers and titles
  get(child(dbRef, `/quizzes/questions/index/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.indexObject = snapshot.val()
        state.indexObjectKeys = Object.keys(state.indexObject)
        createQuestionItems(state.indexObject, state.indexObjectKeys)
      } else {
        console.log('No quiz-questions available')
      }
    })
    .catch((error) => {
      console.error('Error while reading all available quiz-questions from database: ' + error.message)
    })
}

/* Return true if questionNumber is defined, is a number and valid */
function canLoad() {
  return !isNaN(state.questionNumber) && state.indexObjectKeys.includes(state.questionNumber)
}

/* Get the quiz-question data */
function doLoadQuestion() {
  state.showQuestionSelect = false
  get(child(dbRef, `/quizzes/questions/` + state.questionNumber))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const quizObject = snapshot.val()
        state.content = quizObject.body || ''
        state.statementsArray = quizObject.statementsArray
        state.quizQAnswers = quizObject.answers
        state.correctAnswer = quizObject.correctAnswer || '<p></p>'
        state.resultInfo = quizObject.resultInfo
        state.gameRules = quizObject.gameRules
        state.statementNumber = state.statementsArray.length - 1
        // assign the quiz number
        state.quizNumber = state.indexObject[state.questionNumber].quizNumber
        // preset the quiz select
        state.selectedQuizItem = state.quizItems.filter((q) => q.key === state.quizNumber)[0]
      } else {
        console.log('No quiz-question data available')
      }
    })
    .catch((error) => {
      console.error('While reading the quiz-question data from database: error message = ' + error.message)
    })
}

function composeStatement(idx) {
  if (idx > 12) return 'Fout: Meer dan 12 vragen?'
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
  const keys = Object.keys(state.quizQAnswers)
  let count = 0
  keys.forEach((k) => {
    if (state.quizQAnswers[k] === true && state.quizQAnswers[k] === true) count++
  })
  return count
}

/*
Return true if quizNumber and questionNumber are defined and a number, 
the quizNumber represents an existing quiz, the question title is not empty and
at leat 1 good answer is set
*/
function canSave() {
  return (
    !isNaN(state.quizNumber) &&
    !isNaN(state.questionNumber) &&
    state.allQuizNumbers.includes(state.quizNumber) &&
    state.questionTitle &&
    state.questionTitle.length > 0 &&
    countGoodAnswers() > 0 &&
    state.gameRules &&
    state.gameRules.length > 0
  )
}

function doSaveQuestion() {
  // note: Using set() overwrites data at the specified location, including any child nodes.
  set(ref(db, '/quizzes/questions/' + state.questionNumber), {
    body: state.content || '',
    statementsArray: state.statementsArray,
    answers: state.quizQAnswers,
    correctAnswer: state.correctAnswer,
    resultInfo: state.resultInfo,
    gameRules: state.gameRules,
  })
    .then(() => {
      const newIndexObject = { quizNumber: state.quizNumber, title: state.questionTitle, ankeiler: state.ankeiler, creationDate: Number(new Date()) }
      set(ref(db, '/quizzes/questions/index/' + state.questionNumber.toString()), newIndexObject)
        .then(() => {
          // reset current activity and refresh the meta data
          loadMetaData()
        })
        .catch((error) => {
          console.error('The write of the index data failed: ' + error.message)
        })
    })
    .catch((error) => {
      console.error('The write of the question data failed: ' + error.message)
    })
}

/* Return true if quiestionNumber is defined and a number greater than zero */
function canRemove() {
  return !isNaN(state.questionNumber) && state.questionNumber > 0
}

function doRemoveQuestion() {
  remove(child(dbRef, `/quizzes/questions/index/${state.questionNumber}`))
    .then(() => {
      remove(child(dbRef, `/quizzes/questions/${state.questionNumber})`))
        .then(() => {
          state.showQuestionRemove = false
          loadMetaData()
        })
        .catch((error) => {
          console.error('The removal of the quiz-question failed: ' + error.message)
        })
    })
    .catch((error) => {
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
      state.quizTitle = store.metaObject[state.quizNumber].title
    }
  },
)

watch(
  () => state.selectedQuestionItem,
  () => {
    // fires only when state.someObject is replaced
    if (state.selectedQuestionItem.key) {
      // suppress events not coming from v-select
      state.questionNumber = state.selectedQuestionItem.key
      state.questionTitle = state.indexObject[state.questionNumber].title
      state.ankeiler = state.indexObject[state.questionNumber].ankeiler
    }
  },
)
</script>
