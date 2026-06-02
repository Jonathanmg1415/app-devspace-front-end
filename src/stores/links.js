import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useLinksStore = defineStore('links', () => {
  const items   = ref([])
  const loading = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    try {
      const { data } = await api.get('/api/links', { params: { projectId } })
      items.value = data.links ?? []
    } finally { loading.value = false }
  }

  async function create(projectId, payload) {
    const { data } = await api.post('/api/links', { projectId, ...payload })
    items.value.unshift(data.enlace)
    return data.enlace
  }

  async function update(id, payload) {
    const { data } = await api.put('/api/links/edit', { id, ...payload })
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = data.enlace
    return data.enlace
  }

  async function remove(id) {
    await api.delete('/api/links/delete', { data: { id } })
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, loading, fetchAll, create, update, remove }
})