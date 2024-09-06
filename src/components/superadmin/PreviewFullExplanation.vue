<template>
  <v-card>
    <v-card-title>Preview</v-card-title>
    <v-row justify="space-around">
      <v-col cols="6" md="4">
        <p>Preview 414 pixels breed</p>
        <v-sheet class="pa-2" color="grey-lighten-3" width="414">
          <h4 class="py-3">Toelichting op goed/fout antwoord:</h4>
          <v-row no-gutters>
            <div v-html="props.longExplanation"></div>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col cols="6" md="4">
        <p>Preview 375 pixels breed</p>
        <v-sheet class="pa-2" color="grey-lighten-3" width="375">
          <h4 class="py-3">Toelichting op goed/fout antwoord:</h4>
          <v-row no-gutters>
            <div v-html="props.longExplanation"></div>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-divider class="my-5"></v-divider>

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
const emit = defineEmits(['return-to'])
const props = defineProps(['longExplanation'])
</script>
