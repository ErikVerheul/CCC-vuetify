<template>
  <v-app-bar density="compact" color="purple">

    <template v-if="props.screenName === 'Welkom'">
      <v-app-bar-title class="flex text-center">{{ props.screenName }}</v-app-bar-title>
    </template>
    <template v-else>
      <v-app-bar-title v-if="welcomeMsg !== undefined">{{ welcomeMsg }}</v-app-bar-title>
      <v-app-bar-title>{{ props.screenName }}</v-app-bar-title>

      <v-btn v-if="props.isAuthenticated && props.userAlias === 'admin'" size="small" variant="outlined" @click="doSuperAdmin">superAdmin</v-btn>

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
            <v-btn flat size="small" @click="emit('app-settings')">
              Instellingen
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog4 = true">
              Feedback
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog5 = true">
              Contact
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog6 = true">
              Veelgestelde vragen
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog7 = true">
              Over de Speelmee app
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn flat size="small" @click="state.dialog8 = true">
              Privacybeleid
            </v-btn>
          </v-list-item>
          <v-list-item v-if="props.isAuthenticated">
            <v-btn flat size="small" @click="state.dialog9 = true">
              Log uit
            </v-btn>
          </v-list-item>
          <v-list-item v-if="props.isAuthenticated && props.userAlias !== 'admin'">
            <v-btn color="red" flat size="small" @click="state.dialog10 = true">
              Ik speel niet meer mee.<br>Verwijder mijn gegevens
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>

  <v-dialog v-model="state.dialog1" width="auto">
    <v-card>
      <v-card-text>
        <h3>Om in te loggen op een ander apparaat hebt u nodig:</h3>
        <ul>
          <li>Uw schuilnaam: {{ props.userAlias }}</li>
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
          <li>Uw schuilnaam: {{ props.userAlias }}</li>
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

  <v-dialog v-model="state.dialog4" width="auto">
    <v-card>
      <v-card-text>
        <h2>Stuur ons een bericht als je:</h2>
        <ul>
          <li>Een idee hebt</li>
          <li>Wil bijdragen</li>
          <li>Een klacht hebt</li>
          <li>Gebeld wilt worden</li>
          <li>Of een andere goede reden</li>
        </ul>
        <p>Ons e-mail adres is contact@speelmee.app</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog4 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog5" width="auto">
    <v-card>
      <v-card-text>
        <p>Je kunt ons bereiken op ons e-mail adres contact@speelmee.app</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog5 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog6" width="auto">
    <v-card>
      <v-card-text>
        <p>Vraag: Is de app wel veilig?</p>
        <p>Ja, de app is veilig omdat er geen persoonlijke gegevens worden bewaard, zoals jouw e-mail adres, of ieder ander naar jou
          indentificerend gegeven.
          Het ergste wat kan gebeuren is dat iemand anders jouw pin code raadt en namens jou gaat spelen. Mail ons naar contact@speelmee.app
          als je vermoedt dat dit is gebeurd.</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog6 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog7" width="auto">
    <v-card>
      <v-card-text>
        <p>Speelmee.app is in ontwikkeling. De huidige versie is v.0.4.0</p>
        <p>De broncode is open source en is in te zien op: <a href="https://t.ly/vtCMQ">GitHub</a></p>
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

  <v-dialog v-model="state.dialog9" width="auto">
    <v-card>
      <v-card-text>
        <p>In plaats van uit te loggen kunt u ook het tab blad van uw browser sluiten.
          Als u hier uitlogt stopt u ook de automatische login.</p>
      </v-card-text>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn flat prepend-icon="mdi-arrow-left" @click="state.dialog9 = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-col>
            <v-btn flat append-icon="mdi-arrow-right" @click="logout">
              Log uit en log opnieuw in
              <template v-slot:append>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog10" width="auto">
    <v-card>
      <v-card-text>
        <h3>Als u uw gegevens verwijderd kunt u niet meer inloggen. Wel kunt u een nieuwe schuilnaam en pin code kiezen en fris opnieuw
          beginnen.</h3>
        <h3>UW GEGEVENS WORDEN VERNIETIGD NIEMAND KAN DIE NOG TERUGHALEN</h3>
      </v-card-text>
      <v-card-actions>
        <v-row>
          <v-col>
            <v-btn flat prepend-icon="mdi-arrow-left" @click="state.dialog10 = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-col>
            <v-btn color="red" flat append-icon="mdi-arrow-right" @click="removeAccount">
              Vernietig mijn gegevens
              <template v-slot:append>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'
import Cookies from 'universal-cookie'
import { dbRef } from '../firebase'
import { child, remove } from "firebase/database"
import PrivacyBeleid from './PrivacyBeleid.vue'
import router from '@/router'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    required: true
  },
  userAlias: {
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
  },
  firebaseUser: {
    type: Object
  }
})

const emit = defineEmits(['logout-app', 'reset-app', 'app-settings'])

const welcomeMsg = computed(() => {
  if (props.isAuthenticated && props.screenName === 'Menu') {
    return 'Welkom ' + props.userAlias
  } else return undefined
})

const state = reactive({
  dialog1: false,
  dialog2: false,
  dialog4: false,
  dialog5: false,
  dialog6: false,
  dialog7: false,
  dialog8: false,
  dialog9: false,
  dialog10: false,
  cookieIsRemoved: false,
  removeAccountErrorMsg: ''
})

function removeCookie() {
  const cookies = new Cookies()
  cookies.remove('speelMee', { sameSite: true })
  state.cookieIsRemoved = true
}

function logout() {
  removeCookie()
  state.dialog9 = false
  emit('logout-app')
}

function removeAccount() {
  // must remove user data before user is no more authenticated
  remove(child(dbRef, '/users/' + props.userAlias))
  props.firebaseUser.delete().then(() => {
    removeCookie()   
    state.dialog10 = false
    emit('reset-app')
  }).catch((error) => {
    state.dialog10 = false
    state.removeAccountErrorMsg = 'Account verwijdering mislukt. De fout is: ' + error
  })
}

function doSuperAdmin() {
  router.push({ path: 'superadmin'})
}

</script>
