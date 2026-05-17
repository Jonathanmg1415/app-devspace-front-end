<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" @click="router.push('/projects')" />
      <div class="text-h5 text-weight-bold q-ml-sm">{{ project?.name }}</div>
    </div>
    <div class="text-grey-6 q-mb-lg">{{ project?.description }}</div>

    <div class="row q-gutter-sm">
      <q-btn v-for="item in nav" :key="item.path"
        :to="item.to" outline color="primary" :icon="item.icon" :label="item.label" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from 'src/stores/projects'
import { storeToRefs } from 'pinia'

const route  = useRoute()
const router = useRouter()
const store  = useProjectsStore()
const { projects } = storeToRefs(store)

const project = computed(() => projects.value.find(p => p.id == route.params.id))

const nav = computed(() => {
  const id = route.params.id
  return [
    { label: 'Tareas',    icon: 'task_alt',   to: `/projects/${id}/tasks` },
    { label: 'Enlaces',   icon: 'link',        to: `/projects/${id}/links` },
    { label: 'Comandos',  icon: 'terminal',    to: `/projects/${id}/commands` },
    { label: 'Notas',     icon: 'description', to: `/projects/${id}/notes` },
    { label: 'Cards',     icon: 'view_kanban', to: `/projects/${id}/cards` },
  ]
})

onMounted(async () => {
  if (!projects.value.length) await store.fetchAll()
})
</script>
