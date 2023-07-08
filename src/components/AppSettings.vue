<template>
  <v-row>
    <v-col cols="auto">
      <h3 v-if="state.newsFeed">U bent geabbonneerd op een maandelijke nieuws update.</h3>
      <h3 v-else>U bent niet geabbonneerd op een maandelijke nieuws update.</h3>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="8">
      <p> Wil je maandelijks via de app op de hoogte gehouden worden van nieuws over het speelmee.app platform?</p>
    </v-col>
    <v-col cols="4">
      <v-switch :label="newsFeedLabel" v-model="state.newsFeed"></v-switch>
    </v-col>
  </v-row>
  <v-row class="justify-start">
    <v-col cols="auto">
      <v-btn flat prepend-icon="mdi-arrow-left" @click="saveAndReturn">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { onBeforeMount, computed, reactive } from 'vue'
import { dbRef } from '../firebase'
import { child, get, update } from "firebase/database"
const props = defineProps(['firebaseUser', 'userAlias'])
const emit = defineEmits(['return-to-menu'])

// get user's profile from database
onBeforeMount(() => {
  get(child(dbRef, `users/` + props.firebaseUser.uid)).then((snapshot) => {
    if (snapshot.exists()) {
      state.newsFeed = snapshot.val().newsFeed
    } else {
      state.newsFeed = false
      console.log(`No data available. User "${props.userAlias}" unknown`)
    }
  }).catch((error) => {
    console.error(`Error while reading child "${props.userAlias}" from database: ` + error)
  })
})

const newsFeedLabel = computed(() => {
  if (state.newsFeed) return 'Ja'
  return 'Nee'
})

function saveAndReturn() {
  // save the selected value
  const updates = {}
  updates['/users/' + props.firebaseUser.uid + '/newsFeed'] = state.newsFeed
  emit('return-to-menu')
  update(dbRef, updates)
}

const state = reactive({
  newsFeed: false
})
</script>