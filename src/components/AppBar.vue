<template>
  <v-app-bar density="compact" color="teal-darken-4" image="https://picsum.photos/1920/1080?random">
    <template v-slot:image>
      <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
    </template>

    <!-- <template v-slot:prepend>
      <v-app-bar-nav-icon variant="text" @click.stop="state.drawer = !state.drawer"></v-app-bar-nav-icon>
    </template> -->

    <v-app-bar-title>{{ welcomeMsg }}</v-app-bar-title>
    <v-app-bar-title>{{ schermNaam }}</v-app-bar-title>

    <!-- <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-heart</v-icon>
    </v-btn> -->

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
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="">
            Logout
          </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <!-- <v-navigation-drawer v-if="props.isAuthenticated" v-model="state.drawer" location="top" temporary>
    <v-list :items="state.items"></v-list>
  </v-navigation-drawer> -->

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
        <h3 v-if="state.cookieIsRemoved">Automatisch inloggen is uitgezet</h3>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog2 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog7" width="auto">
    <v-card>
      <v-card-text>
        Speelmee.app is in ontwikkeling. De huidige versie is v.0.1.2
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog7 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'
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
    required: true
  },
  schermNaam: {
    type: String,
    required: true
  }
})

const welcomeMsg = computed(() => {
  if (props.isAuthenticated) {
    return 'Welkom ' + props.userName
  }
})

const state = reactive({
  dialog1: false,
  dialog2: false,
  dialog7: false,
  drawer: undefined,
  cookieIsRemoved: false,
  items: [
    {
      title: 'Foo',
      value: 'foo',
    },
    {
      title: 'Bar',
      value: 'bar',
    },
    {
      title: 'Fizz',
      value: 'fizz',
    },
    {
      title: 'Buzz',
      value: 'buzz',
    },
  ],
})

function removeCookie() {
  const cookies = new Cookies()
    cookies.remove('speelMee', { sameSite: true })
    state.cookieIsRemoved = true
}

</script>
