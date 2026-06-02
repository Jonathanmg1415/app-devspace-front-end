<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Tareas</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ tasks.length }} tarea{{ tasks.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <q-btn color="primary" icon="add" :label="$q.screen.gt.xs ? 'Nueva tarea' : ''"
        size="sm" style="height:34px" @click="openForm = true" />
    </div>

    <!-- Kanban — horizontal scroll en móvil, columnas completas en desktop -->
    <div class="kanban-wrapper">
      <div v-for="col in columns" :key="col.status" class="kanban-col">
        <div class="kanban-header">
          <span :style="{ width:'8px', height:'8px', borderRadius:'50%', background:col.dot, display:'inline-block' }" />
          {{ col.label }}
          <q-badge style="background:var(--ds-bg-hover); color:var(--ds-text-2); font-size:10px; margin-left:auto">
            {{ tasksByStatus(col.status).length }}
          </q-badge>
        </div>

        <!-- ✅ Contenedor con scroll -->
        <div class="kanban-cards">
          <div v-for="task in tasksByStatus(col.status)" :key="task.id" class="task-card">
            <div class="row items-start no-wrap q-mb-xs">
              <div class="col" style="font-size:13px; font-weight:500; color:var(--ds-text-1); line-height:1.4">
                {{ task.title }}
              </div>
              <q-btn flat round dense size="xs" icon="more_vert"
                style="color:var(--ds-text-3); margin-top:-2px; flex-shrink:0" @click.stop>
                <q-menu>
                  <q-list style="min-width:130px; padding:4px">
                    <div style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--ds-text-3); padding:4px 12px 2px">
                      Mover a
                    </div>
                    <q-item v-for="s in statuses.filter(s => s.value !== task.status)" :key="s.value"
                      clickable v-close-popup @click="changeStatus(task, s.value)" style="border-radius:6px">
                      <q-item-section style="font-size:13px">{{ s.label }}</q-item-section>
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
            <div class="row items-center" style="gap:6px">
              <span class="priority-badge" :class="task.priority">{{ task.priority }}</span>
            </div>
          </div>

          <div v-if="!tasksByStatus(col.status).length"
            style="font-size:12px; color:var(--ds-text-3); text-align:center; padding:20px 0; border:1px dashed var(--ds-border); border-radius:6px; margin-top:4px">
            Sin tareas
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="openForm" persistent>
      <q-card style="width:min(380px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">Nueva tarea</div>
        </q-card-section>
        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <q-input v-model="form.title" label="Título" outlined dense />
          <q-input v-model="form.description" label="Descripción" outlined dense type="textarea" rows="3" />
          <div class="row q-gutter-sm">
            <q-select v-model="form.status" :options="statuses" label="Estado" outlined dense emit-value map-options class="col" />
            <q-select v-model="form.priority" :options="priorities" label="Prioridad" outlined dense emit-value map-options class="col" />
          </div>
        </q-card-section>
        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" v-close-popup style="color:var(--ds-text-2)" />
          <q-btn color="primary" label="Crear" size="sm" :loading="saving" style="min-width:72px; height:34px" @click="handleCreate" />
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
import { storeToRefs } from 'pinia'

const $q = useQuasar(); const route = useRoute()
const store = useTasksStore(); const { items: tasks } = storeToRefs(store)
const projectId = computed(() => route.params.id)
const openForm = ref(false); const saving = ref(false)
const form = ref({ title: '', description: '', status: 'todo', priority: 'medium' })

const columns = [
  { status: 'todo',        label: 'Por hacer',   dot: '#6B7280' },
  { status: 'in_progress', label: 'En progreso', dot: '#38BDF8' },
  { status: 'done',        label: 'Completado',  dot: '#22C55E' },
]
const statuses   = columns.map(c => ({ label: c.label, value: c.status }))
const priorities = [{ label:'Baja', value:'low' }, { label:'Media', value:'medium' }, { label:'Alta', value:'high' }]
const tasksByStatus = s => tasks.value.filter(t => t.status === s)

onMounted(() => store.fetchAll(projectId.value))

async function handleCreate() {
  if (!form.value.title) return
  saving.value = true
  try {
    await store.create(projectId.value, form.value)
    openForm.value = false
    form.value = { title: '', description: '', status: 'todo', priority: 'medium' }
    $q.notify({ type: 'positive', message: 'Tarea creada' })
  } finally { saving.value = false }
}
async function changeStatus(task, status) { await store.update(task.id, { status }) }
function deleteTask(task) {
  $q.dialog({ title: 'Eliminar tarea', message: `¿Eliminar "${task.title}"?`, cancel: true })
    .onOk(() => store.remove(task.id))
}
</script>

<style scoped>
.kanban-wrapper {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}
.kanban-col {
  min-width: 260px;
  width: 260px;
  flex-shrink: 0;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 12px;
  /* ✅ Columna no crece indefinidamente */
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 180px);
}
@media (min-width: 900px) {
  .kanban-wrapper { flex-wrap: nowrap; }
  .kanban-col { flex: 1; min-width: 220px; width: auto; }
}
.kanban-header {
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ds-text-2); padding-bottom: 10px; border-bottom: 1px solid var(--ds-border);
  margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
  flex-shrink: 0; /* ✅ El header no se comprime */
}
/* ✅ Área de tarjetas con scroll independiente por columna */
.kanban-cards {
  overflow-y: auto;
  flex: 1;
  padding-right: 2px;
}
.kanban-cards::-webkit-scrollbar {
  width: 4px;
}
.kanban-cards::-webkit-scrollbar-track {
  background: transparent;
}
.kanban-cards::-webkit-scrollbar-thumb {
  background: var(--ds-border);
  border-radius: 2px;
}
.kanban-cards::-webkit-scrollbar-thumb:hover {
  background: var(--ds-border-md);
}
.task-card {
  background: var(--ds-bg-2); border: 1px solid var(--ds-border); border-radius: var(--ds-radius-sm);
  padding: 10px 12px; margin-bottom: 6px; cursor: pointer; transition: border-color 120ms ease;
}
.task-card:hover { border-color: var(--ds-border-md); }
.priority-badge { font-size:10px; font-weight:600; padding:1px 6px; border-radius:3px; text-transform:uppercase; letter-spacing:0.04em; }
.priority-badge.low    { background:rgba(107,114,128,0.15); color:#9CA3AF; }
.priority-badge.medium { background:rgba(251,191,36,0.12);  color:#FBBF24; }
.priority-badge.high   { background:rgba(239,68,68,0.12);   color:#EF4444; }
</style>