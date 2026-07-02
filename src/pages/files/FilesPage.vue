<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Archivos</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ files.length }} archivo{{ files.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <q-btn color="primary" icon="upload_file" label="Subir" size="sm" style="height:34px"
        @click="triggerInput" />
      <input ref="inputRef" type="file" multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        style="display:none" @change="handleFileChange" />
    </div>

    <!-- Drop zone -->
    <div class="drop-zone" :class="{ 'drop-zone--active': dragging }"
      @dragover.prevent="dragging = true"
      @dragleave.self="dragging = false"
      @drop.prevent="onDrop">
      <div v-if="!dragging" class="drop-hint">
        <q-icon name="cloud_upload" size="32px" style="color:var(--ds-text-3)" />
        <span>Arrastra archivos aquí o usa el botón "Subir"</span>
      </div>
      <div v-else class="drop-hint drop-hint--active">
        <q-icon name="file_download" size="36px" />
        <span>Suelta para subir</span>
      </div>
    </div>

    <!-- Upload queue -->
    <div v-if="queue.length" class="q-mb-md q-mt-sm" style="display:flex; flex-direction:column; gap:4px">
      <div v-for="item in queue" :key="item.name" class="upload-item">
        <q-icon :name="fileIcon(item.type)" size="16px" style="color:var(--ds-text-2); flex-shrink:0" />
        <span style="font-size:12px; flex:1; color:var(--ds-text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
          {{ item.name }}
        </span>
        <span v-if="item.done" style="font-size:11px; color:#22C55E">✓</span>
        <span v-else-if="item.error" style="font-size:11px; color:var(--ds-negative)">Error</span>
        <q-circular-progress v-else :value="item.progress" size="16px" color="primary" />
      </div>
    </div>

    <SkeletonList v-if="loading && !files.length" variant="list" :count="4" />

    <EmptyState v-else-if="!loading && !files.length"
      icon="folder_open"
      title="Sin archivos"
      subtitle="Arrastra documentos aquí o usa el botón Subir para adjuntarlos al proyecto" />

    <q-list v-else style="border:1px solid var(--ds-border); border-radius:var(--ds-radius); overflow:hidden">
      <q-item v-for="(file, i) in files" :key="file.id" class="q-py-sm"
        :style="i < files.length - 1 ? 'border-bottom:1px solid var(--ds-border)' : ''">
        <q-item-section avatar>
          <q-avatar :icon="fileIcon(file.mimetype)" size="36px"
            style="background:var(--ds-bg-hover); color:var(--ds-text-2)" />
        </q-item-section>

        <q-item-section>
          <q-item-label style="font-size:13px; font-weight:500; color:var(--ds-text-1)">
            {{ file.originalname }}
          </q-item-label>
          <q-item-label caption style="font-size:11px; color:var(--ds-text-3)">
            {{ fileSize(file.size) }} · {{ fileType(file.mimetype) }} ·
            {{ new Date(file.createdAt).toLocaleDateString('es-CO') }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn flat round dense size="sm" icon="download" style="color:var(--ds-text-2)"
              :loading="downloadingId === file.id" @click="downloadFile(file)">
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn flat round dense size="sm" icon="delete" style="color:var(--ds-negative)"
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
import { decodeId } from 'src/utils/routeId'
import SkeletonList from 'src/components/SkeletonList.vue'
import EmptyState from 'src/components/EmptyState.vue'

const $q    = useQuasar()
const route = useRoute()
const store = useFilesStore()
const { files, loading } = storeToRefs(store)

const projectId     = computed(() => decodeId(route.params.id))
const inputRef      = ref(null)
const downloadingId = ref(null)
const dragging      = ref(false)
const queue         = ref([])

onMounted(() => store.fetchAll(projectId.value))

function triggerInput() { inputRef.value.click() }

async function handleFileChange(e) {
  await uploadFiles(Array.from(e.target.files))
  e.target.value = ''
}

async function onDrop(e) {
  dragging.value = false
  const dropped = Array.from(e.dataTransfer.files)
  if (!dropped.length) return
  await uploadFiles(dropped)
}

async function uploadFiles(fileList) {
  const items = fileList.map(f => ({ name: f.name, type: f.type, progress: 0, done: false, error: false, file: f }))
  queue.value.push(...items)

  await Promise.all(items.map(async item => {
    try {
      await store.upload(projectId.value, item.file, p => { item.progress = p })
      item.progress = 100
      item.done = true
    } catch {
      item.error = true
      $q.notify({ type: 'negative', message: `Error al subir ${item.name}` })
    }
  }))

  // Remove finished items after 2s
  setTimeout(() => {
    queue.value = queue.value.filter(i => !i.done && !i.error)
  }, 2000)
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
  } finally { downloadingId.value = null }
}

function confirmDelete(file) {
  $q.dialog({
    title: 'Eliminar archivo',
    message: `¿Eliminar "${file.originalname}"? Esta acción no se puede deshacer.`,
    cancel: true, persistent: true,
  }).onOk(async () => {
    try {
      await store.remove(file.id)
      $q.notify({ type: 'positive', message: 'Archivo eliminado' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

function fileIcon(mime = '') {
  if (mime === 'application/pdf') return 'picture_as_pdf'
  if (mime.includes('word'))      return 'description'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'table_chart'
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'slideshow'
  return 'insert_drive_file'
}
function fileType(mime = '') {
  if (mime === 'application/pdf') return 'PDF'
  if (mime.includes('word'))      return 'Word'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'Excel'
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'PowerPoint'
  if (mime === 'text/plain')      return 'Texto'
  return mime
}
function fileSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 28px 20px;
  text-align: center;
  margin-bottom: 16px;
  transition: border-color 120ms ease, background 120ms ease;
  cursor: pointer;
}
.drop-zone--active {
  border-color: var(--ds-orange);
  background: var(--ds-orange-dim);
}
.drop-hint {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  font-size: 13px; color: var(--ds-text-3);
}
.drop-hint--active { color: var(--ds-orange); }
.upload-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  background: var(--ds-bg-1); border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
}
</style>
