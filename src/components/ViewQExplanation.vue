<template>
  <v-card>
<<<<<<< HEAD
    <v-card-title class="text-center">{{ props.questionObject.qTitle }}</v-card-title>
=======
    <v-card-title class="text-center">Quiz toelichting</v-card-title>
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
    <v-row justify="space-around">
      <v-col cols="12" md="8">
        <v-sheet class="pa-2" color="grey-lighten-3">
          <v-row no-gutters>
            <div v-html="props.quizExplanation"></div>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-divider class="my-5"></v-divider>

    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn prepend-icon="mdi-arrow-left" @click="emit('view-over')">
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
const emit = defineEmits(['view-over'])
<<<<<<< HEAD
const props = defineProps(['questionObject'])
=======
const props = defineProps(['quizExplanation'])
>>>>>>> b15ed8974b263f46f718a4bb6a57e7c5fd985d7c
</script>
