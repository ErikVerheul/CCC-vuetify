<template>
  <v-card variant="tonal">
    <v-card-title>Schuilnamen onderhouden (niet af!)</v-card-title>
    <v-radio-group inline v-model="state.action">
      <v-radio label="Toevoegen" value="1"></v-radio>
      <v-radio label="Veranderen" value="2"></v-radio>
      <v-radio label="Verwijderen" value="3"></v-radio>
    </v-radio-group>

    <v-row>
      <v-col cols="3"></v-col>
      <v-col cols="6">
        <v-text-field v-model.trim="state.alias" :label="textFieldLabel" :rules="state.nameRules" />
      </v-col>
      <v-col cols="3"></v-col>
    </v-row>

    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn flat prepend-icon="mdi-arrow-left" @click="">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            Terug
          </v-btn>
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

    <v-row v-if="aliasInUse">
      <v-col cols="auto">
          <h3>LET OP</h3>
          <p>Schuilnaam {{ state.alias }} is in gebruik</p>
      </v-col>
    </v-row>

  </v-card>
</template>

<script setup>
import { onBeforeMount, reactive, computed } from 'vue'
import { dbRef } from '../../firebase'
import { child, get, update } from 'firebase/database'

// note: refreshing this page will void your authorisation
onBeforeMount(() => {
  // get all available aliases
  get(child(dbRef, `aliases/`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.allAliases = snapshot.val()
      state.upperCaseAliases = state.allAliases.map((el) => el.toUpperCase())
    } else {
      console.log("No aliases data available")
    }
    // get the allready assigned users
    get(child(dbRef, `users/`)).then((snapshot) => {
      if (snapshot.exists()) {
        // create the array with already assigned users
        Object.keys(snapshot.val()).forEach(el => state.assignedUserIds.push(el))
      } else {
        console.log("No assigned aliases data available")
      }
    }).catch((error) => {
      console.error('Error while reading all assigned UserIds from database: ' + error)
    })
  }).catch((error) => {
    console.error('Error while reading all available aliases from database: ' + error)
  })
})

const textFieldLabel = computed(() => {
  if (state.action === '1') return 'Nieuwe schuilnaam'
  if (state.action === '2') return 'Te veranderen schuilnaam'
  if (state.action === '3') return 'Te verwijderen schuilnaam'
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

const aliasEnteredOk = computed(() => {
  return (state.alias.length >= 2)
})

const aliasExists = computed(() => {
  return state.upperCaseAliases.includes(state.alias.toUpperCase())
})

const aliasInUse = computed(() => {
  return state.assignedUserIds.includes(state.alias.toUpperCase())
})

const allowSave = computed(() => {
  if (state.action === '1') return aliasEnteredOk.value && !aliasExists.value && !aliasInUse.value
  if (state.action === '2') return aliasEnteredOk.value && aliasExists.value && !aliasInUse.value
  if (state.action === '3') return aliasEnteredOk.value && aliasExists.value && !aliasInUse.value
  return false
})

function saveChange() {
  if (state.action === '1') {
    state.allAliases.push(state.alias)
    state.allAliases.sort()
    state.upperCaseAliases.push(state.alias.toUpperCase())
    state.upperCaseAliases.sort()
  }
  if (state.action === '2') {

  }
  if (state.action === '3') {
    state.allAliases = state.allAliases.filter(a => a !== state.alias)

  }
}

const state = reactive({
  allAliases: [],
  upperCaseAliases: [],
  assignedUserIds: [],
  action: "1",
  alias: '',
  nameRules: [
    value => {
      if (value) return true

      return 'Vul 2 of meer letters in.'
    },
    value => {
      if (value.length >= 2) return true

      return 'Vul minimaal 2 letters in.'
    },
  ],
})

</script>

<style scoped>

h3 {
  color: orange
}

</style>