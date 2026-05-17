<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h6 text-weight-bold col">{{ t('notes.title') }}</div>
      <q-btn color="primary" icon="add" :label="t('notes.new')" @click="openNew" />
    </div>

    <div class="row q-gutter-md">
      <q-card v-for="note in items" :key="note.id" class="devspace-card col-12 col-md-5" flat bordered>
        <q-card-section>
          <div class="row items-center q-mb-xs">
            <div class="text-weight-bold col">{{ note.title }}</div>
            <q-chip dense size="sm" color="secondary" text-color="white">{{ note.section }}</q-chip>
          </div>
          <div class="text-body2 text-grey-7" style="white-space: pre-wrap">{{ note.content }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat dense size="sm" icon="edit" @click="startEdit(note)" />
          <q-btn flat dense size="sm" icon="delete" color="negative" @click="confirmDelete(note)" />
        </q-card-actions>
      </q-card>
    </div>

    <q-dialog v-model="openForm" persistent>
      <q-card style="min-width: 380px">
        <q-card-section><div class="text-h6">{{ editing ? 'Editar nota' : t('notes.new') }}</div></q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.title"   label="Título"  outlined dense />
          <q-input v-model="form.section" :label="t('notes.section')" outlined dense />
          <q-input v-model="form.content" label="Contenido" outlined type="textarea" rows="5" />
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useNotesStore } from 'src/stores/notes'
import { storeToRefs } from 'pinia'

const { t } = useI18n(); const $q = useQuasar(); const route = useRoute()
const store = useNotesStore(); const { items } = storeToRefs(store)
const projectId = computed(() => route.params.id)
const openForm = ref(false); const saving = ref(false); const editing = ref(null)
const form = ref({ title: '', section: 'General', content: '' })

onMounted(() => store.fetchAll(projectId.value))

function openNew() { resetForm(); openForm.value = true }
function startEdit(n) { editing.value = n; form.value = { title: n.title, section: n.section, content: n.content }; openForm.value = true }
function resetForm() { editing.value = null; form.value = { title: '', section: 'General', content: '' } }

async function handleSubmit() {
  saving.value = true
  try {
    if (editing.value) { await store.update(editing.value.id, form.value); $q.notify({ type: 'positive', message: 'Nota actualizada' }) }
    else { await store.create(projectId.value, form.value); $q.notify({ type: 'positive', message: 'Nota creada' }) }
    openForm.value = false; resetForm()
  } finally { saving.value = false }
}
function confirmDelete(n) {
  $q.dialog({ title: 'Eliminar nota', message: `¿Eliminar "${n.title}"?`, cancel: true }).onOk(() => store.remove(n.id))
}
</script>
