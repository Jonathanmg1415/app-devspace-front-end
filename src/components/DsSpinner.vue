<template>
  <span class="ds-gd-wrap" :class="`ds-gd--${size}`" aria-label="Cargando">
    <span class="ds-gd-cube" />
    <span class="ds-gd-shadow" />
  </span>
</template>

<script setup>
defineProps({
  size: { type: String, default: 'md' }, // sm | md | lg
})
</script>

<style scoped>
.ds-gd-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
}

/* sizes */
.ds-gd--sm  { --sz: 14px; }
.ds-gd--md  { --sz: 20px; }
.ds-gd--lg  { --sz: 28px; }

/* ── Cube ── */
.ds-gd-cube {
  display: block;
  width: var(--sz);
  height: var(--sz);
  background: var(--ds-orange);
  border-radius: 3px;
  box-shadow:
    inset -3px -3px 0 rgba(0,0,0,0.22),
    0 0 8px rgba(var(--ds-accent-rgb) / 0.5);
  animation: gd-jump 0.65s cubic-bezier(0.33, 0, 0.66, 1) infinite;
  position: relative;
  transform-origin: center bottom;
}

/* inner diagonal detail like GD */
.ds-gd-cube::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-top: 2px solid rgba(255,255,255,0.35);
  border-left: 2px solid rgba(255,255,255,0.35);
  border-radius: 1px;
}

/* ── Shadow on the floor ── */
.ds-gd-shadow {
  display: block;
  width: var(--sz);
  height: calc(var(--sz) * 0.18);
  background: rgba(var(--ds-accent-rgb) / 0.35);
  border-radius: 50%;
  animation: gd-shadow 0.65s cubic-bezier(0.33, 0, 0.66, 1) infinite;
  margin-top: 2px;
}

@keyframes gd-jump {
  0% {
    transform: translateY(0)       rotate(0deg)   scaleX(1)    scaleY(0.85);
  }
  10% {
    transform: translateY(0)       rotate(0deg)   scaleX(0.85) scaleY(1.15);
  }
  40% {
    transform: translateY(-140%)   rotate(90deg)  scaleX(1)    scaleY(1);
  }
  70% {
    transform: translateY(-140%)   rotate(135deg) scaleX(1)    scaleY(1);
  }
  90% {
    transform: translateY(0)       rotate(180deg) scaleX(1.1)  scaleY(0.85);
  }
  100% {
    transform: translateY(0)       rotate(180deg) scaleX(1)    scaleY(0.85);
  }
}

@keyframes gd-shadow {
  0%, 100% { transform: scaleX(0.85); opacity: 0.6; }
  40%, 70%  { transform: scaleX(0.4);  opacity: 0.15; }
  90%       { transform: scaleX(1.1);  opacity: 0.7; }
}
</style>
