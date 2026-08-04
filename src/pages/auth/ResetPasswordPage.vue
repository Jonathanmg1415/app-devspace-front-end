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
        Nueva contraseña
      </div>

      <div v-if="!token" class="error-box q-mb-md">
        <q-icon name="error_outline" size="24px" style="color:var(--ds-negative)" />
        <p style="margin:0; font-size:13px; color:var(--ds-text-2)">
          Enlace inválido. Solicita uno nuevo desde el login.
        </p>
      </div>

      <div v-else-if="done" class="success-box q-mb-md">
        <q-icon name="check_circle" size="28px" style="color:#22C55E; display:block; margin:0 auto 8px" />
        <p style="margin:0 0 12px; font-size:13px; color:var(--ds-text-2); text-align:center">
          ¡Contraseña actualizada correctamente!
        </p>
        <q-btn color="primary" label="Iniciar sesión" class="full-width" style="height:38px"
          @click="router.push('/auth/login')" />
      </div>

      <q-form v-else @submit="handleSubmit" class="q-gutter-md">
        <q-input v-model="password" label="Nueva contraseña" :type="showPwd ? 'text' : 'password'"
          outlined dense :rules="[v => !!v || 'Requerido', v => v.length >= 6 || 'Mínimo 6 caracteres']">
          <template #prepend><q-icon name="lock_outline" size="16px" style="color:var(--ds-text-3)" /></template>
          <template #append>
            <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" size="16px"
              class="cursor-pointer" style="color:var(--ds-text-3)"
              tabindex="0" role="button" :aria-label="showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPwd = !showPwd"
              @keydown.enter="showPwd = !showPwd" @keydown.space.prevent="showPwd = !showPwd" />
          </template>
        </q-input>
        <q-input v-model="confirm" label="Confirmar contraseña" :type="showPwd ? 'text' : 'password'"
          outlined dense :rules="[v => v === password || 'Las contraseñas no coinciden']">
          <template #prepend><q-icon name="lock" size="16px" style="color:var(--ds-text-3)" /></template>
        </q-input>
        <q-btn type="submit" label="Cambiar contraseña" color="primary" class="full-width q-mt-sm"
          :loading="loading" style="height:40px; font-size:13px" />
      </q-form>

      <div v-if="!done" class="q-mt-md text-center" style="font-size:12px; color:var(--ds-text-3)">
        <router-link to="/auth/login" style="color:var(--ds-text-3); text-decoration:none">
          ← Volver al login
        </router-link>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar(); const route = useRoute(); const router = useRouter()
const token    = route.query.token || null
const password = ref(''); const confirm = ref(''); const showPwd = ref(false)
const loading  = ref(false); const done = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await api.post('/api/auth/reset-password', { token, password: password.value })
    done.value = true
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.mensaje || 'El enlace ha expirado. Solicita uno nuevo.' })
  } finally { loading.value = false }
}
</script>

<style scoped>
.success-box {
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 8px; padding: 16px;
}
.error-box {
  display: flex; align-items: center; gap: 10px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px; padding: 14px;
}
</style>
