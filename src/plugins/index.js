/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const globalOptions = {
  debug: 'warn',
  placeholder: 'Compose your text...',
  readOnly: false,
  theme: 'snow'
}

export function registerPlugins(app) {
  loadFonts()
  QuillEditor.props.globalOptions.default = () => globalOptions
  app.component('QuillEditor', QuillEditor)
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
}
