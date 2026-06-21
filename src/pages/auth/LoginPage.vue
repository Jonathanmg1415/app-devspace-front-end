<template>
  <q-card class="auth-card" style="width:min(380px, 96vw)">
    <q-card-section class="q-pa-lg q-pa-sm-xl">
      <div class="q-mb-md flex flex-center">
        <img src="/favicon.png" style="height:44px; width:44px; border-radius:50%" />
      </div>
      <div style="font-size:20px; font-weight:700; text-align:center; margin-bottom:4px; color:var(--ds-text-1)">
        Dev<span style="color:var(--ds-orange)">Space</span>
      </div>
      <div class="q-mb-lg" style="font-size:13px; color:var(--ds-text-2); text-align:center">
        Tu workspace técnico personal
      </div>

      <q-form @submit="handleLogin" class="q-gutter-md">
        <q-input v-model="email" label="Email" type="email" outlined dense autocomplete="email"
          :rules="[v => !!v || 'Requerido']">
          <template #prepend><q-icon name="alternate_email" size="16px" style="color:var(--ds-text-3)" /></template>
        </q-input>
        <q-input v-model="password" label="Contraseña" :type="showPwd ? 'text' : 'password'"
          outlined dense autocomplete="current-password" :rules="[v => !!v || 'Requerido']">
          <template #prepend><q-icon name="lock_outline" size="16px" style="color:var(--ds-text-3)" /></template>
          <template #append>
            <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" size="16px"
              class="cursor-pointer" style="color:var(--ds-text-3)" @click="showPwd = !showPwd" />
          </template>
        </q-input>
        <q-btn type="submit" label="Iniciar sesión" color="primary" class="full-width q-mt-sm"
          :loading="loading" style="height:40px; font-size:13px" />
      </q-form>

      <div class="q-mt-md text-center" style="font-size:13px; color:var(--ds-text-2)">
        ¿No tienes cuenta?
        <router-link to="/auth/register" style="color:var(--ds-orange); text-decoration:none; font-weight:500">
          Regístrate
        </router-link>
      </div>
      <div class="q-mt-sm text-center" style="font-size:12px; color:var(--ds-text-3)">
        <router-link to="/auth/forgot-password" style="color:var(--ds-text-3); text-decoration:none">
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>
      <div class="q-mt-sm text-center" style="font-size:11px; color:var(--ds-text-3)">
        v0.3.0-alpha
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
const email = ref(''); const password = ref(''); const showPwd = ref(false); const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/projects')
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error || 'Credenciales incorrectas' })
  } finally { loading.value = false }
}
</script>
