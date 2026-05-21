import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useCardsStore = defineStore('cards', () => {
  const items   = ref([])
  const loading = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    try {
      const { data } = await api.get(`/api/projects/${projectId}/cards`)
      items.value = data.cards ?? []
    } finally {
      loading.value = false
    }
  }

  async function create(projectId, payload) {
    const { data } = await api.post(`/api/projects/${projectId}/cards`, payload)
    items.value.unshift(data.card)
    return data.card
  }

  async function update(id, payload) {
    const { data } = await api.put(`/api/cards/${id}`, payload)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = data.card
    return data.card
  }

  async function remove(id) {
    await api.delete(`/api/cards/${id}`)
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, loading, fetchAll, create, update, remove }
})