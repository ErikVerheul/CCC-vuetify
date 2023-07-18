<template>
  <h2>Onderhoud quiz gegevens</h2>
  <v-sheet>
    <v-text-field v-model="state.headText" label="Kop tekst" />
    <v-file-input :rules="state.imageRules" v-model="state.image" accept="image/png, image/jpeg, image/bmp" placeholder="Kies een afbeelding"
      prepend-icon="mdi-camera" label="Afbeelding (png, jpeg of bmp)">
    </v-file-input>

    <p>Body:</p>
    <Editor v-model="state.editorValue" api-key="perge5827m6r7l4p6saczkr4xdkk4v0fkgxwwtoltjoskmvw" :init="{
      plugins: 'lists link image table code help wordcount'
    }" />
    <v-text-field :rules="state.questionRules" v-model="state.numberOfQuestions" label="Aantal vragen" />
    <v-text-field v-model="state.link" label="Link (optioneel)" />
  </v-sheet>

  <p>Preview</p>
  <v-row justify="space-around">
    <v-col cols="12" md="4">
      <v-sheet class="pa-2" color="grey-lighten-3" height="896" width="414">
        <v-row no-gutters>
          {{ state.headText }}
        </v-row>
        <v-row no-gutters>
          {{ previewImage() }}
        </v-row>
      </v-sheet>
    </v-col>
  </v-row>

  <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('m-done')">
    <template v-slot:prepend>
      <v-icon size="x-large" color="purple"></v-icon>
    </template>
    Terug
  </v-btn>
</template>

<script setup>
import { reactive } from 'vue'
import Editor from '@tinymce/tinymce-vue'
const emit = defineEmits(['m-done'])

const state = reactive({
  headText: '',
  image: undefined,
  editorValue: '',
  imageRules: [
    value => {
      return !value || !value.length || value[0].size < 2000000 || 'Afbeeldingen moeten kleiner zijn dan 2 MB!'
    }
  ],
  questionRules: [
    value => {
      if (value) return true

      return 'Vul 1 of meer cijfers in.'
    },
    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value.length >= 1) return true

      return 'Vul minimaal 1 cijfer in.'
    },
    value => {
      if (value.length <= 2) return true

      return 'Vul maximaal 2 cijfer in.'
    },
  ],
  link: '',
  numberOfQuestions: 1,
})

function previewImage() {
  if (state.image) return state.image
  return 'geen plaatje geladen'
}
</script>