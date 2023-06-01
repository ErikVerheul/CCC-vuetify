<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
     <span>{{ todo.text }}</span>
    </li>
  </ul>
</template>

<script setup>
import { useDatabaseList } from 'vuefire'
import { ref as dbRef } from 'firebase/database'

const todos = useDatabaseList(dbRef(db, 'todos'))
</script>