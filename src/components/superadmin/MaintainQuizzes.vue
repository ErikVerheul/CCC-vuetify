<template>
  <v-card>
    <v-card-title class="text-center">Quiz data onderhouden</v-card-title>
    <v-row>
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-if="editNew" v-model="state.newQuizNumberInput" label="Nieuw quiz nummer" :rules="state.newNumberRules" />
        <v-autocomplete v-if="editExisting" v-model="state.quizNumberInput" item-value="key" :items="state.allQuizItems" label="Te veranderen quiz" />
      </v-col>
      <v-col cols="3"></v-col>
    </v-row>
    <template v-if="state.newQuizNumberInput">
      <v-row>
        <v-col cols="3"></v-col>
        <v-col cols="6">
          <v-text-field v-model.trim="state.quizTitle" label="Nieuwe quiz naam" :rules="state.newNameRules" />
        </v-col>
        <v-col cols="3"></v-col>
      </v-row>
    </template>
    <template v-if="state.quizNumberInput">
      <v-row>
        <v-col cols="3"></v-col>
        <v-col cols="6">
          <v-radio-group inline v-model="state.action">
            <v-radio :disabled="state.quizNumberInput === '0'" @change="startChangeMode" label="Veranderen" value="2"></v-radio>
            <v-radio :disabled="state.quizNumberInput === '0'" @change="startChangeMode" label="Maak quiz leeg" value="3"></v-radio>
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
    <v-row v-if="state.newQuizNumberInput">
      <v-col cols="6">
        <v-text-field v-model="state.actionYear" label="Actie jaar" :rules="state.yearRules" />
      </v-col>
      <v-col cols="6">
        <v-text-field v-model="state.actionWeek" label="Actie week" :rules="state.weekRules" />
      </v-col>
    </v-row>
    <v-row v-if="!(editExisting && editNew) && state.action">
      <v-col cols="12">
        <h2>Toelichting op het thema van deze quiz</h2>
        <QuillEditor v-model:content="state.theme" contentType="html"></QuillEditor>
      </v-col>
    </v-row>
    <v-divider class="mb-5"></v-divider>
    <v-row v-if="state.resetCount > 0">
      <v-col cols="12">
        <h4>{{ state.resetCount }} referenties naar deze quiz in de quiz vragen zijn verwijderd.</h4>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="5" class="text-left">
        <v-btn v-if="state.action" @click="doCancel">Cancel</v-btn>
      </v-col>
      <v-col cols="4" v-if="state.successText">"{{ state.successText }}"</v-col>
      <v-col v-else cols="4"></v-col>
      <v-col cols="3" v-if="state.action && state.action != '4'" class="text-right">
        <v-btn :disabled="!allowSave" :color="saveButtonColor" @click="doAction">
          {{ saveButtonText }}
        </v-btn>
      </v-col>
    </v-row>
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
      <v-dialog v-model="state.listQuestions" width="70%">
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
            <v-btn color="purple" block @click="state.listQuestions = false">Sluit</v-btn>
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

const emptyQuillValue = '<p><br></p>'

onBeforeMount(() => {
  resetAndloadQuizes()
})

const state = reactive({
  allQuizNumbers: [],
  allQuizItems: [],
  newQuizNumberInput: undefined,
  quizNumberInput: null,
  action: undefined,
  quizTitle: '',
  actionYear: undefined,
  actionWeek: undefined,
  creationDate: undefined,
  theme: emptyQuillValue,
  newNumberRules: [
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

      return 'Moet 0 of een positief getal zijn.'
    },
    (value) => {
      if (!QNumberExists(value)) return true

      return 'Dit quiz nummer is al in gebruik'
    },
  ],
  newNameRules: [
    (value) => {
      if (value) return true

      return 'Vul 2 of meer letters in.'
    },
    (value) => {
      if (value && value.length >= 2) return true

      return 'Vul minimaal 2 letters in.'
    },
  ],
  yearRules: [
    (value) => {
      if (value && value.length === 4) return true

      return 'Vul 4 cijfers in.'
    },

    (value) => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    (value) => {
      if (value >= 2023 && value < 2100) return true

      return 'Jaartal moet tussen 2023 en 2100 liggen.'
    },
  ],
  weekRules: [
    (value) => {
      if (value) return true

      return 'Vul 1 of meer cijfers in.'
    },
    (value) => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    (value) => {
      if (value >= 0 && value <= 53) return true

      return 'Weeknummer moet tussen 0 (geen actie week) en 53 liggen.'
    },
  ],
  resetCount: 0,
  checkMultipleAssignments: false,
  questionsList: [],
  listQuestions: false,
  successText: undefined,
})

const editExisting = computed(() => {
  return (state.newQuizNumberInput === '' && state.quizNumberInput === null) || (state.quizNumberInput !== null && state.newQuizNumberInput === '')
})

const editNew = computed(() => {
  return (state.newQuizNumberInput === '' && state.quizNumberInput === null) || (state.newQuizNumberInput !== '' && state.quizNumberInput === null)
})

function actionSettingsOk() {
  return (
    state.actionYear &&
    state.actionWeek &&
    !isNaN(state.actionYear) &&
    !isNaN(state.actionWeek) &&
    state.actionYear >= 2023 &&
    state.actionYear < 2100 &&
    state.actionWeek >= 0 &&
    state.actionWeek <= 53
  )
}

function resetAndloadQuizes() {
  // reset input
  state.newQuizNumberInput = ''
  state.quizNumberInput = null
  state.action = undefined
  state.quizTitle = ''
  state.actionYear = undefined
  state.actionWeek = undefined
  state.creationDate = undefined
  state.theme = emptyQuillValue
  // get all available quizzes
  get(child(dbRef, `/quizzes/metaData/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        store.metaObject = snapshot.val()
        // note: allQuizNumbers are strings
        state.allQuizNumbers = Object.keys(store.metaObject)
        state.allQuizItems = []
        for (const nr of state.allQuizNumbers) {
          state.allQuizItems.push({ key: nr, title: `${nr}) ${store.metaObject[nr].title}` })
        }
      } else {
        console.log('No quizzes available')
      }
    })
    .catch((error) => {
      console.error('Error while reading all available quizzes from database: ' + error.message)
    })
}

function removeQuizRefs(quizNr) {
  get(child(dbRef, `/quizzes/questions/index/`))
    .then((snapshot) => {
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
        set(ref(db, '/quizzes/questions/index/'), indexObject)
          .then(() => {})
          .catch((error) => {
            console.error('Failed to save the questions index to the database: ' + error.message)
          })
      } else {
        console.log('No quiz-questions available')
      }
    })
    .catch((error) => {
      console.error('Error while reading all available quiz-question names from database: ' + error.message)
    })
}

function createQuestionsList(quizNr) {
  get(child(dbRef, `/quizzes/questions/index/`))
    .then((snapshot) => {
      state.questionsList = []
      if (snapshot.exists()) {
        const indexObject = snapshot.val()
        const indexObjectKeys = Object.keys(indexObject)
        indexObjectKeys.forEach((key) => {
          if (indexObject[key].quizNumber == quizNr) {
            state.questionsList.push({ question: key, title: indexObject[key].title })
          }
        })
        state.listQuestions = true
      } else {
        console.log('No quiz-questions available')
      }
    })
    .catch((error) => {
      console.error('Error while reading all available quiz-question names from database: ' + error.message)
    })
}

function QNumberOk(number) {
  return !isNaN(number) && number >= 0
}

function QNameOk() {
  return state.quizTitle && state.quizTitle.length >= 2
}

function QNumberExists(number) {
  return QNumberOk(number) && state.allQuizNumbers.includes(number)
}

function startChangeMode() {
  // set the meta data
  state.quizTitle = store.metaObject[state.quizNumberInput].title
  state.actionYear = store.metaObject[state.quizNumberInput].actionYear
  state.actionWeek = store.metaObject[state.quizNumberInput].actionWeek
  state.creationDate = store.metaObject[state.quizNumberInput].creationDate
  // get the theme description
  get(child(dbRef, `/quizzes/themes/${state.quizNumberInput}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.theme = snapshot.val()
      } else {
        state.theme = emptyQuillValue
      }
    })
    .catch((warn) => {
      state.theme = emptyQuillValue
      console.log('Thema beschrijving niet gevonden; default is gezet: ' + warn.message)
    })
  state.listQuestions = false
  state.successText = undefined
  state.resetCount = 0
}

const allowSave = computed(() => {
  if (state.action === '1') return actionSettingsOk() && QNameOk() && !QNumberExists(state.newQuizNumberInput)
  if (state.action === '2') return !actionWeekInUse.value && actionSettingsOk() && QNameOk() && QNumberExists(state.quizNumberInput)
  if (state.action === '3') return QNumberOk(state.quizNumberInput) && QNumberExists(state.quizNumberInput)
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
  if (state.action === '4') return 'Toon vragen'
  return ''
})

function createSuccessOrFailText(val) {
  if (saveButtonText.value === '') {
    state.successText = undefined
  } else if (val) {
    state.successText = saveButtonText.value + ' is gelukt'
  } else if (!val) {
    state.successText = saveButtonText.value + ' is mislukt'
  } else state.successText = undefined
}

const actionWeekInUse = computed(() => {
  return quizzesAssignedAlready.value.length > 0
})

const quizzesAssignedAlready = computed(() => {
  const sameActionWeekItems = []
  state.allQuizNumbers.forEach((nr) => {
    if (
      nr !== 0 &&
      state.actionWeek != 0 &&
      nr != state.quizNumberInput &&
      store.metaObject[nr].actionYear === state.actionYear &&
      store.metaObject[nr].actionWeek === state.actionWeek
    ) {
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

function doCancel() {
  // refresh overall quiz data
  state.successText = undefined
  resetAndloadQuizes()
}

function doAction() {
  if (state.action === '1') {
    // create new; warning: Using set() overwrites data at the specified location, including any child nodes.
    set(ref(db, '/quizzes/metaData/' + state.newQuizNumberInput), {
      title: state.quizTitle,
      actionYear: state.actionYear,
      actionWeek: state.actionWeek,
      creationDate: Number(new Date()),
    })
      .then(() => {
        // save the theme description
        set(ref(db, '/quizzes/themes/' + state.newQuizNumberInput), state.theme)
          .then(() => {
            createSuccessOrFailText(true)
            // refresh overall quiz data
            resetAndloadQuizes()
          })
          .catch((error) => {
            createSuccessOrFailText(false)
            console.error('Saving the theme description failed, error message = ' + error.message)
          })
      })
      .catch((error) => {
        createSuccessOrFailText(false)
        console.error('Saving the quiz meta data failed, error message = ' + error.message)
      })
  }
  if (state.action === '2') {
    // update existing
    const newQuizObject = {
      title: state.quizTitle,
      actionYear: state.actionYear,
      actionWeek: state.actionWeek,
      creationDate: state.creationDate,
    }
    const updates = {}
    updates[`quizzes/metaData/${state.quizNumberInput}`] = newQuizObject
    updates[`quizzes/themes/${state.quizNumberInput}`] = state.theme
    update(dbRef, updates)
      .then(() => {
        createSuccessOrFailText(true)
        // refresh overall quiz data
        resetAndloadQuizes()
      })
      .catch((error) => {
        createSuccessOrFailText(false)
        console.error('The quiz update failed, error message = ' + error.message)
      })
  }
  if (state.action === '3') {
    // set the action week to 0 (not assigned to an action week)
    const newQuizObject = {
      title: state.quizTitle,
      actionYear: state.actionYear,
      actionWeek: '0',
      creationDate: state.creationDate,
    }
    const updates = {}
    updates[`quizzes/metaData/${state.quizNumberInput}`] = newQuizObject
    update(dbRef, updates)
      .then(() => {
        // remove references to the removed quiz
        removeQuizRefs(state.quizNumberInput)
        createSuccessOrFailText(true)
        // refresh overall quiz data
        resetAndloadQuizes()
      })
      .catch((error) => {
        createSuccessOrFailText(false)
        console.error('The quix update failed, error message = ' + error.message)
      })
  }
}

watch(
  () => state.quizNumberInput,
  () => {
    state.action = undefined
    if (state.quizNumberInput === null) resetAndloadQuizes()
  },
)

watch(
  () => state.newQuizNumberInput,
  () => {
    state.action = '1'
  },
)
</script>

<style scoped>
.color-red {
  color: red;
}
</style>
