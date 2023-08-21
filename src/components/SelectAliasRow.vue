<template>
  <v-btn-toggle v-model="aliasButtonSelections[row]" color="purple" mandatory>
    <template v-for="(num, index) in rowLength">
      <v-btn size="small">
        {{ randomNames[indexOffset + index] }}
      </v-btn>
    </template>
  </v-btn-toggle>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['randomNames', 'rowLength', 'row', 'aliasButtonSelections'])

const indexOffset = computed(() => {
  return props.row * props.rowLength
})

</script>