import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useEventsStore = defineStore('events', () => {
  const events  = ref([])
  const members = ref([])
  const loading = ref(false)

  async function fetchMonth(year, month) {
    loading.value = true
    try {
      const { data } = await api.get('/api/events', { params: { year, month } })
      events.value = data.events ?? []
    } finally { loading.value = false }
  }

  async function fetchMembers() {
    const { data } = await api.get('/api/calendar/members')
    members.value = data.members ?? []
  }

  async function create(payload) {
    const { data } = await api.post('/api/events', payload)
    events.value.push(data.event)
    return data.event
  }

  async function update(id, payload) {
    const { data } = await api.put('/api/events/edit', { id, ...payload })
    const idx = events.value.findIndex(e => e.id === id)
    if (idx !== -1) events.value[idx] = data.event
    return data.event
  }

  async function remove(id) {
    await api.delete('/api/events/delete', { data: { id } })
    events.value = events.value.filter(e => e.id !== id)
  }

  async function invite(email) {
    const { data } = await api.post('/api/calendar/invite', { email })
    members.value.push(data.member)
    return data.member
  }

  async function removeMember(id) {
    await api.delete('/api/calendar/member', { data: { id } })
    members.value = members.value.filter(m => m.id !== id)
  }

  return { events, members, loading, fetchMonth, fetchMembers, create, update, remove, invite, removeMember }
})
