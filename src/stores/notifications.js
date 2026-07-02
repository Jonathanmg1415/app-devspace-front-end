import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'

export const useNotificationsStore = defineStore('notifications', () => {
  const items  = ref([])
  const loading = ref(false)

  const unread = computed(() => items.value.filter(n => !n.read).length)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.get('/api/notifications')
      items.value = data.notifications ?? []
    } finally { loading.value = false }
  }

  async function markRead(id) {
    await api.put('/api/notifications/read', { id })
    const n = items.value.find(i => i.id === id)
    if (n) n.read = true
  }

  async function markAllRead() {
    await api.put('/api/notifications/read-all')
    items.value.forEach(n => { n.read = true })
  }

  return { items, loading, unread, fetchAll, markRead, markAllRead }
})
