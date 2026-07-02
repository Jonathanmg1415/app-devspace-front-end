<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Actividad</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          Historial reciente del proyecto
        </div>
      </div>
      <q-btn flat round dense icon="refresh" size="sm" style="color:var(--ds-text-2)"
        :loading="loading" @click="load">
        <q-tooltip>Actualizar</q-tooltip>
      </q-btn>
    </div>

    <SkeletonList v-if="loading && !events.length" variant="list" :count="6" />

    <EmptyState v-else-if="!events.length"
      icon="timeline"
      title="Sin actividad aún"
      subtitle="Aquí verás un registro de todo lo que ocurre en el proyecto: tareas, notas, comentarios y más" />

    <div v-else class="activity-feed">
      <div v-for="event in events" :key="event.id" class="activity-item">
        <!-- Avatar -->
        <q-avatar size="30px" :style="{ background:'var(--ds-orange)', color:'#fff', fontSize:'12px', fontWeight:'700', flexShrink:0 }">
          {{ event.actor?.name?.[0]?.toUpperCase() || '?' }}
        </q-avatar>

        <!-- Contenido -->
        <div class="col activity-body">
          <div class="activity-text">
            <span class="actor-name">{{ event.actor?.name || 'Alguien' }}</span>
            {{ actionLabel(event) }}
          </div>
          <div class="activity-time">{{ formatTs(event.createdAt) }}</div>
        </div>

        <!-- Ícono de entidad -->
        <q-icon :name="entityIcon(event.entity)" size="14px"
          style="color:var(--ds-text-3); flex-shrink:0; margin-top:3px" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import { decodeId } from 'src/utils/routeId'
import SkeletonList from 'src/components/SkeletonList.vue'
import EmptyState from 'src/components/EmptyState.vue'

const route = useRoute()
const projectId = computed(() => decodeId(route.params.id))
const events  = ref([])
const loading = ref(false)

onMounted(load)

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/api/activity', { params: { projectId: projectId.value } })
    events.value = data.events ?? []
  } finally { loading.value = false }
}

function actionLabel(event) {
  const name = event.meta?.title || event.meta?.taskTitle || event.meta?.userName || ''
  const entity = { task: 'tarea', note: 'nota', member: 'miembro', comment: 'comentario' }[event.entity] || event.entity
  const actions = {
    created:   `creó ${entity === 'nota' ? 'una' : 'una'} ${entity}${name ? `: "${name}"` : ''}`,
    invited:   `invitó a ${event.meta?.userName || name} al proyecto`,
    commented: `comentó en la tarea${name ? ` "${name}"` : ''}`,
    updated:   `actualizó ${entity === 'nota' ? 'una' : 'una'} ${entity}${name ? `: "${name}"` : ''}`,
    deleted:   `eliminó ${entity === 'nota' ? 'una' : 'una'} ${entity}${name ? `: "${name}"` : ''}`,
  }
  return actions[event.action] || `${event.action} ${entity}`
}

function entityIcon(entity) {
  return { task: 'task_alt', note: 'description', member: 'person', comment: 'chat_bubble_outline', file: 'attach_file' }[entity] || 'circle'
}

function formatTs(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000)     return 'Ahora mismo'
  if (diff < 3600000)   return `Hace ${Math.floor(diff / 60000)} min`
  if (diff < 86400000)  return `Hace ${Math.floor(diff / 3600000)} h`
  if (diff < 604800000) return `Hace ${Math.floor(diff / 86400000)} días`
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 600px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ds-border);
}
.activity-item:last-child { border-bottom: none; }

.activity-body { display: flex; flex-direction: column; gap: 2px; }

.activity-text { font-size: 13px; color: var(--ds-text-2); line-height: 1.5; }
.actor-name { font-weight: 600; color: var(--ds-text-1); }

.activity-time { font-size: 11px; color: var(--ds-text-3); }
</style>
