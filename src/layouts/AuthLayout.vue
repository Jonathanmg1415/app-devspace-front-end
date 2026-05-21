<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="auth-bg flex flex-center">
        <div class="auth-grid-lines" />
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
</script>

<style scoped>
.auth-bg {
  background: var(--ds-bg-0);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.auth-grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}
</style>
