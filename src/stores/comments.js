import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useCommentsStore = defineStore('comments', () => {
  const items   = ref([])
  const loading = ref(false)

  async function fetchAll(taskId) {
    loading.value = true
    try {
      const { data } = await api.get('/api/comments', { params: { taskId } })
      items.value = data.comments ?? []
    } finally { loading.value = false }
  }

  async function create(taskId, content) {
    const { data } = await api.post('/api/comments', { taskId, content })
    items.value.push(data.comment)
    return data.comment
  }

  async function remove(id) {
    await api.delete('/api/comments/delete', { data: { id } })
    items.value = items.value.filter(c => c.id !== id)
  }

  function clear() { items.value = [] }

  return { items, loading, fetchAll, create, remove, clear }
})
