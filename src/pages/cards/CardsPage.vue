<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h6 text-weight-bold col">{{ t("cards.title") }}</div>
      <q-btn
        color="primary"
        icon="add"
        :label="t('cards.new')"
        @click="openNew"
      />
    </div>

    <div class="row q-gutter-md">
      <div
        v-for="card in items"
        :key="card.id"
        class="col-12 col-sm-5 col-md-3"
      >
        <div
          class="devspace-card"
          style="overflow: hidden; cursor: default"
          :style="{ borderTop: `3px solid ${card.color || '#F97316'}` }"
        >
          <q-card
            flat
            style="background: transparent; box-shadow: none; border: none"
          >
            <q-card-section>
              <div v-if="editingId !== card.id">
                <div class="row items-center q-mb-xs" style="gap: 8px">
                  <span
                    :style="{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: card.color || '#F97316',
                      flexShrink: 0,
                      display: 'inline-block',
                    }"
                  />
                  <div class="text-weight-bold">{{ card.title }}</div>
                </div>
                <div
                  class="text-body2 text-grey-7"
                  style="white-space: pre-wrap"
                >
                  {{ card.content }}
                </div>
              </div>
              <div v-else class="q-gutter-sm">
                <q-input
                  v-model="editForm.title"
                  dense
                  outlined
                  label="Título"
                />
                <q-input
                  v-model="editForm.content"
                  dense
                  outlined
                  label="Contenido"
                  type="textarea"
                  rows="3"
                />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <template v-if="editingId !== card.id">
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="edit"
                  @click="startInlineEdit(card)"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="confirmDelete(card)"
                />
              </template>
              <template v-else>
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Cancelar"
                  @click="editingId = null"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="primary"
                  label="Guardar"
                  :loading="saving"
                  @click="saveEdit(card)"
                />
              </template>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <q-dialog v-model="openForm" persistent>
      <q-card style="min-width: 340px">
        <q-card-section
          ><div class="text-h6">{{ t("cards.new") }}</div></q-card-section
        >
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.title" label="Título" outlined dense />
          <q-input
            v-model="form.content"
            label="Contenido"
            outlined
            type="textarea"
            rows="3"
          />
          <div class="row items-center q-gutter-sm">
            <span class="text-caption">Color:</span>
            <q-icon name="circle" :style="{ color: form.color }" size="24px">
              <q-popup-proxy cover
                ><q-color v-model="form.color"
              /></q-popup-proxy>
            </q-icon>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Crear"
            :loading="saving"
            @click="handleCreate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useCardsStore } from "src/stores/cards";
import { storeToRefs } from "pinia";
import { decodeId } from "src/utils/routeId";

const { t } = useI18n();
const $q = useQuasar();
const route = useRoute();
const store = useCardsStore();
const { items } = storeToRefs(store);
const projectId = computed(() => decodeId(route.params.id));
const openForm = ref(false);
const saving = ref(false);
const editingId = ref(null);
const editForm = ref({ title: "", content: "" });
const form = ref({ title: "", content: "", color: "#467886" });

onMounted(() => store.fetchAll(projectId.value));

function openNew() {
  form.value = { title: "", content: "", color: "#467886" };
  openForm.value = true;
}
function startInlineEdit(c) {
  editingId.value = c.id;
  editForm.value = { title: c.title, content: c.content };
}

async function handleCreate() {
  saving.value = true;
  try {
    await store.create(projectId.value, form.value);
    openForm.value = false;
    $q.notify({ type: "positive", message: "Card creada" });
  } finally {
    saving.value = false;
  }
}

async function saveEdit(card) {
  saving.value = true;
  try {
    await store.update(card.id, editForm.value);
    editingId.value = null;
  } finally {
    saving.value = false;
  }
}

function confirmDelete(c) {
  $q.dialog({
    title: "Eliminar card",
    message: `¿Eliminar "${c.title}"?`,
    cancel: true,
  }).onOk(() => store.remove(c.id));
}
</script>
