<template>
  <v-card width="store.screenWidth">
    <v-card-title>Er is een fout opgetreden</v-card-title>
    <v-card-text>
      <p><b>De database geeft de volgende melding:</b> {{ props.firebaseError.message }}</p>
      <p><b>Tijdens/bij:</b> {{ props.fbErrorContext }}</p>
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
import { useAppStore } from '../store/app.js'

const store = useAppStore()
const emit = defineEmits(['return-to'])
const props = defineProps({
  firebaseError: {
    type: Object,
    required: true
  },
  fbErrorContext: {
    type: String,
    required: true
  }
})

</script>