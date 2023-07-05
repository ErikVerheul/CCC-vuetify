<template>
  <ToolBar @aliassen-onderhouden="maintainAliases"></ToolBar>
  <v-row align="start" no-gutters>
    <v-container>
      <v-col cols="auto">
        <MaintainAliases></MaintainAliases>
      </v-col>
    </v-container>
  </v-row>
</template>

<script setup>
import ToolBar from './ToolBar.vue'
import MaintainAliases from './MaintainAliases'


function maintainAliases() {
  console.log('maintainAliases')
}


</script>