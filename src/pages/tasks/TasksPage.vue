<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h6 text-weight-bold col">{{ t('tasks.title') }}</div>
      <q-btn color="primary" icon="add" :label="t('tasks.new')" @click="openForm = true" />
    </div>

    <div class="row q-gutter-md">
      <div v-for="col in columns" :key="col.status" class="col-12 col-md kanban-col">
        <div class="text-subtitle2 text-weight-bold q-mb-sm row items-center">
          <q-badge :color="col.color" class="q-mr-sm" /> {{ col.label }}
          <q-badge class="q-ml-sm" color="grey-4" text-color="grey-8">{{ tasksByStatus(col.status).length }}</q-badge>
        </div>

        <q-card
          v-for="task in tasksByStatus(col.status)"
          :key="task.id"
          class="devspace-card q-mb-sm"
          flat bordered
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-start no-wrap">
              <div class="col">
                <div class="text-body2 text-weight-medium">{{ task.title }}</div>
                <div v-if="task.description" class="text-caption text-grey-6 q-mt-xs">{{ task.description }}</div>
              </div>
              <q-btn flat round dense size="sm" icon="more_vert" @click.stop>
                <q-menu>
                  <q-list style="min-width:120px">
                    <q-item v-for="s in statuses" :key="s.value" clickable v-close-popup
                      @click="changeStatus(task, s.value)">
                      <q-item-section>{{ s.label }}</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="deleteTask(task)">
                      <q-item-section class="text-negative">Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <div class="row items-center q-mt-sm">
              <q-badge :color="priorityColor(task.priority)" class="text-capitalize">{{ task.priority }}</q-badge>
              <q-space />
              <q-chip v-for="tag in task.tags" :key="tag" dense size="sm" color="grey-2" text-color="grey-8">{{ tag }}</q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- New task dialog -->
    <q-dialog v-model="openForm" persistent>
      <q-card style="min-width: 340px">
        <q-card-section><div class="text-h6">{{ t('tasks.new') }}</div></q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.title"       label="Título"      outlined dense />
          <q-input v-model="form.description" label="Descripción" outlined dense />
          <q-select v-model="form.status"   :options="statuses"   label="Estado"    outlined dense emit-value map-options />
          <q-select v-model="form.priority" :options="priorities" label="Prioridad" outlined dense emit-value map-options />
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
import { useTasksStore } from 'src/stores/tasks'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const store = useTasksStore()
const { items: tasks } = storeToRefs(store)

const projectId = computed(() => route.params.id)
const openForm = ref(false)
const saving   = ref(false)
const form     = ref({ title: '', description: '', status: 'todo', priority: 'medium' })

const columns = [
  { status: 'todo',        label: t('tasks.todo'),        color: 'grey' },
  { status: 'in_progress', label: t('tasks.in_progress'), color: 'blue' },
  { status: 'done',        label: t('tasks.done'),        color: 'positive' },
]
const statuses   = columns.map(c => ({ label: c.label, value: c.status }))
const priorities = [
  { label: t('tasks.priority.low'),    value: 'low' },
  { label: t('tasks.priority.medium'), value: 'medium' },
  { label: t('tasks.priority.high'),   value: 'high' },
]

const priorityColor = p => ({ low: 'grey', medium: 'orange', high: 'red' }[p] || 'grey')
const tasksByStatus  = s => tasks.value.filter(t => t.status === s)

onMounted(() => store.fetchAll(projectId.value))

async function handleCreate() {
  if (!form.value.title) return
  saving.value = true
  try {
    await store.create(projectId.value, form.value)
    openForm.value = false
    form.value = { title: '', description: '', status: 'todo', priority: 'medium' }
    $q.notify({ type: 'positive', message: 'Tarea creada' })
  } finally { saving.value = false }
}

async function changeStatus(task, status) {
  await store.update(task.id, { status })
}

async function deleteTask(task) {
  $q.dialog({ title: 'Eliminar tarea', message: `¿Eliminar "${task.title}"?`, cancel: true })
    .onOk(() => store.remove(task.id))
}
</script>

<style scoped>
.kanban-col { min-width: 260px; }
</style>
