<template>
  <v-row>
    <v-card flat>
      <v-card-title class="text-h5">alias kiezen</v-card-title>
      <v-card-subtitle>Scroll door alias namen en kies er een</v-card-subtitle>
      <v-card-text>
        <v-row align="center" justify="center">
          <v-btn-toggle v-model="selected[0]" mandatory>
            <v-btn size="small">
              {{ randomNames[0] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[1] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[2] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[3] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[1]" mandatory>
            <v-btn size="small">
              {{ randomNames[4] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[5] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[6] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[7] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[2]" mandatory>
            <v-btn size="small">
              {{ randomNames[8] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[9] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[10] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[11] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[3]" mandatory>
            <v-btn size="small">
              {{ randomNames[12] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[13] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[14] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[15] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[4]" mandatory>
            <v-btn size="small">
              {{ randomNames[16] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[17] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[18] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[19] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[5]" mandatory>
            <v-btn size="small">
              {{ randomNames[20] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[21] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[22] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[23] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[6]" mandatory>
            <v-btn size="small">
              {{ randomNames[24] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[25] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[26] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[27] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[7]" mandatory>
            <v-btn size="small">
              {{ randomNames[28] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[29] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[30] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[31] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[8]" mandatory>
            <v-btn size="small">
              {{ randomNames[32] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[33] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[34] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[35] }}
            </v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="selected[9]" mandatory>
            <v-btn size="small">
              {{ randomNames[36] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[37] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[38] }}
            </v-btn>
            <v-btn size="small">
              {{ randomNames[39] }}
            </v-btn>
          </v-btn-toggle>
        </v-row>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script>
export default {
  props: ['assignedAliases', 'allAliases'],

  beforeMount() {
    const numberOfButtons = 40
    for (let i = 0; i < numberOfButtons; i++) {
      let index = Math.round(Math.random() * this.allAliases.length)
      this.randomNames[i] = this.allAliases[index]
    }
  },

  data() {
    return {
      rowLength: 4,
      selected: [],
      lastIndex: undefined,
      randomNames: []
    }
  },

  watch: {
    selected: {
      handler(val, oldVal) {
        // note: val and oldVal are equal, see https://vuejs.org/guide/essentials/watchers.html#deep-watchers
        // save the lastIndex on Data

        let newIndex = this.lastIndex
        for (let i = 0; i < val.length; i++) {
          if (i !== this.lastIndex && val[i] !== undefined) newIndex = i
        }

        // reset the previous pressed button
        if (newIndex !== this.lastIndex) {
          this.selected[this.lastIndex] = undefined
        }

        this.lastIndex = newIndex

        let index = this.lastIndex * this.rowLength + this.selected[this.lastIndex]
        this.$emit('alias-selected', this.randomNames[index])
      },
      deep: true
    }
  }
}
</script>