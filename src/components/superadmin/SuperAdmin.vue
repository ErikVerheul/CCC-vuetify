<template>
  <ToolBar @aliassen-onderhouden="maintainAliases"></ToolBar>
  <MaintainAliases></MaintainAliases>
</template>

<script setup>
import ToolBar from './ToolBar.vue'
import MaintainAliases from './MaintainAliases'


function maintainAliases() {
  console.log('maintainAliases')
}


</script>