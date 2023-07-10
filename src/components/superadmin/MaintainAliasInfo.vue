<template>
  <h2>Onderhoud schuilnaam info hier</h2>
  <Editor v-model="state.editorValue" api-key="perge5827m6r7l4p6saczkr4xdkk4v0fkgxwwtoltjoskmvw" :init="{
    plugins: 'lists link image table code help wordcount'
  }" />
  <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('m-done')">
    <template v-slot:prepend>
      <v-icon size="x-large" color="purple"></v-icon>
    </template>
    Terug
  </v-btn>

  <v-textarea label="Dit ziet de app als input:" :model-value="state.editorValue"></v-textarea>
</template>

<script setup>
import { reactive } from 'vue'
import Editor from '@tinymce/tinymce-vue'
const emit = defineEmits(['m-done'])

const state = reactive({
  editorValue: 'Hallo wereld'
})
</script>