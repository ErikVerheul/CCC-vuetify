<template>
  <v-row>
    <v-card flat>
      <v-card-title class="text-h5">alias kiezen</v-card-title>
      <v-card-subtitle>Scroll door alias namen en kies er een</v-card-subtitle>
      <v-card-text>
        <v-row align="center" justify="center">
          <SelectAliasRow v-for="(num, index) in state.numberOfRows"
          :assigned-aliases="assignedAliases" 
          :random-names="state.randomNames"
          :row-length="state.rowLength"
          :row=index
          :alias-button-selections="state.aliasButtonSelections"
          />   
        </v-row>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script setup>
  import { onBeforeMount, reactive, watch } from 'vue'
  import SelectAliasRow from './SelectAliasRow.vue'
  const props = defineProps(['assignedAliases', 'allAliases'])
  const emit = defineEmits(['alias-selected'])

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
    } while (itemsSet < numberOfButtons)


    // initialize button selection
    for (let i = 0; i < state.numberOfRows; i++) {
      state.aliasButtonSelections[i] = undefined
    }
  })

  const state = reactive({
      numberOfRows: 20,
      rowLength: 4,
      aliasButtonSelections: [],
      selectedButtonInRows: [],
      lastSelectedRow: undefined,
      lastIndex: undefined,
      randomNames: [],
      skipWatch: false
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
        emit('alias-selected', state.randomNames[index])
      })
</script>