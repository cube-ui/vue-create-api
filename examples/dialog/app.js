import 'babel-polyfill'
import Vue from 'vue'
import App from './components/App.vue'
import Dialog from './components/dialog.vue'
import CreateAPI from 'create-api'

Vue.use(CreateAPI, {
  componentPrefix: 'z-'
})

Vue.createAPI(Dialog, true)

Vue.config.debug = true

Dialog.$create({
  $props: {
    title: 'Hello',
    content: 'I am from pure JS'
  }
}).show()

new Vue({
  el: '#app',
  render: h => h(App)
})

