<template>
  <v-sheet class="top scrollable" max-width="414px">
    <div class="py-8" />
    <v-row class="d-flex align-center justify-center">
      <h2>Blader, en kies een schuilnaam</h2>
    </v-row>
    <v-row class="text-center overflow-auto" align="center" justify="center" style="display: flex; ">
      <SelectAliasRow v-for="(num, index) in state.numberOfRows" :aliases-in-use="aliasesInUse" :random-names="state.randomNames"
        :row-length="state.rowLength" :row=index :alias-button-selections="state.aliasButtonSelections" />
    </v-row>
  </v-sheet>

  <v-sheet class="bottom" max-width="414px">
    <v-row class="justify-start">
      <v-col>
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('reset-signup')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-btn :disabled="state.aliasSelected === undefined || props.aliasOccupied" flat append-icon="mdi-arrow-right"
          @click="emit('alias-selected', state.aliasSelected)">
          Door
          <template v-slot:append>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { onBeforeMount, reactive, watch } from 'vue'
import SelectAliasRow from './SelectAliasRow.vue'
const props = defineProps(['aliasesInUse', 'allAliases', 'aliasOccupied'])
const emit = defineEmits(['alias-clicked', 'alias-selected', 'reset-signup'])

onBeforeMount(() => {
  // randomize alias names
  let itemsSet = 0
  let numberOfButtons = state.rowLength * state.numberOfRows
  state.randomNames = []
  do {
    // pick a random alias
    let alias = props.allAliases[Math.round(Math.random() * (props.allAliases.length - 1))]
    if (!state.randomNames.includes(alias)) {
      // select if not already done
      state.randomNames.push(alias)
      itemsSet++
    }
  } while (itemsSet < numberOfButtons && itemsSet < props.allAliases.length)

  // initialize button selection
  for (let i = 0; i < state.numberOfRows; i++) {
    state.aliasButtonSelections[i] = undefined
  }
})

const state = reactive({
  numberOfRows: 120,
  rowLength: 1,
  aliasButtonSelections: [],
  selectedButtonInRows: [],
  lastSelectedRow: undefined,
  lastIndex: undefined,
  randomNames: [],
  skipWatch: false,
  aliasSelected: undefined
})

watch(state.aliasButtonSelections, (rowValue, oldRowValue) => {
  // note: rowValue and oldRowValue are equal, see https://vuejs.org/guide/essentials/watchers.html#deep-watchers

  if (state.skipWatch) {
    state.skipWatch = false
    return
  }
  // preset newIndex in case a button in the same row is clicked
  let newIndex = state.lastIndex
  for (let i = 0; i < rowValue.length; i++) {
    if (i !== state.lastIndex && rowValue[i] !== undefined) newIndex = i
  }
  // reset the previous clicked button and prevent firing an 'alias-selected' event
  if (state.lastIndex !== undefined && newIndex !== state.lastIndex) {
    state.aliasButtonSelections[state.lastIndex] = undefined
    state.skipWatch = true
  }
  // save the index of the clicked buttom row for removal at the next selection
  state.lastIndex = newIndex

  let index = newIndex * state.rowLength + state.aliasButtonSelections[newIndex]
  state.aliasSelected = state.randomNames[index]
  if (state.aliasSelected !== undefined) emit('alias-clicked', state.aliasSelected)
})
</script>

<style scoped>

.top {
  top: 0;
  left: 0;
  height: 90%;
  width: 100%;
  position: fixed;
}

.bottom {
  bottom: 0;
  left: 0;
  height: 10%;
  width: 100%;
  position: fixed;
}

.scrollable {
  overflow-y: scroll;
  overflow-x:hidden;
  max-height: 90%;
}
</style>