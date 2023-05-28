<template>
  <v-btn-toggle v-model="aliasButtonSelections[row]" mandatory>
    <template v-if="!assignedAliases.includes(randomNames[indexOffset])">
      <v-btn size="small">
        {{ randomNames[indexOffset] }}
      </v-btn>
    </template>
    <template v-else>
      <v-btn size="small" append-icon="mdi-account-circle">
        {{ randomNames[indexOffset] }}
        <template v-slot:append>
          <v-icon color="warning"></v-icon>
        </template>
      </v-btn>
    </template>
    <template v-if="!assignedAliases.includes(randomNames[indexOffset + 1])">
      <v-btn size="small">
        {{ randomNames[indexOffset + 1] }}
      </v-btn>
    </template>
    <template v-else>
      <v-btn size="small" append-icon="mdi-account-circle">
        {{ randomNames[indexOffset + 1] }}
        <template v-slot:append>
          <v-icon color="warning"></v-icon>
        </template>
      </v-btn>
    </template>
    <template v-if="!assignedAliases.includes(randomNames[indexOffset + 2])">
      <v-btn size="small">
        {{ randomNames[indexOffset + 2] }}
      </v-btn>
    </template>
    <template v-else>
      <v-btn size="small" append-icon="mdi-account-circle">
        {{ randomNames[indexOffset + 2] }}
        <template v-slot:append>
          <v-icon color="warning"></v-icon>
        </template>
      </v-btn>
    </template>
    <template v-if="!assignedAliases.includes(randomNames[indexOffset + 3])">
      <v-btn size="small">
        {{ randomNames[indexOffset + 3] }}
      </v-btn>
    </template>
    <template v-else>
      <v-btn size="small" append-icon="mdi-account-circle">
        {{ randomNames[indexOffset + 3] }}
        <template v-slot:append>
          <v-icon color="warning"></v-icon>
        </template>
      </v-btn>
    </template>
  </v-btn-toggle>
</template>

<script>
export default {
  props: ['assignedAliases', 'randomNames', 'row', 'aliasButtonSelections'],

  computed: {
    indexOffset() {
      return this.row * 4
    }
  }

}
</script>