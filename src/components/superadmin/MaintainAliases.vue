<template>
  <v-sheet>
    <h2>Schuilnamen onderhouden</h2>
    <v-radio-group inline v-model="state.action">
      <v-radio @change="resetInput" label="Toevoegen" value="newAlias"></v-radio>
      <v-radio @change="resetInput" label="Veranderen" value="replaceAlias"></v-radio>
      <v-radio @change="resetInput" label="Verwijderen" value="removeAlias"></v-radio>
      <v-radio @change="resetInput" label="Info toevoegen/onderhouden" value="celebrityInfo"></v-radio>
    </v-radio-group>

    <v-row>
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-if="state.action === 'newAlias'" v-model="state.newAlias" :label="textFieldLabel" :rules="state.nameRules" />
        <v-autocomplete v-else v-model="state.selectedAlias" :items="state.allAliases" :label="textFieldLabel" />
        <v-switch v-if="state.action === 'celebrityInfo'" :disabled="!selectedAliasOk" label="Historisch figuur" v-model="state.isCelebrity"></v-switch>
      </v-col>
      <v-col cols="3"></v-col>
    </v-row>
    <v-row v-if="state.action === 'replaceAlias' && aliasExists(state.selectedAlias) && !isAliasInUse(state.selectedAlias)">
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-model.trim="state.replaceAlias" label="Nieuwe schuilnaam" :rules="state.newNameRules" />
      </v-col>
      <v-col cols="3"></v-col>
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
      <v-col v-if="state.saveSuccess === 1"> {{ cuccessText }} is gelukt </v-col>
      <v-col v-if="!state.saveSuccess === 2"> {{ cuccessText }} is mislukt </v-col>
      <v-col class="text-right">
        <v-btn :disabled="!allowSave" :color="saveButtonColor" append-icon="mdi-arrow-right" @click="doSave">
          {{ saveButtonText }}
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="showEditInfo()" class="d-flex align-center justify-center">
      <h2>Onderhoud schuilnaam info</h2>
      <v-sheet>
        <QuillEditor v-model:content="state.aliasInfoContent" contentType="html"></QuillEditor>
      </v-sheet>
      <v-row justify="space-around">
        <v-col cols="6" md="4">
          <p>Preview 414 x 896 px</p>
          <v-sheet class="pa-2" color="grey-lighten-3" height="896" width="414">
            <v-row no-gutters>
              <div v-html="state.aliasInfoContent"></div>
            </v-row>
          </v-sheet>
        </v-col>
        <v-col cols="6" md="4">
          <p>Preview 375 x 812 px</p>
          <v-sheet class="pa-2" color="grey-lighten-3" height="812" width="375">
            <v-row no-gutters>
              <div v-html="state.aliasInfoContent"></div>
            </v-row>
          </v-sheet>
        </v-col>
      </v-row>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { onBeforeMount, reactive, computed, watch } from 'vue'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, update } from 'firebase/database'

const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  resetAndLoadAliases()
})

const state = reactive({
  aliasesObj: {},
  allAliases: [],
  action: 'newAlias',
  newAlias: '',
  selectedAlias: null,
  isCelebrity: false,
  replaceAlias: '',
  nameRules: [
    (value) => {
      if (value) return true

      return 'Vul 2 of meer letters in.'
    },
    (value) => {
      if (value && value.length >= 2) return true

      return 'Vul minimaal 2 letters in.'
    },
    (value) => {
      if (isAliasInUse(value)) {
        return 'Deze schuilnaam is in gebruik'
      }
      return true
    },
    (value) => {
      if (aliasExists(value)) {
        return 'Deze schuilnaam bestaat al'
      }
      return true
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
    (value) => {
      if (isAliasInUse(value)) {
        return 'Deze schuilnaam is in gebruik'
      }
      return true
    },
    (value) => {
      if (aliasExists(value)) {
        return 'Deze schuilnaam bestaat al'
      }
      return true
    },
  ],
  saveSuccess: 0,
  aliasInfoContent: '',
})

function resetAndLoadAliases() {
  resetInput()
  // get all available aliases
  get(child(dbRef, `/aliases/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.aliasesObj = snapshot.val()
        state.allAliases = Object.keys(state.aliasesObj)
      } else {
        console.log('No aliases data available')
      }
    })
    .catch((error) => {
      console.error(`Error while reading all available aliases from database: ${error.message}`)
    })
}

// extract the aliases in use
const aliasesInUse = computed(() => {
  return state.allAliases.filter((a) => state.aliasesObj[a] && state.aliasesObj[a].inUse)
})

const textFieldLabel = computed(() => {
  if (state.action === 'newAlias') return 'Nieuwe schuilnaam'
  if (state.action === 'replaceAlias') return 'Te veranderen schuilnaam'
  if (state.action === 'removeAlias') return 'Te verwijderen schuilnaam'
  if (state.action === 'celebrityInfo') return 'Schuilnaam waaraan info toe te voegen/te veranderen'
  return ''
})

const saveButtonText = computed(() => {
  if (state.action === 'newAlias') return 'Voeg toe'
  if (state.action === 'replaceAlias') return 'Verander'
  if (state.action === 'removeAlias') return 'Verwijder'
  if (state.action === 'celebrityInfo') return 'Sla info op'
  return ''
})

const cuccessText = computed(() => {
  if (state.action === 'newAlias') return 'Toevoegen'
  if (state.action === 'replaceAlias') return 'Veranderen'
  if (state.action === 'removeAlias') return 'Verwijderen'
  if (state.action === 'celebrityInfo') return 'Opslaan'
  return ''
})

const saveButtonColor = computed(() => {
  if (state.action === 'removeAlias') return 'red'
  return ''
})

const selectedAliasOk = computed(() => {
  if (!state.selectedAlias || state.selectedAlias.length < 2) return false
  return true
})

const newAliasOk = computed(() => {
  if (!state.newAlias || state.newAlias.length < 2 || state.newAlias === 'admin' || state.newAlias === 'system') return false
  return true
})

const replaceAliasOk = computed(() => {
  if (!state.replaceAlias || state.replaceAlias.length < 2 || state.replaceAlias === 'admin' || state.replaceAlias === 'system') return false
  return true
})

const allowSave = computed(() => {
  if (state.action === 'newAlias') return newAliasOk.value && !aliasExists(state.newAlias) && !isAliasInUse(state.newAlias)
  if (state.action === 'replaceAlias')
    return selectedAliasOk.value && replaceAliasOk.value && !aliasExists(state.replaceAlias) && !isAliasInUse(state.replaceAlias)
  if (state.action === 'removeAlias') return selectedAliasOk.value && aliasExists(state.selectedAlias) && !isAliasInUse(state.selectedAlias)
  if (state.action === 'celebrityInfo') return selectedAliasOk.value && aliasExists(state.selectedAlias)
  return false
})

function isAliasInUse(alias) {
  return aliasesInUse.value.includes(alias)
}

function aliasExists(alias) {
  return state.allAliases.includes(alias)
}

function showEditInfo() {
  return state.action === 'celebrityInfo' && aliasExists(state.selectedAlias) && state.isCelebrity
}

function saveAliasEntry() {
  if (state.action === 'newAlias') {
    // note: Using set() overwrites data at the specified location, including any child nodes.
    set(ref(db, '/aliases/' + state.newAlias), {
      celebrity: false,
      inUse: false,
    })
      .then(() => {
        // refresh data from previous changes
        resetAndLoadAliases()
        state.saveSuccess = 1
      })
      .catch((error) => {
        state.saveSuccess = 2
        console.error(`The alias addition failed: ${error.message}`)
      })
  }
  if (state.action === 'replaceAlias') {
    const updates = {}
    // remove old
    updates[`/aliases/${state.selectedAlias}`] = null
    if (state.isCelebrity) {
      updates[`/aliasInfo/${state.selectedAlias}`] = null
    }
    // create new
    updates[`/aliases/${state.replaceAlias}`] = state.aliasesObj[state.selectedAlias]
    if (state.isCelebrity) {
      updates[`/aliasInfo/${state.replaceAlias}`] = state.aliasInfoContent
    }
    update(dbRef, updates)
      .then(() => {
        // refresh data from previous changes
        resetAndLoadAliases()
        state.saveSuccess = 1
      })
      .catch((error) => {
        state.saveSuccess = 2
        console.error(`The replace failed: ${error.message}`)
      })
  }
  if (state.action === 'removeAlias') {
    const updates = {}
    updates[`/aliases/${state.selectedAlias}`] = null
    if (state.isCelebrity) {
      updates[`/aliasInfo/${state.selectedAlias}`] = null
    }
    update(dbRef, updates)
      .then(() => {
        // refresh data from previous changes
        resetAndLoadAliases()
        state.saveSuccess = 1
      })
      .catch((error) => {
        state.saveSuccess = 2
        console.error(`The remove failed: ${error.message}`)
      })
  }
}

function saveAliasInfo() {
  // update the info data the selected alias
  const updates = {}
  updates[`/aliases/${state.selectedAlias}/celebrity`] = state.isCelebrity
  if (state.isCelebrity) {
    updates[`/aliasInfo/${state.selectedAlias}`] = state.aliasInfoContent
  } else updates[`/aliasInfo/${state.selectedAlias}`] = null
  update(dbRef, updates)
    .then(() => {
      resetInput()
      state.saveSuccess = 1
    })
    .catch((error) => {
      state.saveSuccess = 2
      console.error('The write failed, error message = ' + error.message)
    })
}

function doSave() {
  if (state.action === 'newAlias') saveAliasEntry()
  if (state.action === 'replaceAlias') saveAliasEntry()
  if (state.action === 'removeAlias') saveAliasEntry()
  if (state.action === 'celebrityInfo') saveAliasInfo()
}

// reset the user input when changing action
function resetInput() {
  state.newAlias = ''
  state.selectedAlias = null
  state.replaceAlias = ''
  state.isCelebrity = false
  state.saveSuccess = 0
  state.aliasInfoContent = ''
}

/* Get alias info if the alias is a celebrity */
watch(
  () => state.selectedAlias,
  () => {
    // check for null when backspacing
    if (state.selectedAlias === null) return
    // clear data from previous action
    state.saveSuccess = 0
    state.aliasInfoContent = ''
    // check for celebrity info
    state.isCelebrity = (state.aliasesObj[state.selectedAlias] && state.aliasesObj[state.selectedAlias].celebrity) || false
    if (state.isCelebrity) {
      get(child(dbRef, `/aliasInfo/${state.selectedAlias}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            state.aliasInfoContent = snapshot.val()
          } else {
            // no info found
            state.isCelebrity = false
          }
        })
        .catch((error) => {
          console.error(`Error while reading alias info of ${state.selectedAlias} from database: ${error.message}`)
        })
    }
  },
)
</script>
