<template>
  <div class="ds-empty">
    <div class="ds-empty-icon">
      <q-icon :name="icon" size="26px" style="color:var(--ds-orange)" />
    </div>
    <div class="ds-empty-title">{{ title }}</div>
    <div v-if="subtitle" class="ds-empty-sub">{{ subtitle }}</div>
    <div v-if="$slots.default" class="ds-empty-action">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:     { type: String,  default: 'inbox' },
  title:    { type: String,  required: true },
  subtitle: { type: String,  default: '' },
})
</script>

<style scoped>
.ds-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  text-align: center;
  user-select: none;
}

.ds-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--ds-orange-dim);
  border: 1px solid rgba(249, 115, 22, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 28px rgba(249, 115, 22, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  margin-bottom: 18px;
}

.ds-empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ds-text-1);
  letter-spacing: -0.01em;
  margin-bottom: 6px;
}

.ds-empty-sub {
  font-size: 12px;
  color: var(--ds-text-3);
  line-height: 1.6;
  max-width: 280px;
}

.ds-empty-action {
  margin-top: 20px;
}
</style>
