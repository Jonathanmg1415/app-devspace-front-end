import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337',
  timeout: 15000,
})

export default boot(({ app }) => {
  Notify.setDefaults({
    position: 'bottom-right',
    timeout: 2500,
    actions: [{ icon: 'close', color: 'white', dense: true, size: 'xs', flat: true }],
  })

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('devspace_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err.response?.status

      if (status === 401) {
        localStorage.removeItem('devspace_token')
        window.location.href = '/auth/login'
        return Promise.reject(err)
      }

      // Error de red / timeout / servidor caído
      if (!err.response) {
        Notify.create({
          type: 'negative',
          message: 'Sin conexión al servidor',
          caption: 'Verifica tu conexión e intenta de nuevo',
          icon: 'cloud_off',
          timeout: 5000,
        })
        return Promise.reject(err)
      }

      if (status >= 500) {
        Notify.create({
          type: 'negative',
          message: 'Error interno del servidor',
          caption: 'Intenta de nuevo en unos segundos',
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
  setInterval(() => {
    fetch(PING_URL).catch(() => {})
  }, 10 * 60 * 1000)
})

export { api }
