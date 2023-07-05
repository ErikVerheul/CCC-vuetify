<template>
  <v-card color="grey-lighten-4" flat rounded="0">
    <v-toolbar density="compact" color="purple">

      <v-toolbar-title>Welkom SuperAdmin</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon id="menu-activator">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>

      <v-menu activator="#menu-activator">
        <v-list>
          <v-list-item>
            <v-btn flat size="small" @click="emit('aliassen-onderhouden')">
              Aliassen onderhouden
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="emit('berichten-maken-en-versturen')">
              Berichten maken en versturen
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="emit('andere-gebruikers-rechten-geven')">
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
const emit = defineEmits(['aliassen-onderhouden', 'berichten-maken-en-versturen', 'andere-gebruikers-rechten-geven'])

</script>