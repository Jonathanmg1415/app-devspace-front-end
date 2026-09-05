import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useDayTasksStore = defineStore('dayTasks', () => {
  const dayTasks = ref([])
  const loading  = ref(false)

  async function fetchMonth(year, month) {
    loading.value = true
    try {
      const { data } = await api.get('/api/day-tasks', { params: { year, month } })
      dayTasks.value = data.dayTasks ?? []
    } finally { loading.value = false }
  }

  async function create(payload) {
    const { data } = await api.post('/api/day-tasks', payload)
    dayTasks.value.push(data.dayTask)
    return data.dayTask
  }

  async function update(id, payload) {
    const { data } = await api.put('/api/day-tasks/edit', { id, ...payload })
    const idx = dayTasks.value.findIndex(t => t.id === id)
    if (idx !== -1) dayTasks.value[idx] = data.dayTask
    return data.dayTask
  }

  async function toggle(id, done) {
    const { data } = await api.put('/api/day-tasks/toggle', { id, done })
    const idx = dayTasks.value.findIndex(t => t.id === id)
    if (idx !== -1) dayTasks.value[idx] = data.dayTask
    return data.dayTask
  }

  async function remove(id) {
    await api.delete('/api/day-tasks/delete', { data: { id } })
    dayTasks.value = dayTasks.value.filter(t => t.id !== id)
  }

  return { dayTasks, loading, fetchMonth, create, update, toggle, remove }
})
