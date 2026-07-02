<template>
  <div class="donut-wrap">
    <svg :width="size" :height="size" viewBox="0 0 42 42">
      <!-- Track -->
      <circle cx="21" cy="21" r="15.9" fill="none"
        stroke="var(--ds-bg-2)" :stroke-width="strokeW" />
      <!-- Segments -->
      <circle v-for="(seg, i) in segments" :key="i"
        cx="21" cy="21" r="15.9" fill="none"
        :stroke="seg.color"
        :stroke-width="strokeW"
        :stroke-dasharray="`${seg.dash} ${100 - seg.dash}`"
        :stroke-dashoffset="seg.offset"
        stroke-linecap="butt"
        style="transition: stroke-dasharray 400ms ease" />
      <!-- Center label -->
      <text x="21" y="21" text-anchor="middle" dominant-baseline="middle"
        :font-size="centerFontSize" font-weight="600" fill="var(--ds-text-1)">
        {{ centerLabel }}
      </text>
      <text x="21" y="26.5" text-anchor="middle"
        font-size="3.5" fill="var(--ds-text-3)">
        {{ centerSub }}
      </text>
    </svg>
    <!-- Legend -->
    <div v-if="legend" class="donut-legend">
      <div v-for="(seg, i) in segments" :key="i" class="legend-item">
        <span class="legend-dot" :style="{ background: seg.color }" />
        <span class="legend-label">{{ seg.label }}</span>
        <span class="legend-val">{{ seg.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  segments:      { type: Array,  default: () => [] }, // [{ label, value, color }]
  size:          { type: Number, default: 100 },
  strokeW:       { type: Number, default: 5 },
  centerLabel:   { type: String, default: '' },
  centerSub:     { type: String, default: '' },
  centerFontSize:{ type: Number, default: 8 },
  legend:        { type: Boolean, default: true },
})

const enriched = computed(() => {
  const total = props.segments.reduce((s, i) => s + i.value, 0) || 1
  let offset = 25 // start at top (12 o'clock)
  return props.segments.map(seg => {
    const dash = (seg.value / total) * 100
    const item = { ...seg, dash, offset: 100 - offset + 25 }
    offset += dash
    return item
  })
})

const segments = computed(() => enriched.value)
</script>

<style scoped>
.donut-wrap { display: flex; align-items: center; gap: 16px; }
.donut-legend { display: flex; flex-direction: column; gap: 6px; }
.legend-item  { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.legend-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-label { color: var(--ds-text-2); flex: 1; }
.legend-val   { color: var(--ds-text-1); font-weight: 600; min-width: 20px; text-align: right; }
</style>
