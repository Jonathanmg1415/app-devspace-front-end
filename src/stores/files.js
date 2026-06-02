import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useFilesStore = defineStore('files', () => {
  const files     = ref([])
  const loading   = ref(false)
  const uploading = ref(false)

  async function fetchAll(projectId) {
    loading.value = true
    try {
      const { data } = await api.get('/api/files', { params: { projectId } })
      files.value = data.files ?? []
    } finally { loading.value = false }
  }

  async function upload(projectId, file, onProgress) {
    uploading.value = true
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post(`/api/files/upload?projectId=${projectId}`, form, {
        onUploadProgress: (e) => {
          if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
        },
      })
      files.value.unshift(data.file)
      return data.file
    } finally { uploading.value = false }
  }

  async function remove(id) {
    await api.delete('/api/files/delete', { data: { id } })
    files.value = files.value.filter(f => f.id !== id)
  }

  return { files, loading, uploading, fetchAll, upload, remove }
})