import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useCalendarsStore = defineStore('calendars', () => {
  const calendars = ref([])
  const members   = ref([])
  const loading   = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.get('/api/calendars')
      calendars.value = data.calendars ?? []
    } finally { loading.value = false }
  }

  async function create(payload) {
    const { data } = await api.post('/api/calendars', payload)
    calendars.value.push(data.calendar)
    return data.calendar
  }

  async function update(id, payload) {
    const { data } = await api.put('/api/calendars/edit', { id, ...payload })
    const idx = calendars.value.findIndex(c => c.id === id)
    if (idx !== -1) calendars.value[idx] = { ...calendars.value[idx], ...data.calendar }
    return data.calendar
  }

  async function remove(id) {
    await api.delete('/api/calendars/delete', { data: { id } })
    calendars.value = calendars.value.filter(c => c.id !== id)
  }

  async function fetchMembers(calendarId) {
    const { data } = await api.get('/api/calendars/members', { params: { calendarId } })
    members.value = data.members ?? []
  }

  async function invite(calendarId, email) {
    const { data } = await api.post('/api/calendars/invite', { calendarId, email })
    members.value.push(data.member)
    return data.member
  }

  async function removeMember(calendarId, memberId) {
    await api.delete('/api/calendars/member', { data: { calendarId, memberId } })
    members.value = members.value.filter(m => m.id !== memberId)
  }

  return { calendars, members, loading, fetchAll, create, update, remove, fetchMembers, invite, removeMember }
})
