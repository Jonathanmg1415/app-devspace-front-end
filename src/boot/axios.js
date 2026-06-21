import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337',
  timeout: 15000,
})

export default boot(({ app }) => {
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
          message: 'Sin conexión con el servidor. Verifica tu conexión.',
          icon: 'cloud_off',
          timeout: 4000,
          position: 'top',
        })
        return Promise.reject(err)
      }

      // Error 5xx
      if (status >= 500) {
        Notify.create({
          type: 'negative',
          message: 'Error interno del servidor. Intenta de nuevo en unos segundos.',
          icon: 'error_outline',
          timeout: 4000,
          position: 'top',
        })
      }

      return Promise.reject(err)
    }
  )

  app.config.globalProperties.$api = api
})

export { api }
