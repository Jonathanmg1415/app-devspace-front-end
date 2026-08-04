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
        Recuperar contraseña
      </div>

      <div v-if="sent" class="sent-box q-mb-md">
        <q-icon name="mark_email_read" size="28px" style="color:#22C55E; display:block; margin:0 auto 8px" />
        <p style="margin:0; font-size:13px; color:var(--ds-text-2); text-align:center">
          Si existe una cuenta con ese email, recibirás un enlace de recuperación en los próximos minutos.
        </p>
      </div>

      <q-form v-else @submit="handleSubmit" class="q-gutter-md">
        <q-input v-model="email" label="Email" type="email" outlined dense autocomplete="email"
          :rules="[v => !!v || 'Requerido']">
          <template #prepend><q-icon name="alternate_email" size="16px" style="color:var(--ds-text-3)" /></template>
        </q-input>
        <q-btn type="submit" label="Enviar enlace" color="primary" class="full-width q-mt-sm"
          :loading="loading" style="height:40px; font-size:13px" />
      </q-form>

      <div class="q-mt-md text-center" style="font-size:12px; color:var(--ds-text-3)">
        <router-link to="/auth/login" style="color:var(--ds-text-3); text-decoration:none">
          ← Volver al login
        </router-link>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const email = ref(''); const loading = ref(false); const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await api.post('/api/auth/forgot-password', { email: email.value })
    sent.value = true
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar el correo. Intenta de nuevo.' })
  } finally { loading.value = false }
}
</script>

<style scoped>
.sent-box {
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 8px;
  padding: 16px;
}
</style>
