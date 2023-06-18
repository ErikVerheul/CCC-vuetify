<template>
  <v-app-bar density="compact" color="purple">

    <v-app-bar-title v-if="welcomeMsg !== undefined">{{ welcomeMsg }}</v-app-bar-title>
    <v-app-bar-title>{{ screenName }}</v-app-bar-title>

    <v-btn icon id="menu-activator">
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>

    <v-menu activator="#menu-activator">
      <v-list>       
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="state.dialog1 = true">
            Inloggen op ander apparaat
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="state.dialog2 = true">
            Stop automatisch inloggen
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="">
            Instellingen
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn flat size="small" @click="">
            Feedback
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn flat size="small" @click="">
            Contact
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn flat size="small" @click="">
            Hulp
          </v-btn>
        </v-list-item>      
        <v-list-item>
          <v-btn flat size="small" @click="state.dialog7 = true">
            Over de Speelmee app
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn flat size="small" @click="state.dialog8 = true">
            privacybeleid
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="">
            Logout
          </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-dialog v-model="state.dialog1" width="auto">
    <v-card>
      <v-card-text>
        <h3>Om in te loggen op een ander apparaat hebt u nodig:</h3>
        <ul>
          <li>Uw schuilnaam: {{ props.userName }}</li>
          <li>Uw pin code: {{ props.PIN }}</li>
        </ul>
        <p>Start de app door speelmee.app in te tikken in het adres veld van uw browser.</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog1 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog2" width="auto">
    <v-card>
      <v-card-text>
        <h3>Als u automatisch inloggen heeft uitgezet kunt u inloggen met:</h3>
        <ul>
          <li>Uw schuilnaam: {{ props.userName }}</li>
          <li>Uw pin code: {{ props.PIN }}</li>
        </ul>
        <v-btn class="mt-8" @click="removeCookie">Stop automatisch inloggen</v-btn>
        <h3 class="mt-4" v-if="state.cookieIsRemoved">Automatisch inloggen is uitgezet</h3>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog2 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog7" width="auto">
    <v-card>
      <v-card-text>
        Speelmee.app is in ontwikkeling. De huidige versie is v.0.1.3
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog7 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog8" width="auto">
    <v-card class="pa-3">
      <PrivacyBeleid :show-privacy-screen="state.dialog8" @exit-privacy-screen="state.dialog8 = false" />
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'
import PrivacyBeleid from './PrivacyBeleid.vue'
import Cookies from 'universal-cookie'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    required: true
  },
  userName: {
    type: String,
    default: undefined
  },
  PIN: {
    type: String,
    default: undefined
  },
  screenName: {
    type: String,
    required: true
  }
})

const welcomeMsg = computed(() => {
  if (props.isAuthenticated) {
    return 'Welkom ' + props.userName
  } else return undefined
})

const state = reactive({
  dialog1: false,
  dialog2: false,
  dialog7: false,
  dialog8:false,
  drawer: undefined,
  cookieIsRemoved: false,
})

function removeCookie() {
  const cookies = new Cookies()
    cookies.remove('speelMee', { sameSite: true })
    state.cookieIsRemoved = true
}

</script>
