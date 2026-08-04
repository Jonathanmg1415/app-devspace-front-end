<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="width:min(560px,96vw); max-height:92vh; display:flex; flex-direction:column">
      <q-card-section style="padding:24px 24px 0; flex-shrink:0">
        <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">Crear tareas desde archivo</div>
        <div style="font-size:12.5px; color:var(--ds-text-3); margin-top:2px">
          Subí una imagen o un .docx — la IA propone tareas, vos elegís cuáles crear.
        </div>
      </q-card-section>

      <div style="flex:1; min-height:0; overflow-y:auto">
        <q-card-section style="padding:16px 24px" class="q-gutter-md">
          <!-- Selector de archivo -->
          <q-file
            v-if="!tasks.length"
            v-model="file"
            label="Imagen o documento .docx"
            outlined dense
            accept="image/*,.docx"
            :disable="analyzing"
          >
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>

          <!-- Estado de análisis -->
          <div v-if="analyzing" class="column items-center q-py-lg" style="gap:10px">
            <DsSpinner size="lg" />
            <div style="font-size:13px; color:var(--ds-text-3)">Analizando con IA…</div>
          </div>

          <!-- Sin tareas encontradas -->
          <div v-else-if="analyzed && !tasks.length" class="column items-center q-py-lg" style="gap:6px">
            <q-icon name="search_off" size="32px" style="color:var(--ds-text-3)" />
            <div style="font-size:13px; color:var(--ds-text-3)">No se encontraron tareas en el archivo.</div>
          </div>

          <!-- Lista de tareas propuestas -->
          <div v-else-if="tasks.length" class="column" style="gap:8px">
            <div style="font-size:12.5px; color:var(--ds-text-3)">
              {{ selectedCount }} de {{ tasks.length }} seleccionadas
            </div>
            <div v-for="(t, i) in tasks" :key="i" class="row items-start" style="gap:8px; padding:8px; border:1px solid var(--ds-border); border-radius:8px">
              <q-checkbox v-model="t.selected" dense style="margin-top:6px" />
              <div class="col column" style="gap:6px">
                <q-input v-model="t.title" dense outlined placeholder="Título" />
                <q-select v-model="t.priority" :options="priorityOptions" dense outlined emit-value map-options style="max-width:160px" />
              </div>
            </div>
          </div>
        </q-card-section>
      </div>

      <q-card-actions align="right" style="padding:12px 24px 20px; flex-shrink:0">
        <q-btn flat label="Cancelar" @click="close" :disable="analyzing || creating" />
        <q-btn v-if="!tasks.length" color="primary" label="Analizar" :disable="!file" :loading="analyzing" @click="analyze" />
        <q-btn v-else color="primary" :label="`Crear seleccionadas (${selectedCount})`" :disable="!selectedCount" :loading="creating" @click="createSelected" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import DsSpinner from 'src/components/DsSpinner.vue'
import { useTasksStore } from 'src/stores/tasks'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  projectId:  { type: [String, Number], required: true },
})
const emit = defineEmits(['update:modelValue', 'created'])

const $q    = useQuasar()
const store = useTasksStore()

const file      = ref(null)
const analyzing = ref(false)
const analyzed  = ref(false)
const creating  = ref(false)
const tasks     = ref([])

const priorityOptions = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
]

const selectedCount = computed(() => tasks.value.filter(t => t.selected).length)

async function analyze() {
  if (!file.value) return
  analyzing.value = true
  try {
    const extracted = await store.extractFromFile(file.value, props.projectId)
    tasks.value = extracted.map(t => ({ ...t, selected: true }))
    analyzed.value = true
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo analizar el archivo. Probá de nuevo.' })
  } finally {
    analyzing.value = false
  }
}

async function createSelected() {
  const toCreate = tasks.value.filter(t => t.selected && t.title.trim())
  if (!toCreate.length) return
  creating.value = true
  try {
    for (const t of toCreate) {
      await store.create(props.projectId, { title: t.title.trim(), description: t.description || '', priority: t.priority })
    }
    $q.notify({ type: 'positive', message: `${toCreate.length} tarea${toCreate.length !== 1 ? 's' : ''} creada${toCreate.length !== 1 ? 's' : ''}` })
    emit('created')
    close()
  } catch {
    $q.notify({ type: 'negative', message: 'Algunas tareas no se pudieron crear.' })
  } finally {
    creating.value = false
  }
}

function close() {
  emit('update:modelValue', false)
  file.value = null
  analyzing.value = false
  analyzed.value = false
  tasks.value = []
}
</script>
