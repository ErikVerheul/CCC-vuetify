<template>
  <p>state.action {{ state.action }}</p>
  <v-card>
    <v-card-title>Quiz meta data onderhouden</v-card-title>
    <v-row>
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-model="state.quizNumberInput" label="Nieuw of te veranderen quiz nummer" :rules="state.numberRules" />
      </v-col>
      <v-col cols="3"></v-col>
    </v-row>
    <template v-if="state.quizNumberInput && QNumberOk()">
      <v-row v-if="!QNumberExists()">
        <v-col cols="3"></v-col>
        <v-col cols="6">
          <v-text-field v-model.trim="state.quizTitle" label="Nieuwe quiz naam" :rules="state.newNameRules" />
        </v-col>
        <v-col cols="3"></v-col>
      </v-row>
      <template v-else>
        <v-row>
          <v-col cols="3"></v-col>
          <v-col cols="6">
            <v-radio-group inline v-model="state.action">
              <v-radio @change="changeMode" label="Veranderen" value="2"></v-radio>
              <v-radio @change="changeMode" label="Maak quiz leeg" value="3"></v-radio>
              <v-radio @change="createQuestionsList(state.quizNumberInput)" label="Toon vragen" value="4"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="3"></v-col>

          <v-col cols="3"></v-col>
          <v-col cols="6">
            <v-text-field v-if="state.action === '2'" v-model.trim="state.quizTitle" label="Verander quiz naam" :rules="state.newNameRules" />
            <p v-if="state.action === '3'">Leeg te maken quiz naam: {{ state.quizTitle }}</p>
          </v-col>
          <v-col cols="3"></v-col>
          <template v-if="state.action === '2'">
            <v-col cols="3"></v-col>
            <v-col cols="6">
              <v-text-field v-model="state.actionYear" label="Actie jaar" :rules="state.yearRules" />
            </v-col>
            <v-col cols="3"></v-col>

            <v-col cols="3"></v-col>
            <v-col cols="6">
              <v-text-field v-model="state.actionWeek" label="Actie week" :rules="state.weekRules" />
            </v-col>
            <v-col cols="3"></v-col>
            <template v-if="actionWeekInUse">
              <v-col cols="3"></v-col>
              <v-col cols="6">
                <p class="color-red">Er is al een quiz aan dit actie jaar en deze week gekoppeld</p>
              </v-col>
              <v-col cols="3">
                <v-btn @click="state.checkMultipleAssignments = true">Welke quiz?</v-btn>
              </v-col>
            </template>
          </template>
        </v-row>
      </template>
      <v-row v-if="!QNumberExists()">
        <v-col cols="6">
          <v-text-field v-model="state.actionYear" label="Actie jaar" :rules="state.yearRules" />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="state.actionWeek" label="Actie week" :rules="state.weekRules" />
        </v-col>
      </v-row>
      <v-row v-if="state.resetCount > 0">
        <v-col cols="12">
          <h4>{{ state.resetCount }} referenties naar deze quiz in de quiz vragen zijn verwijderd.</h4>
        </v-col>
      </v-row>
    </template>
    <v-divider class="mb-5"></v-divider>
    <v-row>
      <v-col>
        <v-btn prepend-icon="mdi-arrow-left" @click="emit('m-done')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
      <v-col v-if="state.saveSuccess === 1">
        "{{ saveButtonText }}" is gelukt
      </v-col>
      <v-col v-if="!state.saveSuccess === 2">
        "{{ saveButtonText }}" is mislukt
      </v-col>
      <v-col v-if="state.action != '4'" class="text-right">
        <v-btn :disabled="!allowSave" :color="saveButtonColor" append-icon="mdi-arrow-right" @click="doAction">
          {{ saveButtonText }}
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>Quizzen overzicht (nummers hoeven niet aan te sluiten)</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-list lines="one">
          <v-list-item v-for="item in state.allQuizItems" :title="composeLine(item)"></v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>

  <v-dialog v-model="state.checkMultipleAssignments" width="70%">
    <v-card>
      <v-card-title>Er is al een quiz aan deze actie week gekoppeld</v-card-title>
      <v-divider></v-divider>
      <v-card-title>Quiz(zen) die al is(zijn) toegewezen aan deze actie week:</v-card-title>
      <v-row>
        <v-col cols="12">
          <v-list lines="one">
            <v-list-item v-for="item in quizzesAssignedAlready" :title="composeLine(item)"></v-list-item>
          </v-list>
        </v-col>
      </v-row>
      <v-card-subtitle>Verbind deze quiz(zen) aan week 0 of een andere week</v-card-subtitle>
      <v-row class="mt-2">
        <v-col>
          <v-btn prepend-icon="mdi-arrow-left" @click="state.checkMultipleAssignments = false">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            Terug
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>

  <template>
    <v-row justify="center">
      <v-dialog v-model="state.showQuestions" width="70%">
        <v-card>
          <v-card-title>
            <span class="text-h5">Vragen van quiz met nummer {{ state.quizNumberInput }}</span>
          </v-card-title>
          <v-card-text>
            <v-list lines="one">
              <v-list-item v-for="item in state.questionsList" :title="composeQuestionLine(item)"></v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn color="purple" block @click="state.showQuestions = false">Sluit</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </template>
</template>

<script setup>
import { onBeforeMount, computed, reactive, watch } from 'vue'
import { useAppStore } from '../../store/app.js'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, remove, update } from 'firebase/database'

const store = useAppStore()
const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadQuizes()
})

const state = reactive({
  allQuizNumbers: [],
  allQuizItems: [],

  quizNumberInput: undefined,
  action: '1',
  quizTitle: '',
  actionYear: '',
  actionWeek: '',
  creationDate: undefined,
  numberRules: [
    value => {
      if (value) return true

      return 'Vul 1 of meer cijfers in.'
    },
    value => {
      if (value && value.length >= 1) return true

      return 'Vul minimaal 1 cijfer in.'
    },

    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value > 0) return true

      return 'Moet een positief getal zijn.'
    }
  ],
  newNameRules: [
    value => {
      if (value) return true

      return 'Vul 2 of meer letters in.'
    },
    value => {
      if (value && value.length >= 2) return true

      return 'Vul minimaal 2 letters in.'
    }
  ],
  yearRules: [
    value => {
      if (value && value.length === 4) return true

      return 'Vul 4 cijfers in.'
    },

    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value >= 2023 && value < 2100) return true

      return 'Jaartal moet tussen 2023 en 2100 liggen.'
    }
  ],
  weekRules: [
    value => {
      if (value) return true

      return 'Vul 1 of meer cijfers in.'
    },
    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value >= 0 && value <= 53) return true

      return 'Weeknummer moet tussen 0 (geen actie week) en 53 liggen.'
    }
  ],
  saveSuccess: 0,
  resetCount: 0,
  checkMultipleAssignments: false,
  questionsList: [],
  showQuestions: false
})

function actionSettingsOk() {
  return state.actionYear === '' && state.actionWeek === '' ||
    (!isNaN(state.actionYear) && !isNaN(state.actionWeek) &&
      state.actionYear >= 2023 && state.actionYear < 2100 && state.actionWeek >= 0 && state.actionWeek <= 53)
}

function loadQuizes() {
  // get all available quizzes
  get(child(dbRef, `/quizzes/metaData/`)).then((snapshot) => {
    if (snapshot.exists()) {
      store.metaObject = snapshot.val()
      // note: allQuizNumbers are strings
      state.allQuizNumbers = Object.keys(store.metaObject)
      state.allQuizItems = []
      for (const nr of state.allQuizNumbers) {
        state.allQuizItems.push({ [nr]: store.metaObject[nr] })
      }
    } else {
      console.log("No quizzes available")
    }
  }).catch((error) => {
    console.error('Error while reading all available quizzes from database: ' + error.message)
  })
}

function removeQuizRefs(quizNr) {
  get(child(dbRef, `/quizzes/questions/index/`)).then((snapshot) => {
    if (snapshot.exists()) {
      const indexObject = snapshot.val()
      const indexObjectKeys = Object.keys(indexObject)
      state.resetCount = 0
      indexObjectKeys.forEach((key) => {
        if (indexObject[key].quizNumber == quizNr) {
          // reset to '0' meaning not assigned to a quiz
          indexObject[key].quizNumber = '0'
          state.resetCount++
        }
      })
      // save updated index
      set(ref(db, '/quizzes/questions/index/'), indexObject).then(() => {
      }).catch((error) => {
        console.error('Failed to save the questions index to the database: ' + error.message)
      })
    } else {
      console.log("No quiz-questions available")
    }
  }).catch((error) => {
    console.error('Error while reading all available quiz-question names from database: ' + error.message)
  })
}

function createQuestionsList(quizNr) {
  get(child(dbRef, `/quizzes/questions/index/`)).then((snapshot) => {
    state.questionsList = []
    if (snapshot.exists()) {
      const indexObject = snapshot.val()
      const indexObjectKeys = Object.keys(indexObject)
      indexObjectKeys.forEach((key) => {
        if (indexObject[key].quizNumber == quizNr) {
          state.questionsList.push({ question: key, title: indexObject[key].title })
        }
      })
      state.showQuestions = true
    } else {
      console.log("No quiz-questions available")
    }
  }).catch((error) => {
    console.error('Error while reading all available quiz-question names from database: ' + error.message)
  })
}

function QNumberOk() {
  return !isNaN(state.quizNumberInput) && state.quizNumberInput > 0
}

function QNameOk() {
  return state.quizTitle && state.quizTitle.length >= 2
}

function QNumberExists() {
  return QNumberOk() && state.allQuizNumbers.includes(state.quizNumberInput)
}

function changeMode() {
  state.quizTitle = store.metaObject[state.quizNumberInput].title
  state.actionYear = store.metaObject[state.quizNumberInput].actionYear
  state.actionWeek = store.metaObject[state.quizNumberInput].actionWeek
  state.creationDate = store.metaObject[state.quizNumberInput].creationDate
  state.saveSuccess = 0
  state.resetCount = 0
}

const allowSave = computed(() => {
  if (state.action === '1') return actionSettingsOk() && QNumberOk() && QNameOk() && !QNumberExists()
  if (state.action === '2') return !actionWeekInUse.value && actionSettingsOk() && QNameOk() && QNumberExists()
  if (state.action === '3') return QNumberOk() && QNumberExists()
  return false
})

const saveButtonColor = computed(() => {
  if (state.action === '3') return 'red'
  return ''
})

const saveButtonText = computed(() => {
  if (state.action === '1') return 'Voeg toe'
  if (state.action === '2') return 'Sla op'
  if (state.action === '3') return 'Maak leeg'
  if (state.action === '4') return 'TEST'
  return ''
})

const actionWeekInUse = computed(() => {
  return quizzesAssignedAlready.value.length > 0
})

const quizzesAssignedAlready = computed(() => {
  const sameActionWeekItems = []
  state.allQuizNumbers.forEach(nr => {
    if (nr !== 0 && state.actionWeek != 0 && nr != state.quizNumberInput &&
      store.metaObject[nr].actionYear === state.actionYear && store.metaObject[nr].actionWeek === state.actionWeek) {
      sameActionWeekItems.push({ [nr]: store.metaObject[nr] })
    }
  })
  return sameActionWeekItems
})

function composeLine(item) {
  const nr = Object.keys(item)[0]
  return `${nr}) ${item[nr].title}`
}

function composeQuestionLine(item) {
  return `Vraagnummer: ${item.question} Titel: ${item.title}`
}

function doAction() {
  if (state.action === '1') {
    // note: Using set() overwrites data at the specified location, including any child nodes.
    set(ref(db, '/quizzes/metaData/' + state.quizNumberInput), {
      "title": state.quizTitle,
      "actionYear": state.actionYear,
      "actionWeek": state.actionWeek,
      "creationDate": Number(new Date())
    }).then(() => {
      // refresh overall quiz data
      loadQuizes()
      state.saveSuccess = 1
    }).catch((error) => {
      state.saveSuccess = 2
      console.error('The write failed, error message = ' + error.message)
    })
  }
  if (state.action === '2') {
    const newQuizObject = {
      "title": state.quizTitle,
      "actionYear": state.actionYear,
      "actionWeek": state.actionWeek,
      "creationDate": state.creationDate
    }
    const updates = {}
    updates[`quizzes/metaData/${state.quizNumberInput}`] = newQuizObject
    update(dbRef, updates).then(() => {
      // refresh overall quiz data
      loadQuizes()
      state.saveSuccess = 1
    }).catch((error) => {
      state.saveSuccess = 2
      console.error('The title update failed, error message = ' + error.message)
    })
  }
  if (state.action === '3') {
    // set the action week to 0 (not assigned to an action week)
    const newQuizObject = {
      "title": state.quizTitle,
      "actionYear": state.actionYear,
      "actionWeek": '0',
      "creationDate": state.creationDate
    }
    const updates = {}
    updates[`quizzes/metaData/${state.quizNumberInput}`] = newQuizObject
    update(dbRef, updates).then(() => {
      // remove references to the removed quiz
      removeQuizRefs(state.quizNumberInput)
      // refresh overall quiz data
      loadQuizes()
      state.saveSuccess = 1
    }).catch((error) => {
      state.saveSuccess = 2
      console.error('The title update failed, error message = ' + error.message)
    })
  }
}

watch(() => state.quizNumberInput, () => {
  state.quizTitle = ''
  state.action = '1'
  state.actionYear = ''
  state.actionWeek = ''
})
</script>

<style scoped>
.color-red {
  color: red
}
</style>