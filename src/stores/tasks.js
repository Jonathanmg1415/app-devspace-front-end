import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useTasksStore = defineStore('tasks', () => {
  const items   = ref([])
  const loading = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    try {
      const { data } = await api.get(`/api/projects/${projectId}/tasks`)
      items.value = data.tasks ?? []
    } finally {
      loading.value = false
    }
  }

  async function create(projectId, payload) {
    const { data } = await api.post(`/api/projects/${projectId}/tasks`, payload)
    items.value.unshift(data.tarea)
    return data.tarea
  }

  async function update(id, payload) {
    const { data } = await api.put(`/api/tasks/${id}`, payload)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = data.tarea
    return data.tarea
  }

  async function remove(id) {
    await api.delete(`/api/tasks/${id}`)
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, loading, fetchAll, create, update, remove }
})