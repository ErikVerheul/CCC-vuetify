<template>
  <v-card width="store.screenWidth">
    <v-card-title>De app meld een probleem</v-card-title>
    <v-card-text>
      <p><b>Probleem:</b> {{ store.problemText }}</p>
      <p><b>Oorzaak:</b> {{ store.problemCause }}</p>
      <p v-if="store.tipToResolve"><b>Mogelijke oplossing:</b> {{ store.tipToResolve }}</p>
    </v-card-text>
    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn prepend-icon="mdi-arrow-left" @click="quitApp">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            STOP
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useAppStore } from '../store/app.js'
import Cookies from 'universal-cookie'

const store = useAppStore()
const cookies = new Cookies()

/* An emergency exit without attempt to signout */
function quitApp() {
  cookies.remove(`speelMee${store.userData.alias}`, { sameSite: true })
  // reset the app
  location.reload(true)
}

</script>