<template>
  <q-page padding>
    <div class="text-h6 text-weight-bold q-mb-lg">{{ t('nav.search') }}</div>

    <q-input
      v-model="q"
      :placeholder="t('common.search')"
      outlined
      clearable
      autofocus
      @update:model-value="onInput"
    >
      <template #prepend><q-icon name="search" /></template>
    </q-input>

    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner size="40px" color="primary" />
    </div>

    <div v-else-if="q && !results.length" class="text-center text-grey-6 q-py-xl">
      {{ t('common.noResults') }}
    </div>

    <q-list v-else-if="results.length" bordered separator class="q-mt-md rounded-borders">
      <q-item v-for="item in results" :key="`${item._type}-${item.id}`" class="q-py-sm">
        <q-item-section avatar>
          <q-avatar :icon="typeIcon(item._type)" :color="typeColor(item._type)" text-color="white" size="36px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ item.title }}</q-item-label>
          <q-item-label caption>
            <q-badge :color="typeColor(item._type)">{{ item._type }}</q-badge>
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="item._type === 'command'">
          <q-btn flat round dense icon="content_copy" size="sm" @click="copyCmd(item.command)" />
        </q-item-section>
        <q-item-section side v-if="item._type === 'link'">
          <q-btn flat round dense icon="open_in_new" size="sm" :href="item.url" target="_blank" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useSearchStore } from 'src/stores/search'
import { storeToRefs } from 'pinia'

const { t } = useI18n(); const $q = useQuasar()
const store = useSearchStore(); const { results, loading } = storeToRefs(store)

const q = ref('')
let debounce = null

function onInput(val) {
  clearTimeout(debounce)
  if (!val || val.length < 2) { store.clear(); return }
  debounce = setTimeout(() => store.search(val), 350)
}

const typeIcon  = t => ({ task: 'task_alt', link: 'link', command: 'terminal', note: 'description', card: 'view_kanban' }[t] || 'help')
const typeColor = t => ({ task: 'teal', link: 'blue', command: 'purple', note: 'orange', card: 'pink' }[t] || 'grey')

function copyCmd(text) {
  navigator.clipboard.writeText(text)
  $q.notify({ type: 'positive', message: t('common.copied'), timeout: 1000 })
}
</script>
