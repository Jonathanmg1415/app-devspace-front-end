<template>
  <Teleport to="body">
    <Transition name="ds-ol">
      <div v-if="loaderVisible" class="ds-ol-backdrop">
        <div class="ds-ol-stage">
          <div class="ds-ol-cube"></div>
          <div class="ds-ol-shadow"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { loaderVisible } from 'src/composables/loader'
</script>

<!-- NO scoped — usamos prefijo ds-ol- para evitar colisiones -->
<style>
/* ── Overlay backdrop ── */
.ds-ol-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px) saturate(1.3);
  -webkit-backdrop-filter: blur(10px) saturate(1.3);
  background: rgba(9, 9, 12, 0.70);
}

/* ── Stage: glow via filter (GPU) en vez de box-shadow en el cubo ── */
.ds-ol-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* drop-shadow en el padre = GPU composited, no repaint */
  filter:
    drop-shadow(0 0 18px rgba(var(--ds-accent-rgb, 249 115 22) / 0.75))
    drop-shadow(0 0 48px rgba(var(--ds-accent-rgb, 249 115 22) / 0.3));
}

/* ── Cubo: solo transform en la animación, sin box-shadow ── */
.ds-ol-cube {
  width: 64px;
  height: 64px;
  background: var(--ds-orange, #F97316);
  border-radius: 8px;
  position: relative;
  will-change: transform;          /* promueve a capa GPU propia */
  animation: ds-ol-jump 0.7s linear infinite;
}

/* Detalle interno tipo GD */
.ds-ol-cube::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-top: 3px solid rgba(255, 255, 255, 0.4);
  border-left: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 3px;
}

.ds-ol-cube::after {
  content: '';
  position: absolute;
  inset: 20px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 2px;
  transform: rotate(45deg);
}

/* ── Sombra en el suelo: solo transform/opacity, sin box-shadow ── */
.ds-ol-shadow {
  width: 56px;
  height: 9px;
  background: var(--ds-orange, #F97316);
  border-radius: 50%;
  margin-top: 4px;
  opacity: 0.45;
  will-change: transform, opacity;
  animation: ds-ol-shadow 0.7s linear infinite;
}

/* ── Keyframes simplificados (menos pasos = menos trabajo por frame) ── */
@keyframes ds-ol-jump {
  0% {
    transform: translateY(0) rotate(0deg);
    animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
  }
  50% {
    transform: translateY(-80px) rotate(90deg);
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  100% {
    transform: translateY(0) rotate(180deg);
  }
}

@keyframes ds-ol-shadow {
  0%   { transform: scaleX(1);    opacity: 0.45; animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
  50%  { transform: scaleX(0.35); opacity: 0.12; animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
  100% { transform: scaleX(1);    opacity: 0.45; }
}

/* ── Transición entrada/salida ── */
.ds-ol-enter-active { transition: opacity 150ms ease; }
.ds-ol-leave-active { transition: opacity 200ms ease; }
.ds-ol-enter-from,
.ds-ol-leave-to     { opacity: 0; }
</style>
