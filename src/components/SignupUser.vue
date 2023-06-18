<template>
  <v-sheet width="480px">
    <v-row>
      <v-col cols="12">
        <h1 class="titleLine">Hallo -{{ props.alias }} </h1>
        <h3>Kies een pin code</h3>
        <v-text-field v-model.trim="state.pinCode" label="PIN" :rules="state.pinRules" />
      </v-col>
    </v-row>
    <v-row class="justify-start">
      <v-col cols="auto">
        <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('exit-signup')">
          <template v-slot:prepend>
            <v-icon size="x-large" color="purple"></v-icon>
          </template>
          Terug
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>

  <v-dialog v-if="PINOK" width="auto">
    <template v-slot:activator="{ props: newUserProps }">
      <v-btn color="black" rounded="l" size="large" v-bind="newUserProps">Maak persoonlijke schuilnaam aan</v-btn>
    </template>
    <v-card>
      <v-card-text>
        <h4>Welkom in de Speelmee.app</h4>
        <p>Uw schuilnaam is {{ props.alias }}</p>
        <p>Uw PIN is {{ state.pinCode }}</p>
        <p>Gebruik deze schuilnaam en PIN om op een ander apparaat in te loggen</p>
        <p>Op dit apparaat wordt u automatisch ingelogd totdat u de app een jaar niet hebt gebruikt</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" block @click="doSignupUser">Ontdek de app</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { getDatabase, ref, set } from "firebase/database"
import Cookies from 'universal-cookie'

const props = defineProps(['alias'])
const emit = defineEmits(['signup-completed', 'exit-signup'])

const state = reactive({
  pinCode: '',
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
  ]
})

const PINOK = computed(() => {
  return !isNaN(state.pinCode) && state.pinCode.length >= 4
})

function doSignupUser() {
  const db = getDatabase();
  set(ref(db, 'users/' + props.alias.toUpperCase()), {
    PIN: state.pinCode,
    alias: props.alias,
    subscriptionDate: Date.now()
  })
  // on success
  const cookies = new Cookies()
  cookies.set('speelMee', { user: props.alias.toUpperCase() }, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: true })
  emit('signup-completed', props.alias, state.pinCode)
}

</script>

<style scoped>
.titleLine {
  text-align: left;
}
</style>