<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Proyectos</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ projects.length }} proyecto{{ projects.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <q-btn color="primary" icon="add" :label="$q.screen.gt.xs ? 'Nuevo proyecto' : ''"
        size="sm" style="height:34px" @click="openCreate = true" />
    </div>

    <div v-if="loading">
      <SkeletonList variant="list" :count="3" />
    </div>

    <EmptyState v-else-if="!projects.length"
      icon="folder_open"
      title="Sin proyectos aún"
      subtitle="Crea tu primer proyecto para empezar a organizar tu trabajo">
      <q-btn color="primary" label="Crear el primero" size="sm" @click="openCreate = true" />
    </EmptyState>

    <div v-else class="projects-grid">
      <div v-for="project in projects" :key="project.id"
        class="project-card" @click="router.push(`/projects/${encodeId(project.id)}`)">
        <div class="project-color-bar" :style="{ background: project.color || 'var(--ds-orange)' }" />
        <div style="padding:14px 14px 14px 18px">
          <div class="row items-start no-wrap">
            <div class="col">
              <div style="font-size:14px; font-weight:600; color:var(--ds-text-1); line-height:1.3">
                {{ project.name }}
              </div>
              <div v-if="project.description"
                style="font-size:12px; color:var(--ds-text-2); margin-top:3px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden">
                {{ project.description }}
              </div>
            </div>
            <q-btn v-if="project._role === 'owner'" flat round dense icon="more_vert" size="xs"
              style="color:var(--ds-text-3); margin-top:-2px; margin-right:-6px" @click.stop>
              <q-menu>
                <q-list style="min-width:150px; padding:4px">
                  <q-item clickable v-close-popup @click="startEdit(project)" style="border-radius:6px">
                    <q-item-section avatar style="min-width:28px"><q-icon name="edit" size="13px" /></q-item-section>
                    <q-item-section style="font-size:13px">Editar</q-item-section>
                  </q-item>
                  <!-- Status -->
                  <q-separator style="margin:4px 0" />
                  <div style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--ds-text-3); padding:4px 12px 2px">
                    Estado
                  </div>
                  <q-item v-for="s in statusOptions.filter(o => o.value !== project.status)" :key="s.value"
                    clickable v-close-popup @click="changeStatus(project, s.value)" style="border-radius:6px">
                    <q-item-section avatar style="min-width:28px">
                      <div style="width:8px; height:8px; border-radius:50%" :style="{ background: s.color }" />
                    </q-item-section>
                    <q-item-section style="font-size:13px">{{ s.label }}</q-item-section>
                  </q-item>
                  <q-separator style="margin:4px 0" />
                  <q-item clickable v-close-popup @click="confirmDelete(project)"
                    style="border-radius:6px; color:var(--ds-negative)">
                    <q-item-section avatar style="min-width:28px"><q-icon name="delete_outline" size="13px" /></q-item-section>
                    <q-item-section style="font-size:13px">Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="row items-center q-mt-sm" style="gap:6px">
            <span v-if="project._role === 'member'" class="ds-status-badge member">miembro</span>
            <span v-else class="ds-status-badge" :class="project.status || 'active'">
              {{ statusLabel(project.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog crear / editar -->
    <q-dialog v-model="openCreate" persistent>
      <q-card style="width:min(420px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">
            {{ editing ? 'Editar proyecto' : 'Nuevo proyecto' }}
          </div>
        </q-card-section>

        <!-- Selector de plantillas (solo en creación) -->
        <template v-if="!editing">
          <q-card-section style="padding:12px 24px 0">
            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--ds-text-3); margin-bottom:8px">
              Plantilla
            </div>
            <div class="templates-grid">
              <button
                v-for="tpl in projectTemplates" :key="tpl.id"
                class="tpl-btn" :class="{ active: selectedTemplate?.id === tpl.id }"
                @click="applyTemplate(tpl)">
                <q-icon :name="tpl.icon" size="16px" :style="{ color: tpl.color }" />
                <span>{{ tpl.label }}</span>
              </button>
              <button class="tpl-btn" :class="{ active: !selectedTemplate }" @click="clearTemplate">
                <q-icon name="add_circle_outline" size="16px" style="color:var(--ds-text-3)" />
                <span>En blanco</span>
              </button>
            </div>
          </q-card-section>
        </template>

        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <q-input v-model="form.name" label="Nombre del proyecto" outlined dense />
          <q-input v-model="form.description" label="Descripción" outlined type="textarea" rows="3" />
          <q-input v-model="form.color" label="Color" outlined dense>
            <template #append>
              <div :style="{ background: form.color, width:'16px', height:'16px', borderRadius:'4px', cursor:'pointer' }">
                <q-popup-proxy cover><q-color v-model="form.color" /></q-popup-proxy>
              </div>
            </template>
          </q-input>
          <div v-if="selectedTemplate" class="tpl-tasks-preview">
            <div style="font-size:11px; font-weight:600; color:var(--ds-text-3); margin-bottom:6px">
              Se crearán {{ selectedTemplate.tasks.length }} tareas iniciales:
            </div>
            <div v-for="t in selectedTemplate.tasks.slice(0,4)" :key="t" class="tpl-task-item">
              <q-icon name="check_circle_outline" size="12px" style="color:var(--ds-text-3)" />
              {{ t }}
            </div>
            <div v-if="selectedTemplate.tasks.length > 4" style="font-size:11px; color:var(--ds-text-3); margin-top:2px">
              +{{ selectedTemplate.tasks.length - 4 }} más...
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" v-close-popup @click="resetForm" style="color:var(--ds-text-2)" />
          <q-btn color="primary" :label="editing ? 'Guardar' : 'Crear'" size="sm"
            :loading="saving" :disable="saving" @click="handleSubmit" style="min-width:80px; height:34px">
            <template #loading><DsSpinner size="sm" /></template>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import DsSpinner from 'src/components/DsSpinner.vue'
import { useProjectsStore } from 'src/stores/projects'
import { useTasksStore } from 'src/stores/tasks'
import { storeToRefs } from 'pinia'
import { encodeId } from 'src/utils/routeId'
import SkeletonList from 'src/components/SkeletonList.vue'
import EmptyState from 'src/components/EmptyState.vue'

const $q = useQuasar(); const router = useRouter()
const store = useProjectsStore(); const tasksStore = useTasksStore()
const { projects, loading } = storeToRefs(store)

const openCreate = ref(false); const saving = ref(false); const editing = ref(null)
const form = ref({ name: '', description: '', color: '#F97316' })
const selectedTemplate = ref(null)

const statusOptions = [
  { value: 'active',    label: 'Activo',     color: '#22C55E' },
  { value: 'paused',    label: 'Pausado',    color: '#FBBF24' },
  { value: 'completed', label: 'Completado', color: '#38BDF8' },
  { value: 'archived',  label: 'Archivado',  color: '#6B7280' },
]

const projectTemplates = [
  {
    id: 'webapp', label: 'Web App', icon: 'web', color: '#38BDF8',
    description: 'Aplicación web con frontend y backend',
    color_hex: '#38BDF8',
    tasks: ['Diseño de UI/UX', 'Setup del repositorio', 'Configurar CI/CD', 'Implementar autenticación', 'Desarrollar API REST', 'Frontend base', 'Tests unitarios', 'Despliegue a producción'],
  },
  {
    id: 'api', label: 'API Backend', icon: 'cloud', color: '#A78BFA',
    description: 'API REST o GraphQL',
    color_hex: '#A78BFA',
    tasks: ['Diseño de esquema de base de datos', 'Setup del servidor', 'Autenticación JWT', 'CRUD de recursos principales', 'Validaciones y manejo de errores', 'Documentación API', 'Tests de integración'],
  },
  {
    id: 'mobile', label: 'Mobile App', icon: 'smartphone', color: '#34D399',
    description: 'Aplicación móvil iOS/Android',
    color_hex: '#34D399',
    tasks: ['Diseño de pantallas', 'Setup del proyecto', 'Navegación y routing', 'Integración con API', 'Manejo de estado', 'Notificaciones push', 'Beta testing', 'Publicación en stores'],
  },
  {
    id: 'startup', label: 'Startup MVP', icon: 'rocket_launch', color: '#F97316',
    description: 'MVP para validar un producto',
    color_hex: '#F97316',
    tasks: ['Definir propuesta de valor', 'Investigación de mercado', 'Diseño de MVP', 'Landing page', 'Core feature #1', 'Core feature #2', 'Onboarding de primeros usuarios', 'Métricas y analítica'],
  },
]

const statusLabel = (s) => ({ active:'Activo', paused:'Pausado', completed:'Completado', archived:'Archivado' }[s] || 'Activo')

onMounted(() => store.fetchAll())

function applyTemplate(tpl) {
  selectedTemplate.value = tpl
  if (!form.value.name) form.value.name = tpl.label + ' Project'
  if (!form.value.description) form.value.description = tpl.description
  form.value.color = tpl.color_hex
}
function clearTemplate() { selectedTemplate.value = null }

function startEdit(p) {
  editing.value = p
  form.value = { name: p.name, description: p.description || '', color: p.color || '#F97316' }
  openCreate.value = true
}
function resetForm() { editing.value = null; selectedTemplate.value = null; form.value = { name: '', description: '', color: '#F97316' } }

async function handleSubmit() {
  if (!form.value.name) return
  saving.value = true
  try {
    if (editing.value) {
      await store.update(editing.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Proyecto actualizado' })
      openCreate.value = false; resetForm()
    } else {
      const created = await store.create(form.value)
      if (selectedTemplate.value && created?.id) {
        const tplTasks = selectedTemplate.value.tasks
        await Promise.all(
          tplTasks.map(title =>
            tasksStore.create(created.id, { title, status: 'todo', priority: 'medium' }).catch(() => {})
          )
        )
        $q.notify({ type: 'positive', message: `Proyecto creado con ${tplTasks.length} tareas iniciales` })
      } else {
        $q.notify({ type: 'positive', message: 'Proyecto creado' })
      }
      openCreate.value = false; resetForm()
    }
  } catch (err) {
    const status = err.response?.status
    if (status === 409) $q.notify({ type: 'warning', message: 'Ya tienes un proyecto con ese nombre' })
    else $q.notify({ type: 'negative', message: 'Error al guardar' })
  } finally { saving.value = false }
}

async function changeStatus(project, status) {
  try {
    await store.update(project.id, { status })
    $q.notify({ type: 'positive', message: `Proyecto marcado como ${statusLabel(status).toLowerCase()}` })
  } catch { $q.notify({ type: 'negative', message: 'Error al cambiar estado' }) }
}

function confirmDelete(p) {
  $q.dialog({ title: 'Eliminar proyecto', message: `¿Eliminar "${p.name}"?`, cancel: true, persistent: true })
    .onOk(async () => { await store.remove(p.id); $q.notify({ type: 'positive', message: 'Proyecto eliminado' }) })
}
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
@media (max-width: 480px) { .projects-grid { grid-template-columns: 1fr; } }

.project-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  transition: border-color 120ms ease, transform 120ms ease;
}
.project-card:hover { border-color: var(--ds-border-md); transform: translateY(-2px); }
.project-color-bar { width: 4px; flex-shrink: 0; }

/* Status badges */
.ds-status-badge { font-size:10px; font-weight:600; padding:2px 8px; border-radius:4px; letter-spacing:0.04em; }
.ds-status-badge.active    { background:rgba(34,197,94,0.12);  color:#22C55E; border:1px solid rgba(34,197,94,0.2); }
.ds-status-badge.paused    { background:rgba(251,191,36,0.12); color:#FBBF24; border:1px solid rgba(251,191,36,0.2); }
.ds-status-badge.completed { background:rgba(56,189,248,0.12); color:#38BDF8; border:1px solid rgba(56,189,248,0.2); }
.ds-status-badge.archived  { background:var(--ds-bg-2);        color:var(--ds-text-3); border:1px solid var(--ds-border); }
.ds-status-badge.member    { background:rgba(56,189,248,0.12); color:#38BDF8; border:1px solid rgba(56,189,248,0.2); }

/* Templates */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.tpl-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 4px; border-radius: 8px;
  border: 1px solid var(--ds-border);
  background: var(--ds-bg-1);
  cursor: pointer;
  font-size: 10px; color: var(--ds-text-2);
  transition: border-color 120ms ease, background 120ms ease;
}
.tpl-btn:hover { border-color: var(--ds-border-md); background: var(--ds-bg-hover); }
.tpl-btn.active { border-color: var(--ds-orange); background: var(--ds-orange-dim); color: var(--ds-text-1); }
.tpl-tasks-preview {
  background: var(--ds-bg-0); border: 1px solid var(--ds-border);
  border-radius: 8px; padding: 10px 12px;
}
.tpl-task-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--ds-text-2);
  padding: 3px 0;
}
</style>
