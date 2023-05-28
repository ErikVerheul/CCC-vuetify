<template>
  <v-row>
    <v-card flat>
      <v-card-title class="text-h5">alias kiezen</v-card-title>
      <v-card-subtitle>Scroll door alias namen en kies er een</v-card-subtitle>
      <v-card-text>
        <v-row align="center" justify="center">       
          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=0
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=1
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=2
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=3
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=4
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=5
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=6
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=7
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=8
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>

          <select-alias-row
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=9
          :alias-button-selections="aliasButtonSelections"
          ></select-alias-row>         
        </v-row>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script>
export default {
  props: ['assignedAliases', 'allAliases'],

  beforeMount() {
    // randomize alias names
    const numberOfButtons = this.numberOfRows * this.rowLength
    for (let i = 0; i < numberOfButtons; i++) {
      let index = Math.round(Math.random() * this.allAliases.length)
      this.randomNames[i] = this.allAliases[index]
    }
    // initialize button selection
    for (let i = 0; i < this.numberOfRows; i++) {
      this.aliasButtonSelections[i] = undefined
    }
  },

  data() {
    return {
      numberOfRows: 10,
      rowLength: 4,
      aliasButtonSelections: [],
      selectedButtonInRows: [],
      lastSelectedRow: undefined,

      lastIndex: undefined,
      randomNames: []
    }
  },

  watch: {
    aliasButtonSelections: {
      handler(rowValue, oldRowValue) {
        console.log('aliasButtonSelections =' + rowValue)
        // note: rowValue and oldRowValue are equal, see https://vuejs.org/guide/essentials/watchers.html#deep-watchers

        // preset newIndex in case a button in the same row is clicked
        let newIndex = this.lastIndex
        for (let i = 0; i < rowValue.length; i++) {
          if (i !== this.lastIndex && rowValue[i] !== undefined) newIndex = i
        }

        // reset the previous clicked button
        if (newIndex !== this.lastIndex) {
          this.aliasButtonSelections[this.lastIndex] = undefined
        }

        // save the index of the clicked buttom for removal at the next selection
        this.lastIndex = newIndex

        let index = newIndex * this.rowLength + this.aliasButtonSelections[newIndex]
        this.$emit('alias-selected', this.randomNames[index])
      },
      deep: true
    }
  }
}
</script>