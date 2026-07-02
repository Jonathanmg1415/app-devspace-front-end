<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Notas</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ items.length }} nota{{ items.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <q-btn color="primary" icon="add" label="Nueva nota" size="sm" style="height:34px" @click="openNew" />
    </div>

    <!-- Skeleton carga -->
    <SkeletonList v-if="loading && !items.length" variant="grid" :count="6" />

    <!-- Notas -->
    <div v-else class="notes-grid">
      <div v-for="note in items" :key="note.id" class="note-card" style="cursor:pointer" @click="openView(note)">
        <div class="note-card-header">
          <div class="note-card-title">{{ note.title }}</div>
          <q-btn flat round dense size="xs" icon="more_vert"
            style="color:var(--ds-text-3); flex-shrink:0" @click.stop>
            <q-menu>
              <q-list style="min-width:130px; padding:4px">
                <q-item clickable v-close-popup @click="openView(note)" style="border-radius:6px">
                  <q-item-section avatar style="min-width:28px"><q-icon name="open_in_full" size="14px" /></q-item-section>
                  <q-item-section style="font-size:13px">Ver nota</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="startEdit(note)" style="border-radius:6px">
                  <q-item-section avatar style="min-width:28px"><q-icon name="edit" size="14px" /></q-item-section>
                  <q-item-section style="font-size:13px">Editar</q-item-section>
                </q-item>
                <q-separator style="margin:4px 0" />
                <q-item clickable v-close-popup @click="confirmDelete(note)" style="border-radius:6px; color:var(--ds-negative)">
                  <q-item-section avatar style="min-width:28px"><q-icon name="delete" size="14px" /></q-item-section>
                  <q-item-section style="font-size:13px">Eliminar</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <div class="note-card-section">{{ note.section }}</div>
        <div class="note-card-preview">{{ plainPreview(note.content) }}</div>
      </div>
    </div>

    <!-- Dialog ver nota completa -->
    <q-dialog v-model="viewDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card style="display:flex; flex-direction:column; background:var(--ds-bg-0)">
        <!-- Header fijo -->
        <div class="view-header">
          <div class="col" style="min-width:0">
            <div class="view-title">{{ viewNote?.title }}</div>
            <div class="view-section">{{ viewNote?.section }}</div>
          </div>
          <div class="row items-center" style="gap:6px; flex-shrink:0">
            <q-btn flat dense size="sm" icon="edit" label="Editar"
              style="color:var(--ds-text-2); height:32px"
              @click="viewDialog = false; startEdit(viewNote)" />
            <q-btn flat round dense icon="close" size="sm"
              style="color:var(--ds-text-2)" v-close-popup />
          </div>
        </div>

        <!-- Contenido scrollable -->
        <q-scroll-area style="flex:1">
          <div class="view-body">
            <NoteContent :content="viewNote?.content || ''" />
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <EmptyState v-if="!loading && !items.length"
      icon="description"
      title="Sin notas aún"
      subtitle="Documenta decisiones técnicas, ideas o cualquier referencia importante del proyecto" />

    <div v-if="hasMore && !loading" class="flex flex-center q-mt-md">
      <q-btn flat size="sm" label="Cargar más" icon="expand_more"
        style="color:var(--ds-text-2)" :loading="loadingMore" @click="store.loadMore()" />
    </div>

    <!-- Dialog IA -->
    <q-dialog v-model="aiDialog" persistent>
      <q-card style="width:min(460px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div class="row items-center">
            <q-icon name="auto_awesome" size="16px" style="color:var(--ds-orange); margin-right:8px" />
            <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">Generar contenido con IA</div>
          </div>
        </q-card-section>
        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <q-select v-model="aiForm.docType" :options="docTypeOptions" label="Tipo de documento"
            outlined dense emit-value map-options />
          <q-input v-model="aiForm.prompt" label="¿Qué deseas generar?" outlined dense type="textarea"
            rows="3" placeholder="Ej: README para una API REST en Node.js con rutas de usuarios" />
          <q-input v-model="aiForm.context" label="Contexto adicional (opcional)" outlined dense type="textarea"
            rows="2" placeholder="Tecnologías, restricciones, estructura del proyecto..." />
        </q-card-section>
        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" style="color:var(--ds-text-2)" @click="aiDialog = false" />
          <q-btn color="primary" label="Generar" size="sm" icon="auto_awesome"
            :loading="aiGenerating" style="min-width:80px; height:34px" @click="generateWithAI" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog crear / editar -->
    <q-dialog v-model="openForm" persistent>
      <q-card style="width:min(520px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">
            {{ editing ? 'Editar nota' : 'Nueva nota' }}
          </div>
        </q-card-section>

        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <q-input v-model="form.title" label="Título" outlined dense />
          <q-input v-model="form.section" label="Sección" outlined dense />

          <!-- Contenido con barra de herramientas -->
          <div>
            <div class="note-editor-toolbar">
              <span style="font-size:11px; color:var(--ds-text-3)">Contenido</span>
              <div class="row" style="gap:2px">
                <q-btn flat dense size="xs" icon="auto_awesome" style="color:var(--ds-orange)"
                  @click="aiDialog = true">
                  <q-tooltip>Generar con IA</q-tooltip>
                </q-btn>
                <q-btn flat dense size="xs" icon="code" style="color:var(--ds-text-2)"
                  @click="insertCodeBlock">
                  <q-tooltip>Insertar bloque de código</q-tooltip>
                </q-btn>
              </div>
            </div>
            <q-input
              ref="contentRef"
              v-model="form.content"
              outlined
              type="textarea"
              :rows="8"
              placeholder="Escribe el contenido... Usa ```sql para bloques de código"
              style="font-family:'JetBrains Mono',monospace; font-size:12.5px"
            />
            <div style="font-size:11px; color:var(--ds-text-3); margin-top:4px">
              Tip: escribe <code style="background:var(--ds-bg-0);padding:1px 4px;border-radius:3px">```sql</code> para bloques de código. Soporta: sql, js, css, python, html, bash
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" v-close-popup @click="resetForm" style="color:var(--ds-text-2)" />
          <q-btn color="primary" :label="editing ? 'Guardar' : 'Crear'" size="sm" :loading="saving" style="min-width:72px; height:34px" @click="handleSubmit">
            <template #loading><DsSpinner size="sm" /></template>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useNotesStore } from 'src/stores/notes'
import { storeToRefs } from 'pinia'
import NoteContent from 'src/components/NoteContent.vue'
import SkeletonList from 'src/components/SkeletonList.vue'
import EmptyState from 'src/components/EmptyState.vue'
import { decodeId } from 'src/utils/routeId'
import { api } from 'src/boot/axios'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const store = useNotesStore()
const { items, loading, loadingMore, hasMore } = storeToRefs(store)
const projectId = computed(() => decodeId(route.params.id))

const openForm = ref(false)
const saving = ref(false)
const editing = ref(null)
const contentRef = ref(null)
const form = ref({ title: '', section: 'General', content: '' })

const viewDialog = ref(false)
const viewNote   = ref(null)

function openView(note) { viewNote.value = note; viewDialog.value = true }

function plainPreview(content) {
  if (!content) return ''
  return content
    .replace(/```[\s\S]*?```/g, '[código]')
    .replace(/[#*`>_~\[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 140)
}

const aiDialog = ref(false)
const aiGenerating = ref(false)
const aiForm = ref({ docType: 'general', prompt: '', context: '' })
const docTypeOptions = [
  { label: 'General', value: 'general' },
  { label: 'README', value: 'readme' },
  { label: 'Documentacion de API', value: 'api' },
  { label: 'Arquitectura', value: 'architecture' },
  { label: 'Tutorial', value: 'tutorial' },
]

onMounted(() => store.fetchAll(projectId.value))

function openNew() { resetForm(); openForm.value = true }

function startEdit(n) {
  editing.value = n
  form.value = { title: n.title, section: n.section, content: n.content }
  openForm.value = true
}

function resetForm() {
  editing.value = null
  form.value = { title: '', section: 'General', content: '' }
}

async function generateWithAI() {
  if (!aiForm.value.prompt) return
  aiGenerating.value = true
  try {
    const { data } = await api.post('/api/ai/generate', {
      prompt:  aiForm.value.prompt,
      docType: aiForm.value.docType,
      context: aiForm.value.context,
    })
    form.value.content = form.value.content
      ? form.value.content + '\n\n' + data.content
      : data.content
    aiDialog.value = false
    aiForm.value = { docType: 'general', prompt: '', context: '' }
    if (!openForm.value) openForm.value = true
    $q.notify({ type: 'positive', message: 'Contenido generado' })
  } catch (err) {
    const msg = err.response?.data?.mensaje || 'Error al generar contenido'
    $q.notify({ type: 'negative', message: msg })
  } finally { aiGenerating.value = false }
}

async function insertCodeBlock() {
  const lang = await new Promise(resolve => {
    $q.dialog({
      title: 'Insertar bloque de código',
      message: 'Lenguaje:',
      prompt: { model: 'sql', type: 'text', placeholder: 'sql, js, css, python, html, bash...' },
      cancel: true,
    }).onOk(val => resolve(val)).onCancel(() => resolve(null))
  })
  if (!lang) return
  const snippet = `\`\`\`${lang}\n// tu código aquí\n\`\`\``
  form.value.content = form.value.content
    ? form.value.content + '\n\n' + snippet
    : snippet
}

async function handleSubmit() {
  if (!form.value.title) {
    $q.notify({ type: 'warning', message: 'El título es requerido' })
    return
  }
  saving.value = true
  try {
    if (editing.value) {
      await store.update(editing.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Nota actualizada' })
    } else {
      await store.create(projectId.value, form.value)
      $q.notify({ type: 'positive', message: 'Nota creada' })
    }
    openForm.value = false
    resetForm()
  } finally {
    saving.value = false
  }
}

function confirmDelete(n) {
  $q.dialog({ title: 'Eliminar nota', message: `¿Eliminar "${n.title}"?`, cancel: true })
    .onOk(() => store.remove(n.id))
}
</script>

<style scoped>
/* ── Grid de notas ── */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.note-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 120ms ease;
}
.note-card:hover { border-color: var(--ds-border-md); }

.note-card-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.note-card-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--ds-text-1);
  line-height: 1.4;
}

.note-card-section {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ds-orange);
}

.note-card-preview {
  font-size: 12px;
  color: var(--ds-text-3);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* ── Vista completa ── */
.view-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--ds-border);
  background: var(--ds-bg-1);
  flex-shrink: 0;
}
.view-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ds-text-1);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.view-section {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ds-orange);
  margin-top: 2px;
}

.view-body {
  max-width: 740px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

/* ── Editor toolbar ── */
.note-editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 2px;
}
</style>
