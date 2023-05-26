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
app.component('app-bar', AppBar)

import SelectAlias from './components/SelectAlias.vue'
app.component('select-alias', SelectAlias)

registerPlugins(app)

app.mount('#app')
