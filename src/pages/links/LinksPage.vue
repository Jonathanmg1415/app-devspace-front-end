<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Links</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ items.length }} enlace{{ items.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <q-btn color="primary" icon="add" label="Nuevo link" size="sm"
        style="height:34px" @click="openForm = true" />
    </div>

    <div v-if="!items.length && !loading"
      class="flex flex-center column q-py-xl" style="color:var(--ds-text-3)">
      <q-icon name="link" size="48px" style="opacity:0.3" />
      <p class="q-mt-md" style="font-size:14px">No hay links aún</p>
    </div>

    <div class="row q-gutter-sm">
      <div v-for="link in items" :key="link.id"
        class="link-card col-12 col-md-5"
        @click="openLink(link.url)">

        <div class="row items-center no-wrap" style="gap:12px">
          <div class="link-favicon">
            <img :src="`https://www.google.com/s2/favicons?domain=${getDomain(link.url)}&sz=32`"
              style="width:16px; height:16px" @error="e => e.target.style.display='none'" />
            <q-icon v-show="false" name="link" size="16px" style="color:var(--ds-text-3)" />
          </div>

          <div class="col" style="overflow:hidden">
            <div style="font-size:13px; font-weight:500; color:var(--ds-text-1)">{{ link.title }}</div>
            <div style="font-size:11px; color:var(--ds-text-3); overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
              {{ link.url }}
            </div>
          </div>

          <div class="row items-center" style="gap:4px; flex-shrink:0" @click.stop>
            <span v-if="link.label" class="ds-tag">{{ link.label }}</span>
            <q-btn flat round dense size="xs" icon="open_in_new"
              style="color:var(--ds-text-3)"
              :href="link.url" target="_blank" @click.stop />
            <q-btn flat round dense size="xs" icon="delete_outline"
              style="color:var(--ds-text-3)"
              @click.stop="confirmDelete(link)" />
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="openForm" persistent>
      <q-card style="width:380px; max-width:95vw">
        <q-card-section style="padding:24px 24px 0">
          <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">Nuevo link</div>
        </q-card-section>
        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <q-input v-model="form.title" label="Título" outlined dense />
          <q-input v-model="form.url"   label="URL"    outlined dense placeholder="https://" />
          <q-input v-model="form.label" label="Etiqueta (opcional)" outlined dense />
        </q-card-section>
        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" v-close-popup style="color:var(--ds-text-2)" />
          <q-btn color="primary" label="Crear" size="sm" :loading="saving"
            style="min-width:72px; height:34px" @click="handleCreate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useLinksStore } from 'src/stores/links'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const route = useRoute()
const store = useLinksStore()
const { items, loading } = storeToRefs(store)

const projectId = computed(() => route.params.id)
const openForm  = ref(false)
const saving    = ref(false)
const form      = ref({ title: '', url: '', label: '' })

onMounted(() => store.fetchAll(projectId.value))

function getDomain(url) {
  try { return new URL(url).hostname } catch { return '' }
}

function openLink(url) { window.open(url, '_blank') }

async function handleCreate() {
  saving.value = true
  try {
    await store.create(projectId.value, form.value)
    openForm.value = false
    form.value = { title: '', url: '', label: '' }
    $q.notify({ type: 'positive', message: 'Link creado' })
  } finally { saving.value = false }
}

function confirmDelete(link) {
  $q.dialog({ title: 'Eliminar link', message: `¿Eliminar "${link.title}"?`, cancel: true })
    .onOk(() => store.remove(link.id))
}
</script>

<style scoped>
.link-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.link-card:hover {
  border-color: var(--ds-border-md);
  background: var(--ds-bg-2);
}
.link-favicon {
  width: 28px; height: 28px;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ds-tag {
  font-size: 10px; font-weight: 500;
  padding: 1px 6px; border-radius: 3px;
  background: var(--ds-orange-dim);
  border: 1px solid rgba(249,115,22,0.20);
  color: var(--ds-orange);
}
</style>
