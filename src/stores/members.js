import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useMembersStore = defineStore('members', () => {
  const members  = ref([])
  const loading  = ref(false)
  const inviting = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    try {
      const { data } = await api.get(`/api/projects/${projectId}/members`)
      members.value = data.members ?? []
    } finally {
      loading.value = false
    }
  }

  async function invite(projectId, email) {
    inviting.value = true
    try {
      const { data } = await api.post(`/api/projects/${projectId}/members/invite`, { email })
      members.value.push(data.member)
      return data.member
    } finally {
      inviting.value = false
    }
  }

  async function remove(projectId, memberId) {
    await api.delete(`/api/projects/${projectId}/members/${memberId}`)
    members.value = members.value.filter(m => m.id !== memberId)
  }

  function clear() { members.value = [] }

  return { members, loading, inviting, fetchAll, invite, remove, clear }
})