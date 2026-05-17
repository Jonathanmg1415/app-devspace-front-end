import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useLinksStore = defineStore('links', () => {
  const items   = ref([])
  const loading = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    const { data } = await api.get(`/api/projects/${projectId}/links`)
    items.value = data
    loading.value = false
  }

  async function create(projectId, payload) {
    const { data } = await api.post(`/api/projects/${projectId}/links`, payload)
    items.value.unshift(data)
    return data
  }

  async function update(id, payload) {
    const { data } = await api.patch(`/api/links/${id}`, payload)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = data
    return data
  }

  async function remove(id) {
    await api.delete(`/api/links/${id}`)
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, loading, fetchAll, create, update, remove }
})
