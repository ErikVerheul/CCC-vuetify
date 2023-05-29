<template>
  <v-row>
    <v-card flat>
      <v-card-title class="text-h5">alias kiezen</v-card-title>
      <v-card-subtitle>Scroll door alias namen en kies er een</v-card-subtitle>
      <v-card-text>
        <v-row align="center" justify="center">       
          <select-alias-row v-for="(num, index) in numberOfRows"
          :assigned-aliases="assignedAliases" 
          :random-names="randomNames"
          :row=index
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
    let itemsSet = 0
    let numberOfButtons = this.rowLength * this.numberOfRows
    this.randomNames = []
    do {
      // pick a random alias
      let alias = this.allAliases[Math.round(Math.random() * (this.allAliases.length - 1))]
      if (!this.randomNames.includes(alias)) {
        // select if not already done
        this.randomNames.push(alias)
        itemsSet++
      }
    } while (itemsSet < numberOfButtons)


    // initialize button selection
    for (let i = 0; i < this.numberOfRows; i++) {
      this.aliasButtonSelections[i] = undefined
    }
  },

  data() {
    return {
      numberOfRows: 20,
      rowLength: 4,
      aliasButtonSelections: [],
      selectedButtonInRows: [],
      lastSelectedRow: undefined,
      lastIndex: undefined,
      randomNames: [],
      skipWatch: false
    }
  },

  watch: {
    aliasButtonSelections: {
      handler(rowValue, oldRowValue) {
        // note: rowValue and oldRowValue are equal, see https://vuejs.org/guide/essentials/watchers.html#deep-watchers

        if (this.skipWatch) {
          this.skipWatch = false
          return
        }
        // preset newIndex in case a button in the same row is clicked
        let newIndex = this.lastIndex
        for (let i = 0; i < rowValue.length; i++) {
          if (i !== this.lastIndex && rowValue[i] !== undefined) newIndex = i
        }

        // reset the previous clicked button and prevent firing an 'alias-selected' event
        if (this.lastIndex !== undefined && newIndex !== this.lastIndex) {
          this.aliasButtonSelections[this.lastIndex] = undefined
          this.skipWatch = true
        }

        // save the index of the clicked buttom row for removal at the next selection
        this.lastIndex = newIndex

        let index = newIndex * this.rowLength + this.aliasButtonSelections[newIndex]
        this.$emit('alias-selected', this.randomNames[index])
      },
      deep: true
    }
  }
}
</script>