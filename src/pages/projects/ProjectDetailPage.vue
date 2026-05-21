<template>
  <q-page padding>

    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" size="sm"
        style="color:var(--ds-text-2); margin-right:8px"
        @click="router.push('/projects')" />
      <div class="col">
        <div class="ds-page-title">{{ project?.name }}</div>
        <div v-if="project?.description"
          style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ project.description }}
        </div>
      </div>
      <q-btn flat dense size="sm" icon="group" label="Miembros"
        style="color:var(--ds-text-2); height:34px"
        @click="openMembers" />
    </div>

    <!-- Module grid -->
    <div class="row q-gutter-md">
      <div
        v-for="item in nav"
        :key="item.to"
        class="module-card col-12 col-sm-5 col-md-3"
        @click="router.push(item.to)"
      >
        <div class="module-icon" :style="{ background: item.color + '18', color: item.color }">
          <q-icon :name="item.icon" size="20px" />
        </div>
        <div class="q-mt-sm">
          <div style="font-size:13px; font-weight:600; color:var(--ds-text-1)">{{ item.label }}</div>
          <div style="font-size:11px; color:var(--ds-text-3); margin-top:2px">{{ item.desc }}</div>
        </div>
      </div>
    </div>

    <!-- Members dialog -->
    <q-dialog v-model="showMembers" persistent>
      <q-card style="width:440px; max-width:95vw">
        <q-card-section style="padding:24px 24px 0">
          <div class="row items-center">
            <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)" class="col">
              Miembros del proyecto
            </div>
            <q-btn flat round dense icon="close" size="sm"
              style="color:var(--ds-text-2)" v-close-popup />
          </div>
        </q-card-section>

        <!-- Invite input -->
        <q-card-section style="padding:16px 24px">
          <div class="row q-gutter-sm">
            <q-input
              v-model="inviteEmail"
              label="Email del desarrollador"
              outlined dense class="col"
              @keyup.enter="handleInvite"
            />
            <q-btn color="primary" label="Invitar" size="sm"
              style="height:40px; align-self:flex-end"
              :loading="inviting"
              :disable="!inviteEmail"
              @click="handleInvite" />
          </div>
        </q-card-section>

        <q-separator style="background:var(--ds-border)" />

        <!-- Members list -->
        <q-card-section style="padding:12px 24px; max-height:320px; overflow-y:auto">
          <div v-if="loading" class="flex flex-center q-py-md">
            <q-spinner size="24px" color="primary" />
          </div>

          <div v-else-if="!members.length"
            class="flex flex-center column q-py-md" style="color:var(--ds-text-3)">
            <q-icon name="group" size="32px" style="opacity:0.3" />
            <p style="font-size:13px; margin-top:8px">Solo tú en este proyecto</p>
          </div>

          <div v-else class="q-gutter-sm">
            <!-- Owner -->
            <div class="member-row">
              <q-avatar size="32px"
                :style="{ background: 'var(--ds-orange)', color:'#fff', fontSize:'12px', fontWeight:'600' }">
                {{ project?.ownerData?.name?.[0]?.toUpperCase() || '?' }}
              </q-avatar>
              <div class="col" style="overflow:hidden">
                <div style="font-size:13px; font-weight:500; color:var(--ds-text-1)">
                  {{ project?.ownerData?.name }}
                  <span style="font-size:10px; color:var(--ds-text-3); margin-left:6px">tú</span>
                </div>
                <div style="font-size:11px; color:var(--ds-text-3)">{{ project?.ownerData?.email }}</div>
              </div>
              <span class="role-badge owner">owner</span>
            </div>

            <!-- Members -->
            <div v-for="m in members" :key="m.id" class="member-row">
              <q-avatar size="32px"
                :style="{ background: 'var(--ds-bg-hover)', color:'var(--ds-text-1)', fontSize:'12px', fontWeight:'600' }">
                {{ m.user?.name?.[0]?.toUpperCase() || '?' }}
              </q-avatar>
              <div class="col" style="overflow:hidden">
                <div style="font-size:13px; font-weight:500; color:var(--ds-text-1)">
                  {{ m.user?.name }}
                </div>
                <div style="font-size:11px; color:var(--ds-text-3)">{{ m.user?.email }}</div>
              </div>
              <span class="role-badge member">member</span>
              <q-btn flat round dense size="xs" icon="close"
                style="color:var(--ds-text-3); margin-left:4px"
                @click="handleRemove(m)">
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

const $q     = useQuasar()
const route  = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const membersStore  = useMembersStore()
const auth = useAuthStore()

const { projects } = storeToRefs(projectsStore)
const { members, loading, inviting } = storeToRefs(membersStore)

const showMembers = ref(false)
const inviteEmail = ref('')

const project = computed(() => {
  const p = projects.value.find(p => p.id == route.params.id)
  if (!p) return null
  return { ...p, ownerData: auth.user }
})

const nav = computed(() => {
  const id = route.params.id
  return [
    { label: 'Tareas',    desc: 'Kanban de tareas',         icon: 'task_alt',   color: '#22C55E', to: `/projects/${id}/tasks` },
    { label: 'Comandos',  desc: 'Snippets CLI',              icon: 'terminal',   color: '#F97316', to: `/projects/${id}/commands` },
    { label: 'Links',     desc: 'URLs del proyecto',         icon: 'link',       color: '#38BDF8', to: `/projects/${id}/links` },
    { label: 'Notas',     desc: 'Documentación técnica',     icon: 'description',color: '#A78BFA', to: `/projects/${id}/notes` },
    { label: 'Cards',     desc: 'Notas rápidas arrastrables',icon: 'view_kanban',color: '#F472B6', to: `/projects/${id}/cards` },
    { label: 'Archivos',  desc: 'PDFs y documentos',         icon: 'attach_file',color: '#FBBF24', to: `/projects/${id}/files` },
  ]
})

onMounted(async () => {
  if (!projects.value.length) await projectsStore.fetchAll()
})

async function openMembers() {
  showMembers.value = true
  await membersStore.fetchAll(route.params.id)
}

async function handleInvite() {
  if (!inviteEmail.value) return
  try {
    await membersStore.invite(route.params.id, inviteEmail.value)
    inviteEmail.value = ''
    $q.notify({ type: 'positive', message: 'Miembro agregado correctamente' })
  } catch (err) {
    const status = err.response?.status
    if (status === 404) {
      $q.notify({ type: 'warning', message: 'No existe ninguna cuenta con ese email' })
    } else if (status === 409) {
      $q.notify({ type: 'warning', message: 'Este usuario ya es miembro del proyecto' })
    } else if (status === 400) {
      $q.notify({ type: 'warning', message: 'No puedes invitarte a ti mismo' })
    } else {
      $q.notify({ type: 'negative', message: 'Error al invitar' })
    }
  }
}

async function handleRemove(m) {
  $q.dialog({
    title: 'Eliminar miembro',
    message: `¿Eliminar a ${m.user?.name} del proyecto?`,
    cancel: true,
  }).onOk(async () => {
    await membersStore.remove(route.params.id, m.id)
    $q.notify({ type: 'positive', message: 'Miembro eliminado' })
  })
}
</script>

<style scoped>
.module-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 120ms ease, transform 120ms ease;
}
.module-card:hover {
  border-color: var(--ds-border-md);
  transform: translateY(-1px);
}
.module-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--ds-border);
}
.member-row:last-child { border-bottom: none; }
.role-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.role-badge.owner {
  background: var(--ds-orange-dim);
  color: var(--ds-orange);
  border: 1px solid rgba(249,115,22,0.20);
}
.role-badge.member {
  background: var(--ds-bg-hover);
  color: var(--ds-text-3);
  border: 1px solid var(--ds-border);
}
</style>