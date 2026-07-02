import { createRouter, createWebHistory } from 'vue-router'
import { LoadingBar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const routes = [
  {
    path: '/auth',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [
      { path: 'login',          component: () => import('src/pages/auth/LoginPage.vue') },
      { path: 'register',       component: () => import('src/pages/auth/RegisterPage.vue') },
      { path: 'forgot-password',component: () => import('src/pages/auth/ForgotPasswordPage.vue') },
      { path: 'reset-password', component: () => import('src/pages/auth/ResetPasswordPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',                         redirect: '/projects' },
      { path: 'projects',                 component: () => import('src/pages/projects/ProjectsPage.vue') },
      { path: 'projects/:id',             component: () => import('src/pages/projects/ProjectDetailPage.vue') },
      { path: 'projects/:id/tasks',       component: () => import('src/pages/tasks/TasksPage.vue') },
      { path: 'projects/:id/links',       component: () => import('src/pages/links/LinksPage.vue') },
      { path: 'projects/:id/commands',    component: () => import('src/pages/commands/CommandsPage.vue') },
      { path: 'projects/:id/notes',       component: () => import('src/pages/notes/NotesPage.vue') },
      { path: 'projects/:id/files',       component: () => import('src/pages/files/FilesPage.vue') },
      { path: 'projects/:id/activity',   component: () => import('src/pages/activity/ActivityPage.vue') },
      { path: 'my-tasks',                  component: () => import('src/pages/tasks/MyTasksPage.vue') },
      { path: 'calendar',                  component: () => import('src/pages/calendar/CalendarPage.vue') },
      { path: 'search',                   component: () => import('src/pages/search/SearchPage.vue') },
      { path: 'profile',                  component: () => import('src/pages/profile/ProfilePage.vue') },
      { path: 'changelog',                component: () => import('src/pages/changelog/ChangelogPage.vue') },
    ],
  },
  // Ruta no encontrada — 404 dentro del app, login si no autenticado
  {
    path: '/:pathMatch(.*)*',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('src/pages/errors/NotFoundPage.vue') }],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export function setupRouterGuards(pinia) {
  const auth = useAuthStore(pinia)

  router.beforeEach(() => { LoadingBar.start() })
  router.afterEach(() => { LoadingBar.stop() })

  router.beforeEach((to) => {
    // Solo verificamos si hay token — la validación real contra la API
    // ocurre en App.vue (onMounted) para no bloquear la navegación inicial.
    if (to.meta.requiresAuth && !auth.token) {
      return { path: '/auth/login' }
    }
    if (to.path.startsWith('/auth') && auth.token) {
      return { path: '/projects' }
    }
  })
}

export default router