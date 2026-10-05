<template>
  <router-view />
  <DsLoadingOverlay />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useThemeStore } from 'src/stores/theme'
import { useAuthStore } from 'src/stores/auth'
import DsLoadingOverlay from 'src/components/DsLoadingOverlay.vue'

const themeStore = useThemeStore()
const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  themeStore.init()
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe()
    } catch (err) {
      // Token inválido/expirado → logout y redirigir al login
      if (err?.response?.status === 401) {
        auth.logout()
        router.push('/auth/login')
      }
      // Errores de red o 500: mantenemos la sesión, la UI mostrará errores
    }
  }

  // register-service-worker (src-pwa) dispara este evento cuando detecta una versión
  // nueva — con skipWaiting+clientsClaim el SW ya se activó solo, pero la pestaña
  // abierta sigue corriendo el JS viejo en memoria hasta que recarga. Sin este listener
  // el evento se perdía y el usuario podía quedarse indefinidamente en un build
  // desactualizado (ej. el fix de comandos multilínea nunca se veía reflejado).
  document.addEventListener('swUpdated', () => {
    Notify.create({
      message: 'Hay una versión nueva de DevSpace disponible',
      color: 'dark',
      position: 'bottom',
      timeout: 0,
      actions: [
        { label: 'Recargar', color: 'orange', handler: () => window.location.reload() },
      ],
    })
  }, { once: true })
})
</script>
