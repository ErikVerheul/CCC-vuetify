<template>
  <v-sheet>
    <h2>Schuilnamen onderhouden</h2>
    <v-radio-group inline v-model="state.action">
      <v-radio @change="resetInput" label="Toevoegen" value="newAlias"></v-radio>
      <v-radio @change="resetInput" label="Veranderen" value="replaceAlias"></v-radio>
      <v-radio @change="resetInput" label="Verwijderen" value="removeAlias"></v-radio>
      <v-radio @change="resetInput" label="Info toevoegen/onderhouden" value="celebrity"></v-radio>
    </v-radio-group>

    <v-row>
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-if="state.action === 'newAlias'" v-model="state.newAlias" :label="textFieldLabel" :rules="state.nameRules" />
        <v-autocomplete v-else v-model="state.selectedAlias" :items="state.allAliases" :label="textFieldLabel" />
        <v-switch v-if="state.action === 'celebrity'" label="Historisch figuur" v-model="state.isCelebrity"></v-switch>
      </v-col>
      <v-col cols="3"></v-col>
    </v-row>
    <v-row
      v-if="state.action === 'replaceAlias' && isValidAlias(state.selectedAlias) && aliasExists(state.selectedAlias) && !isAliasInUse(state.selectedAlias)">
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
      <v-col v-if="state.saveSuccess === 1">
        "{{ saveButtonText }}" is gelukt
      </v-col>
      <v-col v-if="!state.saveSuccess === 2">
        "{{ saveButtonText }}" is mislukt
      </v-col>
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
        <quill-editor v-model:value="state.aliasInfoContent"></quill-editor>
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
import { ref, child, get, set, update, remove } from 'firebase/database'

const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadAliasNames()
})

const state = reactive({
  allAliases: [],
  aliasesInUse: [],
  action: "newAlias",
  newAlias: '',
  selectedAlias: '',
  isCelebrity: false,
  replaceAlias: '',
  nameRules: [
    value => {
      if (value) return true

      return 'Vul 2 of meer letters in.'
    },
    value => {
      if (value && value.length >= 2) return true

      return 'Vul minimaal 2 letters in.'
    },
    value => {
      if (isAliasInUse(value)) {
        return 'Deze schuilnaam is in gebruik'
      }
      return true
    },
    value => {
      if (aliasExists(value)) {
        return 'Deze schuilnaam bestaat al'
      }
      return true
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
    },
    value => {
      if (isAliasInUse(value)) {
        return 'Deze schuilnaam is in gebruik'
      }
      return true
    },
    value => {
      if (aliasExists(value)) {
        return 'Deze schuilnaam bestaat al'
      }
      return true
    }
  ],
  saveSuccess: 0,
  aliasInfoContent: ''
})

function loadAliasNames() {
  // get all available alias names
  get(child(dbRef, `/aliases/`)).then((snapshot) => {
    if (snapshot.exists()) {
      const aliasObject = snapshot.val()
      state.allAliases = Object.keys(aliasObject)
      // extract the aliases in use
      state.aliasesInUse = state.allAliases.filter(a => aliasObject[a].inUse)
    } else {
      console.log("No aliases data available")
    }
  }).catch((error) => {
    console.error('While reading all available aliases from database: error message = ' + error.message)
  })
}

function isValidAlias(alias) {
  return alias && alias.length > 1
}

function isAliasInUse(alias) {
  for (const el of state.aliasesInUse) {
    if (el.toUpperCase() === alias.toUpperCase()) {
      return true
    }
  }
  return false
}

function aliasExists(alias) {
  for (const el of state.allAliases) {
    if (el.toUpperCase() === alias.toUpperCase()) {
      return true
    }
  }
  return false
}

function showEditInfo() {
  return state.action === 'celebrity' && isValidAlias(state.selectedAlias) && aliasExists(state.selectedAlias) && state.isCelebrity
}

const textFieldLabel = computed(() => {
  if (state.action === 'newAlias') return 'Nieuwe schuilnaam'
  if (state.action === 'replaceAlias') return 'Te veranderen schuilnaam'
  if (state.action === 'removeAlias') return 'Te verwijderen schuilnaam'
  if (state.action === 'celebrity') return 'Schuilnaam waaraan info toe te voegen/te veranderen'
  return ''
})

const saveButtonText = computed(() => {
  if (state.action === 'newAlias') return 'Voeg toe'
  if (state.action === 'replaceAlias') return 'Sla op'
  if (state.action === 'removeAlias') return 'Verwijder'
  if (state.action === 'celebrity') return 'Sla info op'
  return ''
})

const saveButtonColor = computed(() => {
  if (state.action === 'removeAlias') return 'red'
  return ''
})

const newAliasOk = computed(() => {
  if (state.newAlias && state.newAlias.length < 2 || state.newAlias.toUpperCase() === 'ADMIN' || state.newAlias.toUpperCase() === 'SYSTEM') return false
  return true
})

const replaceAliasOk = computed(() => {
  if (state.replaceAlias && state.replaceAlias.length < 2 || state.replaceAlias.toUpperCase() === 'ADMIN' || state.replaceAlias.toUpperCase() === 'SYSTEM') return false
  return true
})

const allowSave = computed(() => {
  if (state.action === 'newAlias') return newAliasOk.value && !aliasExists(state.newAlias) && !isAliasInUse(state.newAlias)
  if (state.action === 'replaceAlias') return replaceAliasOk.value && !aliasExists(state.replaceAlias) && !isAliasInUse(state.replaceAlias)
  if (state.action === 'removeAlias') return isValidAlias(state.selectedAlias) && aliasExists(state.selectedAlias) && !isAliasInUse(state.selectedAlias)
  if (state.action === 'celebrity') return isValidAlias(state.selectedAlias) && aliasExists(state.selectedAlias)
  return false
})

function saveAliasEntry() {
  if (state.action === 'newAlias') {
    // note: Using set() overwrites data at the specified location, including any child nodes.
    set(ref(db, '/aliases/' + state.newAlias), {
      "celebrity": state.isCelebrity
    })
    state.saveSuccess = 1
    // add the alias to the local array
    state.allAliases.push(state.newAlias)
  }
  if (state.action === 'replaceAlias') {
    // get the data of the alias
    get(child(dbRef, `/aliases/` + state.selectedAlias)).then((snapshot) => {
      if (snapshot.exists()) {
        // remove the alias from the database
        remove(child(dbRef, '/aliases/' + state.selectedAlias)).then(() => {
          // remove the alias from the local array
          state.allAliases = state.allAliases.filter(a => a !== state.selectedAlias)
          // add the changed alias to the database
          let aliasObj = snapshot.val()
          // update the celebrity prop
          if (state.isCelebrity) aliasObj[state.replaceAlias].celebrity = state.isCelebrity
          set(ref(db, '/aliases/' + state.replaceAlias), aliasObj)
          state.saveSuccess = 1
          // add the alias to the local array
          state.allAliases.push(state.replaceAlias)
        }).catch((error) => {
          state.saveSuccess = 2
          console.error('The remove failed, error message = ' + error.message)
        })
      } else {
        console.error('Cannot read the alias data')
        state.saveSuccess = 2
      }
    }).catch((error) => {
      state.saveSuccess = 2
      console.error('Cannot read the alias data, error message = ' + error.message)
    })
  }
  if (state.action === 'removeAlias') {
    remove(child(dbRef, '/aliases/' + state.selectedAlias)).then(() => {
      // remove the alias from the local array
      state.allAliases = state.allAliases.filter(a => a !== state.selectedAlias)
      state.saveSuccess = 1
    }).catch((error) => {
      state.saveSuccess = 2
      console.error('The remove failed, error message = ' + error.message)
    })
  }
}

function saveAliasInfo() {
  // update the info data the selected alias
  const updates = {}
  updates[`/aliases/${state.selectedAlias}/info`] = state.aliasInfoContent
  updates[`/aliases/${state.selectedAlias}/celebrity`] = state.isCelebrity
  update(dbRef, updates).then(() => {
    state.saveSuccess = 1
  }).catch((error) => {
    state.saveSuccess = 2
    console.error('The write failed, error message = ' + error.message)
  })
}

function doSave() {
  if (state.action === 'newAlias') saveAliasEntry()
  if (state.action === 'replaceAlias') saveAliasEntry()
  if (state.action === 'removeAlias') saveAliasEntry()
  if (state.action === 'celebrity') saveAliasInfo()
}

// reset the user input when changing action
function resetInput() {
  state.newAlias = ''
  state.selectedAlias = ''
  state.replaceAlias = ''
  state.isCelebrity = false
  state.saveSuccess = 0
  state.aliasInfoContent = ''
}

watch(() => state.selectedAlias, () => {
  // prevent null when backspacing
  if (state.selectedAlias === null) state.selectedAlias = ''
  // undo the saveSuccess message
  state.saveSuccess = 0
  // check for celebrity info
  if (isValidAlias(state.selectedAlias)) {
    // initialize the content
    get(child(dbRef, `/aliases/${state.selectedAlias}`)).then((snapshot) => {
      if (snapshot.exists()) {
        state.isCelebrity = snapshot.val().celebrity
        state.aliasInfoContent = snapshot.val().info
      } else state.isCelebrity = false
    }).catch((error) => {
      console.error('While reading all available aliases from database: error message = ' + error.message)
    })
  }
})

</script>