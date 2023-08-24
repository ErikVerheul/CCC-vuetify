<template>
  <v-row v-if="PINOK">
    <v-col cols="12">
      <v-card class="mx-auto" color="yellow-lighten-3" theme="dark"  :max-width="store.screenWidth">
        <v-card-title class="text-h5">
          Welkom in de Speelmee.app
        </v-card-title>
        <v-card-text>
          Uw schuilnaam is <b>{{ store.userData.alias }}</b><br>
          Uw PIN is <b>{{ store.userData.PIN }}</b>
          <p>Gebruik deze schuilnaam en pin code om op een ander apparaat in te loggen.<br>
            Op dit apparaat wordt u automatisch ingelogd totdat u de app een jaar niet hebt gebruikt.</p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else>
    <v-sheet class="ma-2">
      <v-col cols="12">
        <h1 class="titleLine">Hallo -{{ store.userData.alias }} </h1>
        <h3>Kies een pin code</h3>
        <v-text-field v-model.trim="store.userData.PIN" label="pin code" :rules="state.pinRules" />
      </v-col>
    </v-sheet>
  </v-row>

  <v-sheet class="pa-2" :max-width="store.screenWidth">
    <v-row>
      <v-col cols="12">
        <h4>De speelmee.app neemt uw privacy serieus.</h4>
        <p>Daarom maken we het mogelijk alle persoonlijke data te wissen als je geen gebruik meer wil maken van de app.</p>
      </v-col>
    </v-row>
  </v-sheet>
  <v-divider class="mb-5"></v-divider>
  <v-row>
    <v-col>
      <v-btn flat prepend-icon="mdi-arrow-left" @click="emit('exit-signup')">
        <template v-slot:prepend>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
        Terug
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>
    <v-col>
      <v-btn :disabled="!PINOK" flat append-icon="mdi-arrow-right" @click="emit('signup-continue')">
        Door
        <template v-slot:append>
          <v-icon size="x-large" color="purple"></v-icon>
        </template>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useAppStore } from '../store/app.js'

const emit = defineEmits(['signup-continue', 'exit-signup'])
const store = useAppStore()

const state = reactive({
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
      if (value && value.length >= 4) return true

      return 'Vul minimaal 4 cijfers in.'
    },
  ]
})

const PINOK = computed(() => {
  return !isNaN(store.userData.PIN) && store.userData.PIN.length >= 4
})

const newsFeedLabel = computed(() => {
  if (state.newsFeed) return 'Ja'
  return 'Nee'
})

</script>

<style scoped>
.titleLine {
  text-align: left;
}
</style>