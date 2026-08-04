<template>
  <q-card class="auth-card" style="width:min(380px, 96vw)">
    <q-card-section class="q-pa-lg q-pa-sm-xl">
      <div class="q-mb-md flex flex-center">
        <img src="/favicon.png" alt="DevSpace" style="height:44px; width:44px; border-radius:50%" />
      </div>
      <div style="font-size:20px; font-weight:700; text-align:center; margin-bottom:4px; color:var(--ds-text-1)">
        Dev<span style="color:var(--ds-orange)">Space</span>
      </div>
      <div class="q-mb-lg" style="font-size:13px; color:var(--ds-text-2); text-align:center">
        Crea tu cuenta gratuita
      </div>

      <q-form @submit="handleRegister" class="q-gutter-md">
        <q-input v-model="name" label="Nombre" outlined dense :rules="[v => !!v || 'Requerido']">
          <template #prepend><q-icon name="person_outline" size="16px" style="color:var(--ds-text-3)" /></template>
        </q-input>
        <q-input v-model="email" label="Email" type="email" outlined dense autocomplete="email"
          :rules="[v => !!v || 'Requerido']">
          <template #prepend><q-icon name="alternate_email" size="16px" style="color:var(--ds-text-3)" /></template>
        </q-input>
        <q-input v-model="password" label="Contraseña" type="password" outlined dense
          autocomplete="new-password" :rules="[v => !!v || 'Requerido', v => v.length >= 6 || 'Mínimo 6 caracteres']">
          <template #prepend><q-icon name="lock_outline" size="16px" style="color:var(--ds-text-3)" /></template>
        </q-input>
        <q-btn type="submit" label="Crear cuenta" color="primary" class="full-width q-mt-sm"
          :loading="loading" style="height:40px; font-size:13px" />
      </q-form>

      <div class="q-mt-md text-center" style="font-size:13px; color:var(--ds-text-2)">
        ¿Ya tienes cuenta?
        <router-link to="/auth/login" style="color:var(--ds-orange); text-decoration:none; font-weight:500">
          Inicia sesión
        </router-link>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar(); const router = useRouter(); const auth = useAuthStore()
const name = ref(''); const email = ref(''); const password = ref(''); const loading = ref(false)

async function handleRegister() {
  loading.value = true
  try {
    await auth.register(name.value, email.value, password.value)
    router.push('/projects')
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error || 'Error al registrarse' })
  } finally { loading.value = false }
}
</script>
