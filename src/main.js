import 'core-js/stable'
import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import { iconsSet as icons } from './assets/icons/icons.js'
import store from './store'
import ToggleButton from 'vue-js-toggle-button'
import money from 'v-money'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import VueTypedJs from 'vue-typed-js'

Vue.config.performance = true
Vue.use(CoreuiVue)
Vue.prototype.$log = console.log.bind(console)
Vue.use(ToggleButton)
Vue.use(money, { precision: 4 })
Vue.use(Buefy)
Vue.use(VueTypedJs)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

new Vue({
  el: '#app',
  router,
  store,
  icons,
  template: '<App/>',
  components: {
    App
  },

})
