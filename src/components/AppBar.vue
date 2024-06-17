<template>
  <v-app-bar density="compact" color="purple">
    <v-app-bar-title class="flex text-center">Hoe goed ken je Maastricht?</v-app-bar-title>
    <v-btn v-if="store.largeScreenDetected && props.isAuthenticated && store.userData.alias === 'admin'" size="small" variant="outlined" @click="doAdmin">Admin</v-btn>
    <v-btn v-if="props.withActivator" icon id="menu-activator">
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
    <v-menu activator="#menu-activator">
      <v-list>
        <v-list-item v-if="props.isAuthenticated && aliasIsCelebrity(store.userData.alias)">
          <v-btn flat size="small" @click="emit('show-alias-info')">
            Wie was {{ store.userData.alias }}?
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="state.dialog1 = true">
            Schuilnaam en pincode
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="state.dialog2 = true">
            Stop automatisch inloggen
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
          <v-btn flat size="small" @click="router.push({ path: '/Privacybeleid' })">
            Privacybeleid
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated">
          <v-btn flat size="small" @click="state.dialog9 = true">
            Log uit
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated && store.userData.alias !== 'admin'">
          <v-btn color="pink" flat @click="state.dialog10 = true">
            Ik speel niet meer mee.<br>Verwijder mijn gegevens
          </v-btn>
        </v-list-item>
        <v-list-item v-if="props.isAuthenticated && store.userData.alias === 'admin'">
          <v-btn color="green" flat @click="router.push({ path: '/QuizResultsView' })">
            Toon de scores en de winnaars
          </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-dialog v-model="state.dialog1" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <h3>Om in te loggen op een ander apparaat hebt u nodig:</h3>
        <ul class="mx-5">
          <li>Uw schuilnaam: {{ store.userData.alias }}</li>
          <li>Uw pin code: {{ store.userData.PIN }}</li>
        </ul>
        <p class="py-2">Start de app door speelmee.app in te tikken in het adres veld van uw browser.</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog1 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog2" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <h3>Als u automatisch inloggen heeft uitgezet kunt u inloggen met:</h3>
        <ul class="mx-5">
          <li>Uw schuilnaam: {{ store.userData.alias }}</li>
          <li>Uw pin code: {{ store.userData.PIN }}</li>
        </ul>
        <v-btn class="mt-8" @click="removeCookie">Stop automatisch inloggen</v-btn>
        <h3 class="mt-4" v-if="state.cookieIsRemoved">Automatisch inloggen is uitgezet</h3>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog2 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog4" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <h2>Stuur ons een bericht als je:</h2>
        <ul class="mx-5">
          <li>Een idee hebt</li>
          <li>Wil bijdragen</li>
          <li>Een klacht hebt</li>
          <li>Gebeld wilt worden</li>
          <li>Of een andere goede reden</li>
        </ul>
        <p class="py-2">Ons e-mail adres is contact@speelmee.app</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog4 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog5" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <p>Je kunt ons bereiken op ons e-mail adres contact@speelmee.app</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog5 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog6" :max-width="store.screenWidth">
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

  <v-dialog v-model="state.dialog7" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <p>Speelmee.app is in ontwikkeling. De huidige versie is v.0.10.1</p>
        <p>De broncode is open source en is in te zien op: <a href="https://t.ly/vtCMQ">GitHub</a></p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="purple" block @click="state.dialog7 = false">Sluit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog9" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <p>In plaats van uit te loggen kunt u ook het tab blad van uw browser sluiten.
          Als u hier uitlogt stopt u ook de automatische login.</p>
        <h3>Om opnieuw in te loggen noteer deze gegevens:</h3>
        <ul class="mx-5">
          <li>Uw schuilnaam: {{ store.userData.alias }}</li>
          <li>Uw pin code: {{ store.userData.PIN }}</li>
        </ul>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions style="height: 60px;">
        <v-row>
          <v-col>
            <v-btn flat prepend-icon="mdi-arrow-left" @click="state.dialog9 = false">
              <template v-slot:prepend>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
              Terug
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="text-right">
            <v-btn flat append-icon="mdi-arrow-right" @click="logout">
              Log uit
              <template v-slot:append>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog10" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <h3>Als u uw gegevens verwijderd kunt u niet meer inloggen. Wel kunt u een nieuwe schuilnaam en pin code kiezen en fris opnieuw
          beginnen.</h3>
        <h3>UW GEGEVENS WORDEN VERNIETIGD NIEMAND KAN DIE NOG TERUGHALEN</h3>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions style="height: 60px;">
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
              Vernietig
              <template v-slot:append>
                <v-icon size="x-large" color="purple"></v-icon>
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="state.dialog11" :max-width="store.screenWidth">
    <v-card>
      <v-card-text>
        <h3>De scores en de winnaars van de afgelopen 4 weken</h3>
      </v-card-text>
      <QuizResults @return-to-menu="state.dialog11 = false"></QuizResults>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive } from 'vue'
import { useAppStore } from '../store/app.js'
import Cookies from 'universal-cookie'
import { dbRef } from '../firebase'
import { update } from 'firebase/database'
import router from '../router'
import QuizResults from './QuizResults.vue'

const store = useAppStore()

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
  },
  withActivator: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['logout-app', 'reset-app', 'app-settings', 'show-alias-info'])

const state = reactive({
  dialog1: false,
  dialog2: false,
  dialog4: false,
  dialog5: false,
  dialog6: false,
  dialog7: false,
  dialog9: false,
  dialog10: false,
  dialog11: false,
  cookieIsRemoved: false
})

function removeCookie() {
  const cookies = new Cookies()
  cookies.remove('speelMee', { sameSite: true })
  state.cookieIsRemoved = true
}

/* Remove users data, cookie and account */
function removeAccount() {
  const updates = {}
  // remove the user data
  updates[`users/${store.firebaseUser.uid}`] = null
  // update alias in use value for future use
  updates[`aliases/${store.userData.alias}/inUse`] = false
  // remove the quiz results of the current and last 9 years, if existing
  for (let n = 0; n < 10; n++) {
    updates[`quizzes/results/${store.currentYear - n}/${store.userData.alias}`] = null
  }
  // remove the users account and cookie
  update(dbRef, updates).then(() => {
    store.firebaseUser.delete().then(() => {
      removeCookie()
      state.dialog10 = false
      emit('reset-app')
    }).catch((error) => {
      state.dialog10 = false
      console.log(`Account and/or cookie deletion failed: ${error.message}`)
    })
  }).catch((error) => {
    console.log(`Removal of ${store.userData.alias} data failed: ${error.message}`)
  })
}

function aliasIsCelebrity(alias) {
  return store.aliasesObject[alias] && store.aliasesObject[alias].celebrity
}

function logout() {
  removeCookie()
  state.dialog9 = false
  emit('logout-app')
}

function doAdmin() {
  router.push({ path: 'superAdmin' })
}

</script>
