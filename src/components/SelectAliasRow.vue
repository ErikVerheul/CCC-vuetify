<template>
  <v-btn-toggle v-model="aliasButtonSelections[row]" color="purple" mandatory>
    <template v-for="(num, index) in rowLength">
      <v-btn size="small" :disabled="nameIsInUse(index)">
        {{ randomNames[indexOffset + index] }}
      </v-btn>
      <!-- <template v-else> TO ADD A ICON TO THE BUTTON
        <v-btn size="small" append-icon="mdi-account-circle">
          {{ randomNames[indexOffset + index] }}
          <template v-slot:append>
            <v-icon color="warning"></v-icon>
          </template>
        </v-btn>
      </template> -->
    </template>
  </v-btn-toggle>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['aliasesInUse', 'randomNames', 'rowLength', 'row', 'aliasButtonSelections'])

const indexOffset = computed(() => {
  return props.row * props.rowLength
})

function nameIsInUse(index) {
  for (const el of props.aliasesInUse) {
    const name = props.randomNames[indexOffset.value + index]
    // skip if not enough names to fill the page
    if (name === undefined) break
    if (el.toUpperCase() === name.toUpperCase()) {
      return true
    }
  }
  return false
}
</script>