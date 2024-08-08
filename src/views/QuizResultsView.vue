<template>
  <v-container>
    <v-row class="d-flex align-center justify-center">
      <AppBar :withActivator="false" />
      <v-sheet class="mx-3">
        <QuizResults @return-to-menu="router.replace({ path: '/' })" />
      </v-sheet>
    </v-row>
  </v-container>
</template>

<script setup>
import router from '@/router'
import QuizResults from '@/components/QuizResults.vue'
import { useAppStore } from '../store/app.js'

const store = useAppStore()
</script>
