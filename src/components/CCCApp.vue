<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <app-bar :is-authenticated="matchGevonden"></app-bar>
      <base-card>
        <form @submit.prevent="submitForm">
          <div class="form-control">         
            <template v-if="userEntryMode === 'login'">
              <label for="schuilNaam">Uw schuilnaam</label>
              <input type="text" id="schuilNaam" v-model.trim="schuilNaam"/>
            </template>
            <template v-if="userEntryMode === 'signup'">
              <p>Beschikbare letters: {{ allowedCharacters }}</p>
              <label v-if="!matchGevonden" for="schuilNaamId">Kies uw schuilnaam</label>
              <label v-if="matchGevonden" for="schuilNaamId">Kies uw schuilnaam ✅ gevonden</label>
              <input type="text" id="schuilNaamId" v-model.trim="schuilNaam" @keypress="filterInput($event)" />
            </template>
          </div>
          <div class="form-control">
            <label v-if="userEntryMode === 'login'" for="passwordId">Wachtwoord</label>
            <label v-if="userEntryMode === 'signup'" for="passwordId">Kies een wachtwoord van 6 of meer tekens</label>
            <input type="password" id="passwordId" v-model.trim="password" />
          </div>
          <p v-if="!formIsValid">Schuilnaam en wachtwoord combinatie onjuist.</p>
          <base-button>{{ submitButtonCaption }}</base-button>
          <base-button type="button" mode="flat" @click="switchAuthMode">{{ switchModeButtonCaption }}</base-button>
        </form>
      </base-card>


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
      lastKey: '',
      schuilNaam: '',
      allowedChars: '',
      matchGevonden: false,
      alleSchuilnamen: ['Alain', 'Alberto', 'Aldo', 'Alessandro', 'Alexander', 'Alfred', 'Alice', 'Alla', 'Anastasiya', 'Anatoliy', 'Andre', 'Andrea', 'Andreas', 'Andrew', 'Andriy', 'Angelo', 'Anne', 'Anthony', 'Antonio', 'Armando', 'Arthur', 'Bartolomeo', 'Bas', 'Benedetto', 'Bernard', 'Bernd', 'Bernhard', 'Bjorn', 'Bohdan', 'Bram', 'Brian', 'Bruno', 'Carl', 'Carlo', 'Caroline', 'Cas', 'Catherine', 'Charles', 'Christian', 'Christine', 'Christopher', 'Claude', 'Claudio', 'Corinne', 'Corrado', 'Daan', 'Daniel', 'Daniele', 'David', 'Davide', 'Denis', 'Dennis', 'Dieter', 'Dirk', 'Dmytro', 'Domenico', 'Donald', 'Douglas', 'Dylan', 'Edward', 'Emanuele', 'Emiliano', 'Emilio', 'Emmanuel', 'Enrico', 'Eric', 'Erich', 'Ernst', 'Fabio', 'Fabrice', 'Federico', 'Filippo', 'Florence', 'Floris', 'Francesco', 'Frank', 'Franz', 'Frederic', 'Freek', 'Fritz', 'Gabriele', 'Gaetano', 'Gary', 'Georg', 'George', 'Gerard', 'Giacomo', 'Gianni', 'Gijs', 'Gilbert', 'Giorgio', 'Giovanni', 'Giuseppe', 'Gregory', 'Günter', 'Gustav', 'Halyna', 'Hanna', 'Hans', 'Hans-Peter', 'Harold', 'Heinz', 'Helmut', 'Hendrik', 'Henk', 'Henry', 'Hermann', 'Horst', 'Ihor', 'Ingo', 'Inna', 'Iryna', 'Isabelle', 'Ivan', 'Jacob', 'Jacques', 'James', 'Jan', 'Jarno', 'Jason', 'Jean', 'Jeffrey', 'Jelle', 'Jelte', 'Jerome', 'Jerry', 'Jesse', 'Joachim', 'Joep', 'Johannes', 'John', 'Joost', 'Joris', 'Jose', 'Josef', 'Joseph', 'Joshua', 'Julie', 'Jürgen', 'Karl', 'Kateryna', 'Kenneth', 'Kevin', 'Khrystyna', 'Klaas', 'Klaus', 'Kurt', 'Larry', 'Lars', 'Larysa', 'Laurence', 'Laurens', 'Lennard', 'Lothar', 'Luc', 'Luca', 'Lucas', 'Luciano', 'Luigi', 'Lyubov', 'Lyudmyla', 'Maarten', 'Manfred', 'Marc', 'Marcello', 'Marco', 'Marie', 'Mario', 'Mariya', 'Mark', 'Markus', 'Martijn', 'Martin', 'Martine', 'Mary', 'Maryna', 'Massimo', 'Matthew', 'Matthias', 'Matthijs', 'Max', 'Michael', 'Michel', 'Milan', 'Monique', 'Mykhailo', 'Mykola', 'Myroslav', 'Nadiya', 'Nataliya', 'Nathalie', 'Nicolas', 'Nicolo', 'Niels', 'Oksana', 'Oleh', 'Oleksandr', 'Oleksiy', 'Olha', 'Orest', 'Otto', 'Paolo', 'Patrick', 'Paul', 'Pavlo', 'Peter', 'Petro', 'Philippe', 'Pierre', 'Pieter', 'Pietro', 'Raffaele', 'Raymond', 'Reinhold', 'Riccardo', 'Richard', 'Robert', 'Roberto', 'Robin', 'Roger', 'Roland', 'Rolf', 'Roman', 'Ronald', 'Ruben', 'Rudolf', 'Ryan', 'Salvatore', 'Sam', 'Sandrine', 'Scott', 'Sebastien', 'Sem', 'Sergio', 'Serhiy', 'Simone', 'Sophie', 'Stefan', 'Stefano', 'Stepan', 'Stephane', 'Stephen', 'Steven', 'Stijn', 'Sven', 'Svitlana', 'Taras', 'Tetyana', 'Teun', 'Thijs', 'Thomas', 'Tim', 'Timothy', 'Tom', 'Tommaso', 'Uliana', 'Umberto', 'Uwe', 'Vasyl', 'Viktor', 'Viktoriya', 'Vincenzo', 'Virginie', 'Volker', 'Volodymyr', 'Walter', 'Werner', 'Willem', 'Willi', 'William', 'Wolfgang', 'Wouter', 'Xavier', 'Yana', 'Yevhen', 'Yosyp', 'Yuliana', 'Yuliya', 'Yuriy', 'Yves'],
      gekozenSchuilnamen: ['Jelle', 'Pieter', 'Jan'],

      password: '',
      formIsValid: true,
      userEntryMode: 'login',
      isLoading: false,
      error: null,
    }
  },

  computed: {
    allowedCharacters() {
      let index = this.schuilNaam.length
      let allowedChars = ''
      this.alleSchuilnamen.forEach(item => {
        if (!this.gekozenSchuilnamen.includes(item)) {
          if (item.startsWith(this.schuilNaam)) {
            const letter = item.charAt(index)
            // add new letter if not already in letters
            if (allowedChars.indexOf(letter) === -1) allowedChars += item.charAt(index)
          }
        }
      })
      return allowedChars
    },

    submitButtonCaption() {
      if (this.userEntryMode === 'login') {
        return 'Login';
      } else {
        return 'Nieuwe aanmelding';
      }
    },
    switchModeButtonCaption() {
      if (this.userEntryMode === 'login') {
        return 'Ga naar nieuwe aanmelding';
      } else {
        return 'Ga naar Login';
      }
    },
  },

  methods: {
    filterInput(e) {
      console.log('e=' + e)
      console.log('e=' + JSON.stringify(e, null, 2))
      console.log('e.key=' + JSON.stringify(e.key, null, 2))
      if (e && e.key !== 'Backspace') {    
        this.lastKey = e.key
        if (!this.allowedCharacters.includes(e.key) || /^\W$/.test(e.key)) {
          // a non-allowed char or a special character was entered; skip it
          e.preventDefault();
        }
      }
    },

    async submitForm() {
      console.log('submitForm')
      this.formIsValid = true
      if (
        !this.matchGevonden ||
        this.password.length < 6
      ) {
        this.formIsValid = false;
        return
      }
    },

    switchAuthMode() {
      this.matchGevonden = false
      this.password = ''
      this.schuilNaam = ''
      if (this.userEntryMode === 'login') {
        this.userEntryMode = 'signup';
      } else {
        this.userEntryMode = 'login';
      }
    },
  },

  watch: {
    schuilNaam(val) {
      if (this.userEntryMode === 'login') this.matchGevonden = this.gekozenSchuilnamen.includes(val)
      if (this.userEntryMode === 'signup') this.matchGevonden = (!this.gekozenSchuilnamen.includes(val) && this.alleSchuilnamen.includes(val))
    }
  }
}
</script>

<style scoped>
form {
  margin: 1rem;
  padding: 1rem;
}

.form-control {
  margin: 0.5rem 0;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

input,
textarea {
  display: block;
  width: 100%;
  font: inherit;
  border: 1px solid #ccc;
  padding: 0.15rem;
}

input:focus,
textarea:focus {
  border-color: #3d008d;
  background-color: #faf6ff;
  outline: none;
}
</style>