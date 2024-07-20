<template>
  <v-card width="store.screenWidth">
    <v-card-title>De app meld een probleem</v-card-title>
    <v-card-text>
      <p><b>Probleem:</b> {{ store.problemText }}</p>
      <p><b>Oorzaak:</b> {{ store.problemCause }}</p>
      <p v-if="store.tipToResolve"><b>Mogelijke oplossing:</b> {{ store.tipToResolve }}</p>
    </v-card-text>
    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn prepend-icon="mdi-arrow-left" @click="emit('exit-now')">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            STOP
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useAppStore } from '../store/app.js'

const store = useAppStore()
const emit = defineEmits(['exit-now'])

</script>