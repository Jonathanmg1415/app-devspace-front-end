<template>
  <router-view />
  <DsLoadingOverlay />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
})
</script>
