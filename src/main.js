/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

// Global components
import AppBar from './components/AppBar.vue'
import BaseCard from './components/ui/BaseCard.vue'
import BaseButton from './components/ui/BaseButton.vue'
app.component('app-bar', AppBar)
app.component('base-card', BaseCard)
app.component('base-button', BaseButton)

import SelectAlias from './components/SelectAlias.vue'
app.component('select-alias', SelectAlias)

registerPlugins(app)

app.mount('#app')
