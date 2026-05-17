<template>
  <q-card style="min-width: 360px" class="q-pa-lg">
    <q-card-section class="text-center q-pb-none">
      <div class="text-h5 text-weight-bold text-primary">DevSpace</div>
      <div class="text-subtitle2 text-grey-6">{{ t('auth.register') }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="handleRegister" class="q-gutter-md">
        <q-input v-model="name"     :label="t('auth.name')"     outlined dense :rules="[v => !!v || 'Requerido']" />
        <q-input v-model="email"    :label="t('auth.email')"    type="email" outlined dense :rules="[v => !!v || 'Requerido']" />
        <q-input v-model="password" :label="t('auth.password')" type="password" outlined dense :rules="[v => !!v || 'Requerido', v => v.length >= 6 || 'Mínimo 6 caracteres']" />

        <q-btn type="submit" :label="t('auth.register')" color="primary" class="full-width" :loading="loading" />
      </q-form>
    </q-card-section>

    <q-card-section class="text-center q-pt-none">
      <router-link to="/auth/login" class="text-primary text-caption">
        ¿Ya tienes cuenta? Inicia sesión
      </router-link>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()

const name = ref(''); const email = ref(''); const password = ref(''); const loading = ref(false)

async function handleRegister() {
  loading.value = true
  try {
    await auth.register(name.value, email.value, password.value)
    router.push('/projects')
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error || 'Error al registrarse' })
  } finally {
    loading.value = false
  }
}
</script>
