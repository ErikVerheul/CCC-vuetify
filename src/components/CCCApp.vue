<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <AppBar :is-authenticated="isAuthenticated" />
      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-card variant="text">
            <v-form @submit.prevent>
              <div>
                <template v-if="state.userEntryMode === 'login'">
                  <v-card-title class="text-h5">login</v-card-title>
                  <v-card-subtitle>Login met uw alias en PIN code</v-card-subtitle>
                  <v-text-field v-model.trim="state.aliasSelected" label="Uw alias" :rules="state.nameRules" />
                </template>
                <template v-if="state.userEntryMode === 'signup'">
                  <v-alert v-if="state.aliasSelected !== undefined" v-model="state.alert" border="start" variant="tonal"
                    type="warning" title="Alias bezet">
                    Deze alias is al gekozen door een andere gebruiker. Kies een andere alias.
                  </v-alert>
                  <SelectAlias :assigned-aliases="state.assignedAliases" :all-aliases="state.allAliases"
                    @alias-selected="setSelectedAlias">
                  </SelectAlias>
                  <div class="py-2" />
                  <label>Kies een PIN code</label>
                </template>
                <v-text-field v-model.trim="state.PIN" label="PIN" :rules="state.pinRules" />
              </div>
              <v-btn v-if="state.userEntryMode === 'login' && aliasOK && PINOK" type="submit" color="black"
                @click='doSigninUser' rounded="l" size="large">Login</v-btn>

              <v-dialog v-if="state.userEntryMode === 'signup' && aliasOK && PINOK" v-model="state.newUserDialog"
                width="auto">
                <template v-slot:activator="{ props: newUserProps }">
                  <v-btn color="black" rounded="l" size="large" v-bind="newUserProps">Maak persoonlijke alias aan</v-btn>
                </template>
                <v-card>
                  <v-card-text>
                    <h4>Welkom in de CCC app</h4>
                    <p>Uw alias is {{ state.aliasSelected }}</p>
                    <p>Uw PIN is {{ state.PIN }}</p>
                    <p>Gebruik deze alias en PIN om voortaan in te loggen</p>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" block @click="doSignupUser">Ontdek de app</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-btn type="button" variant="text" @click="switchAuthMode">{{ switchModeButtonCaption }}</v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>

      <div class="py-14" />

      <v-img height="300" src="@/assets/logo.svg" />

      <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>

      <h1 class="text-h2 font-weight-bold">Vuetify</h1>

      <div class="py-14" />

      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-btn href="https://vuetifyjs.com/components/all/" min-width="164" rel="noopener noreferrer" target="_blank"
            variant="text">
            <v-icon icon="mdi-view-dashboard" size="large" start />

            Components
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn color="primary" href="https://vuetifyjs.com/introduction/why-vuetify/#feature-guides" min-width="228"
            rel="noopener noreferrer" size="x-large" target="_blank" variant="flat">
            <v-icon icon="mdi-speedometer" size="large" start />

            Get Started
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn href="https://community.vuetifyjs.com/" min-width="164" rel="noopener noreferrer" target="_blank"
            variant="text">
            <v-icon icon="mdi-account-group" size="large" start />

            Community
          </v-btn>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { onBeforeMount,reactive, computed } from 'vue'
import SelectAlias from './SelectAlias.vue'

// import { getDatabase, ref, child, get } from "firebase/database"
import { getDatabase, ref, set, child, get } from "firebase/database"

onBeforeMount(() => {
  // get the assigned aliases
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log('snapshot.val()=' + JSON.stringify(snapshot.val(), null, 2));
      // create the array with already assigned users in lowercase
      Object.keys(snapshot.val()).forEach(el => state.assignedAliases.push(el.toLowerCase()))
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  })
})

const state = reactive({
  userId: 'Niels',
  alert: false,
  newUserDialog: false,
  userEntryMode: 'login',
  aliasSelected: '',
  nameRules: [
    value => {
      if (state.assignedAliases.includes(value.toLowerCase())) return true

      return 'Alias onbekend.'
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
  isAuthenticated: false,
  allAliases: ['Alain', 'Alberto', 'Aldo', 'Alessandro', 'Alexander', 'Alfred', 'Alice', 'Alla', 'Anastasiya', 'Anatoliy', 'Andre', 'Andrea', 'Andreas', 'Andrew', 'Andriy', 'Angelo', 'Anne', 'Anthony', 'Antonio', 'Armando', 'Arthur', 'Bartolomeo', 'Bas', 'Benedetto', 'Bernard', 'Bernd', 'Bernhard', 'Bjorn', 'Bohdan', 'Bram', 'Brian', 'Bruno', 'Carl', 'Carlo', 'Caroline', 'Cas', 'Catherine', 'Charles', 'Christian', 'Christine', 'Christopher', 'Claude', 'Claudio', 'Corinne', 'Corrado', 'Daan', 'Daniel', 'Daniele', 'David', 'Davide', 'Denis', 'Dennis', 'Dieter', 'Dirk', 'Dmytro', 'Domenico', 'Donald', 'Douglas', 'Dylan', 'Edward', 'Emanuele', 'Emiliano', 'Emilio', 'Emmanuel', 'Enrico', 'Eric', 'Erich', 'Ernst', 'Fabio', 'Fabrice', 'Federico', 'Filippo', 'Florence', 'Floris', 'Francesco', 'Frank', 'Franz', 'Frederic', 'Freek', 'Fritz', 'Gabriele', 'Gaetano', 'Gary', 'Georg', 'George', 'Gerard', 'Giacomo', 'Gianni', 'Gijs', 'Gilbert', 'Giorgio', 'Giovanni', 'Giuseppe', 'Gregory', 'Günter', 'Gustav', 'Halyna', 'Hanna', 'Hans', 'Hans-Peter', 'Harold', 'Heinz', 'Helmut', 'Hendrik', 'Henk', 'Henry', 'Hermann', 'Horst', 'Ihor', 'Ingo', 'Inna', 'Iryna', 'Isabelle', 'Ivan', 'Jacob', 'Jacques', 'James', 'Jan', 'Jarno', 'Jason', 'Jean', 'Jeffrey', 'Jelle', 'Jelte', 'Jerome', 'Jerry', 'Jesse', 'Joachim', 'Joep', 'Johannes', 'John', 'Joost', 'Joris', 'Jose', 'Josef', 'Joseph', 'Joshua', 'Julie', 'Jürgen', 'Karl', 'Kateryna', 'Kenneth', 'Kevin', 'Khrystyna', 'Klaas', 'Klaus', 'Kurt', 'Larry', 'Lars', 'Larysa', 'Laurence', 'Laurens', 'Lennard', 'Lothar', 'Luc', 'Luca', 'Lucas', 'Luciano', 'Luigi', 'Lyubov', 'Lyudmyla', 'Maarten', 'Manfred', 'Marc', 'Marcello', 'Marco', 'Marie', 'Mario', 'Mariya', 'Mark', 'Markus', 'Martijn', 'Martin', 'Martine', 'Mary', 'Maryna', 'Massimo', 'Matthew', 'Matthias', 'Matthijs', 'Max', 'Michael', 'Michel', 'Milan', 'Monique', 'Mykhailo', 'Mykola', 'Myroslav', 'Nadiya', 'Nataliya', 'Nathalie', 'Nicolas', 'Nicolo', 'Niels', 'Oksana', 'Oleh', 'Oleksandr', 'Oleksiy', 'Olha', 'Orest', 'Otto', 'Paolo', 'Patrick', 'Paul', 'Pavlo', 'Peter', 'Petro', 'Philippe', 'Pierre', 'Pieter', 'Pietro', 'Raffaele', 'Raymond', 'Reinhold', 'Riccardo', 'Richard', 'Robert', 'Roberto', 'Robin', 'Roger', 'Roland', 'Rolf', 'Roman', 'Ronald', 'Ruben', 'Rudolf', 'Ryan', 'Salvatore', 'Sam', 'Sandrine', 'Scott', 'Sebastien', 'Sem', 'Sergio', 'Serhiy', 'Simone', 'Sophie', 'Stefan', 'Stefano', 'Stepan', 'Stephane', 'Stephen', 'Steven', 'Stijn', 'Sven', 'Svitlana', 'Taras', 'Tetyana', 'Teun', 'Thijs', 'Thomas', 'Tim', 'Timothy', 'Tom', 'Tommaso', 'Uliana', 'Umberto', 'Uwe', 'Vasyl', 'Viktor', 'Viktoriya', 'Vincenzo', 'Virginie', 'Volker', 'Volodymyr', 'Walter', 'Werner', 'Willem', 'Willi', 'William', 'Wolfgang', 'Wouter', 'Xavier', 'Yana', 'Yevhen', 'Yosyp', 'Yuliana', 'Yuliya', 'Yuriy', 'Yves'],
  // note that assignedAliases must be converted to lowercase
  assignedAliases: [],
  signInMessage: '',
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
  if (state.userEntryMode === 'login') return state.aliasSelected.length > 0 && state.assignedAliases.includes(state.aliasSelected.toLowerCase())
  if (state.userEntryMode === 'signup') return state.aliasSelected.length > 0 && !state.assignedAliases.includes(state.aliasSelected.toLowerCase())
})

function setSelectedAlias(selectedAlias) {
  if (selectedAlias === undefined) return
  state.aliasSelected = selectedAlias
  state.alert = state.assignedAliases.includes(state.aliasSelected.toLowerCase())
  console.log('CCCapp: selected alias=' + state.aliasSelected)
}

function doSigninUser() {
  state.signInMessage = 'alias OK= ' + aliasOK + ', PIN OK = ' + PINOK

  // on success
  state.isAuthenticated = true
}

function doSignupUser() {
  state.newUserDialog = false

  if (aliasOK && PINOK) {
    const db = getDatabase();
    set(ref(db, 'users/' + state.aliasSelected), {
      PIN: state.PIN,
      subscriptionDate: Date.now()
    })
    // add new alias to current array
    state.assignedAliases.push(state.aliasSelected.toLowerCase())

    // on success signin user
    state.isAuthenticated = true
    console.log('CCCapp: sucessfully subsribed user with alias ' + state.aliasSelected)
  }
}

function switchAuthMode() {
  state.isAuthenticated = false
  state.PIN = ''
  state.aliasSelected = undefined
  state.signInMessage = ''
  state.signUpMessage = ''
  if (state.userEntryMode === 'login') {
    state.userEntryMode = 'signup';
  } else {
    state.userEntryMode = 'login';
  }
}
</script>