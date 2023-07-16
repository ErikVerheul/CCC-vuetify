<template>
  <v-btn-toggle v-model="aliasButtonSelections[row]" color="purple" mandatory>
    <template v-for="(num, index) in rowLength">
      <template v-if="nameIsCelebrity(index)">
        <template v-if="!nameIsInUse(index)">
          <v-btn size="small" append-icon="mdi-account-circle">
            {{ randomNames[indexOffset + index] }}
            <template v-slot:append>
              <v-icon color="warning"></v-icon>
            </template>
          </v-btn>
        </template>
        <template v-else>
          <v-btn size="small" variant="outlined" color="orange" append-icon="mdi-account-circle">
            {{ randomNames[indexOffset + index] }}
            <template v-slot:append>
              <v-icon color="warning"></v-icon>
            </template>
          </v-btn>
        </template>
      </template>
      <template v-else>
        <template v-if="!nameIsInUse(index)">
          <v-btn size="small">
            {{ randomNames[indexOffset + index] }}
          </v-btn>
        </template>
        <template v-else>
          <v-btn size="small" variant="outlined" color="orange">
            {{ randomNames[indexOffset + index] }}
          </v-btn>
        </template>
      </template>
    </template>
  </v-btn-toggle>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['aliasObject', 'aliasesInUse', 'randomNames', 'rowLength', 'row', 'aliasButtonSelections'])

const indexOffset = computed(() => {
  return props.row * props.rowLength
})

function nameIsInUse(index) {
  const name = props.randomNames[indexOffset.value + index]
  return props.aliasObject[name].inUse
}

function nameIsCelebrity(index) {
  const name = props.randomNames[indexOffset.value + index]
  if (props.aliasObject[name].celebrity) return true
  return false
}
</script>