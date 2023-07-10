<template>
  <h2>Onderhoud gebruikers rollen hier</h2>
  <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('m-done')">
    <template v-slot:prepend>
      <v-icon size="x-large" color="purple"></v-icon>
    </template>
    Terug
  </v-btn>
</template>

<script setup>
  const emit = defineEmits(['m-done'])
</script>