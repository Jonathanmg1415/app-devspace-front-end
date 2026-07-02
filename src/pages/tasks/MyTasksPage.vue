<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Mis tareas</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ totalCount }} tarea{{ totalCount !== 1 ? 's' : '' }} asignadas a ti
        </div>
      </div>
      <!-- Filtro de estado -->
      <div class="row" style="gap:4px">
        <q-btn
          v-for="f in FILTERS" :key="f.value"
          :label="f.label" size="sm" dense rounded unelevated
          :style="filter === f.value
            ? 'background:var(--ds-orange); color:#fff; height:28px; padding:0 10px'
            : 'background:var(--ds-bg-2); color:var(--ds-text-2); height:28px; padding:0 10px; border:1px solid var(--ds-border)'"
          @click="filter = f.value" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="my-tasks-empty">
      <DsSpinner size="lg" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredTasks.length" class="my-tasks-empty">
      <q-icon name="task_alt" size="40px" style="color:var(--ds-text-3); opacity:0.4" />
      <div style="font-size:13px; color:var(--ds-text-3); margin-top:10px">
        {{ filter === 'all' ? 'No tienes tareas asignadas aún' : 'Sin tareas con este filtro' }}
      </div>
    </div>

    <!-- Grupos por proyecto -->
    <template v-else>
      <div v-for="group in groupedByProject" :key="group.projectId" class="project-group">
        <!-- Header del proyecto -->
        <div class="project-group-header">
          <span class="project-dot" :style="{ background: group.color }" />
          <span class="project-name">{{ group.projectName }}</span>
          <span class="project-count">{{ group.tasks.length }}</span>
        </div>

        <!-- Tareas del grupo -->
        <div class="task-list">
          <div v-for="task in group.tasks" :key="task.id" class="task-row">
            <!-- Status toggle -->
            <button class="status-btn" :class="`status-btn--${task.status}`"
              @click="cycleStatus(task)">
              <q-icon :name="statusIcon(task.status)" size="13px" />
            </button>

            <!-- Contenido -->
            <div class="task-content">
              <div class="task-title" :class="{ 'task-title--done': task.status === 'done' }">
                {{ task.title }}
              </div>
              <div v-if="task.description" class="task-desc">{{ task.description }}</div>
            </div>

            <!-- Meta -->
            <div class="task-meta">
              <span v-if="task.dueDate" class="due-chip" :class="dueDateClass(task)">
                <q-icon name="schedule" size="10px" />
                {{ formatDate(task.dueDate) }}
              </span>
              <span class="priority-dot" :style="{ background: priorityColor(task.priority) }" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { encodeId } from 'src/utils/routeId'
import DsSpinner from 'src/components/DsSpinner.vue'

const $q = useQuasar()
const loading = ref(true)
const tasks   = ref([])
const filter  = ref('all')

const FILTERS = [
  { label: 'Todas',       value: 'all' },
  { label: 'Pendientes',  value: 'todo' },
  { label: 'En progreso', value: 'in_progress' },
  { label: 'Listas',      value: 'done' },
]

onMounted(async () => {
  try {
    const { data } = await api.get('/api/tasks/mine')
    tasks.value = data.tasks ?? []
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar tus tareas' })
  } finally { loading.value = false }
})

const filteredTasks = computed(() =>
  filter.value === 'all' ? tasks.value : tasks.value.filter(t => t.status === filter.value)
)

const totalCount = computed(() => tasks.value.length)

const groupedByProject = computed(() => {
  const map = new Map()
  for (const t of filteredTasks.value) {
    const pid = t.project?.id ?? t.project
    if (!map.has(pid)) {
      map.set(pid, {
        projectId:   pid,
        projectName: t.project?.name ?? 'Proyecto',
        color:       t.project?.color || 'var(--ds-orange)',
        tasks:       [],
      })
    }
    map.get(pid).tasks.push(t)
  }
  return [...map.values()]
})

const STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' }

async function cycleStatus(task) {
  const next = STATUS_CYCLE[task.status]
  const prev = task.status
  task.status = next
  try {
    await api.put('/api/tasks/edit', { id: task.id, status: next })
  } catch {
    task.status = prev
    $q.notify({ type: 'negative', message: 'Error al actualizar' })
  }
}

function statusIcon(s) {
  return { todo: 'radio_button_unchecked', in_progress: 'timelapse', done: 'check_circle' }[s] || 'radio_button_unchecked'
}

function priorityColor(p) {
  return { low: '#64748B', medium: '#F97316', high: '#EF4444' }[p] || '#64748B'
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const now   = new Date()
  const diff  = (date - now) / 86400000
  if (diff < 0)       return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
  if (diff < 1)       return 'Hoy'
  if (diff < 2)       return 'Mañana'
  if (diff < 7)       return `En ${Math.ceil(diff)} días`
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function dueDateClass(task) {
  if (!task.dueDate || task.status === 'done') return ''
  const diff = (new Date(task.dueDate) - new Date()) / 86400000
  if (diff < 0)  return 'due-overdue'
  if (diff < 1)  return 'due-today'
  if (diff < 3)  return 'due-soon'
  return ''
}
</script>

<style scoped>
.my-tasks-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

/* ── Grupo por proyecto ── */
.project-group {
  margin-bottom: 20px;
}
.project-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 8px;
  border-bottom: 1px solid var(--ds-border);
  margin-bottom: 2px;
}
.project-dot {
  width: 8px; height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}
.project-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--ds-text-2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex: 1;
}
.project-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--ds-text-3);
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  padding: 0 7px;
  height: 18px;
  display: flex;
  align-items: center;
}

/* ── Fila de tarea ── */
.task-list { display: flex; flex-direction: column; }
.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 4px;
  border-bottom: 1px solid var(--ds-border);
  transition: background 100ms ease;
  border-radius: 4px;
}
.task-row:last-child { border-bottom: none; }
.task-row:hover { background: var(--ds-bg-hover); }

/* Status button */
.status-btn {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 120ms ease;
}
.status-btn--todo       { background: var(--ds-bg-2); color: var(--ds-text-3); }
.status-btn--in_progress{ background: rgba(249,115,22,0.14); color: var(--ds-orange); }
.status-btn--done       { background: rgba(34,197,94,0.14); color: #22C55E; }

/* Contenido */
.task-content { flex: 1; min-width: 0; }
.task-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ds-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-title--done {
  text-decoration: line-through;
  color: var(--ds-text-3);
}
.task-desc {
  font-size: 11px;
  color: var(--ds-text-3);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Meta */
.task-meta { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.due-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--ds-bg-2);
  color: var(--ds-text-3);
  border: 1px solid var(--ds-border);
}
.due-chip.due-overdue  { background: rgba(239,68,68,0.1);  color: #EF4444; border-color: rgba(239,68,68,0.2); }
.due-chip.due-today    { background: rgba(249,115,22,0.1); color: var(--ds-orange); border-color: rgba(249,115,22,0.2); }
.due-chip.due-soon     { background: rgba(251,191,36,0.1); color: #FBBF24; border-color: rgba(251,191,36,0.2); }

.priority-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
