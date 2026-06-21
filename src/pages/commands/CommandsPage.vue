<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Comandos</div>
        <div style="font-size: 12px; color: var(--ds-text-3); margin-top: 2px">
          {{ items.length }} snippet{{ items.length !== 1 ? "s" : "" }}
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo comando"
        size="sm"
        style="height: 34px"
        @click="openNew"
      />
    </div>

    <div class="row q-gutter-md">
      <div
        v-for="cmd in items"
        :key="cmd.id"
        class="command-card col-12 col-md-5"
      >
        <div style="padding: 16px">
          <div class="row items-start no-wrap q-mb-xs">
            <div class="col">
              <div class="row items-center" style="gap:6px; margin-bottom:2px">
                <div style="font-size: 13px; font-weight: 600; color: var(--ds-text-1)">
                  {{ cmd.title }}
                </div>
                <span v-if="cmd.area" class="area-badge">{{ cmd.area }}</span>
              </div>
              <div
                v-if="cmd.description"
                style="font-size: 11px; color: var(--ds-text-2); margin-top: 2px"
              >
                {{ cmd.description }}
              </div>
            </div>
            <q-btn
              flat round dense size="xs"
              icon="edit_outlined"
              style="color: var(--ds-text-3)"
              @click="startEdit(cmd)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat round dense size="xs"
              icon="delete_outline"
              style="color: var(--ds-text-3)"
              @click="confirmDelete(cmd)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>

          <div
            class="command-snippet q-mt-sm"
            @click="copyCmd(cmd.command)"
            style="cursor: pointer"
          >
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
              {{ cmd.command }}
            </span>
            <q-btn
              flat round dense size="xs"
              icon="content_copy"
              style="color: var(--ds-text-3); flex-shrink: 0; margin: -4px"
              @click.stop="copyCmd(cmd.command)"
            >
              <q-tooltip>Copiar</q-tooltip>
            </q-btn>
          </div>

          <div
            v-if="cmd.tags?.length"
            class="row q-mt-sm"
            style="gap: 4px; flex-wrap: wrap"
          >
            <span v-for="tag in cmd.tags" :key="tag" class="ds-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <SkeletonList v-if="loading" :count="4" />

    <div v-else-if="!items.length" class="flex flex-center column q-py-xl" style="color:var(--ds-text-3)">
      <q-icon name="terminal" size="48px" style="opacity:0.25" />
      <p style="font-size:14px; margin-top:12px; font-weight:500">Sin comandos guardados</p>
      <p style="font-size:12px; margin-top:4px">Guarda tus snippets y comandos frecuentes aquí</p>
    </div>

    <div v-if="hasMore && !loading" class="flex flex-center q-mt-md">
      <q-btn flat size="sm" label="Cargar más" icon="expand_more"
        style="color:var(--ds-text-2)" :loading="loadingMore" @click="store.loadMore()" />
    </div>

    <!-- Dialog crear / editar -->
    <q-dialog v-model="openForm" persistent>
      <q-card style="width: min(440px, 96vw)">
        <q-card-section style="padding: 24px 24px 0">
          <div style="font-size: 15px; font-weight: 600; color: var(--ds-text-1)">
            {{ editing ? 'Editar comando' : 'Nuevo comando' }}
          </div>
        </q-card-section>

        <q-card-section style="padding: 16px 24px" class="q-gutter-sm">
          <q-input v-model="form.title" label="Título" outlined dense />

          <q-input v-model="form.area" label="Área / Aplicativo" outlined dense
            placeholder="ej: Backend, Frontend, Base de datos, Docker..." />

          <q-input
            v-model="form.command"
            label="Comando"
            outlined
            dense
            style="font-family: 'JetBrains Mono', monospace"
          />

          <div>
            <q-input
              v-model="form.description"
              label="Descripción"
              outlined
              type="textarea"
              rows="3"
            />
            <div class="row justify-end q-mt-xs">
              <q-btn
                flat dense size="sm"
                @click="generateDescription"
                :loading="generatingDesc"
                :disable="!form.command"
                style="color: var(--ds-orange); font-size: 12px; gap: 4px"
              >
                <q-icon name="auto_awesome" size="14px" />
                Generar con IA
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" style="padding: 0 24px 20px; gap: 8px">
          <q-btn
            flat label="Cancelar" size="sm"
            v-close-popup @click="resetForm"
            style="color: var(--ds-text-2)"
          />
          <q-btn
            color="primary"
            :label="editing ? 'Guardar' : 'Crear'"
            size="sm"
            :loading="saving"
            style="min-width: 72px; height: 34px"
            @click="handleSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useCommandsStore } from "src/stores/commands";
import SkeletonList from "src/components/SkeletonList.vue";
import { storeToRefs } from "pinia";
import { decodeId } from "src/utils/routeId";

const $q = useQuasar();
const route = useRoute();
const store = useCommandsStore();
const { items, loading, loadingMore, hasMore } = storeToRefs(store);

const projectId = computed(() => decodeId(route.params.id));
const openForm = ref(false);
const saving = ref(false);
const generatingDesc = ref(false);
const editing = ref(null);
const form = ref({ title: "", command: "", description: "", area: "" });

onMounted(() => store.fetchAll(projectId.value));

function openNew() {
  resetForm();
  openForm.value = true;
}

function startEdit(cmd) {
  editing.value = cmd;
  form.value = { title: cmd.title, command: cmd.command, description: cmd.description || "", area: cmd.area || "" };
  openForm.value = true;
}

function resetForm() {
  editing.value = null;
  form.value = { title: "", command: "", description: "", area: "" };
}

async function generateDescription() {
  if (!form.value.command) return;
  generatingDesc.value = true;
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 120,
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente técnico. Describe en español, en máximo 2 oraciones concisas, qué hace el siguiente comando de terminal. Sin formato markdown, solo texto plano.",
            },
            { role: "user", content: form.value.command },
          ],
        }),
      }
    );
    const data = await response.json();
    const desc = data.choices?.[0]?.message?.content?.trim();
    if (desc) {
      form.value.description = desc;
    } else {
      $q.notify({ type: "warning", message: "No se pudo generar la descripción" });
    }
  } catch {
    $q.notify({ type: "negative", message: "Error al conectar con la IA" });
  } finally {
    generatingDesc.value = false;
  }
}

async function handleSubmit() {
  if (!form.value.title || !form.value.command) {
    $q.notify({ type: "warning", message: "Título y comando son requeridos" });
    return;
  }
  saving.value = true;
  try {
    if (editing.value) {
      await store.update(editing.value.id, form.value);
      $q.notify({ type: "positive", message: "Comando actualizado" });
    } else {
      await store.create(projectId.value, form.value);
      $q.notify({ type: "positive", message: "Comando creado" });
    }
    openForm.value = false;
    resetForm();
  } finally {
    saving.value = false;
  }
}

function copyCmd(text) {
  navigator.clipboard.writeText(text);
  $q.notify({
    message: "Copiado",
    timeout: 800,
    color: "grey-9",
    textColor: "white",
    position: "bottom",
  });
}

function confirmDelete(cmd) {
  $q.dialog({
    title: "Eliminar comando",
    message: `¿Eliminar "${cmd.title}"?`,
    cancel: true,
  }).onOk(() => store.remove(cmd.id));
}
</script>

<style scoped>
.ds-tag {
  font-size: 10px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--ds-orange-dim);
  border: 1px solid rgba(249, 115, 22, 0.2);
  color: var(--ds-orange);
}
.area-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 3px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: #38BDF8;
  letter-spacing: 0.02em;
}
</style>
