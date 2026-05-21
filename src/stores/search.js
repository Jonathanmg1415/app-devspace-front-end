import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useSearchStore = defineStore('search', () => {
  const results = ref([])
  const loading = ref(false)
  const query   = ref('')

  async function search(q, projectId = null) {
    query.value   = q
    loading.value = true
    try {
      const params = { q, ...(projectId ? { projectId } : {}) }
      const { data } = await api.get('/api/search', { params })
      results.value = data.results ?? []
    } finally {
      loading.value = false
    }
  }

  function clear() { results.value = []; query.value = '' }

  return { results, loading, query, search, clear }
})