import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('devspace_token') || null)
  const user  = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('devspace_token', data.token)
  }

  async function register(name, email, password) {
    const { data } = await api.post('/api/auth/register', { name, email, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('devspace_token', data.token)
  }

  async function fetchMe() {
    const { data } = await api.get('/api/auth/me')
    user.value = data.user
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('devspace_token')
  }

  return { token, user, isAuthenticated, login, register, fetchMe, logout }
})
