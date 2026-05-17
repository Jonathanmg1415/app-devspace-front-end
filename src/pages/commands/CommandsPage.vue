<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h6 text-weight-bold col">{{ t('commands.title') }}</div>
      <q-btn color="primary" icon="add" :label="t('commands.new')" @click="openForm = true" />
    </div>

    <div class="row q-gutter-md">
      <q-card v-for="cmd in items" :key="cmd.id" class="devspace-card col-12 col-md-5" flat bordered>
        <q-card-section>
          <div class="row items-center q-mb-xs">
            <div class="text-weight-bold col">{{ cmd.title }}</div>
            <q-btn flat round dense size="sm" icon="delete" color="negative" @click="confirmDelete(cmd)" />
          </div>
          <div v-if="cmd.description" class="text-caption text-grey-6 q-mb-sm">{{ cmd.description }}</div>
          <q-input
            :model-value="cmd.command"
            readonly dense outlined
            class="code-input"
            bg-color="grey-2"
          >
            <template #append>
              <q-btn flat round dense icon="content_copy" size="sm" @click="copyCmd(cmd.command)">
                <q-tooltip>{{ t('common.copy') }}</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <div class="q-mt-xs">
            <q-chip v-for="tag in cmd.tags" :key="tag" dense size="sm" color="primary" text-color="white">{{ tag }}</q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="openForm" persistent>
      <q-card style="min-width: 360px">
        <q-card-section><div class="text-h6">{{ t('commands.new') }}</div></q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.title"       label="Título"      outlined dense />
          <q-input v-model="form.command"     :label="t('commands.command')"     outlined dense font="monospace" />
          <q-input v-model="form.description" :label="t('commands.description')" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Crear" :loading="saving" @click="handleCreate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useCommandsStore } from 'src/stores/commands'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const store = useCommandsStore()
const { items } = storeToRefs(store)

const projectId = computed(() => route.params.id)
const openForm = ref(false)
const saving   = ref(false)
const form     = ref({ title: '', command: '', description: '' })

onMounted(() => store.fetchAll(projectId.value))

async function handleCreate() {
  saving.value = true
  try {
    await store.create(projectId.value, form.value)
    openForm.value = false
    form.value = { title: '', command: '', description: '' }
    $q.notify({ type: 'positive', message: 'Comando creado' })
  } finally { saving.value = false }
}

function copyCmd(text) {
  navigator.clipboard.writeText(text)
  $q.notify({ type: 'positive', message: t('common.copied'), timeout: 1000 })
}

function confirmDelete(cmd) {
  $q.dialog({ title: 'Eliminar comando', message: `¿Eliminar "${cmd.title}"?`, cancel: true })
    .onOk(() => store.remove(cmd.id))
}
</script>
