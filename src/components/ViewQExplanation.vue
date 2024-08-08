<template>
  <v-card>
    <v-card-title class="text-center">{{ props.questionObject.qTitle }}</v-card-title>
    <v-row justify="space-around">
      <v-col cols="12" md="8">
        <v-sheet class="pa-2" color="grey-lighten-3">
          <h4 class="py-3">Toelichting op deze vraag</h4>
          <v-row no-gutters>
            <div v-if="'props.questionObject.body'" v-html="props.questionObject.body"></div>
            <v-divider class="my-5"></v-divider>
            <div v-html="props.questionObject.resultInfo"></div>
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
const props = defineProps(['questionObject'])
</script>
