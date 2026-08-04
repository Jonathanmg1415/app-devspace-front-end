<template>
  <q-page padding style="max-width:560px; margin:0 auto">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Mi perfil</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">Información de tu cuenta</div>
      </div>
    </div>

    <!-- ── Hero avatar ── -->
    <div class="profile-hero q-mb-md">
      <!-- Avatar clickeable -->
      <div class="avatar-wrap" role="button" tabindex="0" aria-label="Cambiar foto de perfil"
        @click="triggerFilePick" @keydown.enter="triggerFilePick" @keydown.space.prevent="triggerFilePick">
        <img v-if="avatarPreview" :src="avatarPreview" :alt="auth.user?.name || 'Avatar'" class="avatar-img" />
        <div v-else class="avatar-initial" :style="{ background:'var(--ds-orange)' }">
          {{ auth.user?.name?.[0]?.toUpperCase() || '?' }}
        </div>
        <div class="avatar-overlay">
          <q-icon name="photo_camera" size="20px" color="white" />
        </div>
        <q-tooltip>Cambiar foto</q-tooltip>
      </div>

      <div class="col">
        <div style="font-size:17px; font-weight:700; color:var(--ds-text-1)">{{ auth.user?.name }}</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">{{ auth.user?.email }}</div>
        <div v-if="avatarChanged" class="row items-center q-mt-sm" style="gap:8px">
          <q-btn color="primary" label="Guardar foto" size="xs" style="height:26px"
            :loading="savingAvatar" @click="handleSaveAvatar" />
          <q-btn flat label="Cancelar" size="xs" style="height:26px; color:var(--ds-text-3)"
            @click="cancelAvatar" />
        </div>
        <div v-else style="font-size:11px; color:var(--ds-text-3); margin-top:6px">
          Haz clic en la foto para cambiarla
        </div>
      </div>
    </div>

    <!-- Input oculto -->
    <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFilePicked" />

    <!-- ── Nombre ── -->
    <q-card class="profile-section q-mb-md">
      <q-card-section style="padding:20px 24px 0">
        <div class="section-title">Nombre</div>
      </q-card-section>
      <q-card-section style="padding:12px 24px">
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

    <!-- ── Contraseña ── -->
    <q-card class="profile-section">
      <q-card-section style="padding:20px 24px 0">
        <div class="section-title">Cambiar contraseña</div>
      </q-card-section>
      <q-card-section style="padding:12px 24px" class="q-gutter-sm">
        <q-input v-model="pwdForm.current" label="Contraseña actual"
          :type="showCurrent ? 'text' : 'password'" outlined dense>
          <template #append>
            <q-icon :name="showCurrent ? 'visibility_off' : 'visibility'" size="16px"
              class="cursor-pointer" style="color:var(--ds-text-3)"
              tabindex="0" role="button" :aria-label="showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showCurrent = !showCurrent"
              @keydown.enter="showCurrent = !showCurrent" @keydown.space.prevent="showCurrent = !showCurrent" />
          </template>
        </q-input>
        <q-input v-model="pwdForm.next" label="Nueva contraseña"
          :type="showNext ? 'text' : 'password'" outlined dense
          :rules="[v => !v || v.length >= 6 || 'Mínimo 6 caracteres']">
          <template #append>
            <q-icon :name="showNext ? 'visibility_off' : 'visibility'" size="16px"
              class="cursor-pointer" style="color:var(--ds-text-3)"
              tabindex="0" role="button" :aria-label="showNext ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showNext = !showNext"
              @keydown.enter="showNext = !showNext" @keydown.space.prevent="showNext = !showNext" />
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
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'

const $q   = useQuasar()
const auth = useAuthStore()

// ── Avatar ──
const fileInput    = ref(null)
const avatarPreview = ref(auth.user?.avatar || null)
const avatarData    = ref(null)
const savingAvatar  = ref(false)
const avatarChanged = computed(() => avatarData.value !== null)

function triggerFilePick() { fileInput.value?.click() }

function onFilePicked(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => compressImage(evt.target.result)
  reader.readAsDataURL(file)
  e.target.value = ''
}

function compressImage(dataUrl) {
  const img = new Image()
  img.onload = () => {
    const MAX = 240
    let w = img.width, h = img.height
    if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX } }
    else        { if (h > MAX) { w = w * MAX / h; h = MAX } }

    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const compressed = canvas.toDataURL('image/jpeg', 0.82)
    avatarPreview.value = compressed
    avatarData.value    = compressed
  }
  img.src = dataUrl
}

function cancelAvatar() {
  avatarPreview.value = auth.user?.avatar || null
  avatarData.value    = null
}

async function handleSaveAvatar() {
  savingAvatar.value = true
  try {
    const { data } = await api.put('/api/auth/profile', { avatar: avatarData.value })
    auth.user = data.user
    avatarData.value = null
    $q.notify({ type: 'positive', message: 'Foto actualizada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar la foto' })
  } finally { savingAvatar.value = false }
}

// ── Nombre ──
const nameForm   = ref({ name: auth.user?.name || '' })
const savingName = ref(false)

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

// ── Contraseña ──
const pwdForm     = ref({ current: '', next: '', confirm: '' })
const savingPwd   = ref(false)
const showCurrent = ref(false)
const showNext    = ref(false)

async function handleSavePwd() {
  if (!pwdForm.value.current || !pwdForm.value.next) return
  if (pwdForm.value.next !== pwdForm.value.confirm) return
  savingPwd.value = true
  try {
    await api.put('/api/auth/profile', {
      currentPassword: pwdForm.value.current,
      newPassword:     pwdForm.value.next,
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
  gap: 20px;
  padding: 24px;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
}

/* ── Avatar ── */
.avatar-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 50%;
}
.avatar-wrap:hover .avatar-overlay { opacity: 1; }

.avatar-img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--ds-border-md);
  display: block;
}

.avatar-initial {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.15);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 160ms ease;
}

/* ── Secciones ── */
.profile-section {
  background: var(--ds-bg-1) !important;
  border: 1px solid var(--ds-border) !important;
  border-radius: var(--ds-radius) !important;
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ds-text-1);
  margin-bottom: 4px;
}
</style>
