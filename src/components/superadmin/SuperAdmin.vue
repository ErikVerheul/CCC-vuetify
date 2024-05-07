<template>
  <v-container>
    <AppBar :withActivator=false />
    <v-sheet v-if="state.action === 'menu'">
      <v-row>
        <v-navigation-drawer width="100%" class="bg-deep-purple" theme="dark" permanent>
          <v-list color="transparent">
            <v-list-item prepend-icon="mdi-view-dashboard" title="Schuilnamen onderhouden" @click="state.action = 'mAliases'"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Quiz meta data onderhouden" @click="state.action = 'mQuizzes'"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Quiz vragen onderhouden" @click="state.action = 'mQuizQuestions'"></v-list-item>
            <v-list-item prepend-icon="mdi-account-box" title="Berichten maken en versturen" @click="state.action = 'mMessages'"></v-list-item>
            <v-list-item prepend-icon="mdi-gavel" title="Andere gebruikers rechten geven" @click="state.action = 'mRoles'"></v-list-item>
          </v-list>

          <template v-slot:append>
            <v-divider></v-divider>
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
    <MaintainQuizzes v-if="state.action === 'mQuizzes'" @m-done="state.action = 'menu'"></MaintainQuizzes>
    <MaintainQuizQuestions v-if="state.action === 'mQuizQuestions'" @m-done="state.action = 'menu'"></MaintainQuizQuestions>
    <MaintainMessages v-if="state.action === 'mMessages'" @m-done="state.action = 'menu'"></MaintainMessages>
    <MaintainRoles v-if="state.action === 'mRoles'" @m-done="state.action = 'menu'"></MaintainRoles>
  </v-container>
</template>

<script setup>
import { reactive } from 'vue'
import router from '@/router'
import MaintainAliases from './MaintainAliases.vue'
import MaintainQuizzes from './MaintainQuizzes.vue'
import MaintainQuizQuestions from './MaintainQuizQuestions.vue'
import MaintainMessages from './MaintainMessages.vue'
import MaintainRoles from './MaintainRoles.vue'

const state = reactive({
  action: 'menu'
})


</script>