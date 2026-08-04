<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" size="sm"
        style="color:var(--ds-text-2); margin-right:8px"
        @click="router.push('/projects')" />
      <div class="col">
        <div class="row items-center" style="gap:10px">
          <div class="ds-page-title">{{ project?.name }}</div>
          <span class="proj-status-badge" :class="project?.status || 'active'">
            {{ statusLabel(project?.status) }}
          </span>
        </div>
        <div v-if="project?.description" style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ project.description }}
        </div>
      </div>
      <div class="row items-center" style="gap:6px">
        <q-btn flat dense size="sm" icon="download"
          :label="$q.screen.gt.xs ? 'Exportar' : ''"
          style="color:var(--ds-text-2); height:34px"
          :loading="exporting" @click="handleExport">
          <q-tooltip>Exportar como JSON</q-tooltip>
        </q-btn>
        <q-btn v-if="isOwner" flat dense size="sm" icon="group"
          :label="$q.screen.gt.xs ? 'Miembros' : ''"
          style="color:var(--ds-text-2); height:34px" @click="openMembers" />
      </div>
    </div>

    <!-- Dashboard stats -->
    <div v-if="!loadingSummary && summary" class="dashboard">

      <!-- Fila superior: donut + stats rápidas -->
      <div class="dash-row">
        <!-- Donut de tareas -->
        <div class="dash-card dash-card--donut">
          <div class="dash-card-title">Estado de tareas</div>
          <div class="q-mt-md">
            <DonutChart
              :segments="taskSegments"
              :size="110"
              :stroke-w="6"
              :center-label="String(summary.taskCounts.total)"
              center-sub="tareas"
              :center-font-size="9"
            />
          </div>
        </div>

        <!-- Stats rápidas -->
        <div class="dash-stats">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(34,197,94,0.12); color:#22C55E">
              <q-icon name="check_circle" size="18px" />
            </div>
            <div>
              <div class="stat-val">{{ summary.completionRate }}%</div>
              <div class="stat-lbl">Completado</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(167,139,250,0.12); color:#A78BFA">
              <q-icon name="description" size="18px" />
            </div>
            <div>
              <div class="stat-val">{{ summary.notes }}</div>
              <div class="stat-lbl">Notas</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(56,189,248,0.12); color:#38BDF8">
              <q-icon name="link" size="18px" />
            </div>
            <div>
              <div class="stat-val">{{ summary.links }}</div>
              <div class="stat-lbl">Links</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(249,115,22,0.12); color:#F97316">
              <q-icon name="terminal" size="18px" />
            </div>
            <div>
              <div class="stat-val">{{ summary.commands }}</div>
              <div class="stat-lbl">Comandos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(251,191,36,0.12); color:#FBBF24">
              <q-icon name="group" size="18px" />
            </div>
            <div>
              <div class="stat-val">{{ summary.memberCount }}</div>
              <div class="stat-lbl">Miembros</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(52,211,153,0.12); color:#34D399">
              <q-icon name="attach_file" size="18px" />
            </div>
            <div>
              <div class="stat-val">{{ summary.files }}</div>
              <div class="stat-lbl">Archivos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila inferior: actividad reciente -->
      <div class="dash-card" style="margin-top:12px" v-if="summary.recentActivity?.length">
        <div class="dash-card-title">Actividad reciente</div>
        <div class="q-mt-sm">
          <div v-for="ev in summary.recentActivity" :key="ev.id" class="activity-row">
            <q-avatar size="24px" :style="{ background:'var(--ds-orange)', color:'#fff', fontSize:'10px', fontWeight:'700', flexShrink:0 }">
              {{ ev.actor?.name?.[0]?.toUpperCase() || '?' }}
            </q-avatar>
            <div class="col" style="min-width:0">
              <span style="font-size:12px; font-weight:600; color:var(--ds-text-1)">{{ ev.actor?.name }}</span>
              <span style="font-size:12px; color:var(--ds-text-2)"> {{ actLabel(ev) }}</span>
            </div>
            <span style="font-size:11px; color:var(--ds-text-3); flex-shrink:0">{{ relTime(ev.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <SkeletonList v-else-if="loadingSummary" variant="dashboard" />

    <!-- Módulos -->
    <div class="q-mt-lg">
      <div class="dash-card-title q-mb-sm">Módulos</div>
      <div class="modules-grid">
        <div v-for="item in nav" :key="item.to" class="module-card" @click="router.push(item.to)">
          <div class="module-icon" :style="{ background: item.color + '18', color: item.color }">
            <q-icon :name="item.icon" size="20px" />
          </div>
          <div class="q-mt-sm">
            <div style="font-size:13px; font-weight:600; color:var(--ds-text-1)">{{ item.label }}</div>
            <div class="gt-xs" style="font-size:11px; color:var(--ds-text-3); margin-top:2px">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Members dialog -->
    <q-dialog v-model="showMembers" persistent>
      <q-card style="width:min(440px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div class="row items-center">
            <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)" class="col">Miembros del proyecto</div>
            <q-btn flat round dense icon="close" size="sm" style="color:var(--ds-text-2)" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section style="padding:16px 24px">
          <div class="row q-gutter-sm">
            <q-input v-model="inviteEmail" label="Email del desarrollador" outlined dense class="col" @keyup.enter="handleInvite" />
            <q-btn color="primary" label="Invitar" size="sm" style="height:40px; align-self:flex-end"
              :loading="inviting" :disable="!inviteEmail" @click="handleInvite" />
          </div>
        </q-card-section>
        <q-separator style="background:var(--ds-border)" />
        <q-card-section style="padding:12px 24px; max-height:320px; overflow-y:auto">
          <div v-if="loading" class="flex flex-center q-py-md"><q-spinner size="24px" color="primary" /></div>
          <div v-else class="q-gutter-sm">
            <div class="member-row">
              <q-avatar size="32px" :style="{ background:'var(--ds-orange)', color:'#fff', fontSize:'12px', fontWeight:'600' }">
                {{ auth.user?.name?.[0]?.toUpperCase() || '?' }}
              </q-avatar>
              <div class="col" style="overflow:hidden">
                <div style="font-size:13px; font-weight:500; color:var(--ds-text-1)">
                  {{ auth.user?.name }}<span style="font-size:10px; color:var(--ds-text-3); margin-left:6px">tú</span>
                </div>
                <div style="font-size:11px; color:var(--ds-text-3)">{{ auth.user?.email }}</div>
              </div>
              <span class="role-badge owner">owner</span>
            </div>
            <div v-if="!members.length" class="flex flex-center column q-py-md" style="color:var(--ds-text-3)">
              <q-icon name="group" size="32px" style="opacity:0.3" />
              <p style="font-size:13px; margin-top:8px">Solo tú en este proyecto</p>
            </div>
            <div v-for="m in members" :key="m.id" class="member-row">
              <q-avatar size="32px" :style="{ background:'var(--ds-bg-hover)', color:'var(--ds-text-1)', fontSize:'12px', fontWeight:'600' }">
                {{ m.user?.name?.[0]?.toUpperCase() || '?' }}
              </q-avatar>
              <div class="col" style="overflow:hidden">
                <div style="font-size:13px; font-weight:500; color:var(--ds-text-1)">{{ m.user?.name }}</div>
                <div style="font-size:11px; color:var(--ds-text-3)">{{ m.user?.email }}</div>
              </div>
              <q-select :model-value="m.role" :options="roleOptions" emit-value map-options dense outlined
                style="min-width:88px; font-size:11px"
                @update:model-value="handleRoleChange(m, $event)" />
              <q-btn flat round dense size="xs" icon="close" style="color:var(--ds-text-3); margin-left:4px" @click="handleRemove(m)">
                <q-tooltip>Eliminar miembro</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" style="padding:8px 24px 20px">
          <q-btn flat label="Cerrar" size="sm" v-close-popup style="color:var(--ds-text-2)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useProjectsStore } from 'src/stores/projects'
import { useMembersStore } from 'src/stores/members'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import { decodeId } from 'src/utils/routeId'
import { api } from 'src/boot/axios'
import DonutChart from 'src/components/DonutChart.vue'
import SkeletonList from 'src/components/SkeletonList.vue'

const $q = useQuasar(); const route = useRoute(); const router = useRouter()
const projectsStore = useProjectsStore(); const membersStore = useMembersStore(); const auth = useAuthStore()
const { projects } = storeToRefs(projectsStore)
const { members, loading, inviting } = storeToRefs(membersStore)

const showMembers = ref(false); const inviteEmail = ref(''); const exporting = ref(false)
const summary = ref(null); const loadingSummary = ref(true)
const roleOptions = [{ label: 'Member', value: 'member' }, { label: 'Admin', value: 'admin' }]
const projectId = computed(() => decodeId(route.params.id))
const project   = computed(() => projects.value.find(p => p.id === projectId.value))
const isOwner   = computed(() => project.value?._role === 'owner')

const taskSegments = computed(() => {
  if (!summary.value) return []
  const { todo, in_progress, done } = summary.value.taskCounts
  return [
    { label: 'Por hacer',   value: todo,        color: '#64748B' },
    { label: 'En progreso', value: in_progress, color: '#F97316' },
    { label: 'Terminadas',  value: done,         color: '#22C55E' },
  ].filter(s => s.value > 0)
})

const nav = computed(() => {
  const id = route.params.id
  return [
    { label:'Tareas',    desc:'Kanban + lista',           icon:'task_alt',    color:'#22C55E', to:`/projects/${id}/tasks` },
    { label:'Comandos',  desc:'Snippets CLI',             icon:'terminal',    color:'#F97316', to:`/projects/${id}/commands` },
    { label:'Links',     desc:'URLs del proyecto',        icon:'link',        color:'#38BDF8', to:`/projects/${id}/links` },
    { label:'Notas',     desc:'Documentación técnica',    icon:'description', color:'#A78BFA', to:`/projects/${id}/notes` },
    { label:'Cards',     desc:'Tablero de tarjetas',      icon:'grid_view',   color:'#EC4899', to:`/projects/${id}/cards` },
    { label:'Archivos',  desc:'PDFs y documentos',        icon:'attach_file', color:'#FBBF24', to:`/projects/${id}/files` },
    { label:'Actividad', desc:'Historial del equipo',     icon:'timeline',    color:'#34D399', to:`/projects/${id}/activity` },
  ]
})

const statusLabel = (s) => ({ active:'Activo', paused:'Pausado', completed:'Completado', archived:'Archivado' }[s] || 'Activo')

function relTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts)
  if (diff < 60000)    return 'Ahora'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`
  return `${Math.floor(diff / 86400000)} d`
}

function actLabel(ev) {
  const ent = { task:'tarea', note:'nota', member:'miembro', comment:'comentario' }[ev.entity] || ev.entity
  const act = { created:'creó una', invited:'invitó a un', commented:'comentó en', updated:'actualizó', deleted:'eliminó' }[ev.action] || ev.action
  return `${act} ${ent}${ev.meta?.title ? ': "' + ev.meta.title + '"' : ''}`
}

onMounted(async () => {
  if (auth.token && !auth.user) await auth.fetchMe()
  // carga en paralelo: proyectos + summary al mismo tiempo
  await Promise.all([projectsStore.fetchAll(), loadSummary()])
})

async function loadSummary() {
  loadingSummary.value = true
  try {
    const { data } = await api.get('/api/projects/summary', { params: { projectId: projectId.value } })
    summary.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar el resumen del proyecto' })
  } finally {
    loadingSummary.value = false
  }
}

async function openMembers() { showMembers.value = true; await membersStore.fetchAll(projectId.value) }

async function handleInvite() {
  if (!inviteEmail.value) return
  try {
    await membersStore.invite(projectId.value, inviteEmail.value)
    inviteEmail.value = ''
    $q.notify({ type: 'positive', message: 'Miembro agregado correctamente' })
  } catch (err) {
    const s = err.response?.status
    if (s === 404) $q.notify({ type: 'warning', message: 'No existe ninguna cuenta con ese email' })
    else if (s === 409) $q.notify({ type: 'warning', message: 'Este usuario ya es miembro' })
    else if (s === 400) $q.notify({ type: 'warning', message: 'No puedes invitarte a ti mismo' })
    else $q.notify({ type: 'negative', message: 'Error al invitar' })
  }
}

async function handleRoleChange(m, newRole) {
  try {
    await membersStore.updateRole(projectId.value, m.id, newRole)
    $q.notify({ type: 'positive', message: 'Rol actualizado' })
  } catch { $q.notify({ type: 'negative', message: 'Error al actualizar rol' }) }
}

async function handleExport() {
  if (!project.value) return
  exporting.value = true
  try {
    const id = projectId.value
    const [tasks, notes, commands, links] = await Promise.all([
      api.get('/api/tasks',    { params: { projectId: id } }).then(r => r.data.tasks ?? []),
      api.get('/api/notes',    { params: { projectId: id } }).then(r => r.data.notes ?? []),
      api.get('/api/commands', { params: { projectId: id } }).then(r => r.data.commands ?? []),
      api.get('/api/links',    { params: { projectId: id } }).then(r => r.data.links ?? []),
    ])
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), project: project.value, tasks, notes, commands, links }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob), a = document.createElement('a')
    a.href = url; a.download = `devspace-${project.value.name.replace(/\s+/g,'-').toLowerCase()}.json`; a.click()
    URL.revokeObjectURL(url)
    $q.notify({ type: 'positive', message: 'Proyecto exportado' })
  } catch { $q.notify({ type: 'negative', message: 'Error al exportar' }) } finally { exporting.value = false }
}

async function handleRemove(m) {
  $q.dialog({ title: 'Eliminar miembro', message: `¿Eliminar a ${m.user?.name}?`, cancel: true })
    .onOk(async () => { await membersStore.remove(projectId.value, m.id); $q.notify({ type: 'positive', message: 'Miembro eliminado' }) })
}
</script>

<style scoped>
/* Dashboard */
.dash-row { display: flex; gap: 12px; flex-wrap: wrap; }
.dash-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 16px;
}
.dash-card--donut { flex-shrink: 0; }
.dash-card-title {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--ds-text-3);
}
.dash-stats {
  flex: 1; display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 12px 14px;
  display: flex; align-items: center; gap: 10px;
}
.stat-icon {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-val { font-size: 18px; font-weight: 700; color: var(--ds-text-1); line-height: 1; }
.stat-lbl { font-size: 11px; color: var(--ds-text-3); margin-top: 2px; }

.activity-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--ds-border);
  overflow: hidden;
}
.activity-row:last-child { border-bottom: none; }

/* Status badge */
.proj-status-badge {
  font-size: 10px; font-weight: 600; padding: 2px 8px;
  border-radius: 4px; letter-spacing: 0.04em;
}
.proj-status-badge.active    { background: rgba(34,197,94,0.12);  color: #22C55E; border: 1px solid rgba(34,197,94,0.2); }
.proj-status-badge.paused    { background: rgba(251,191,36,0.12); color: #FBBF24; border: 1px solid rgba(251,191,36,0.2); }
.proj-status-badge.completed { background: rgba(56,189,248,0.12); color: #38BDF8; border: 1px solid rgba(56,189,248,0.2); }
.proj-status-badge.archived  { background: var(--ds-bg-2);        color: var(--ds-text-3); border: 1px solid var(--ds-border); }

/* Módulos */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}
.module-card {
  background: var(--ds-bg-1); border: 1px solid var(--ds-border); border-radius: 10px;
  padding: 14px; cursor: pointer; transition: border-color 120ms ease, transform 120ms ease;
}
.module-card:hover { border-color: var(--ds-border-md); transform: translateY(-1px); }
.module-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.member-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--ds-border); }
.member-row:last-child { border-bottom:none; }
.role-badge { font-size:10px; font-weight:600; padding:2px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.04em; flex-shrink:0; }
.role-badge.owner  { background:var(--ds-orange-dim); color:var(--ds-orange); border:1px solid rgba(249,115,22,0.20); }
.role-badge.member { background:var(--ds-bg-hover); color:var(--ds-text-3); border:1px solid var(--ds-border); }

@media (max-width: 599px) {
  .dash-stats { grid-template-columns: repeat(2, 1fr); }
  .modules-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>
