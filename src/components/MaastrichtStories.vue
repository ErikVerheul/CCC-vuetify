<template>
  <v-card v-if="!state.doQuiz" max-width="600" class="mx-auto">
    <!-- <v-system-bar
      color="pink darken-2"
      dark
    >
      <v-spacer></v-spacer>

      <v-icon>mdi-window-minimize</v-icon>

      <v-icon>mdi-window-maximize</v-icon>

      <v-icon>mdi-close</v-icon>
    </v-system-bar>

    <v-app-bar
      dark
      color="pink"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>My Music</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar> -->

    <v-row dense>
      <v-col cols="12">
        <v-card color="#1F7087" theme="dark">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="text-h5">
                Faliezusters
              </v-card-title>

              <v-card-subtitle>Test je kennis</v-card-subtitle>

              <v-card-actions>
                <v-btn class="ms-2" variant="outlined" size="small" @click="startQuiz">
                  Start de quiz
                </v-btn>
              </v-card-actions>
            </div>

            <v-avatar class="ma-3" size="180" rounded="0">
              <v-img src="../assets/Faliezusterklooster.png"></v-img>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <div class="py-5" />
    <v-row class="justify-start">
      <v-col cols="auto">
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('return-to-menu')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
  <FalieZusters v-else @quit-quiz="state.doQuiz = false"></FalieZusters>
</template>

<script setup>
import { reactive } from 'vue'
import FalieZusters from './FalieZusters.vue'
const props = defineProps(['userId', 'alias'])
const emit = defineEmits(['return-to-menu'])

const state = reactive({
  doQuiz: false
})

function startQuiz() {
  state.doQuiz = true
}
</script>