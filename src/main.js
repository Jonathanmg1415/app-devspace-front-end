import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading, LocalStorage } from 'quasar'
import { createPinia } from 'pinia'
import router, { setupRouterGuards } from './router'
import { i18n } from './boot/i18n'
import { api } from './boot/axios'
import App from './App.vue'

import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

const pinia = createPinia()
const app   = createApp(App)

app.use(Quasar, { plugins: { Notify, Dialog, Loading, LocalStorage }, config: { dark: 'auto' } })
app.use(pinia)

// Guards van DESPUÉS de montar pinia
setupRouterGuards(pinia)

app.use(router)
app.use(i18n)
app.config.globalProperties.$api = api

app.mount('#app')