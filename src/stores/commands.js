import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

const PAGE = 50

export const useCommandsStore = defineStore('commands', () => {
  const items       = ref([])
  const loading     = ref(false)
  const loadingMore = ref(false)
  const hasMore     = ref(false)
  const total       = ref(0)
  let   _skip       = 0
  let   _projectId  = null

  async function fetchAll(projectId) {
    _projectId = projectId
    _skip = 0
    loading.value = true
    try {
      const { data } = await api.get('/api/commands', { params: { projectId, limit: PAGE, skip: 0 } })
      items.value = data.commands ?? []
      total.value = data.total ?? items.value.length
      hasMore.value = data.hasMore ?? false
      _skip = items.value.length
    } finally { loading.value = false }
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    try {
      const { data } = await api.get('/api/commands', { params: { projectId: _projectId, limit: PAGE, skip: _skip } })
      const next = data.commands ?? []
      items.value.push(...next)
      hasMore.value = data.hasMore ?? false
      _skip += next.length
    } finally { loadingMore.value = false }
  }

  async function create(projectId, payload) {
    const { data } = await api.post('/api/commands', { projectId, ...payload })
    items.value.unshift(data.comando)
    total.value++
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
    total.value--
  }

  return { items, loading, loadingMore, hasMore, total, fetchAll, loadMore, create, update, remove }
})
