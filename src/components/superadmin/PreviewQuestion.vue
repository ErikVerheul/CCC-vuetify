<template>
  <v-card>
    <v-card-title>Preview</v-card-title>
    <v-row justify="space-around">
      <v-col cols="6" md="4">
        <p>Preview 414 pixels breed</p>
        <v-sheet class="pa-2" color="grey-lighten-3" width="414">
          <v-row no-gutters>
            <div v-html="props.content"></div>
          </v-row>
          <v-row no-gutters>
            <v-list lines="two" density="compact">
              <v-list-item v-for="(num, index) in props.statementsArray" :subtitle="composeStatement(index)" :style="{ 'background-color': bgColor }"></v-list-item>
            </v-list>
          </v-row>
          <v-row v-if="props.gameRules !== ''" no-gutters>
            <p class="py-2">{{ props.gameRules }}</p>
          </v-row>
          <h4 class="py-3">Toelichting op goed/fout antwoord</h4>
          <v-row no-gutters>
            <div v-html="props.correctAnswer"></div>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col cols="6" md="4">
        <p>Preview 375 pixels breed</p>
        <v-sheet class="pa-2" color="grey-lighten-3" width="375">
          <v-row no-gutters>
            <div v-html="props.content"></div>
          </v-row>
          <v-row no-gutters>
            <v-list lines="two" density="compact">
              <v-list-item v-for="(num, index) in props.statementsArray" :subtitle="composeStatement(index)" :style="{ 'background-color': bgColor }"></v-list-item>
            </v-list>
          </v-row>
          <v-row v-if="props.gameRules !== ''" no-gutters>
            <p class="py-2">{{ props.gameRules }}</p>
          </v-row>
          <h4 class="py-3">Toelichting op goed/fout antwoord:</h4>
          <v-row no-gutters>
            <div v-html="props.correctAnswer"></div>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-divider class="my-5"></v-divider>

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
const props = defineProps(['content', 'statementsArray', 'quizQAnswers', 'gameRules', 'correctAnswer'])

// must be non-reactive
let bgColor = undefined

function composeStatement(idx) {
  if (idx > 12) return "Fout: Meer dan 12 vragen?"
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
  bgColor = 'white'
  if (props.quizQAnswers[idx]) {
    bgColor = 'aqua'
  }
  return `${letters[idx]}. ` + props.statementsArray[idx]
}

</script>