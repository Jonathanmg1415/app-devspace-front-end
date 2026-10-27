import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'
import { loaderShow, loaderHide } from 'src/composables/loader'

// Render (free tier) puede tardar 30-50s en despertar el backend tras estar dormido —
// 15s cortaba la conexión antes de que el cold-start terminara (ver "Sin conexión al
// servidor" en requests normales recién abierta la app). Los endpoints de IA además
// necesitan su propio override más alto: el backend ya les da hasta 30s por modelo
// en su propio helper de Groq (ver api/helpers/groq.js), así que 15s también cortaba
// ahí incluso sin cold-start.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337',
  timeout: 45000,
})

// GET requests que cargan páginas muestran el overlay; estas se saltan
const SKIP_URLS = ['/notifications', '/health', '/auth/me']
let _activeLoads = 0

// Evita que un cold-start de Render (o cualquier caída) dispare un toast de
// "sin conexión" por cada request en paralelo que falla — se agrupa en uno solo.
let _lastConnErrorAt = 0
const CONN_ERROR_COOLDOWN = 4000

function shouldTrack(config) {
  if (!config) return false
  if ((config.method || '').toLowerCase() !== 'get') return false
  const url = config.url || ''
  return !SKIP_URLS.some(s => url.includes(s))
}

export default boot(({ app }) => {
  Notify.setDefaults({
    position: 'bottom-right',
    timeout: 2500,
    actions: [{ icon: 'close', color: 'white', dense: true, size: 'xs', flat: true }],
  })

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('devspace_token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    if (shouldTrack(config)) {
      _activeLoads++
      if (_activeLoads === 1) loaderShow()
    }

    return config
  })

  api.interceptors.response.use(
    (res) => {
      if (shouldTrack(res.config)) {
        _activeLoads = Math.max(0, _activeLoads - 1)
        if (_activeLoads === 0) loaderHide()
      }
      return res
    },
    (err) => {
      if (shouldTrack(err.config)) {
        _activeLoads = Math.max(0, _activeLoads - 1)
        if (_activeLoads === 0) loaderHide()
      }

      const status = err.response?.status

      if (status === 401) {
        // /auth/me lo maneja App.vue — evitamos el hard-redirect aquí
        // para no competir con el flujo de onMounted
        const url = err.config?.url || ''
        if (!url.includes('/auth/me')) {
          localStorage.removeItem('devspace_token')
          window.location.href = '/auth/login'
        }
        return Promise.reject(err)
      }

      if (!err.response) {
        const now = Date.now()
        if (now - _lastConnErrorAt > CONN_ERROR_COOLDOWN) {
          _lastConnErrorAt = now
          Notify.create({
            type: 'negative',
            message: 'Sin conexión al servidor',
            caption: 'Si es la primera carga puede tardar unos segundos en despertar — inténtelo de nuevo',
            icon: 'cloud_off',
            timeout: 5000,
          })
        }
        return Promise.reject(err)
      }

      if (status >= 500) {
        Notify.create({
          type: 'negative',
          message: 'Error interno del servidor',
          caption: 'Inténtelo de nuevo en unos segundos',
          icon: 'error_outline',
          timeout: 4000,
        })
      }

      return Promise.reject(err)
    }
  )

  app.config.globalProperties.$api = api

  // Keep-alive: ping cada 10 min para que Render no duerma el servidor
  const PING_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337') + '/api/health'
  setInterval(() => { fetch(PING_URL).catch(() => {}) }, 10 * 60 * 1000)
})

export { api }
