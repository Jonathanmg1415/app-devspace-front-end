<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h5 text-weight-bold col">{{ t('projects.title') }}</div>
      <q-btn color="primary" icon="add" :label="t('projects.new')" @click="openCreate = true" />
    </div>

    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner size="48px" color="primary" />
    </div>

    <div v-else-if="!projects.length" class="flex flex-center column q-py-xl text-grey-6">
      <q-icon name="folder_open" size="64px" />
      <p class="q-mt-md">{{ t('projects.empty') }}</p>
    </div>

    <div v-else class="row q-gutter-md">
      <q-card
        v-for="project in projects"
        :key="project.id"
        class="devspace-card cursor-pointer col-12 col-sm-5 col-md-3"
        @click="router.push(`/projects/${project.id}`)"
      >
        <q-card-section class="row items-center no-wrap">
          <q-avatar :style="{ background: project.color || '#467886' }" text-color="white" icon="folder" size="40px" class="q-mr-md" />
          <div>
            <div class="text-weight-bold">{{ project.name }}</div>
            <div class="text-caption text-grey-6">{{ project.description }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="more_vert" @click.stop>
            <q-menu>
              <q-list style="min-width:120px">
                <q-item clickable v-close-popup @click="startEdit(project)">
                  <q-item-section>Editar</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="confirmDelete(project)">
                  <q-item-section class="text-negative">Eliminar</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-badge :style="{ background: project.status === 'active' ? '#21BA45' : '#888' }">
            {{ project.status === 'active' ? 'Activo' : 'Archivado' }}
          </q-badge>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog create/edit -->
    <q-dialog v-model="openCreate" persistent>
      <q-card style="min-width: 340px">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Editar proyecto' : t('projects.new') }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.name"        :label="t('projects.name')"        outlined dense />
          <q-input v-model="form.description" :label="t('projects.description')" outlined dense />
          <q-input v-model="form.color"       :label="t('projects.color')"       outlined dense>
            <template #append>
              <q-icon name="colorize">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color v-model="form.color" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup @click="resetForm" />
          <q-btn color="primary" :label="editing ? 'Guardar' : 'Crear'" :loading="saving" @click="handleSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useProjectsStore } from 'src/stores/projects'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const store = useProjectsStore()
const { projects, loading } = storeToRefs(store)

const openCreate = ref(false)
const saving = ref(false)
const editing = ref(null)
const form = ref({ name: '', description: '', color: '#467886' })

onMounted(() => store.fetchAll())

function startEdit(p) {
  editing.value = p
  form.value = { name: p.name, description: p.description, color: p.color }
  openCreate.value = true
}

function resetForm() {
  editing.value = null
  form.value = { name: '', description: '', color: '#467886' }
}

async function handleSubmit() {
  if (!form.value.name) return
  saving.value = true
  try {
    if (editing.value) {
      await store.update(editing.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Proyecto actualizado' })
    } else {
      await store.create(form.value)
      $q.notify({ type: 'positive', message: 'Proyecto creado' })
    }
    openCreate.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(p) {
  $q.dialog({
    title: 'Eliminar proyecto',
    message: `¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await store.remove(p.id)
    $q.notify({ type: 'positive', message: 'Proyecto eliminado' })
  })
}
</script>
