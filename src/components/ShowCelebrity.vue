<template>
  <v-sheet class="ma-2" :max-width="store.screenWidth">
    <v-row no-gutters>
      <div v-html="state.aliasInfoContent"></div>
    </v-row>
  </v-sheet>
  <v-divider></v-divider>
  <v-row class="mt-2">
    <v-col>
      <v-btn @click="emit('return-to')" flat prepend-icon="mdi-arrow-left">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { onBeforeMount, reactive} from 'vue'
import { useAppStore } from '../store/app.js'
import { dbRef } from '../firebase'
import { child, get } from 'firebase/database'

const store = useAppStore()
const emit = defineEmits(['return-to'])

onBeforeMount(() => {
  loadAliasInfo()
})

const state = reactive({
  aliasInfoContent: {}
})

function loadAliasInfo() {
  get(child(dbRef, `aliasInfo/${store.userData.alias}`)).then((snapshot) => {
    if (snapshot.exists()) {
      state.aliasInfoContent = snapshot.val()
    } else {
      console.log(`No info for alias ${store.userData.alias} found`)
    }
  }).catch((error) => {
    console.log(`Error while loading info for alias ${store.userData.alias}: ${error.message}`)
  })
}

</script>