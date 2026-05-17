import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const current  = ref(null)
  const loading  = ref(false)

  async function fetchAll() {
    loading.value = true
    const { data } = await api.get('/api/projects')
    projects.value = data
    loading.value = false
  }

  async function fetchOne(id) {
    const { data } = await api.get(`/api/projects/${id}`)
    current.value = data
    return data
  }

  async function create(payload) {
    const { data } = await api.post('/api/projects', payload)
    projects.value.unshift(data)
    return data
  }

  async function update(id, payload) {
    const { data } = await api.patch(`/api/projects/${id}`, payload)
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) projects.value[idx] = data
    return data
  }

  async function remove(id) {
    await api.delete(`/api/projects/${id}`)
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return { projects, current, loading, fetchAll, fetchOne, create, update, remove }
})
