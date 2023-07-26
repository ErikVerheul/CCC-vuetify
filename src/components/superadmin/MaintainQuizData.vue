<template>
  <v-sheet>
    <v-row class="d-flex align-center justify-center">
      <h2 v-if="state.quizQName !== ''">Onderhoud quiz-vraag "{{ state.quizQName }}" gegevens</h2>
      <h2 v-else>Onderhoud quiz-vraag gegevens</h2>
    </v-row>
    <v-row>
      <v-col>
        <v-btn @click="state.showQuizQSelect = true">Laad een bestaande quiz-vraag</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn @click="clearAll()">Maak een nieuwe quiz-vraag</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn color="red" @click="state.showQuizQRemove = true">Verwijder een quiz-vraag</v-btn>
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
      <v-text-field v-model="state.quizStatement" :label="sLabel" />
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
        @click="state.showSaveQuizQ = true">
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

  <v-dialog v-model="state.showQuizQSelect" width="50%">
    <v-card>
      <v-card-title>Kies een bestaande quiz-vraag</v-card-title>
      <v-select :items="state.allQuizQNames" v-model="state.quizQName" label="Bestaande quiz-vraag naam"></v-select>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="state.showQuizQSelect = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn append-icon="mdi-arrow-right" @click="doLoadQuizQ">
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

  <v-dialog v-model="state.showQuizQRemove" width="50%">
    <v-card>
      <v-card-title>Kies een te verwijderen quiz-vraag</v-card-title>
      <v-select :items="state.allQuizQNames" v-model="state.quizQNameToRemove" label="Te verwijderen quiz-vraag naam"></v-select>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="state.showQuizQRemove = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn append-icon="mdi-arrow-right" @click="doRemoveQuizQ">
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

  <v-dialog v-model="state.showSaveQuizQ" width="50%">
    <v-card>
      <v-card-title>Bewaar de quiz-vraag</v-card-title>
      <v-text-field v-model="state.quizQName" :rules="state.saveQuizNameRules" label="Unieke quiz-vraag naam"></v-text-field>
      <v-text-field v-model="state.quizNumber" :rules="state.saveQuizNumberRules"
        label="Het quiz nummer van deze vraag; 0 als niet toegekend"></v-text-field>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn prepend-icon="mdi-arrow-left" @click="state.showSaveQuizQ = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn :disabled="!canSave()" append-icon="mdi-arrow-right" @click="saveQuizQ">
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
import { onBeforeMount, computed, reactive } from 'vue'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, remove } from 'firebase/database'
const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadQuizQNames()
})

const state = reactive({
  indexObject: {},
  allQuizQNames: [],
  allQuizNumbers: [],
  showQuizQSelect: false,
  showQuizQRemove: false,
  quizQName: '',
  quizQNameToRemove: '',
  showSaveQuizQ: false,
  headText: '',
  content: undefined,
  statementNumber: 0,
  quizStatement: '',
  statementsArray: [],
  gameRules: '',
  quizQAnswers: {},
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
      return state.allQuizQNames.includes(value) || 'Quiz-vraag naam niet genonden. Nieuwe quiz-vraag?'
    }
  ],
  saveQuizNumberRules: [
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
      if (value === '0' || state.allQuizNumbers.includes(value)) return true

      return 'Dit quiz nummer bestaat niet'
    }
  ],
  quizNumber: ''
})

function isKnownQuizNumber(nr) {
  for (const strNr of state.allQuizNumbers) {
    if (strNr === nr) return true
  }
  return false
}

function loadQuizQNames() {
  // get all available quiz-question names
  get(child(dbRef, `/quizes/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.indexObject = snapshot.val()
      state.allQuizQNames = Object.keys(state.indexObject)
      // get all available quiz numbers
      get(child(dbRef, `/quizes/names/`)).then((snapshot) => {
        if (snapshot.exists()) {
          state.quizesObject = snapshot.val()
          // allQuizNumbers contains string values
          state.allQuizNumbers = Object.keys(state.quizesObject)
        } else {
          console.log("No quizes available")
        }
      }).catch((error) => {
        console.error('While reading all available quizes from database: error message = ' + error.message)
      })
    } else {
      console.log("No quiz-question names available")
    }
  }).catch((error) => {
    console.error('While reading all available quiz-question names from database: error message = ' + error.message)
  })
}

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

function doLoadQuizQ() {
  state.showQuizQSelect = false
  // get all the quiz-question data
  get(child(dbRef, `/quizes/` + state.quizQName)).then((snapshot) => {
    if (snapshot.exists()) {
      const quizObject = snapshot.val()
      state.headText = quizObject.headText
      state.content = quizObject.body || ''
      state.statementsArray = quizObject.questionsArray
      state.quizQAnswers = quizObject.answers
      state.resultInfo = quizObject.resultInfo
      state.gameRules = quizObject.gameRules
      state.explanationUrl = quizObject.explanationUrl
      state.statementNumber = state.statementsArray.length - 1
      // assing the quiz number
      state.quizNumber = state.indexObject[state.quizQName].quizNumber
    } else {
      console.log("No quiz-question data available")
    }
  }).catch((error) => {
    console.error('While reading the quiz-question data from database: error message = ' + error.message)
  })
}

function doRemoveQuizQ() {
  get(child(dbRef, `/quizes/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      // refresh data from database
      state.indexObject = snapshot.val()
      state.allQuizQNames = Object.keys(state.indexObject)

      state.showQuizQRemove = false
      remove(child(dbRef, '/quizes/' + state.quizQNameToRemove)).then(() => {
        // remove the quiz-question from the array
        state.allQuizQNames = state.allQuizQNames.filter(q => q !== state.quizQNameToRemove)
        // update the index
        const newIndexObject = {}
        for (const el of state.allQuizQNames) {
          if (state.indexObject[el]) {
            //copy existing entries
            newIndexObject[el] = state.indexObject[el]
          }
        }
        set(ref(db, '/quizes/index/'), newIndexObject)
        if (state.quizQName === state.quizQNameToRemove) {
          // the current quiz-question was removed
          clearAll()
        }
        state.quizQNameToRemove = ''
      }).catch((error) => {
        console.error('The quiz-question remove failed, error message = ' + error.message)
      })
    } else {
      console.log("No quiz-question names available")
    }
  }).catch((error) => {
    console.error('While reading all available quiz-question names from database: error message = ' + error.message)
  })
}

function clearAll() {
  state.quizQName = ''
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

function canSave() {
  return !isNaN(state.quizNumber) && state.quizQName !== '' && (state.quizNumber === '0' || isKnownQuizNumber(state.quizNumber))
}

function saveQuizQ() {
  // note: Using set() overwrites data at the specified location, including any child nodes.
  set(ref(db, '/quizes/' + state.quizQName), {
    "headText": state.headText,
    "body": state.content || '',
    "questionsArray": state.statementsArray,
    "answers": state.quizQAnswers,
    "resultInfo": state.resultInfo,
    "gameRules": state.gameRules,
    "explanationUrl": state.explanationUrl
  }).then(() => {
    // update the index
    if (!state.allQuizQNames.includes(state.quizQName)) {
      state.allQuizQNames.push(state.quizQName)
    }
    const newIndexObject = {}
    for (const el of state.allQuizQNames) {
      if (state.indexObject[el]) {
        //copy existing entry
        newIndexObject[el] = state.indexObject[el]
      } else {
        // create new entry
        newIndexObject[el] = { 'creationDate': Number(new Date()) }
      }
    }
    // assign the quiz number to this question
    newIndexObject[state.quizQName].quizNumber = state.quizNumber
    set(ref(db, '/quizes/index/'), newIndexObject)
    state.showSaveQuizQ = false
    clearAll()
  }).catch((error) => {
    console.error('The write failed, error message = ' + error.message)
  })
}
</script> 

