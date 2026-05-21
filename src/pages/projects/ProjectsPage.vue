<template>
  <q-page padding>

    <div class="row items-center q-mb-xl">
      <div class="col">
        <div class="ds-page-title">Proyectos</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ projects.length }} proyecto{{ projects.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <q-btn color="primary" icon="add" label="Nuevo proyecto" size="sm"
        style="height:34px" @click="openCreate = true" />
    </div>

    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner size="32px" color="primary" />
    </div>

    <div v-else-if="!projects.length" class="flex flex-center column q-py-xl"
      style="color:var(--ds-text-3)">
      <q-icon name="folder_open" size="48px" style="opacity:0.4" />
      <p class="q-mt-md" style="font-size:14px">No tienes proyectos aún</p>
      <q-btn flat color="primary" label="Crear el primero" size="sm" @click="openCreate = true" />
    </div>

    <div v-else class="row" style="gap:16px; flex-wrap:wrap">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card col-12 col-sm-5 col-md-3"
        @click="router.push(`/projects/${project.id}`)"
      >
        <!-- Color bar -->
        <div class="project-color-bar" :style="{ background: project.color || 'var(--ds-orange)' }" />

        <div style="padding: 14px 14px 14px 18px">
          <div class="row items-start no-wrap">
            <div class="col">
              <div style="font-size:14px; font-weight:600; color:var(--ds-text-1); line-height:1.3">
                {{ project.name }}
              </div>
              <div v-if="project.description"
                style="font-size:12px; color:var(--ds-text-2); margin-top:3px; line-height:1.4">
                {{ project.description }}
              </div>
            </div>
            <q-btn flat round dense icon="more_vert" size="xs"
              style="color:var(--ds-text-3); margin-top:-2px; margin-right:-6px"
              @click.stop>
              <q-menu>
                <q-list style="min-width:130px; padding:4px">
                  <q-item clickable v-close-popup @click="startEdit(project)" style="border-radius:6px">
                    <q-item-section avatar style="min-width:28px">
                      <q-icon name="edit" size="13px" />
                    </q-item-section>
                    <q-item-section style="font-size:13px">Editar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="confirmDelete(project)"
                    style="border-radius:6px; color:var(--ds-negative)">
                    <q-item-section avatar style="min-width:28px">
                      <q-icon name="delete_outline" size="13px" />
                    </q-item-section>
                    <q-item-section style="font-size:13px">Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <div class="row items-center q-mt-md" style="gap:6px">
            <span class="ds-status-badge" :class="project.status === 'active' ? 'active' : 'archived'">
              {{ project.status === 'active' ? 'Activo' : 'Archivado' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="openCreate" persistent>
      <q-card style="width:380px; max-width:95vw">
        <q-card-section style="padding:24px 24px 0">
          <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">
            {{ editing ? 'Editar proyecto' : 'Nuevo proyecto' }}
          </div>
        </q-card-section>

        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <q-input v-model="form.name"        label="Nombre del proyecto" outlined dense />
          <q-input v-model="form.description" label="Descripción"         outlined dense />
          <div class="row items-center q-gutter-sm">
            <q-input v-model="form.color" label="Color" outlined dense class="col">
              <template #append>
                <div
                  :style="{ background: form.color, width:'16px', height:'16px', borderRadius:'4px', cursor:'pointer' }"
                >
                  <q-popup-proxy cover>
                    <q-color v-model="form.color" />
                  </q-popup-proxy>
                </div>
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" v-close-popup @click="resetForm"
            style="color:var(--ds-text-2)" />
          <q-btn color="primary" :label="editing ? 'Guardar' : 'Crear'" size="sm"
            :loading="saving" :disable="saving" @click="handleSubmit"
            style="min-width:80px; height:34px" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useProjectsStore } from 'src/stores/projects'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const router = useRouter()
const store = useProjectsStore()
const { projects, loading } = storeToRefs(store)

const openCreate = ref(false)
const saving     = ref(false)
const editing    = ref(null)
const form       = ref({ name: '', description: '', color: '#F97316' })

onMounted(() => store.fetchAll())

function startEdit(p) {
  editing.value = p
  form.value = { name: p.name, description: p.description, color: p.color }
  openCreate.value = true
}

function resetForm() {
  editing.value = null
  form.value = { name: '', description: '', color: '#F97316' }
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
  } catch (err) {
    const status = err.response?.status
    if (status === 409) {
      $q.notify({ type: 'warning', message: 'Ya tienes un proyecto con ese nombre' })
    } else {
      $q.notify({ type: 'negative', message: 'Error al guardar' })
    }
  } finally {
    saving.value = false
  }
}

function confirmDelete(p) {
  $q.dialog({
    title: 'Eliminar proyecto',
    message: `¿Eliminar "${p.name}"? Esto eliminará todas sus tareas, links, comandos y notas.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await store.remove(p.id)
    $q.notify({ type: 'positive', message: 'Proyecto eliminado' })
  })
}
</script>

<style scoped>
.ds-status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}
.ds-status-badge.active {
  background: rgba(34,197,94,0.12);
  color: #22C55E;
  border: 1px solid rgba(34,197,94,0.20);
}
.ds-status-badge.archived {
  background: var(--ds-bg-hover);
  color: var(--ds-text-3);
  border: 1px solid var(--ds-border);
}
</style>
