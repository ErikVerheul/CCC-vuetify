<template>
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
              <v-radio @change="changeMode" label="Verwijderen" value="3"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="3"></v-col>

          <v-col cols="3"></v-col>
          <v-col cols="6">
            <v-text-field v-if="state.action === '2'" v-model.trim="state.quizTitle" label="Verander quiz naam" :rules="state.newNameRules" />
            <p v-if="state.action === '3'">Te verwijderen quiz naam: {{ state.quizTitle }}</p>
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
      <v-col class="text-right">
        <v-btn :disabled="!allowSave" :color="saveButtonColor" append-icon="mdi-arrow-right" @click="doSaveRemove">
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
</template>

<script setup>
import { onBeforeMount, computed, reactive, watch } from 'vue'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, remove, update } from 'firebase/database'

const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadQuizes()
})

const state = reactive({
  quizesObject: {},
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
      if (value > 0 && value <= 53) return true

      return 'Weeknummer moet tussen 1 en 53 liggen.'
    }
  ],
  saveSuccess: 0,
  resetCount: 0
})

function actionSettingsOk() {
  return state.actionYear === '' && state.actionWeek === '' ||
    (!isNaN(state.actionYear) && !isNaN(state.actionWeek) &&
      state.actionYear >= 2023 && state.actionYear < 2100 && state.actionWeek > 0 && state.actionWeek <= 53)
}

function loadQuizes() {
  // get all available quizzes
  get(child(dbRef, `/quizzes/metaData/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.quizesObject = snapshot.val()
      state.allQuizNumbers = Object.keys(state.quizesObject)
      state.allQuizItems = []
      for (const nr of state.allQuizNumbers) {
        state.allQuizItems.push({ [nr]: state.quizesObject[nr] })
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
      const allQuestionKeys = Object.keys(indexObject)
      state.resetCount = 0
      for (const key of allQuestionKeys) {
        if (indexObject[key].quizNumber == quizNr) {
          // reset to '0' meaning not assigned to a quiz
          indexObject[key].quizNumber = '0'
          state.resetCount++
        }
      }
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

function QNumberOk() {
  return !isNaN(state.quizNumberInput) && state.quizNumberInput > 0
}

function QNameOk() {
  return state.quizTitle && state.quizTitle && state.quizTitle.length >= 2
}

function QNumberExists() {
  return QNumberOk() && state.allQuizNumbers.includes(state.quizNumberInput)
}

function changeMode() {
  state.quizTitle = state.quizesObject[state.quizNumberInput].title
  state.actionYear = state.quizesObject[state.quizNumberInput].actionYear
  state.actionWeek = state.quizesObject[state.quizNumberInput].actionWeek
  state.creationDate = state.quizesObject[state.quizNumberInput].creationDate
  state.saveSuccess = 0
  state.resetCount = 0
}

const allowSave = computed(() => {
  if (state.action === '1') return actionSettingsOk() && QNumberOk() && QNameOk() && !QNumberExists()
  if (state.action === '2') return actionSettingsOk() && QNameOk() && QNumberExists()
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
  if (state.action === '3') return 'Verwijder'
  return ''
})

function composeLine(item) {
  const nr = Object.keys(item)[0]
  return `${nr}) ${item[nr].title}`
}

function doSaveRemove() {
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
    remove(child(dbRef, '/quizzes/metaData/' + state.quizNumberInput)).then(() => {
      // remove references to the removed quiz
      removeQuizRefs(state.quizNumberInput)
      // refresh overall quiz data
      loadQuizes()
      state.saveSuccess = 1
    }).catch((error) => {
      state.saveSuccess = 2
      console.error('The remove failed, error message = ' + error.message)
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