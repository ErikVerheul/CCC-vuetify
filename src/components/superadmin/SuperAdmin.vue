<template>
  <v-container>
    <v-sheet v-if="state.action === 'menu'">
      <v-row>
        <v-navigation-drawer width="100%" class="bg-deep-purple" theme="dark" permanent>
          <v-list color="transparent">
            <v-list-item prepend-icon="mdi-view-dashboard" title="Schuilnamen onderhouden" @click="state.action = 'mAliases'"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Schuilnaam info onderhouden" @click="state.action = 'maInfo'"></v-list-item>
            <v-list-item prepend-icon="mdi-account-box" title="Berichten maken en versturen" @click="state.action = 'mMess'"></v-list-item>
            <v-list-item prepend-icon="mdi-gavel" title="Andere gebruikers rechten geven" @click="state.action = 'mRoles'"></v-list-item>
          </v-list>

          <template v-slot:append>
            <div class="pa-2">
              <v-btn block @click="router.replace({ path: '/' })">
                Terug
              </v-btn>
            </div>
          </template>
        </v-navigation-drawer>
      </v-row>
    </v-sheet>

    <v-row>
      <v-col v-if="state.action === 'mAliases'" cols="auto">
        <MaintainAliases @m-done="state.action = 'menu'"></MaintainAliases>
      </v-col>
      <v-col v-if="state.action === 'maInfo'" cols="auto">
        <MaintainAliasInfo @m-done="state.action = 'menu'"></MaintainAliasInfo>
      </v-col>
      <v-col v-if="state.action === 'mMess'" cols="auto">
        <MaintainMessages @m-done="state.action = 'menu'"></MaintainMessages>
      </v-col>
      <v-col v-if="state.action === 'mRoles'" cols="auto">
        <MaintainRoles @m-done="state.action = 'menu'"></MaintainRoles>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { reactive } from 'vue'
import router from '@/router'
import MaintainAliases from './MaintainAliases'
import MaintainAliasInfo from './MaintainAliasInfo'
import MaintainMessages from './MaintainMessages'
import MaintainRoles from './MaintainRoles'

const state = reactive({
  action: 'menu'
})


</script>