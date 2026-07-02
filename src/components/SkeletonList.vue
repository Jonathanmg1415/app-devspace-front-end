<template>
  <div class="ds-skel">

    <!-- list: links, actividad -->
    <template v-if="variant === 'list'">
      <div v-for="i in count" :key="i" class="skel-list-item">
        <div class="skel-circle" style="width:32px;height:32px;flex-shrink:0" />
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="skel-line" :style="{ width: w(i, 45, 72) }" />
          <div class="skel-line skel-sm" :style="{ width: w(i, 28, 50) }" />
        </div>
        <div class="skel-pill" style="width:36px" />
      </div>
    </template>

    <!-- grid: notas -->
    <template v-else-if="variant === 'grid'">
      <div class="skel-grid">
        <div v-for="i in count" :key="i" class="skel-grid-card">
          <div class="skel-line" :style="{ width: w(i, 50, 80) }" style="margin-bottom:8px" />
          <div class="skel-pill" style="width:54px;margin-bottom:14px" />
          <div class="skel-line skel-sm" style="width:100%" />
          <div class="skel-line skel-sm" :style="{ width: w(i, 65, 92) }" />
          <div class="skel-line skel-sm" :style="{ width: w(i, 40, 70) }" />
        </div>
      </div>
    </template>

    <!-- kanban: tareas -->
    <template v-else-if="variant === 'kanban'">
      <div class="skel-kanban">
        <div v-for="(col, ci) in kanbanCols" :key="ci" class="skel-kanban-col">
          <div class="skel-kanban-header">
            <span class="skel-status-dot" :style="{ background: col.dot }" />
            <div class="skel-line" style="width:68px" />
            <div class="skel-pill" style="width:22px;margin-left:auto" />
          </div>
          <div v-for="j in col.cards" :key="j" class="skel-kanban-card">
            <div class="skel-line" :style="{ width: w(j + ci * 3, 44, 82) }" />
            <div class="skel-line skel-sm" :style="{ width: w(j + 1, 52, 76) }" style="margin-top:6px" />
            <div style="display:flex;gap:6px;margin-top:10px;align-items:center">
              <div class="skel-pill" style="width:46px" />
              <div style="margin-left:auto"><div class="skel-circle" style="width:18px;height:18px" /></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- dashboard (ProjectDetailPage) -->
    <template v-else-if="variant === 'dashboard'">
      <!-- donut + stats row -->
      <div style="display:flex; gap:12px; flex-wrap:wrap">
        <!-- donut placeholder -->
        <div class="skel-dashboard-donut">
          <div class="skel-line" style="width:70px; margin-bottom:16px" />
          <div class="skel-circle" style="width:110px; height:110px; margin:0 auto; border-radius:50%" />
        </div>
        <!-- stat cards -->
        <div class="skel-stat-grid">
          <div v-for="i in 6" :key="i" class="skel-stat-card">
            <div class="skel-circle" style="width:34px; height:34px; flex-shrink:0; border-radius:8px" />
            <div style="flex:1; display:flex; flex-direction:column; gap:6px">
              <div class="skel-line" :style="{ width: w(i, 28, 48) }" />
              <div class="skel-line skel-sm" :style="{ width: w(i+2, 38, 58) }" />
            </div>
          </div>
        </div>
      </div>
      <!-- activity placeholder -->
      <div class="skel-activity-card" style="margin-top:12px">
        <div class="skel-line" style="width:110px; margin-bottom:14px" />
        <div v-for="i in 4" :key="i" class="skel-activity-row">
          <div class="skel-circle" style="width:24px; height:24px; flex-shrink:0" />
          <div style="flex:1; display:flex; flex-direction:column; gap:5px">
            <div class="skel-line" :style="{ width: w(i, 44, 72) }" />
          </div>
          <div class="skel-pill" style="width:32px" />
        </div>
      </div>
    </template>

    <!-- command -->
    <template v-else-if="variant === 'command'">
      <div class="skel-cmd-grid">
        <div v-for="i in count" :key="i" class="skel-cmd-card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
            <div class="skel-line" :style="{ width: w(i, 32, 58) }" />
            <div class="skel-pill" style="width:50px;margin-left:auto" />
          </div>
          <div class="skel-line skel-sm" style="width:78%;margin-bottom:12px" />
          <div class="skel-snippet" />
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
defineProps({
  count:   { type: Number, default: 4 },
  variant: { type: String, default: 'list' },
})

const kanbanCols = [
  { dot: '#64748B', cards: 2 },
  { dot: '#F97316', cards: 3 },
  { dot: '#22C55E', cards: 2 },
]

const offsets = [0, 0.3, 0.65, 0.1, 0.55, 0.42, 0.8, 0.18]
function w(i, min, max) {
  return Math.round(min + offsets[i % offsets.length] * (max - min)) + '%'
}
</script>

<style scoped>
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ── Shimmer elements ── */
.skel-line,
.skel-pill,
.skel-circle,
.skel-snippet {
  position: relative;
  overflow: hidden;
  background: var(--ds-bg-2);
  border-radius: 4px;
}
.skel-line::after,
.skel-pill::after,
.skel-circle::after,
.skel-snippet::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 50%,
    transparent 100%
  );
  animation: shimmer 1.85s ease-in-out infinite;
}

.skel-line  { height: 13px; }
.skel-sm    { height: 10px; margin-top: 5px; }
.skel-pill  { height: 18px; border-radius: 9px; }
.skel-circle{ border-radius: 50%; }
.skel-snippet {
  height: 38px;
  border-radius: var(--ds-radius-sm);
  background: var(--ds-bg-0);
  border: 1px solid var(--ds-border);
}

/* ── list ── */
.skel-list-item {
  display: flex; align-items: center; gap: 12px;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 12px 14px;
  margin-bottom: 6px;
}

/* ── grid (notas) ── */
.skel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.skel-grid-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 14px 16px;
}

/* ── kanban ── */
.skel-kanban {
  display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px;
}
.skel-kanban-col {
  min-width: 276px; flex-shrink: 0;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 12px;
}
.skel-kanban-header {
  display: flex; align-items: center; gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ds-border);
  margin-bottom: 10px;
}
.skel-status-dot {
  width: 8px; height: 8px;
  border-radius: 50%; flex-shrink: 0;
}
.skel-kanban-card {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  padding: 10px 12px;
  margin-bottom: 6px;
}
.skel-kanban-card:last-child { margin-bottom: 0; }

/* ── dashboard ── */
.skel-dashboard-donut {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 16px;
  flex-shrink: 0;
  min-width: 160px;
}
.skel-stat-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 599px) {
  .skel-stat-grid { grid-template-columns: repeat(2, 1fr); }
  .skel-dashboard-donut { min-width: 100%; }
}
.skel-stat-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.skel-activity-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 16px;
}
.skel-activity-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--ds-border);
}
.skel-activity-row:last-child { border-bottom: none; }

/* ── command ── */
.skel-cmd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.skel-cmd-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  padding: 16px;
  position: relative; overflow: hidden;
}
.skel-cmd-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--ds-bg-2) 0%, transparent 100%);
}
</style>
