import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useNotesStore = defineStore('notes', () => {
  const items   = ref([])
  const loading = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    try {
      const { data } = await api.get('/api/notes', { params: { projectId } })
      items.value = data.notes ?? []
    } finally { loading.value = false }
  }

  async function create(projectId, payload) {
    const { data } = await api.post('/api/notes', { projectId, ...payload })
    items.value.unshift(data.nota)
    return data.nota
  }

  async function update(id, payload) {
    const { data } = await api.put('/api/notes/edit', { id, ...payload })
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = data.nota
    return data.nota
  }

  async function remove(id) {
    await api.delete('/api/notes/delete', { data: { id } })
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, loading, fetchAll, create, update, remove }
})