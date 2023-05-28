<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <app-bar :is-authenticated="isAuthenticated"></app-bar>
      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-card variant="text">
            <v-form @submit.prevent>
              <div>
                <template v-if="userEntryMode === 'login'">
                  <v-card-title class="text-h5">login</v-card-title>
                  <v-card-subtitle>Login met uw alias en PIN code</v-card-subtitle>
                  <v-text-field v-model.trim="alias" label="Uw alias" :rules="nameRules" />
                </template>
                <template v-if="userEntryMode === 'signup'">
                  <v-alert v-model="alert" border="start" variant="tonal" type="warning" title="Alias bezet">
                    Deze alias is al gekozen door een andere gebruiker. Kies een andere alias.
                  </v-alert>
                  <select-alias :assigned-aliases="assignedAliases" :all-aliases="allAliases"
                    @alias-selected="setSelectedAlias">
                  </select-alias>
                  <div class="py-2" />
                  <label>Kies een PIN code</label>
                </template>
                <v-text-field v-model.trim="PIN" label="PIN" :rules="pinRules" />
              </div>
              <v-btn v-if="userEntryMode === 'login'" type="submit" color="black" @click='doSigninUser' rounded="l"
                size="large">Login</v-btn>
              <v-btn v-if="userEntryMode === 'signup'" type="submit" color="black" @click='doSignupUser' rounded="l"
                size="large">Maak persoonlijke alias aan</v-btn>
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

<script>
import AppBar from './AppBar.vue'
export default {
  data() {
    return {
      alert: true,
      userEntryMode: 'login',
      selectedAlias: undefined,
      formIsValid: false,
      alias: '',
      nameRules: [
        value => {
          if (this.assignedAliases.includes(value)) return true

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
      assignedAliases: ['Jelle', 'Pieter', 'Jan'],

      signInMessage: '',
      signUpMessage: ''
    }
  },

  computed: {
    switchModeButtonCaption() {
      if (this.userEntryMode === 'login') {
        return 'Ga naar nieuwe aanmelding';
      } else {
        return 'Ga naar Login';
      }
    },
    PINOK() {
      return !isNaN(this.PIN) && this.PIN.length >= 4
    },

    aliasOK() {
      if (this.userEntryMode === 'login') return this.alias.length > 0 && this.assignedAliases.includes(this.alias)
      if (this.userEntryMode === 'signup') return this.alias.length > 0 && !this.assignedAliases.includes(this.alias)
    }
  },

  methods: {
    setSelectedAlias(selectedAlias) {
      this.alias = selectedAlias
      this.alert = this.assignedAliases.includes(this.alias)
      console.log('CCCapp: selected alias=' + this.alias)
    },

    doSigninUser() {
      this.signInMessage = 'alias OK= ' + this.aliasOK + ', PIN OK = ' + this.PINOK

      // on success
      this.isAuthenticated = true
    },

    doSignupUser() {
      this.signUpMessage = 'alias OK= ' + this.aliasOK + ', PIN OK = ' + this.PINOK

      // on success signin user
      this.isAuthenticated = true
    },

    switchAuthMode() {
      this.isAuthenticated = false
      this.PIN = ''
      this.PINOK = false
      this.alias = ''
      this.aliasOK = false,
        this.signInMessage = ''
      this.signUpMessage = ''
      if (this.userEntryMode === 'login') {
        this.userEntryMode = 'signup';
      } else {
        this.userEntryMode = 'login';
      }
    },
  }
}
</script>