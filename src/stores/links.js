import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

const PAGE = 50

export const useLinksStore = defineStore('links', () => {
  const items       = ref([])
  const loading     = ref(true)
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
      const { data } = await api.get('/api/links', { params: { projectId, limit: PAGE, skip: 0 } })
      items.value = data.links ?? []
      total.value = data.total ?? items.value.length
      hasMore.value = data.hasMore ?? false
      _skip = items.value.length
    } finally { loading.value = false }
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    try {
      const { data } = await api.get('/api/links', { params: { projectId: _projectId, limit: PAGE, skip: _skip } })
      const next = data.links ?? []
      items.value.push(...next)
      hasMore.value = data.hasMore ?? false
      _skip += next.length
    } finally { loadingMore.value = false }
  }

  async function create(projectId, payload) {
    const { data } = await api.post('/api/links', { projectId, ...payload })
    items.value.unshift(data.enlace)
    total.value++
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
    total.value--
  }

  return { items, loading, loadingMore, hasMore, total, fetchAll, loadMore, create, update, remove }
})
