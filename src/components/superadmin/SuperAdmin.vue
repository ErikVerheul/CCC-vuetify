<template>
  <v-container>
    <v-sheet v-if="state.action === 'menu'">
      <v-row>
        <v-navigation-drawer width="100%" class="bg-deep-purple" theme="dark" permanent>
          <v-list color="transparent">
            <v-list-item prepend-icon="mdi-view-dashboard" title="Schuilnamen onderhouden" @click="state.action = 'mAliases'"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Quiz namen onderhouden" @click="state.action = 'mQuizNames'"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Quiz vragen onderhouden" @click="state.action = 'mQuiz'"></v-list-item>
            <v-list-item prepend-icon="mdi-account-box" title="Berichten maken en versturen" @click="state.action = 'mMess'"></v-list-item>
            <v-list-item prepend-icon="mdi-gavel" title="Andere gebruikers rechten geven" @click="state.action = 'mRoles'"></v-list-item>
          </v-list>

          <template v-slot:append>
            <div class="pa-2">
              <v-btn flat prepend-icon="mdi-arrow-left" @click="router.replace({ path: '/' })">
                <template v-slot:prepend>
                  <v-icon size="x-large" color="purple"></v-icon>
                </template>
                Terug
              </v-btn>
            </div>
          </template>
        </v-navigation-drawer>
      </v-row>
    </v-sheet>

    <MaintainAliases v-if="state.action === 'mAliases'" @m-done="state.action = 'menu'"></MaintainAliases>
    <MaintainQuizNames v-if="state.action === 'mQuizNames'" @m-done="state.action = 'menu'"></MaintainQuizNames>
    <MaintainQuizData v-if="state.action === 'mQuiz'" @m-done="state.action = 'menu'"></MaintainQuizData>
    <MaintainMessages v-if="state.action === 'mMess'" @m-done="state.action = 'menu'"></MaintainMessages>
    <MaintainRoles v-if="state.action === 'mRoles'" @m-done="state.action = 'menu'"></MaintainRoles>
  </v-container>
</template>

<script setup>
import { reactive } from 'vue'
import router from '@/router'
import MaintainAliases from './MaintainAliases.vue'
import MaintainQuizNames from './MaintainQuizNames.vue'
import MaintainQuizData from './MaintainQuizData.vue'
import MaintainMessages from './MaintainMessages.vue'
import MaintainRoles from './MaintainRoles.vue'

const state = reactive({
  action: 'menu'
})


</script>