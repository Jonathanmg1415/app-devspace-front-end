<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h6 text-weight-bold col">{{ t('links.title') }}</div>
      <q-btn color="primary" icon="add" :label="t('links.new')" @click="openForm = true" />
    </div>

    <q-list bordered separator rounded>
      <q-item v-for="link in items" :key="link.id" class="q-py-sm">
        <q-item-section avatar>
          <q-avatar icon="link" color="primary" text-color="white" size="36px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ link.title }}</q-item-label>
          <q-item-label caption>
            <a :href="link.url" target="_blank" class="text-primary">{{ link.url }}</a>
          </q-item-label>
          <q-item-label v-if="link.label" caption>
            <q-chip dense size="sm" color="grey-2" text-color="grey-8">{{ link.label }}</q-chip>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn flat round dense size="sm" icon="open_in_new" :href="link.url" target="_blank" />
            <q-btn flat round dense size="sm" icon="delete" color="negative" @click="confirmDelete(link)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <q-dialog v-model="openForm" persistent>
      <q-card style="min-width: 340px">
        <q-card-section><div class="text-h6">{{ t('links.new') }}</div></q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.title" label="Título" outlined dense />
          <q-input v-model="form.url"   :label="t('links.url')"   outlined dense />
          <q-input v-model="form.label" :label="t('links.label')" outlined dense />
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
import { useLinksStore } from 'src/stores/links'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const store = useLinksStore()
const { items } = storeToRefs(store)

const projectId = computed(() => route.params.id)
const openForm = ref(false)
const saving   = ref(false)
const form     = ref({ title: '', url: '', label: '' })

onMounted(() => store.fetchAll(projectId.value))

async function handleCreate() {
  saving.value = true
  try {
    await store.create(projectId.value, form.value)
    openForm.value = false
    form.value = { title: '', url: '', label: '' }
    $q.notify({ type: 'positive', message: 'Enlace creado' })
  } finally { saving.value = false }
}

function confirmDelete(link) {
  $q.dialog({ title: 'Eliminar enlace', message: `¿Eliminar "${link.title}"?`, cancel: true })
    .onOk(() => store.remove(link.id))
}
</script>
