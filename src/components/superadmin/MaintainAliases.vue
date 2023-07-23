<template>
  <v-card variant="tonal">
    <v-card-title>Schuilnamen onderhouden</v-card-title>
    <v-radio-group inline v-model="state.action">
      <v-radio @change="resetInput" label="Toevoegen" value="1"></v-radio>
      <v-radio @change="resetInput" label="Veranderen" value="2"></v-radio>
      <v-radio @change="resetInput" label="Verwijderen" value="3"></v-radio>
      <v-radio @change="resetInput" label="Info toevoegen/onderhouden" value="4"></v-radio>
    </v-radio-group>

    <v-row>
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-model="state.userAliasInput" :label="textFieldLabel" :rules="state.nameRules" />
      </v-col>
      <v-col cols="3"></v-col>
    </v-row>
    <v-row v-if="state.action === '2' && aliasExists(state.userAliasInput) && !isAliasInUse(state.userAliasInput)">
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-model.trim="state.userNewAliasInput" label="Nieuwe schuilnaam" :rules="state.newNameRules" />
      </v-col>
      <v-col cols="3"></v-col>
    </v-row>
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
  </v-card>
</template>

<script setup>
import { onBeforeMount, reactive, computed, watch } from 'vue'
import { db, dbRef } from '../../firebase'
import { ref, child, get, set, update, remove } from 'firebase/database'

const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadAliasData()
})

const state = reactive({
  allAliases: [],
  aliasesInUse: [],
  action: "1",
  userAliasInput: '',
  userNewAliasInput: '',
  nameRules: [
    value => {
      if (value) return true

      return 'Vul 2 of meer letters in.'
    },
    value => {
      if (value.length >= 2) return true

      return 'Vul minimaal 2 letters in.'
    },
    value => {
      if ((state.action === '2' || state.action === '3') && isAliasInUse(value)) {
        return 'Deze schuilnaam is in gebruik'
      }
      return true
    },
    value => {
      if ((state.action === '1') && aliasExists(value)) {
        return 'Deze schuilnaam bestaat al'
      }
      return true
    },
    value => {
      if ((state.action === '4') && !aliasExists(value)) {
        return 'Deze schuilnaam bestaat niet'
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
      if (value.length >= 2) return true

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

function loadAliasData() {
  // get all available aliases
  get(child(dbRef, `/aliases/`)).then((snapshot) => {
    if (snapshot.exists()) {
      const aliasObject = snapshot.val()
      state.allAliases = Object.keys(aliasObject)
      // extract the aliases in use
      state.aliasesInUse = []
      state.allAliases.forEach(el => {
        if (aliasObject[el].inUse) state.aliasesInUse.push(el)
      })
    } else {
      console.log("No aliases data available")
    }
  }).catch((error) => {
    console.error('While reading all available aliases from database: error message = ' + error.message)
  })
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
  return state.action === '4' && userAliasInputOk.value && aliasExists(state.userAliasInput)
}

const textFieldLabel = computed(() => {
  if (state.action === '1') return 'Nieuwe schuilnaam'
  if (state.action === '2') return 'Te veranderen schuilnaam'
  if (state.action === '3') return 'Te verwijderen schuilnaam'
  if (state.action === '4') return 'Schuilnaam waaraan info toe te voegen/te veranderen'
  return ''
})

const saveButtonText = computed(() => {
  if (state.action === '1') return 'Voeg toe'
  if (state.action === '2') return 'Sla op'
  if (state.action === '3') return 'Verwijder'
  if (state.action === '4') return 'Sla info op'
  return ''
})

const saveButtonColor = computed(() => {
  if (state.action === '3') return 'red'
  return ''
})

const userAliasInputOk = computed(() => {
  if (state.userAliasInput.length < 2 || state.userAliasInput.toUpperCase() === 'ADMIN' || state.userAliasInput.toUpperCase() === 'SYSTEM') return false
  return true
})

const userNewAliasInputOk = computed(() => {
  if (state.userNewAliasInput.length < 2 || state.userNewAliasInput.toUpperCase() === 'ADMIN' || state.userNewAliasInput.toUpperCase() === 'SYSTEM') return false
  return true
})

const allowSave = computed(() => {
  if (state.action === '1') return userAliasInputOk.value && !aliasExists(state.userAliasInput) && !isAliasInUse(state.userAliasInput)
  if (state.action === '2') return userAliasInputOk.value && userNewAliasInputOk.value && !aliasExists(state.userNewAliasInput) && !isAliasInUse(state.userNewAliasInput)
  if (state.action === '3') return userAliasInputOk.value && aliasExists(state.userAliasInput) && !isAliasInUse(state.userAliasInput)
  if (state.action === '4') return userAliasInputOk.value && aliasExists(state.userAliasInput)
  return false
})

function saveAliasEntry() {
  if (state.action === '1') {
    // note: Using set() overwrites data at the specified location, including any child nodes.
    set(ref(db, '/aliases/' + state.userAliasInput), {
      "inUse": false
    })
    state.saveSuccess = 1
    // add the alias to the local array
    state.allAliases.push(state.userAliasInput)
  }
  if (state.action === '2') {
    // get the data of the alias
    get(child(dbRef, `/aliases/` + state.userAliasInput)).then((snapshot) => {
      if (snapshot.exists()) {
        // remove the alias from the database
        remove(child(dbRef, '/aliases/' + state.userAliasInput)).then(() => {
          // remove the alias from the local array
          state.allAliases = state.allAliases.filter(a => a !== state.userAliasInput)
          // add the changed alias to the database
          set(ref(db, '/aliases/' + state.userNewAliasInput), snapshot.val())
          state.saveSuccess = 1
          // add the alias to the local array
          state.allAliases.push(state.userNewAliasInput)
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
  if (state.action === '3') {
    remove(child(dbRef, '/aliases/' + state.userAliasInput)).then(() => {
      // remove the alias from the local array
      state.allAliases = state.allAliases.filter(a => a !== state.userAliasInput)
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
  updates[`/aliases/${state.userAliasInput}/info`] = state.aliasInfoContent
  update(dbRef, updates).then(() => {
    state.saveSuccess = 1
  }).catch((error) => {
    state.saveSuccess = 2
    console.error('The write failed, error message = ' + error.message)
  })
}

function doSave() {
  if (state.action === '1') saveAliasEntry()
  if (state.action === '2') saveAliasEntry()
  if (state.action === '3') saveAliasEntry()
  if (state.action === '4') saveAliasInfo()
}

// reset the user input when changing action
function resetInput() {
  state.userAliasInput = ''
  state.userNewAliasInput = ''
  state.saveSuccess = 0
  state.aliasInfoContent = ''
}

// autocomplete the alias name
watch(() => state.userAliasInput, () => {
  // undo the saveSuccess message
  state.saveSuccess = 0
  if (state.action === '2' || state.action === '3' || state.action === '4') {
    const inputLen = state.userAliasInput.length
    let lastMatch = undefined
    let exactMatch = false
    let matchcount = 0
    for (const el of state.allAliases) {
      if (el.substring(0, inputLen).toUpperCase() === state.userAliasInput.toUpperCase()) {
        lastMatch = el
        matchcount++
        // test on exact match
        exactMatch = el.length === inputLen
        if (exactMatch) break
      }
    }
    if (exactMatch || matchcount === 1) {
      // unique match found
      if (state.action === '4' && state.userAliasInput !== lastMatch.trim()) {
        // prevent loading again after that state.userAliasInput was set (triggers another watch)
        state.userAliasInput = lastMatch.trim()
        // initialize the content
        get(child(dbRef, `/aliases/${state.userAliasInput}/info`)).then((snapshot) => {
          if (snapshot.exists()) {
            state.aliasInfoContent = snapshot.val()
          }
        }).catch((error) => {
          console.error('While reading all available aliases from database: error message = ' + error.message)
        })
      } else
        state.userAliasInput = lastMatch.trim()
    }
  }
})

</script>

<style scoped>
h3 {
  color: orange
}
</style>