<template>
  <q-page padding style="max-width:520px; margin:0 auto">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Mi perfil</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          Información de tu cuenta
        </div>
      </div>
    </div>

    <!-- Avatar + info -->
    <div class="profile-hero q-mb-lg">
      <q-avatar size="56px" :style="{ background:'var(--ds-orange)', color:'#fff', fontSize:'22px', fontWeight:'700' }">
        {{ auth.user?.name?.[0]?.toUpperCase() || '?' }}
      </q-avatar>
      <div>
        <div style="font-size:16px; font-weight:700; color:var(--ds-text-1)">{{ auth.user?.name }}</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">{{ auth.user?.email }}</div>
      </div>
    </div>

    <!-- Nombre -->
    <q-card class="profile-section q-mb-md">
      <q-card-section style="padding:20px 24px 0">
        <div class="section-title">Nombre</div>
      </q-card-section>
      <q-card-section style="padding:12px 24px" class="q-gutter-sm">
        <q-input v-model="nameForm.name" label="Tu nombre" outlined dense
          :rules="[v => !!v || 'El nombre es requerido']" />
      </q-card-section>
      <q-card-actions style="padding:0 24px 20px">
        <q-space />
        <q-btn color="primary" label="Guardar nombre" size="sm" style="height:34px"
          :loading="savingName" :disable="nameForm.name === auth.user?.name"
          @click="handleSaveName" />
      </q-card-actions>
    </q-card>

    <!-- Contraseña -->
    <q-card class="profile-section">
      <q-card-section style="padding:20px 24px 0">
        <div class="section-title">Cambiar contraseña</div>
      </q-card-section>
      <q-card-section style="padding:12px 24px" class="q-gutter-sm">
        <q-input v-model="pwdForm.current" label="Contraseña actual"
          :type="showCurrent ? 'text' : 'password'" outlined dense>
          <template #append>
            <q-icon :name="showCurrent ? 'visibility_off' : 'visibility'" size="16px"
              class="cursor-pointer" style="color:var(--ds-text-3)" @click="showCurrent = !showCurrent" />
          </template>
        </q-input>
        <q-input v-model="pwdForm.next" label="Nueva contraseña"
          :type="showNext ? 'text' : 'password'" outlined dense
          :rules="[v => !v || v.length >= 6 || 'Mínimo 6 caracteres']">
          <template #append>
            <q-icon :name="showNext ? 'visibility_off' : 'visibility'" size="16px"
              class="cursor-pointer" style="color:var(--ds-text-3)" @click="showNext = !showNext" />
          </template>
        </q-input>
        <q-input v-model="pwdForm.confirm" label="Confirmar nueva contraseña"
          :type="showNext ? 'text' : 'password'" outlined dense
          :rules="[v => !pwdForm.next || v === pwdForm.next || 'Las contraseñas no coinciden']" />
      </q-card-section>
      <q-card-actions style="padding:0 24px 20px">
        <q-space />
        <q-btn color="primary" label="Cambiar contraseña" size="sm" style="height:34px"
          :loading="savingPwd"
          :disable="!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm"
          @click="handleSavePwd" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const auth = useAuthStore()

const nameForm = ref({ name: auth.user?.name || '' })
const pwdForm  = ref({ current: '', next: '', confirm: '' })
const savingName = ref(false)
const savingPwd  = ref(false)
const showCurrent = ref(false)
const showNext    = ref(false)

async function handleSaveName() {
  if (!nameForm.value.name.trim()) return
  savingName.value = true
  try {
    const { data } = await api.put('/api/auth/profile', { name: nameForm.value.name.trim() })
    auth.user = data.user
    $q.notify({ type: 'positive', message: 'Nombre actualizado' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error || 'Error al guardar' })
  } finally { savingName.value = false }
}

async function handleSavePwd() {
  if (!pwdForm.value.current || !pwdForm.value.next) return
  if (pwdForm.value.next !== pwdForm.value.confirm) return
  savingPwd.value = true
  try {
    await api.put('/api/auth/profile', {
      currentPassword: pwdForm.value.current,
      newPassword: pwdForm.value.next,
    })
    pwdForm.value = { current: '', next: '', confirm: '' }
    $q.notify({ type: 'positive', message: 'Contraseña actualizada' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error || 'La contraseña actual es incorrecta' })
  } finally { savingPwd.value = false }
}
</script>

<style scoped>
.profile-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
}
.profile-section {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ds-text-1);
  margin-bottom: 4px;
}
</style>
