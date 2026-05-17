<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>
          <span class="text-weight-bold">DevSpace</span>
        </q-toolbar-title>

        <q-btn flat round icon="search" :to="{ path: '/search' }" />

        <q-btn flat round>
          <q-icon name="brightness_6" />
          <q-tooltip>{{ $q.dark.isActive ? 'Modo claro' : 'Modo oscuro' }}</q-tooltip>
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup @click="$q.dark.set(false)">
                <q-item-section>Claro</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$q.dark.set(true)">
                <q-item-section>Oscuro</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$q.dark.set('auto')">
                <q-item-section>Sistema</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat round icon="logout" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered :width="220">
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header>{{ t('nav.projects') }}</q-item-label>
          <q-item clickable v-ripple :to="{ path: '/projects' }" exact>
            <q-item-section avatar><q-icon name="folder" /></q-item-section>
            <q-item-section>{{ t('nav.projects') }}</q-item-section>
          </q-item>

          <template v-if="currentProject">
            <q-separator spaced />
            <q-item-label header class="ellipsis" style="max-width:180px">
              {{ currentProject.name }}
            </q-item-label>
            <q-item v-for="item in projectNav" :key="item.path"
              clickable v-ripple :to="item.to" exact>
              <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
              <q-item-section>{{ t(item.label) }}</q-item-section>
            </q-item>
          </template>

          <q-separator spaced />
          <q-item clickable v-ripple :to="{ path: '/search' }">
            <q-item-section avatar><q-icon name="search" /></q-item-section>
            <q-item-section>{{ t('nav.search') }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useProjectsStore } from 'src/stores/projects'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()
const projectsStore = useProjectsStore()

const drawer = ref(false)

const currentProject = computed(() =>
  route.params.id ? projectsStore.projects.find(p => p.id == route.params.id) : null
)

const projectNav = computed(() => {
  const id = route.params.id
  return [
    { label: 'nav.tasks',    icon: 'task_alt',     to: `/projects/${id}/tasks` },
    { label: 'nav.links',    icon: 'link',          to: `/projects/${id}/links` },
    { label: 'nav.commands', icon: 'terminal',      to: `/projects/${id}/commands` },
    { label: 'nav.notes',    icon: 'description',   to: `/projects/${id}/notes` },
    { label: 'nav.cards',    icon: 'view_kanban',   to: `/projects/${id}/cards` },
  ]
})

async function handleLogout() {
  auth.logout()
  router.push('/auth/login')
}
</script>
