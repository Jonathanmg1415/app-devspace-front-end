<template>
  <q-page padding>
    <div class="ds-page-title q-mb-lg">Búsqueda global</div>

    <div class="search-bar row items-center q-mb-lg">
      <q-icon name="search" size="18px" style="color:var(--ds-text-3); margin-right:10px; flex-shrink:0" />
      <input
        v-model="q"
        placeholder="Buscar tareas, links, comandos, notas..."
        class="search-input"
        autofocus
        @input="onInput"
      />
      <q-icon v-if="q" name="close" size="16px"
        style="color:var(--ds-text-3); cursor:pointer; flex-shrink:0"
        @click="q = ''; store.clear()" />
    </div>

    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner size="28px" color="primary" />
    </div>

    <div v-else-if="q && !results.length" class="flex flex-center column q-py-xl"
      style="color:var(--ds-text-3)">
      <q-icon name="search_off" size="40px" style="opacity:0.3" />
      <p class="q-mt-sm" style="font-size:13px">Sin resultados para "{{ q }}"</p>
    </div>

    <div v-else-if="results.length" class="search-results">
      <div v-for="item in results" :key="`${item._type}-${item.id}`"
        class="search-result-item" @click="handleResultClick(item)">

        <div class="result-type-icon" :style="{ background: typeColor(item._type) + '18', color: typeColor(item._type) }">
          <q-icon :name="typeIcon(item._type)" size="14px" />
        </div>

        <div class="col" style="overflow:hidden">
          <div style="font-size:13px; font-weight:500; color:var(--ds-text-1)">{{ item.title }}</div>
          <div style="font-size:11px; color:var(--ds-text-3); margin-top:1px">
            <span class="result-type-label" :style="{ color: typeColor(item._type) }">{{ typeLabel(item._type) }}</span>
            <span v-if="item._type === 'link'" style="margin-left:8px">{{ item.url }}</span>
            <span v-if="item._type === 'command'" style="font-family:'JetBrains Mono',monospace; margin-left:8px; font-size:10px">{{ item.command }}</span>
          </div>
        </div>

        <div class="row items-center" style="gap:4px; flex-shrink:0">
          <q-btn v-if="item._type === 'command'" flat round dense size="xs"
            icon="content_copy" style="color:var(--ds-text-3)"
            @click.stop="copyCmd(item.command)">
            <q-tooltip>Copiar</q-tooltip>
          </q-btn>
          <q-btn v-if="item._type === 'link'" flat round dense size="xs"
            icon="open_in_new" style="color:var(--ds-text-3)"
            :href="item.url" target="_blank" @click.stop />
        </div>
      </div>
    </div>

    <div v-else-if="!q" class="flex flex-center column q-py-xl" style="color:var(--ds-text-3)">
      <q-icon name="manage_search" size="48px" style="opacity:0.2" />
      <p class="q-mt-md" style="font-size:13px">Escribe para buscar en todos tus proyectos</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useSearchStore } from 'src/stores/search'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const store = useSearchStore()
const { results, loading } = storeToRefs(store)

const q = ref('')
let debounce = null

function onInput() {
  clearTimeout(debounce)
  if (!q.value || q.value.length < 2) { store.clear(); return }
  debounce = setTimeout(() => store.search(q.value), 300)
}

const typeIcon  = t => ({ task:'task_alt', link:'link', command:'terminal', note:'description', card:'view_kanban' }[t] || 'help')
const typeColor = t => ({ task:'#22C55E', link:'#38BDF8', command:'#F97316', note:'#A78BFA', card:'#F472B6' }[t] || '#6B7280')
const typeLabel = t => ({ task:'Tarea', link:'Link', command:'Comando', note:'Nota', card:'Card' }[t] || t)

function copyCmd(text) {
  navigator.clipboard.writeText(text)
  $q.notify({ message: 'Copiado', timeout: 800, color: 'grey-9', textColor: 'white', position: 'bottom' })
}

function handleResultClick(item) {
  if (item._type === 'link') window.open(item.url, '_blank')
  if (item._type === 'command') copyCmd(item.command)
}
</script>

<style scoped>
.search-bar {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border-md);
  border-radius: 10px;
  padding: 10px 14px;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.search-bar:focus-within {
  border-color: var(--ds-orange);
  box-shadow: 0 0 0 2px var(--ds-orange-dim);
}
.search-input {
  background: none;
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--ds-text-1);
}
.search-input::placeholder { color: var(--ds-text-3); }

.search-results {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.search-result-item:hover {
  border-color: var(--ds-border-md);
  background: var(--ds-bg-2);
}
.result-type-icon {
  width: 28px; height: 28px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.result-type-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
