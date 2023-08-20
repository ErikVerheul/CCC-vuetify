<template>
  <v-card width="store.screenWidth">
    <v-card-title>De app meld een probleem</v-card-title>
    <v-card-text>
      <p><b>Probleem:</b> {{ props.problemText }}</p>
      <p><b>Oorzaak:</b> {{ props.problemCause }}</p>
      <p v-if="props.tipToResolve"><b>Mogelijke oplossing:</b> {{ props.tipToResolve }}</p>
    </v-card-text>
    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn prepend-icon="mdi-arrow-left" @click="emit('return-to')">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            Terug
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useAppStore } from '../store/app.js'
import { db, dbRef } from '../firebase'
import { ref, child, get, set, remove, update } from 'firebase/database'
const store = useAppStore()
const emit = defineEmits(['return-to'])
const props = defineProps({
  problemText: {
    type: String,
    required: true
  },
  problemCause: {
    type: String,
    required: true
  },
  tipToResolve: {
    type: String,
    required: true
  }
})

</script>