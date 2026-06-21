<template>
  <q-layout view="lHh Lpr lFf">

    <q-header>
      <q-toolbar style="padding: 0 8px; min-height: 48px">
<q-toolbar-title style="flex:0 0 auto; padding-right:8px">
          <div class="ds-logo-wrap">
            <div class="ds-logo-icon">
              <img src="/favicon.png" style="height:20px; width:20px; border-radius:50%; display:block" />
            </div>
            <span class="ds-logo-text">Dev<span style="color:var(--ds-orange)">Space</span></span>
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- Search — solo ícono en móvil -->
        <q-btn flat round dense size="sm" icon="search"
          style="color:var(--ds-text-2)"
          @click="router.push('/search')" class="lt-sm" />

        <!-- Search pill — solo en desktop -->
        <q-btn flat rounded dense @click="router.push('/search')"
          class="gt-xs"
          style="color:var(--ds-text-2); background:var(--ds-bg-2); border:1px solid var(--ds-border); padding:0 10px; height:28px; font-size:12px; gap:6px; margin-right:6px">
          <q-icon name="search" size="13px" />
          Buscar...
        </q-btn>

        <!-- Dark mode -->
        <q-btn flat round dense size="sm" style="color:var(--ds-text-2)">
          <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" size="16px" />
          <q-menu>
            <q-list style="min-width:140px; padding:4px">
              <q-item clickable v-close-popup @click="setDark(false)" style="border-radius:6px">
                <q-item-section avatar style="min-width:28px"><q-icon name="light_mode" size="14px" /></q-item-section>
                <q-item-section style="font-size:13px">Claro</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setDark(true)" style="border-radius:6px">
                <q-item-section avatar style="min-width:28px"><q-icon name="dark_mode" size="14px" /></q-item-section>
                <q-item-section style="font-size:13px">Oscuro</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setDark('auto')" style="border-radius:6px">
                <q-item-section avatar style="min-width:28px"><q-icon name="brightness_auto" size="14px" /></q-item-section>
                <q-item-section style="font-size:13px">Sistema</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- User -->
        <q-btn flat round dense style="color:var(--ds-text-2); margin-left:4px; padding:2px">
          <q-avatar size="38px" :style="{ background:'var(--ds-orange)', color:'#fff', fontSize:'15px', fontWeight:'700' }">
            {{ userInitial }}
          </q-avatar>
          <q-menu>
            <q-list style="min-width:160px; padding:4px">
              <q-item style="padding:8px 12px; pointer-events:none">
                <q-item-section>
                  <div style="font-size:12px; font-weight:600; color:var(--ds-text-1)">{{ auth.user?.name }}</div>
                  <div style="font-size:11px; color:var(--ds-text-3)">{{ auth.user?.email }}</div>
                </q-item-section>
              </q-item>
              <q-separator style="margin:4px 0" />
              <q-item clickable v-close-popup @click="router.push('/profile')" style="border-radius:6px">
                <q-item-section avatar style="min-width:28px"><q-icon name="manage_accounts" size="14px" /></q-item-section>
                <q-item-section style="font-size:13px">Mi perfil</q-item-section>
              </q-item>
              <q-separator style="margin:4px 0" />
              <q-item clickable v-close-popup @click="handleLogout" style="border-radius:6px; color:var(--ds-negative)">
                <q-item-section avatar style="min-width:28px"><q-icon name="logout" size="14px" /></q-item-section>
                <q-item-section style="font-size:13px">Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="200" :breakpoint="768" bordered>
      <q-scroll-area class="fit" style="padding-top:8px">
        <q-list>
          <div class="sidebar-section-label">Workspace</div>
          <q-item clickable v-ripple :to="{ path: '/projects' }" exact class="sidebar-item">
            <q-item-section avatar><q-icon name="grid_view" size="15px" /></q-item-section>
            <q-item-section>Proyectos</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="{ path: '/search' }" class="sidebar-item">
            <q-item-section avatar><q-icon name="search" size="15px" /></q-item-section>
            <q-item-section>Buscar</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="{ path: '/changelog' }" class="sidebar-item">
            <q-item-section avatar><q-icon name="auto_awesome" size="15px" /></q-item-section>
            <q-item-section>Novedades</q-item-section>
          </q-item>

          <template v-if="currentProject">
            <div class="sidebar-section-label q-mt-md" style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-block; width:8px; height:8px; border-radius:2px; flex-shrink:0"
                :style="{ background: currentProject.color || 'var(--ds-orange)' }" />
              <span class="ellipsis" style="max-width:130px">{{ currentProject.name }}</span>
            </div>
            <q-item v-for="item in projectNav" :key="item.to"
              clickable v-ripple :to="item.to" exact class="sidebar-item">
              <q-item-section avatar><q-icon :name="item.icon" size="15px" /></q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useProjectsStore } from 'src/stores/projects'
import { decodeId } from 'src/utils/routeId'

const $q     = useQuasar()
const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()
const projectsStore = useProjectsStore()

const drawer = ref(true)

onMounted(async () => {
  if (auth.token && !auth.user) await auth.fetchMe()
  // Restaurar dark mode
  const saved = localStorage.getItem('devspace_dark')
  if (saved !== null) $q.dark.set(JSON.parse(saved))
})

const userInitial = computed(() => auth.user?.name?.[0]?.toUpperCase() || '?')

const currentProject = computed(() => {
  const id = decodeId(route.params.id)
  return id ? projectsStore.projects.find(p => p.id === id) : null
})

const projectNav = computed(() => {
  const id = route.params.id
  return [
    { label: 'Tareas',   icon: 'task_alt',   to: `/projects/${id}/tasks` },
    { label: 'Comandos', icon: 'terminal',   to: `/projects/${id}/commands` },
    { label: 'Links',    icon: 'link',       to: `/projects/${id}/links` },
    { label: 'Notas',    icon: 'description',to: `/projects/${id}/notes` },
    { label: 'Archivos',  icon: 'attach_file', to: `/projects/${id}/files` },
    { label: 'Actividad', icon: 'timeline',    to: `/projects/${id}/activity` },
  ]
})

function setDark(val) {
  $q.dark.set(val)
  localStorage.setItem('devspace_dark', JSON.stringify(val))
}

function handleLogout() {
  auth.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
/* ── Logo ── */
.ds-logo-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.ds-logo-icon {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.ds-logo-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ds-text-1);
}

.sidebar-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ds-text-3);
  padding: 12px 16px 4px;
}
.sidebar-item {
  border-radius: 6px !important;
  margin: 1px 8px !important;
  min-height: 32px !important;
  padding: 0 8px !important;
  font-size: 13px !important;
  color: var(--ds-text-2) !important;
  transition: background 120ms ease, color 120ms ease !important;
}
.sidebar-item:hover { background: var(--ds-bg-hover) !important; color: var(--ds-text-1) !important; }
.sidebar-item.q-router-link--active {
  background: var(--ds-orange-dim) !important;
  color: var(--ds-orange) !important;
  border-left: 2px solid var(--ds-orange);
  padding-left: 6px !important;
}
</style>
