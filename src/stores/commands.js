import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useCommandsStore = defineStore('commands', () => {
  const items   = ref([])
  const loading = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    try {
      const { data } = await api.get('/api/commands', { params: { projectId } })
      items.value = data.commands ?? []
    } finally { loading.value = false }
  }

  async function create(projectId, payload) {
    const { data } = await api.post('/api/commands', { projectId, ...payload })
    items.value.unshift(data.comando)
    return data.comando
  }

  async function update(id, payload) {
    const { data } = await api.put('/api/commands/edit', { id, ...payload })
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = data.comando
    return data.comando
  }

  async function remove(id) {
    await api.delete('/api/commands/delete', { data: { id } })
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, loading, fetchAll, create, update, remove }
})