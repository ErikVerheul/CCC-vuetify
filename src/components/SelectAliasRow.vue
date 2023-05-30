<template>
  <v-btn-toggle v-model="aliasButtonSelections[row]" mandatory>
    <template v-for="(num, index) in rowLength">
      <template v-if="!assignedAliases.includes(randomNames[indexOffset + index])">
        <v-btn size="small">
          {{ randomNames[indexOffset + index] }}
        </v-btn>
      </template>
      <template v-else>
        <v-btn size="small" append-icon="mdi-account-circle">
          {{ randomNames[indexOffset + index] }}
          <template v-slot:append>
            <v-icon color="warning"></v-icon>
          </template>
        </v-btn>
      </template>
    </template>
  </v-btn-toggle>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['assignedAliases', 'randomNames', 'rowLength', 'row', 'aliasButtonSelections'])
const indexOffset = computed(() => {
  return props.row * 4
})
</script>