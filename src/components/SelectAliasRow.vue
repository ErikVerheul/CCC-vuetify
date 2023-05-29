<template>
  <v-btn-toggle v-model="aliasButtonSelections[row]" mandatory>
    <template v-for="(num, index) in rowLength">
      <template v-if="!assignedAliases.includes(randomNames[indexOffset + index])">
        <v-btn size="small">
          {{ randomNames[indexOffset + index] }}
        </v-btn>
      </template>
      <template v-else>
        <v-btn size="small" append-icon="mdi-account-circle">
          {{ randomNames[indexOffset + index] }}
          <template v-slot:append>
            <v-icon color="warning"></v-icon>
          </template>
        </v-btn>
      </template>
    </template>
  </v-btn-toggle>
</template>

<script>
export default {
  props: ['assignedAliases', 'randomNames', 'rowLength', 'row', 'aliasButtonSelections'],

  computed: {
    indexOffset() {
      return this.row * 4
    }
  }

}
</script>