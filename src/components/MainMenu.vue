<template>
  <v-row>
    <v-col cols="auto">
      <p>Laatste login: {{ createDateTimeString() }}</p>
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

  <v-row>
    <v-col cols="auto">
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
</template>

<script setup>
const props = defineProps(['firebaseUser'])
const emit = defineEmits(['menu-item-selected'])

function createDateTimeString() {
  const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }
  const evt = new Date(Number(props.firebaseUser.metadata.lastLoginAt))
  return evt.toLocaleDateString('nl-NL', options) + ' u.'
}
</script>

<style scoped>
li {
  margin-left: 20px;
}
</style>