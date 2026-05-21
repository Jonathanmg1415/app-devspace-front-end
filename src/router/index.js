import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const routes = [
  {
    path: '/auth',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [
      { path: 'login',    component: () => import('src/pages/auth/LoginPage.vue') },
      { path: 'register', component: () => import('src/pages/auth/RegisterPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',                      redirect: '/projects' },
      { path: 'projects',              component: () => import('src/pages/projects/ProjectsPage.vue') },
      { path: 'projects/:id',          component: () => import('src/pages/projects/ProjectDetailPage.vue') },
      { path: 'projects/:id/tasks',    component: () => import('src/pages/tasks/TasksPage.vue') },
      { path: 'projects/:id/links',    component: () => import('src/pages/links/LinksPage.vue') },
      { path: 'projects/:id/commands', component: () => import('src/pages/commands/CommandsPage.vue') },
      { path: 'projects/:id/notes',    component: () => import('src/pages/notes/NotesPage.vue') },
      { path: 'projects/:id/cards',    component: () => import('src/pages/cards/CardsPage.vue') },
      { path: 'search',                component: () => import('src/pages/search/SearchPage.vue') },
      { path: 'projects/:id/files', component: () => import('src/pages/files/FilesPage.vue') },
      { path: 'projects/:id', component: () => import('src/pages/projects/ProjectDetailPage.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export function setupRouterGuards(pinia) {
  const auth = useAuthStore(pinia)

  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { path: '/auth/login' }
    }
    if (to.path.startsWith('/auth') && auth.isAuthenticated) {
      return { path: '/projects' }
    }
  })
}

export default router