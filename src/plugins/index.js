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
  theme: 'snow',
  modules: {
    toolbar: [
      [{ header: [false, 1, 2, 3, 4, 5, 6] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      ['link', 'image', 'code-block'],
      [{ align: [] }],
    ],
  },
}

export function registerPlugins(app) {
  loadFonts()
  QuillEditor.props.globalOptions.default = () => globalOptions
  app.component('QuillEditor', QuillEditor)
  app.use(vuetify).use(router).use(pinia)
}
