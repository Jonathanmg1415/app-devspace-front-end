import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const current  = ref(null)
  const loading  = ref(true)

  async function fetchAll() {
  loading.value = true
  try {
    const { data } = await api.get('/api/projects')
    projects.value = data.projects ?? []
  } finally { loading.value = false }
}

  async function fetchOne(id) {
    const { data } = await api.get('/api/projects/detail', { params: { id } })
    current.value = data.project
    return data.project
  }

  async function create(payload) {
    const { data } = await api.post('/api/projects', payload)
    projects.value.unshift(data.project)
    return data.project
  }

  async function update(id, payload) {
    const { data } = await api.put('/api/projects/edit', { id, ...payload })
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) projects.value[idx] = data.project
    return data.project
  }

  async function remove(id) {
    await api.delete('/api/projects/delete', { data: { id } })
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return { projects, current, loading, fetchAll, fetchOne, create, update, remove }
})