<template>
  <q-page class="flex flex-center">
    <div class="notfound-wrap">
      <div class="notfound-code">404</div>
      <div class="notfound-title">Página no encontrada</div>
      <div class="notfound-sub">La ruta que buscas no existe o fue movida.</div>
      <q-btn color="primary" label="Ir a proyectos" icon="grid_view"
        style="margin-top:28px; height:38px"
        @click="$router.push('/projects')" />
    </div>
  </q-page>
</template>

<script setup></script>

<style scoped>
.notfound-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px;
}
.notfound-code {
  font-size: 80px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--ds-orange);
  line-height: 1;
  opacity: 0.8;
}
.notfound-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ds-text-1);
  margin-top: 12px;
  letter-spacing: -0.02em;
}
.notfound-sub {
  font-size: 13px;
  color: var(--ds-text-3);
  margin-top: 6px;
}
</style>
