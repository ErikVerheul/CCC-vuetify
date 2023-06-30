<template>
  <ToolBar></ToolBar>
</template>

<script setup>
import { onBeforeMount, reactive, computed, watch } from 'vue'
import { dbRef } from '../../firebase'
import { child, get, update } from "firebase/database"
import ToolBar from './ToolBar.vue'


</script>