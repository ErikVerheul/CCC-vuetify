<template>
  <v-row v-if="PINOK">
    <v-col cols="12">
      <v-card class="mx-auto" color="yellow-lighten-3" theme="dark" max-width="350">
        <v-card-title class="text-h5">
          Welkom in de Speelmee.app
        </v-card-title>
        <v-card-text>
          Uw schuilnaam is <b>{{ props.alias }}</b><br>
          Uw PIN is <b>{{ state.pinCode }}</b><br>
          Gebruik deze schuilnaam en pin code om op een ander apparaat in te loggen.
          Op dit apparaat wordt u automatisch ingelogd totdat u de app een jaar niet hebt gebruikt.
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col cols="12">
      <h1 class="titleLine">Hallo -{{ props.alias }} </h1>
      <h3>Kies een pin code</h3>
      <v-text-field v-model.trim="state.pinCode" label="pin code" :rules="state.pinRules" />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <p>De speelmee.app neemt Privacy serieus;<br>
        daarom maken we het mogelijk alle<br>
        persoonlijke data te wissen als je geen<br>
        gebruik meer wil maken van de app.</p>
    </v-col>
  </v-row>
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
      <v-btn :disabled="!PINOK" flat append-icon="mdi-arrow-right" @click="emit('signup-continue', props.alias, state.pinCode)">
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

const props = defineProps(['alias'])
const emit = defineEmits(['signup-continue', 'exit-signup'])

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