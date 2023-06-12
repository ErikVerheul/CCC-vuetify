<template>
    <h1>Welkom {{ props.userId }}</h1>
    <h2>Je bent automatisch ingelogd</h2>
    <h3>Dat kan omdat bij de aanmelding een cookie gezet is dat 1 jaar geldig blijft</h3>
    <v-btn size="large" @click="verwijderCookie">Verwijder de cookie</v-btn>
    <div v-if="state.isRemoved">
        <h2>De cookie is verwijderd; je moet opnieuw inloggen</h2>
    </div>
</template>

<script setup>
import { reactive } from 'vue'
import Cookies from 'universal-cookie'

const props = defineProps(['userId'])

const state = reactive({
    isRemoved: false
})

function verwijderCookie() {
    const cookies = new Cookies()
    cookies.remove('speelMee', { sameSite: true })
    state.isRemoved = true
}

</script>