/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'
import App from './App.vue'
import { firebaseApp } from './firebase'
import VueGtag from "vue-gtag"
import router from './router/index'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

app.use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [
        // we will see other modules later on
        VueFireAuth(),
    ],
})

app.use(VueGtag, {
    config: { id: "G-JYFV02BZH6" }
}, router)

// Global components
import AppBarImplementation from './components/AppBar.vue'
app.component('AppBar', AppBarImplementation)

registerPlugins(app)

app.mount('#app')
