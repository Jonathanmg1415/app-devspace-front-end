<template>
  <div class="skeleton-wrap">
    <div v-for="i in count" :key="i" class="skeleton-card">
      <div class="skel-row">
        <div class="skel-block" :style="{ width: widths[i % widths.length] + '%', height: '13px' }" />
        <div class="skel-block" style="width:40px; height:13px; margin-left:auto" />
      </div>
      <div class="skel-block" style="width:85%; height:10px; margin-top:8px" />
      <div class="skel-block" style="width:60%; height:10px; margin-top:5px" />
      <div class="skel-row" style="margin-top:10px">
        <div class="skel-block" style="width:36px; height:18px; border-radius:9px" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 5 } })
const widths = [55, 70, 45, 65, 50]
</script>

<style scoped>
.skeleton-wrap { display: flex; flex-direction: column; gap: 8px; }

.skeleton-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  padding: 12px 14px;
}

.skel-row { display: flex; align-items: center; gap: 8px; }

.skel-block {
  background: var(--ds-bg-2);
  border-radius: 4px;
  animation: skel-pulse 1.4s ease-in-out infinite;
}

@keyframes skel-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
</style>
