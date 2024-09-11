<template>
  <v-btn-toggle v-model="state.aliasButtons[row]" color="purple" mandatory>
    <template v-for="(num, index) in rowLength" :key="num">
      <v-btn size="small">
        {{ randomNames[indexOffset + index] }}
      </v-btn>
    </template>
  </v-btn-toggle>
</template>

<script setup>
import { computed, reactive } from 'vue'
const props = defineProps(['randomNames', 'rowLength', 'row', 'aliasButtonSelections'])

const state = reactive({
  aliasButtons: props.aliasButtonSelections,
})

const indexOffset = computed(() => {
  return props.row * props.rowLength
})
</script>
