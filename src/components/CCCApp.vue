<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <AppBar v-if="!state.showOpeningScreen" :is-authenticated="isAuthenticated" />
      <Speelmee :show-opening-screen="state.showOpeningScreen" @exit-opening-screen="state.showOpeningScreen=false"></Speelmee>
      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-card variant="text">           
            <v-form v-if="!state.showOpeningScreen" @submit.prevent>
              <div>
                <template v-if="state.userEntryMode === 'login'">
                  <v-card-title class="text-h5">login</v-card-title>
                  <v-card-subtitle>Login met uw schuilnaam en PIN code</v-card-subtitle>
                  <v-text-field v-model.trim="state.aliasSelected" label="Uw schuilnaam" :rules="state.nameRules" />
                </template>
                <template v-if="state.userEntryMode === 'signup'">
                  <v-alert v-if="state.aliasSelected !== undefined" v-model="state.alert" border="start" variant="tonal"
                    type="warning" title="Schuilnaam bezet">
                    Deze schuilnaam is al gekozen door een andere gebruiker. Kies een andere schuilnaam.
                  </v-alert>
                  <SelectAlias :assigned-user-ids="state.assignedUserIds" :all-aliases="state.allAliases"
                    @alias-selected="setSelectedAlias">
                  </SelectAlias>
                  <div class="py-2" />
                  <label>Kies een PIN code</label>
                </template>
                <v-text-field v-model.trim="state.PIN" label="PIN" :rules="state.pinRules" />
              </div>
              <v-btn v-if="state.userEntryMode === 'login' && aliasOK && PINOK && !isAuthenticated" type="submit" color="black"
                @click='doSigninUser' rounded="l" size="large">Login</v-btn>

              <v-dialog v-if="state.userEntryMode === 'signup' && aliasOK && PINOK" v-model="state.newUserDialog"
                width="auto">
                <template v-slot:activator="{ props: newUserProps }">
                  <v-btn color="black" rounded="l" size="large" v-bind="newUserProps">Maak persoonlijke schuilnaam aan</v-btn>
                </template>
                <v-card>
                  <v-card-text>
                    <h4>Welkom in de CCC app</h4>
                    <p>Uw schuilnaam is {{ state.aliasSelected }}</p>
                    <p>Uw PIN is {{ state.PIN }}</p>
                    <p>Gebruik deze schuilnaam en PIN om voortaan in te loggen</p>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" block @click="doSignupUser">Ontdek de app</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-btn v-if="!isAuthenticated" type="button" variant="text" @click="switchAuthMode">{{ switchModeButtonCaption }}</v-btn>
              <div v-if="isAuthenticated">
                <p>U bent ingelogd</p>
              </div>
              <div v-else>
                <p>U bent (nog) niet ingelogd</p>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { onBeforeMount, reactive, computed } from 'vue'
import Speelmee from './Speelmee.vue'
import SelectAlias from './SelectAlias.vue'

// import { getDatabase, ref, child, get } from "firebase/database"
import { getDatabase, ref, set, child, get } from "firebase/database"

onBeforeMount(() => {
  // get the assigned aliases
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log('snapshot.val()=' + JSON.stringify(snapshot.val(), null, 2));
      // create the array with already assigned users
      Object.keys(snapshot.val()).forEach(el => state.assignedUserIds.push(el))
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  })
})

const state = reactive({
  showOpeningScreen: true,
  userId: 'Niels',
  alert: false,
  newUserDialog: false,
  userEntryMode: 'login',
  aliasSelected: '',
  nameRules: [
    value => {
      if (state.assignedUserIds.includes(value.toUpperCase())) return true

      return 'Schuilnaam onbekend.'
    },
  ],
  PIN: '',
  pinRules: [
    value => {
      if (value) return true

      return 'Vul 4 of meer cijfers in.'
    },
    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value.length >= 4) return true

      return 'Vul minimaal 4 cijfers in.'
    },
  ],
  PINverifiedOk: false,
  allAliases: ['Alain', 'Alberto', 'Aldo', 'Alessandro', 'Alexander', 'Alfred', 'Alice', 'Alla', 'Anastasiya', 'Anatoliy', 'Andre', 'Andrea', 'Andreas', 'Andrew', 'Andriy', 'Angelo', 'Anne', 'Anthony', 'Antonio', 'Armando', 'Arthur', 'Bartolomeo', 'Bas', 'Benedetto', 'Bernard', 'Bernd', 'Bernhard', 'Bjorn', 'Bohdan', 'Bram', 'Brian', 'Bruno', 'Carl', 'Carlo', 'Caroline', 'Cas', 'Catherine', 'Charles', 'Christian', 'Christine', 'Christopher', 'Claude', 'Claudio', 'Corinne', 'Corrado', 'Daan', 'Daniel', 'Daniele', 'David', 'Davide', 'Denis', 'Dennis', 'Dieter', 'Dirk', 'Dmytro', 'Domenico', 'Donald', 'Douglas', 'Dylan', 'Edward', 'Emanuele', 'Emiliano', 'Emilio', 'Emmanuel', 'Enrico', 'Eric', 'Erich', 'Ernst', 'Fabio', 'Fabrice', 'Federico', 'Filippo', 'Florence', 'Floris', 'Francesco', 'Frank', 'Franz', 'Frederic', 'Freek', 'Fritz', 'Gabriele', 'Gaetano', 'Gary', 'Georg', 'George', 'Gerard', 'Giacomo', 'Gianni', 'Gijs', 'Gilbert', 'Giorgio', 'Giovanni', 'Giuseppe', 'Gregory', 'Günter', 'Gustav', 'Halyna', 'Hanna', 'Hans', 'Hans-Peter', 'Harold', 'Heinz', 'Helmut', 'Hendrik', 'Henk', 'Henry', 'Hermann', 'Horst', 'Ihor', 'Ingo', 'Inna', 'Iryna', 'Isabelle', 'Ivan', 'Jacob', 'Jacques', 'James', 'Jan', 'Jarno', 'Jason', 'Jean', 'Jeffrey', 'Jelle', 'Jelte', 'Jerome', 'Jerry', 'Jesse', 'Joachim', 'Joep', 'Johannes', 'John', 'Joost', 'Joris', 'Jose', 'Josef', 'Joseph', 'Joshua', 'Julie', 'Jürgen', 'Karl', 'Kateryna', 'Kenneth', 'Kevin', 'Khrystyna', 'Klaas', 'Klaus', 'Kurt', 'Larry', 'Lars', 'Larysa', 'Laurence', 'Laurens', 'Lennard', 'Lothar', 'Luc', 'Luca', 'Lucas', 'Luciano', 'Luigi', 'Lyubov', 'Lyudmyla', 'Maarten', 'Manfred', 'Marc', 'Marcello', 'Marco', 'Marie', 'Mario', 'Mariya', 'Mark', 'Markus', 'Martijn', 'Martin', 'Martine', 'Mary', 'Maryna', 'Massimo', 'Matthew', 'Matthias', 'Matthijs', 'Max', 'Michael', 'Michel', 'Milan', 'Monique', 'Mykhailo', 'Mykola', 'Myroslav', 'Nadiya', 'Nataliya', 'Nathalie', 'Nicolas', 'Nicolo', 'Niels', 'Oksana', 'Oleh', 'Oleksandr', 'Oleksiy', 'Olha', 'Orest', 'Otto', 'Paolo', 'Patrick', 'Paul', 'Pavlo', 'Peter', 'Petro', 'Philippe', 'Pierre', 'Pieter', 'Pietro', 'Raffaele', 'Raymond', 'Reinhold', 'Riccardo', 'Richard', 'Robert', 'Roberto', 'Robin', 'Roger', 'Roland', 'Rolf', 'Roman', 'Ronald', 'Ruben', 'Rudolf', 'Ryan', 'Salvatore', 'Sam', 'Sandrine', 'Scott', 'Sebastien', 'Sem', 'Sergio', 'Serhiy', 'Simone', 'Sophie', 'Stefan', 'Stefano', 'Stepan', 'Stephane', 'Stephen', 'Steven', 'Stijn', 'Sven', 'Svitlana', 'Taras', 'Tetyana', 'Teun', 'Thijs', 'Thomas', 'Tim', 'Timothy', 'Tom', 'Tommaso', 'Uliana', 'Umberto', 'Uwe', 'Vasyl', 'Viktor', 'Viktoriya', 'Vincenzo', 'Virginie', 'Volker', 'Volodymyr', 'Walter', 'Werner', 'Willem', 'Willi', 'William', 'Wolfgang', 'Wouter', 'Xavier', 'Yana', 'Yevhen', 'Yosyp', 'Yuliana', 'Yuliya', 'Yuriy', 'Yves'],
  assignedUserIds: [],
  signUpMessage: ''
})

const switchModeButtonCaption = computed(() => {
  if (state.userEntryMode === 'login') {
    return 'Ga naar nieuwe aanmelding';
  } else {
    return 'Ga naar Login';
  }
})

const PINOK = computed(() => {
  return !isNaN(state.PIN) && state.PIN.length >= 4
})

const aliasOK = computed(() => {
  if (state.aliasSelected === undefined) return false
  if (state.userEntryMode === 'login') return state.aliasSelected.length > 0 && state.assignedUserIds.includes(state.aliasSelected.toUpperCase())
  if (state.userEntryMode === 'signup') return state.aliasSelected.length > 0 && !state.assignedUserIds.includes(state.aliasSelected.toUpperCase())
})

const isAuthenticated = computed(() => {
  return PINOK && aliasOK && state.PINverifiedOk
})

function setSelectedAlias(selectedAlias) {
  if (selectedAlias === undefined) return
  state.aliasSelected = selectedAlias
  state.alert = state.assignedUserIds.includes(state.aliasSelected.toUpperCase())
}

function doSigninUser() {
  state.PINverifiedOk = false
  if (aliasOK && PINOK) {
    // get the user's PIN
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/` + state.aliasSelected.toUpperCase() + '/PIN')).then((snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.val() === state.PIN) {
          // on success
          state.PINverifiedOk = true
        }
      } else {
        console.log("No data available")
      }
    }).catch((error) => {
      console.error(error);
    })
  }
}

function doSignupUser() {
  state.newUserDialog = false

  if (aliasOK && PINOK) {
    const db = getDatabase();
    set(ref(db, 'users/' + state.aliasSelected.toUpperCase()), {
      PIN: state.PIN,
      alias: state.aliasSelected,
      subscriptionDate: Date.now()
    })
    // add new alias to current array
    state.assignedUserIds.push(state.aliasSelected.toUpperCase())

    // on success
    state.PINverifiedOk = true
  }
}

function switchAuthMode() {
  state.PIN = ''
  state.PINverifiedOk = false
  state.aliasSelected = undefined
  state.signUpMessage = ''
  if (state.userEntryMode === 'login') {
    state.userEntryMode = 'signup';
  } else {
    state.userEntryMode = 'login';
  }
}
</script>