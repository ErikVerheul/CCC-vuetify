<template> 
  <v-row class="d-flex align-center">
    <v-col cols="auto">
      <p class="mb-4">Laatste login: {{ createDateTimeString() }}</p>
      <h2>Hoe goed ken ik</h2>
      <ul>
        <li>
          <v-btn class="my-2" size="small" @click="emit('menu-item-selected', 'verborgenVerhalen')">
            De verborgen verhalen van Maastricht
          </v-btn>
        </li>
        <li>
          <v-btn class="my-2" size="small" @click="">
            Natuurhistorie en biodiversiteit
          </v-btn>
        </li>
        <li>
          <v-btn class="my-2" size="small" @click="">
            Natuur in en rond Maastricht
          </v-btn>
        </li>
        <li>
          <v-btn class="my-2" size="small" @click="">
            Groeten uit Maastricht
          </v-btn>
        </li>
      </ul>
    </v-col>
  </v-row>

  <v-row class="py-2 d-flex align-center">
    <v-col cols="auto">      
      <h2>Hoe goed ben ik in</h2>
      <ul>
        <li>
          Hersengym
          <ul>
            <li>
              <v-btn class="my-2" size="small" @click="">
                Woordpuzzel
              </v-btn>
            </li>
          </ul>
        </li>
        <li>
          Schaken
          <ul>
            <li>
              <v-btn class="my-2" size="small" @click="">
                Probleem
              </v-btn>
            </li>
            <li>
              <v-btn class="my-2" size="small" @click="">
                Schaak Slag Der Steden
              </v-btn>
            </li>
          </ul>
        </li>
        <li>
          Bewegen
          <ul>
            <li>
              <v-btn class="my-2" size="small" @click="">
                Sprint 30 meter
              </v-btn>
            </li>
            <li>
              <v-btn class="my-2" size="small" @click="">
                Sprint 30 meter Para
              </v-btn>
            </li>
            <li>
              <v-btn class="my-2" size="small" @click="">
                Estafette
              </v-btn>
            </li>
            <li>
              <v-btn class="my-2" size="small" @click="">
                Wandelen 600 met chrono
              </v-btn>
            </li>
          </ul>
        </li>
      </ul>
    </v-col>
  </v-row>
</template>

<script setup>
import { useAppStore } from '../store/app.js'
const emit = defineEmits(['menu-item-selected'])
const store = useAppStore()

function createDateTimeString() {
  const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }
  const evt = new Date(Number(store.userData.lastLogin))
  return evt.toLocaleDateString('nl-NL', options)
}
</script>

<style scoped>
li {
  margin-left: 20px;
}
</style>