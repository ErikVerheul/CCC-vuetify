<template>
  <v-card color="grey-lighten-4" flat height="200px" rounded="0">
    <v-toolbar density="compact" color="purple">

      <v-toolbar-title>Welkom SuperAdmin</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon id="menu-activator">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>

      <v-menu activator="#menu-activator">
        <v-list>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog1 = true">
              Aliassen onderhouden
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog2 = true">
              Berichten maken en versturen
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog3 = true">
              Andere gebruikers rechten geven
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </v-card>
</template>

<script setup>
import { computed, reactive } from 'vue'

const state = reactive({
  dialog1: false,
  dialog2: false,
  dialog3: false,
})

</script>