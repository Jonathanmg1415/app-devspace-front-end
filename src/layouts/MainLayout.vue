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

        <!-- Notificaciones -->
        <q-btn flat round dense size="sm" style="color:var(--ds-text-2); position:relative">
          <q-icon name="notifications" size="18px" />
          <span v-if="notifStore.unread > 0" class="notif-badge">{{ notifStore.unread > 9 ? '9+' : notifStore.unread }}</span>
          <q-menu style="width:320px; max-height:440px" anchor="bottom right" self="top right">
            <div class="notif-header">
              <span style="font-size:13px; font-weight:600; color:var(--ds-text-1)">Notificaciones</span>
              <q-btn v-if="notifStore.unread > 0" flat dense size="xs" label="Marcar todo leído"
                style="color:var(--ds-text-3); font-size:11px" @click="notifStore.markAllRead()" />
            </div>
            <q-scroll-area style="height:340px">
              <div v-if="!notifStore.items.length" class="flex flex-center column q-py-xl" style="color:var(--ds-text-3)">
                <q-icon name="notifications_none" size="32px" style="opacity:0.3" />
                <p style="font-size:12px; margin-top:8px">Sin notificaciones</p>
              </div>
              <div v-for="n in notifStore.items" :key="n.id"
                class="notif-item" :class="{ 'notif-item--unread': !n.read }"
                @click="notifStore.markRead(n.id)">
                <div class="notif-dot" v-if="!n.read" />
                <div style="flex:1; min-width:0">
                  <div style="font-size:12px; font-weight:500; color:var(--ds-text-1); line-height:1.4">{{ n.title }}</div>
                  <div v-if="n.body" style="font-size:11px; color:var(--ds-text-3); margin-top:2px">{{ n.body }}</div>
                  <div style="font-size:10px; color:var(--ds-text-3); margin-top:3px">{{ formatNotifTime(n.createdAt) }}</div>
                </div>
              </div>
            </q-scroll-area>
          </q-menu>
        </q-btn>

        <!-- Theme picker -->
        <q-btn flat round dense size="sm" style="color:var(--ds-text-2)">
          <q-icon name="palette" size="16px" />
          <q-tooltip>Color de acento</q-tooltip>
          <q-menu style="min-width:216px" anchor="bottom right" self="top right">
            <div style="padding:12px">
              <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--ds-text-3); margin-bottom:10px">Color de acento</div>
              <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px">
                <div v-for="t in THEMES" :key="t.id"
                  class="theme-swatch"
                  :class="{ active: themeStore.accent === t.color }"
                  :style="{ '--tw': t.color }"
                  @click="themeStore.setAccent(t.color)">
                  <div class="theme-dot" :style="{ background: t.color }" />
                  <span class="theme-label">{{ t.label }}</span>
                  <q-icon v-if="themeStore.accent === t.color" name="check" size="10px"
                    class="theme-check" />
                </div>
              </div>
            </div>
          </q-menu>
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
          <q-avatar size="34px" :style="auth.user?.avatar ? {} : { background:'var(--ds-orange)', color:'#fff', fontSize:'14px', fontWeight:'700' }">
            <img v-if="auth.user?.avatar" :src="auth.user.avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />
            <span v-else>{{ userInitial }}</span>
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
          <q-item clickable v-ripple :to="{ path: '/my-tasks' }" class="sidebar-item">
            <q-item-section avatar><q-icon name="assignment" size="15px" /></q-item-section>
            <q-item-section>Mis tareas</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="{ path: '/calendar' }" class="sidebar-item">
            <q-item-section avatar><q-icon name="calendar_month" size="15px" /></q-item-section>
            <q-item-section>Calendario</q-item-section>
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
import { useNotificationsStore } from 'src/stores/notifications'
import { useThemeStore, THEMES } from 'src/stores/theme'
import { decodeId } from 'src/utils/routeId'

const $q         = useQuasar()
const router     = useRouter()
const route      = useRoute()
const auth       = useAuthStore()
const projectsStore  = useProjectsStore()
const notifStore     = useNotificationsStore()
const themeStore     = useThemeStore()

const drawer = ref(true)

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)
  } catch { /* navegador bloqueó audio sin interacción previa */ }
}

onMounted(async () => {
  if (auth.token && !auth.user) await auth.fetchMe()
  const saved = localStorage.getItem('devspace_dark')
  if (saved !== null) $q.dark.set(JSON.parse(saved))
  notifStore.fetchAll()
  // refresca notificaciones cada 30 segundos y suena si hay nuevas
  setInterval(async () => {
    const prevUnread = notifStore.unread
    await notifStore.fetchAll()
    if (notifStore.unread > prevUnread) playNotifSound()
  }, 30 * 1000)
})

function formatNotifTime(ts) {
  if (!ts) return ''
  const d = new Date(ts), now = new Date(), diff = now - d
  if (diff < 60000)    return 'Ahora'
  if (diff < 3600000)  return `Hace ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`
  return d.toLocaleDateString('es', { day:'numeric', month:'short' })
}

const userInitial = computed(() => auth.user?.name?.[0]?.toUpperCase() || '?')

const currentProject = computed(() => {
  const id = decodeId(route.params.id)
  return id ? projectsStore.projects.find(p => p.id === id) : null
})

const projectNav = computed(() => {
  const id = route.params.id
  return [
    { label: 'Inicio',   icon: 'dashboard',  to: `/projects/${id}` },
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
/* ── Notificaciones ── */
.notif-badge {
  position: absolute;
  top: 2px; right: 2px;
  min-width: 16px; height: 16px;
  background: var(--ds-orange);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
  line-height: 1;
}
.notif-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--ds-border);
}
.notif-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--ds-border);
  cursor: pointer;
  transition: background 120ms ease;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: var(--ds-bg-hover); }
.notif-item--unread { background: rgba(249,115,22,0.04); }
.notif-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--ds-orange);
  flex-shrink: 0;
  margin-top: 4px;
}
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

/* ── Theme picker swatches ── */
.theme-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  border: 1px solid transparent;
  transition: background 120ms ease, border-color 120ms ease;
}
.theme-swatch:hover { background: var(--ds-bg-hover); }
.theme-swatch.active {
  background: var(--ds-orange-dim);
  border-color: var(--ds-orange);
}
.theme-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.22);
  transition: transform 140ms cubic-bezier(0.34,1.56,0.64,1);
}
.theme-swatch:hover .theme-dot { transform: scale(1.15); }
.theme-swatch.active .theme-dot { transform: scale(1.1); }
.theme-label {
  font-size: 9px;
  font-weight: 500;
  color: var(--ds-text-3);
  text-align: center;
  white-space: nowrap;
}
.theme-swatch.active .theme-label { color: var(--ds-orange); }
.theme-check {
  position: absolute;
  top: 4px;
  right: 4px;
  color: var(--ds-orange);
}
</style>
