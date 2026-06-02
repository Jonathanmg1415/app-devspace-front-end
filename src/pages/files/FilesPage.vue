<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h6 text-weight-bold col">Archivos</div>
      <q-btn color="primary" icon="upload_file" label="Subir archivo" @click="triggerInput" />
      <input
        ref="inputRef"
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        style="display:none"
        @change="handleFileChange"
      />
    </div>

    <q-banner v-if="uploading" rounded class="bg-blue-1 q-mb-md">
      <template #avatar><q-icon name="cloud_upload" color="primary" /></template>
      Subiendo archivo...
      <q-linear-progress :value="progress / 100" color="primary" class="q-mt-sm" />
    </q-banner>

    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner size="48px" color="primary" />
    </div>

    <div v-else-if="!files.length" class="flex flex-center column q-py-xl text-grey-6">
      <q-icon name="folder_open" size="64px" />
      <p class="q-mt-md">No hay archivos en este proyecto aún.</p>
    </div>

    <q-list v-else bordered separator rounded>
      <q-item v-for="file in files" :key="file.id" class="q-py-sm">
        <q-item-section avatar>
          <q-avatar :icon="fileIcon(file.mimetype)" color="primary" text-color="white" size="40px" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-medium">{{ file.originalname }}</q-item-label>
          <q-item-label caption>
            {{ fileSize(file.size) }} · {{ fileType(file.mimetype) }} ·
            {{ new Date(file.createdAt).toLocaleDateString('es-CO') }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn flat round dense size="sm" icon="download"
              :loading="downloadingId === file.id"
              @click="downloadFile(file)">
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn flat round dense size="sm" icon="delete" color="negative"
              @click="confirmDelete(file)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFilesStore } from 'src/stores/files'
import { storeToRefs } from 'pinia'

const $q    = useQuasar()
const route = useRoute()
const store = useFilesStore()
const { files, loading, uploading } = storeToRefs(store)

const projectId    = computed(() => route.params.id)
const inputRef     = ref(null)
const progress     = ref(0)
const downloadingId = ref(null)

onMounted(() => store.fetchAll(projectId.value))

function triggerInput() {
  inputRef.value.click()
}

async function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  progress.value = 0
  try {
    await store.upload(projectId.value, file, (p) => { progress.value = p })
    $q.notify({ type: 'positive', message: 'Archivo subido correctamente' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.mensaje || 'Error al subir el archivo' })
  } finally {
    e.target.value = ''
  }
}

async function downloadFile(file) {
  downloadingId.value = file.id
  try {
    const response = await fetch(file.url)
    const blob     = await response.blob()
    const url      = URL.createObjectURL(blob)
    const a        = document.createElement('a')
    a.href         = url
    a.download     = file.originalname
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    $q.notify({ type: 'negative', message: 'Error al descargar el archivo' })
  } finally {
    downloadingId.value = null
  }
}

function confirmDelete(file) {
  $q.dialog({
    title: 'Eliminar archivo',
    message: `¿Eliminar "${file.originalname}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.remove(file.id)
      $q.notify({ type: 'positive', message: 'Archivo eliminado' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

function fileIcon(mimetype) {
  if (mimetype === 'application/pdf') return 'picture_as_pdf'
  if (mimetype.includes('word'))      return 'description'
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'table_chart'
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'slideshow'
  return 'insert_drive_file'
}

function fileType(mimetype) {
  if (mimetype === 'application/pdf') return 'PDF'
  if (mimetype.includes('word'))      return 'Word'
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'Excel'
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'PowerPoint'
  if (mimetype === 'text/plain')      return 'Texto'
  return mimetype
}

function fileSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>