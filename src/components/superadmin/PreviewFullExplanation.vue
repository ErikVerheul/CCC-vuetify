<template>
  <v-card>
    <v-card-title>Preview</v-card-title>
    <v-row justify="space-around">
      <v-col cols="6" md="4">
        <p>Preview 414 x 2688 px (3 x schermhoogte)</p>
        <v-sheet class="pa-2" color="grey-lighten-3" height="2688" width="414">
          <h4 class="py-3">Toelichting op goed/fout antwoord:</h4>
          <v-row no-gutters>
            <div v-html="props.resultInfo"></div>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col cols="6" md="4">
        <p>Preview 375 x 2436 px (3 x schermhoogte)</p>
        <v-sheet class="pa-2" color="grey-lighten-3" height="2436" width="375">
          <h4 class="py-3">Toelichting op goed/fout antwoord:</h4>
          <v-row no-gutters>
            <div v-html="props.resultInfo"></div>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-divider></v-divider>

    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn prepend-icon="mdi-arrow-left" @click="emit('return-to')">
            <template v-slot:prepend>
              <v-icon size="x-large" color="purple"></v-icon>
            </template>
            Terug
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
<script setup>
const emit = defineEmits(['return-to'])
const props = defineProps(['resultInfo'])

</script>