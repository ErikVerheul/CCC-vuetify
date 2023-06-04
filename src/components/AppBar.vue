<template>
  <v-app-bar color="teal-darken-4" image="https://picsum.photos/1920/1080?random">
    <template v-slot:image>
      <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
    </template>

    <template v-slot:prepend>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>CCC-app v.0.0.7</v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-heart</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-if="isAuthenticated" v-model="drawer" location="top" temporary>
    <v-list :items="items"></v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    required: true
  }
})

const state = reactive({
  drawer: false,
  group: null,
  items: [
    {
      title: 'Foo',
      value: 'foo',
    },
    {
      title: 'Bar',
      value: 'bar',
    },
    {
      title: 'Fizz',
      value: 'fizz',
    },
    {
      title: 'Buzz',
      value: 'buzz',
    },
  ],
})

watch(state.group, (value, oldValue) => {
  state.drawer = false
})
</script>
