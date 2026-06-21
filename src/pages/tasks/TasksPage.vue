<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="ds-page-title">Tareas</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ filteredCount }} de {{ tasks.length }} tarea{{ tasks.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <div class="row items-center" style="gap:6px">
        <q-btn flat dense size="sm" icon="visibility_off"
          :style="hideDone ? 'color:var(--ds-orange)' : 'color:var(--ds-text-3)'"
          @click="hideDone = !hideDone">
          <q-tooltip>{{ hideDone ? 'Mostrar completadas' : 'Ocultar completadas' }}</q-tooltip>
        </q-btn>
        <q-btn color="primary" icon="add" :label="$q.screen.gt.xs ? 'Nueva tarea' : ''"
          size="sm" style="height:34px" @click="openForm = true" />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filter-bar q-mb-md">
      <q-input v-model="filterText" dense outlined placeholder="Buscar tareas..."
        style="flex:1; min-width:140px; max-width:260px"
        clearable @clear="filterText = ''">
        <template #prepend><q-icon name="search" size="14px" style="color:var(--ds-text-3)" /></template>
      </q-input>

      <div class="filter-chips">
        <button v-for="p in priorityFilters" :key="p.value"
          class="filter-chip" :class="{ active: filterPriority === p.value, [p.value]: filterPriority === p.value }"
          @click="filterPriority = p.value">
          {{ p.label }}
        </button>
      </div>

      <button v-if="memberOptions.length > 1"
        class="filter-chip" :class="{ active: filterAssignee !== null }">
        <q-icon name="person" size="12px" style="margin-right:3px" />
        {{ filterAssignee ? memberOptions.find(m => m.value === filterAssignee)?.label?.replace(' (yo)','') : 'Asignado' }}
        <q-icon v-if="filterAssignee" name="close" size="11px" style="margin-left:3px"
          @click.stop="filterAssignee = null" />
        <q-menu>
          <q-list style="min-width:160px; padding:4px">
            <q-item clickable v-close-popup @click="filterAssignee = null" style="border-radius:6px">
              <q-item-section style="font-size:13px; color:var(--ds-text-2)">Todos</q-item-section>
            </q-item>
            <q-item v-for="m in memberOptions" :key="m.value"
              clickable v-close-popup @click="filterAssignee = m.value" style="border-radius:6px">
              <q-item-section style="font-size:13px">{{ m.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
    </div>

    <!-- Skeleton carga inicial -->
    <div v-if="loading" class="kanban-wrapper">
      <div v-for="c in 3" :key="c" class="kanban-col">
        <div class="kanban-header">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--ds-bg-2)" />
          <div style="width:70px;height:10px;background:var(--ds-bg-2);border-radius:4px;animation:skel-pulse 1.4s infinite" />
        </div>
        <SkeletonList :count="3" />
      </div>
    </div>

    <!-- Kanban con drag & drop -->
    <div v-else class="kanban-wrapper">
      <div v-for="col in visibleColumns" :key="col.status" class="kanban-col"
        :class="{ 'kanban-col--drag-over': dragOverCol === col.status }"
        @dragover.prevent="dragOverCol = col.status"
        @dragleave="dragOverCol = null"
        @drop.prevent="onDrop(col.status)">

        <div class="kanban-header">
          <span :style="{ width:'8px', height:'8px', borderRadius:'50%', background:col.dot, display:'inline-block' }" />
          {{ col.label }}
          <q-badge style="background:var(--ds-bg-hover); color:var(--ds-text-2); font-size:10px; margin-left:auto">
            {{ tasksByStatus(col.status).length }}
          </q-badge>
        </div>

        <div class="kanban-cards">
          <div v-for="task in tasksByStatus(col.status)" :key="task.id"
            class="task-card"
            :class="{ 'task-card--dragging': draggingId === task.id }"
            draggable="true"
            @dragstart="onDragStart(task)"
            @dragend="onDragEnd">

            <div class="row items-start no-wrap q-mb-xs">
              <q-icon name="drag_indicator" size="14px"
                style="color:var(--ds-text-3); flex-shrink:0; margin-right:4px; margin-top:1px; cursor:grab" />
              <div class="col" style="font-size:13px; font-weight:500; color:var(--ds-text-1); line-height:1.4">
                {{ task.title }}
              </div>
              <q-btn flat round dense size="xs" icon="more_vert"
                style="color:var(--ds-text-3); margin-top:-2px; flex-shrink:0" @click.stop>
                <q-menu>
                  <q-list style="min-width:150px; padding:4px">
                    <div style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--ds-text-3); padding:4px 12px 2px">
                      Mover a
                    </div>
                    <q-item v-for="s in statuses.filter(s => s.value !== task.status)" :key="s.value"
                      clickable v-close-popup @click="changeStatus(task, s.value)" style="border-radius:6px">
                      <q-item-section style="font-size:13px">{{ s.label }}</q-item-section>
                    </q-item>
                    <q-separator style="margin:4px 0" />
                    <q-item clickable v-close-popup @click="openAssign(task)" style="border-radius:6px">
                      <q-item-section style="font-size:13px">Asignar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openEdit(task)" style="border-radius:6px">
                      <q-item-section style="font-size:13px">Editar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="duplicateTask(task)" style="border-radius:6px">
                      <q-item-section style="font-size:13px">Duplicar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openComments(task)" style="border-radius:6px">
                      <q-item-section style="font-size:13px">Comentarios</q-item-section>
                    </q-item>
                    <q-separator style="margin:4px 0" />
                    <q-item clickable v-close-popup @click="deleteTask(task)" style="border-radius:6px; color:var(--ds-negative)">
                      <q-item-section style="font-size:13px">Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div v-if="task.description" style="font-size:11px; color:var(--ds-text-2); margin-bottom:8px; line-height:1.4">
              {{ task.description }}
            </div>

            <!-- Footer de la tarjeta -->
            <div class="row items-center" style="gap:6px; justify-content:space-between; margin-top:6px">
              <span class="priority-badge" :class="task.priority">{{ task.priority }}</span>
              <div class="row items-center" style="gap:6px; margin-left:auto">
                <!-- Fecha límite -->
                <span v-if="task.dueDate" class="due-badge" :class="dueDateClass(task.dueDate)">
                  <q-icon name="schedule" size="10px" style="margin-right:2px" />
                  {{ dueDateLabel(task.dueDate) }}
                </span>
                <!-- Asignado -->
                <div v-if="task.assignee" class="row items-center" style="gap:3px">
                  <q-avatar size="18px" :style="{ background:'var(--ds-orange)', color:'#fff', fontSize:'9px', fontWeight:'700' }">
                    {{ assigneeInitial(task.assignee) }}
                  </q-avatar>
                  <q-btn flat round dense size="xs" icon="close"
                    style="color:var(--ds-text-3); margin:-2px"
                    @click.stop="clearAssignee(task)">
                    <q-tooltip>Quitar asignación</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!tasksByStatus(col.status).length"
            class="kanban-empty"
            :class="{ 'kanban-empty--active': dragOverCol === col.status }">
            {{ dragOverCol === col.status ? 'Suelta aquí' : 'Sin tareas' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog nueva/editar tarea -->
    <q-dialog v-model="openForm" persistent>
      <q-card style="width:min(400px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">
            {{ editingTask ? 'Editar tarea' : 'Nueva tarea' }}
          </div>
        </q-card-section>
        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <q-input v-model="form.title" label="Título" outlined dense />
          <q-input v-model="form.description" label="Descripción" outlined dense type="textarea" rows="3" />
          <div class="row q-gutter-sm">
            <q-select v-model="form.status" :options="statuses" label="Estado" outlined dense emit-value map-options class="col" />
            <q-select v-model="form.priority" :options="priorities" label="Prioridad" outlined dense emit-value map-options class="col" />
          </div>
          <q-input v-model="form.dueDate" label="Fecha límite (opcional)" outlined dense type="date"
            style="max-width:200px" clearable />
          <q-select v-model="form.assignee" :options="memberOptions"
            label="Asignar a (opcional)" outlined dense emit-value map-options clearable />
        </q-card-section>
        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" @click="closeForm" style="color:var(--ds-text-2)" />
          <q-btn color="primary" :label="editingTask ? 'Guardar' : 'Crear'" size="sm"
            :loading="saving" style="min-width:72px; height:34px"
            @click="editingTask ? handleEdit() : handleCreate()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog comentarios -->
    <q-dialog v-model="commentsDialog" persistent>
      <q-card style="width:min(480px,96vw); max-height:85vh; display:flex; flex-direction:column">
        <q-card-section style="padding:20px 24px 0; flex-shrink:0">
          <div class="row items-center">
            <div class="col">
              <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">Comentarios</div>
              <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">{{ commentsTask?.title }}</div>
            </div>
            <q-btn flat round dense icon="close" size="sm" style="color:var(--ds-text-2)" v-close-popup />
          </div>
        </q-card-section>

        <!-- Lista de comentarios -->
        <q-card-section style="flex:1; overflow-y:auto; padding:16px 24px">
          <div v-if="commentsStore.loading" class="flex flex-center q-py-lg">
            <q-spinner size="24px" color="primary" />
          </div>
          <div v-else-if="!commentsStore.items.length" class="flex flex-center column q-py-lg" style="color:var(--ds-text-3)">
            <q-icon name="chat_bubble_outline" size="32px" style="opacity:0.35" />
            <p style="font-size:13px; margin-top:8px">Sin comentarios aún</p>
          </div>
          <div v-else class="q-gutter-sm">
            <div v-for="c in commentsStore.items" :key="c.id" class="comment-row">
              <q-avatar size="28px" :style="{ background:'var(--ds-orange)', color:'#fff', fontSize:'11px', fontWeight:'700', flexShrink:0 }">
                {{ c.author?.name?.[0]?.toUpperCase() || '?' }}
              </q-avatar>
              <div class="col comment-bubble">
                <div class="row items-center" style="gap:6px; margin-bottom:3px">
                  <span style="font-size:12px; font-weight:600; color:var(--ds-text-1)">{{ c.author?.name }}</span>
                  <span style="font-size:10px; color:var(--ds-text-3)">{{ formatTs(c.createdAt) }}</span>
                  <q-btn v-if="c.author?.id === auth.user?.id"
                    flat round dense size="xs" icon="close" style="color:var(--ds-text-3); margin-left:auto"
                    @click="removeComment(c.id)">
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </div>
                <div style="font-size:13px; color:var(--ds-text-1); white-space:pre-wrap; word-break:break-word">{{ c.content }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Input nuevo comentario -->
        <q-card-section style="padding:0 24px 20px; flex-shrink:0; border-top:1px solid var(--ds-border)">
          <div class="row items-end q-gutter-sm q-pt-sm">
            <q-input v-model="newComment" outlined dense placeholder="Escribe un comentario..."
              class="col" type="textarea" rows="2" autogrow
              @keydown.ctrl.enter="submitComment" />
            <q-btn color="primary" icon="send" dense size="sm" style="height:38px; width:38px"
              :loading="submittingComment" :disable="!newComment.trim()"
              @click="submitComment">
              <q-tooltip>Enviar (Ctrl+Enter)</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog asignar -->
    <q-dialog v-model="assignDialog" persistent>
      <q-card style="width:min(320px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">Asignar tarea</div>
          <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">{{ assignTask?.title }}</div>
        </q-card-section>
        <q-card-section style="padding:16px 24px">
          <q-select v-model="assigneeId" :options="memberOptions"
            label="Persona asignada" outlined dense emit-value map-options clearable />
        </q-card-section>
        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" v-close-popup style="color:var(--ds-text-2)" />
          <q-btn color="primary" label="Guardar" size="sm" :loading="saving" style="min-width:72px; height:34px" @click="saveAssign" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTasksStore } from 'src/stores/tasks'
import SkeletonList from 'src/components/SkeletonList.vue'
import { useMembersStore } from 'src/stores/members'
import { useAuthStore } from 'src/stores/auth'
import { useCommentsStore } from 'src/stores/comments'
import { storeToRefs } from 'pinia'
import { decodeId } from 'src/utils/routeId'

const $q = useQuasar()
const route = useRoute()
const store = useTasksStore()
const membersStore = useMembersStore()
const auth = useAuthStore()
const commentsStore = useCommentsStore()
const { items: tasks, loading } = storeToRefs(store)
const { members } = storeToRefs(membersStore)

const projectId = computed(() => decodeId(route.params.id))
const openForm = ref(false)
const saving = ref(false)
const editingTask = ref(null)
const assignDialog = ref(false)
const assignTask = ref(null)
const assigneeId = ref(null)
const form = ref({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignee: null })

// Filtros
const filterText = ref('')
const filterPriority = ref('all')
const filterAssignee = ref(null)
const hideDone = ref(false)

// Drag & drop
const draggingTask = ref(null)
const draggingId = ref(null)
const dragOverCol = ref(null)

const columns = [
  { status: 'todo',        label: 'Por hacer',   dot: '#6B7280' },
  { status: 'in_progress', label: 'En progreso', dot: '#38BDF8' },
  { status: 'done',        label: 'Completado',  dot: '#22C55E' },
]
const statuses   = columns.map(c => ({ label: c.label, value: c.status }))
const priorities = [{ label:'Baja', value:'low' }, { label:'Media', value:'medium' }, { label:'Alta', value:'high' }]
const priorityFilters = [
  { label: 'Todas', value: 'all' },
  { label: 'Alta',  value: 'high' },
  { label: 'Media', value: 'medium' },
  { label: 'Baja',  value: 'low' },
]

const visibleColumns = computed(() =>
  hideDone.value ? columns.filter(c => c.status !== 'done') : columns
)

const filteredTasks = computed(() => {
  let list = tasks.value
  if (hideDone.value) list = list.filter(t => t.status !== 'done')
  if (filterPriority.value !== 'all') list = list.filter(t => t.priority === filterPriority.value)
  if (filterAssignee.value != null) {
    list = list.filter(t => {
      const id = typeof t.assignee === 'object' ? t.assignee?.id : t.assignee
      return id === filterAssignee.value
    })
  }
  if (filterText.value.trim()) {
    const q = filterText.value.toLowerCase().trim()
    list = list.filter(t =>
      t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    )
  }
  return list
})

const filteredCount = computed(() => filteredTasks.value.length)

const tasksByStatus = s => filteredTasks.value.filter(t => t.status === s)

const memberOptions = computed(() => {
  const opts = []
  if (auth.user) opts.push({ label: auth.user.name + ' (yo)', value: auth.user.id })
  for (const m of members.value) {
    if (m.user && m.user.id !== auth.user?.id) {
      opts.push({ label: m.user.name, value: m.user.id })
    }
  }
  return opts
})

const assigneeInitial = (u) => (typeof u === 'object' ? u?.name?.[0]?.toUpperCase() : '?')

// ── Due date helpers ──
function dueDateLabel(date) {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = d - today
  if (diff < 0) return 'Vencida'
  if (diff === 0) return 'Hoy'
  if (diff <= 86400000) return 'Mañana'
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}
function dueDateClass(date) {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = d - today
  if (diff < 0) return 'due-overdue'
  if (diff === 0) return 'due-today'
  if (diff <= 86400000) return 'due-soon'
  return 'due-normal'
}

onMounted(() => {
  store.fetchAll(projectId.value)
  membersStore.fetchAll(projectId.value)
})

// ── Drag & drop ──
function onDragStart(task) { draggingTask.value = task; draggingId.value = task.id }
function onDragEnd() { draggingTask.value = null; draggingId.value = null; dragOverCol.value = null }
async function onDrop(targetStatus) {
  dragOverCol.value = null
  if (!draggingTask.value) return
  if (draggingTask.value.status === targetStatus) return
  await store.update(draggingTask.value.id, { status: targetStatus })
  draggingTask.value = null; draggingId.value = null
}

// ── CRUD ──
async function handleCreate() {
  if (!form.value.title) return
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.dueDate) delete payload.dueDate
    await store.create(projectId.value, payload)
    closeForm()
    $q.notify({ type: 'positive', message: 'Tarea creada' })
  } finally { saving.value = false }
}

function openEdit(task) {
  editingTask.value = task
  const assigneeVal = typeof task.assignee === 'object' ? task.assignee?.id : task.assignee
  form.value = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    assignee: assigneeVal ?? null,
  }
  openForm.value = true
}

async function handleEdit() {
  if (!form.value.title || !editingTask.value) return
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.dueDate) payload.dueDate = null
    await store.update(editingTask.value.id, payload)
    closeForm()
    $q.notify({ type: 'positive', message: 'Tarea actualizada' })
  } finally { saving.value = false }
}

function closeForm() {
  openForm.value = false
  editingTask.value = null
  form.value = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignee: null }
}

async function changeStatus(task, status) { await store.update(task.id, { status }) }

function openAssign(task) {
  assignTask.value = task
  assigneeId.value = typeof task.assignee === 'object' ? task.assignee?.id : task.assignee ?? null
  assignDialog.value = true
}
async function saveAssign() {
  if (!assignTask.value) return
  saving.value = true
  try {
    const payload = assigneeId.value ? { assignee: assigneeId.value } : { clearAssignee: true }
    await store.update(assignTask.value.id, payload)
    assignDialog.value = false
    $q.notify({ type: 'positive', message: 'Asignación guardada' })
  } finally { saving.value = false }
}
async function clearAssignee(task) { await store.update(task.id, { clearAssignee: true }) }

async function duplicateTask(task) {
  const assigneeVal = typeof task.assignee === 'object' ? task.assignee?.id : task.assignee
  await store.create(projectId.value, {
    title: task.title + ' (copia)',
    description: task.description || '',
    status: 'todo',
    priority: task.priority,
    dueDate: task.dueDate,
    assignee: assigneeVal,
  })
  $q.notify({ type: 'positive', message: 'Tarea duplicada' })
}

function deleteTask(task) {
  $q.dialog({ title: 'Eliminar tarea', message: `¿Eliminar "${task.title}"?`, cancel: true })
    .onOk(() => store.remove(task.id))
}

// ── Comentarios ──
const commentsDialog = ref(false)
const commentsTask   = ref(null)
const newComment     = ref('')
const submittingComment = ref(false)

function openComments(task) {
  commentsTask.value = task
  commentsStore.clear()
  commentsStore.fetchAll(task.id)
  commentsDialog.value = true
}

async function submitComment() {
  if (!newComment.value.trim() || !commentsTask.value) return
  submittingComment.value = true
  try {
    await commentsStore.create(commentsTask.value.id, newComment.value.trim())
    newComment.value = ''
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar comentario' })
  } finally { submittingComment.value = false }
}

async function removeComment(id) {
  await commentsStore.remove(id)
}

function formatTs(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'ahora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
@keyframes skel-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.filter-chip {
  font-size: 11px; font-weight: 500;
  padding: 3px 10px; border-radius: 20px;
  border: 1px solid var(--ds-border-md);
  background: var(--ds-bg-1);
  color: var(--ds-text-2);
  cursor: pointer;
  transition: all 100ms ease;
}
.filter-chip:hover { background: var(--ds-bg-hover); color: var(--ds-text-1); }
.filter-chip.active { background: var(--ds-bg-2); color: var(--ds-text-1); border-color: var(--ds-border-md); }
.filter-chip.active.high   { border-color: rgba(239,68,68,0.5); color: #EF4444; background: rgba(239,68,68,0.08); }
.filter-chip.active.medium { border-color: rgba(251,191,36,0.5); color: #FBBF24; background: rgba(251,191,36,0.08); }
.filter-chip.active.low    { border-color: rgba(107,114,128,0.5); color: #9CA3AF; background: rgba(107,114,128,0.08); }

/* ── Kanban ── */
.kanban-wrapper {
  display: flex; gap: 12px; overflow-x: auto;
  padding-bottom: 12px; -webkit-overflow-scrolling: touch;
}
.kanban-col {
  min-width: 260px; width: 260px; flex-shrink: 0;
  background: var(--ds-bg-1); border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius); padding: 12px;
  display: flex; flex-direction: column;
  max-height: calc(100vh - 240px);
  transition: border-color 120ms ease, background 120ms ease;
}
.kanban-col--drag-over {
  border-color: var(--ds-orange) !important;
  background: var(--ds-orange-dim) !important;
}
@media (min-width: 900px) {
  .kanban-wrapper { flex-wrap: nowrap; }
  .kanban-col { flex: 1; min-width: 220px; width: auto; }
}
.kanban-header {
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ds-text-2); padding-bottom: 10px; border-bottom: 1px solid var(--ds-border);
  margin-bottom: 10px; display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.kanban-cards { overflow-y: auto; flex: 1; padding-right: 2px; }
.kanban-cards::-webkit-scrollbar { width: 4px; }
.kanban-cards::-webkit-scrollbar-track { background: transparent; }
.kanban-cards::-webkit-scrollbar-thumb { background: var(--ds-border); border-radius: 2px; }

/* ── Task card ── */
.task-card {
  background: var(--ds-bg-2); border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm); padding: 10px 12px; margin-bottom: 6px;
  cursor: grab; transition: border-color 120ms ease, opacity 120ms ease, transform 120ms ease;
}
.task-card:hover { border-color: var(--ds-border-md); transform: translateY(-1px); }
.task-card--dragging { opacity: 0.4; cursor: grabbing; }

.kanban-empty {
  font-size: 12px; color: var(--ds-text-3); text-align: center;
  padding: 20px 0; border: 1px dashed var(--ds-border);
  border-radius: 6px; margin-top: 4px;
  transition: border-color 120ms ease, color 120ms ease;
}
.kanban-empty--active { border-color: var(--ds-orange); color: var(--ds-orange); }

/* ── Priority badges ── */
.priority-badge { font-size:10px; font-weight:600; padding:1px 6px; border-radius:3px; text-transform:uppercase; letter-spacing:0.04em; }
.priority-badge.low    { background:rgba(107,114,128,0.15); color:#9CA3AF; }
.priority-badge.medium { background:rgba(251,191,36,0.12);  color:#FBBF24; }
.priority-badge.high   { background:rgba(239,68,68,0.12);   color:#EF4444; }

/* ── Due date badges ── */
.due-badge {
  display: inline-flex; align-items: center;
  font-size: 10px; font-weight: 500;
  padding: 1px 6px; border-radius: 3px;
}
.due-badge.due-overdue { background: rgba(239,68,68,0.12);   color: #EF4444; }
.due-badge.due-today   { background: rgba(249,115,22,0.12);  color: #F97316; }
.due-badge.due-soon    { background: rgba(251,191,36,0.12);  color: #FBBF24; }
.due-badge.due-normal  { background: rgba(107,114,128,0.12); color: #9CA3AF; }

/* ── Comentarios ── */
.comment-row {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 8px 0; border-bottom: 1px solid var(--ds-border);
}
.comment-row:last-child { border-bottom: none; }
.comment-bubble {
  background: var(--ds-bg-2); border: 1px solid var(--ds-border);
  border-radius: 6px; padding: 8px 10px;
}
</style>
