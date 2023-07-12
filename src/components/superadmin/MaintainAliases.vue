<template>
  <v-card variant="tonal">
    <v-card-title>Schuilnamen onderhouden</v-card-title>
    <v-radio-group inline v-model="state.action">
      <v-radio @change="resetInput" label="Toevoegen" value="1"></v-radio>
      <v-radio @change="resetInput" label="Veranderen" value="2"></v-radio>
      <v-radio @change="resetInput" label="Verwijderen" value="3"></v-radio>
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

    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('m-done')">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            Terug
          </v-btn>
        </v-col>
        <v-col v-if="state.saveSuccess === 1">
          {{ saveButtonText }} is gelukt
        </v-col>
        <v-col v-if="!state.saveSuccess === 2">
          {{ saveButtonText }} is mislukt
        </v-col>
        <v-col>
          <v-btn :disabled="!allowSave" :color="saveButtonColor" flat append-icon="mdi-arrow-right" @click="saveChange">
            {{ saveButtonText }}
            <template v-slot:append>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { onBeforeMount, reactive, computed } from 'vue'
import { dbRef } from '../../firebase'
import { child, get, update } from 'firebase/database'
import { watch } from 'vue'

const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadAliasData()
})

const state = reactive({
  aliasObject: {},
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
  saveSuccess: 0
})

function loadAliasData() {
  // get all available aliases
  get(child(dbRef, `aliases/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.aliasObject = snapshot.val()
      state.allAliases = Object.keys(state.aliasObject)
      // extract the aliases in use
      state.aliasesInUse = []
      state.allAliases.forEach(el => {
        if (state.aliasObject[el].inUse) state.aliasesInUse.push(el)
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
  if (alias.toUpperCase() === 'SYSTEM' || alias.toUpperCase() === 'ADMIN') return true
  for (const el of state.allAliases) {
    if (el.toUpperCase() === alias.toUpperCase()) {
      return true
    }
  }
  return false
}

const textFieldLabel = computed(() => {
  if (state.action === '1') return 'Nieuwe schuilnaam'
  if (state.action === '2') return 'Te veranderen'
  if (state.action === '3') return 'Te verwijderen'
  return ''
})

const saveButtonText = computed(() => {
  if (state.action === '1') return 'Voeg toe'
  if (state.action === '2') return 'Sla op'
  if (state.action === '3') return 'Verwijder'
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
  return false
})

function saveChange() {
  if (state.action === '1') {
    const trimmedAlias = state.userAliasInput.trim()
    state.aliasObject[trimmedAlias] = {
      "inUse": false
    }
    // add the alias to the local array
    state.allAliases.push(trimmedAlias)
  }
  if (state.action === '2') {
    for (let key in state.aliasObject) {
      if (key.toUpperCase() === state.userAliasInput.toUpperCase()) {
        delete state.aliasObject[key]
      }
    }
    // remove the changed alias from the local array
    state.allAliases = state.allAliases.filter(a => a !== state.userAliasInput)
    state.aliasObject[state.userNewAliasInput] = {
      "inUse": false
    }
    // add the changed alias to the local array
    state.allAliases.push(state.userNewAliasInput.trim())
  }
  if (state.action === '3') {
    for (let key in state.aliasObject) {
      if (key.toUpperCase() === state.userAliasInput.toUpperCase()) {
        delete state.aliasObject[key]
      }
    }
    // remove the alias from the local array
    state.allAliases = state.allAliases.filter(a => a !== state.userAliasInput)
  }
  // save the data
  const updates = {}
  updates['aliases/'] = state.aliasObject
  update(dbRef, updates).then(() => {
    state.saveSuccess = 1
    // and read back with any changes made by other users
    loadAliasData()
  }).catch((error) => {
    state.saveSuccess = 2
    console.error('The write failed, error message = ' + error.message)
  })
}

// reset the user input when changing action
function resetInput() {
  state.userAliasInput = ''
  state.userNewAliasInput = ''
  state.saveSuccess = 0
}

// autocomplete the alias name
watch(() => state.userAliasInput, () => { 
  // undo the saveSuccess message
  state.saveSuccess = 0
  if (state.action === '2' || state.action === '3') {
    const trimmedInput = state.userAliasInput.trim()
    const inputLen = trimmedInput.length
    let lastMatch = undefined
    let exactMatch = false
    let matchcount = 0
    for (const el of state.allAliases) {
      if (el.substring(0, inputLen).toUpperCase() === trimmedInput.toUpperCase()) {
        lastMatch = el
        matchcount++
        // test on exact match
        exactMatch = el.length === inputLen
        if (exactMatch) break
      }
    }
    if (exactMatch || matchcount === 1) {
      // unique match found
      state.aliasOk = true
      state.userAliasInput = lastMatch
    }
  }
})

</script>

<style scoped>
h3 {
  color: orange
}
</style>