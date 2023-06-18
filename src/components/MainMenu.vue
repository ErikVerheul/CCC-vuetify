<template>
  <v-container class="fill-height">
    <v-row>
      <v-col cols="auto">
        <p v-if="props.lastLogin !== undefined">Mijn laatste login was op {{ new
          Date(Number(props.lastLogin)).toString().substring(0, 25) }}</p>
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
            <v-btn class="my-2" size="small" @click="">
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
  </v-container>
</template>

<script setup>
const props = defineProps(['lastLogin'])

</script>

<style scoped>
li {
  margin-left: 20px;
}
</style>