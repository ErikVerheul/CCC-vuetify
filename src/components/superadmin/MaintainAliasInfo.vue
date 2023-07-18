<template>
  <h2>Onderhoud schuilnaam info</h2>
  <v-sheet>
    <v-text-field v-model="state.userAliasInput" label="Kies een schuilnaam" :rules="state.nameRules" />
    <p>Body:</p>
    <quill-editor v-model:value="state.content"></quill-editor>
  </v-sheet>

  <template v-if="state.aliasOk">
    <v-row justify="space-around">
      <v-col cols="6" md="4">
        <p>Preview 414 x 896 px</p>
        <v-sheet class="pa-2" color="grey-lighten-3" height="896" width="414">         
          <v-row no-gutters>
            <div v-html="state.content"></div>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col cols="6" md="4">
        <p>Preview 375 x 812 px</p>
        <v-sheet class="pa-2" color="grey-lighten-3" height="812" width="375">         
          <v-row no-gutters>
            <div v-html="state.content"></div>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </template>

  <v-row>
    <v-col>
      <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('m-done')">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>
    <v-col>
      <v-btn :disabled="!state.aliasOk" color="purple" flat append-icon="mdi-arrow-right" @click="saveChange">
        Sla op
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { onBeforeMount, reactive, watch } from 'vue'
import { dbRef } from '../../firebase'
import { child, get, update } from 'firebase/database'
const emit = defineEmits(['m-done'])

onBeforeMount(() => {
  loadAliasData()
})

const state = reactive({
  content: '',
  allAliases: [],
  aliasOk: false,
  nameRules: [
    value => {
      if (value) return true

      return 'Vul 2 of meer letters in.'
    },
    value => {
      if (value.length >= 2) return true

      return 'Vul minimaal 2 letters in.'
    }
  ]
})

function loadAliasData() {
  // get all available aliases
  get(child(dbRef, `aliases/`)).then((snapshot) => {
    if (snapshot.exists()) {
      const aliasObject = snapshot.val()
      state.allAliases = Object.keys(aliasObject)
    } else {
      console.log("No aliases data available")
    }
  }).catch((error) => {
    console.error('While reading all available aliases from database: error message = ' + error.message)
  })
}

function saveChange() {
  // update the info data the selected alias
  const updates = {}
  updates[`aliases/${state.userAliasInput}/info`] = state.content
  update(dbRef, updates).then(() => {
  }).catch((error) => {
    console.error('The write failed, error message = ' + error.message)
  })
}

// autocomplete the alias name
watch(() => state.userAliasInput, () => {
  state.aliasOk = false
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
    state.aliasOk = true
    state.userAliasInput = lastMatch.trim()
    // initialize the content
    get(child(dbRef, `aliases/${state.userAliasInput}/info`)).then((snapshot) => {
      if (snapshot.exists()) {
        state.content = snapshot.val()
      } else {
        state.content = `<h3>Je wil "${state.userAliasInput}" als schuilnaam kiezen</h3>`
      }
    }).catch((error) => {
      console.error('While reading all available aliases from database: error message = ' + error.message)
    })
  }
})

</script>