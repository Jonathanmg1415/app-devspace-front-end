import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337',
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
      if (err.response?.status === 401) {
        localStorage.removeItem('devspace_token')
        window.location.href = '/auth/login'
      }
      return Promise.reject(err)
    }
  )

  app.config.globalProperties.$api = api
})

export { api }
