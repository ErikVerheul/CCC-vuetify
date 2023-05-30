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
import AppBarImplementation from './components/AppBar.vue'
app.component('AppBar', AppBarImplementation)

registerPlugins(app)

app.mount('#app')
