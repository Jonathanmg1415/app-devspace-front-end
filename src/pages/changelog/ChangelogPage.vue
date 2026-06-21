<template>
  <q-page>
    <div class="changelog-content">
      <div class="changelog-hero">
        <div class="changelog-badge">Alpha</div>
        <h1 class="changelog-title">Notas de versión</h1>
        <p class="changelog-subtitle">DevSpace está en desarrollo activo. Aquí encontrarás los cambios de cada versión.</p>
      </div>

      <!-- Timeline -->
      <div class="changelog-timeline">
        <div v-for="(release, index) in releases" :key="release.version" class="changelog-entry">
          <!-- Header clickeable -->
          <button class="changelog-trigger" @click="toggle(index)" :aria-expanded="open[index]">
            <div class="trigger-left">
              <span class="version-chip" :class="release.type">{{ release.version }}</span>
              <div class="trigger-text">
                <span class="trigger-title">{{ release.title }}</span>
                <span class="trigger-date">{{ release.date }}</span>
              </div>
            </div>
            <div class="trigger-right">
              <span class="changes-count">{{ release.changes.length }} cambios</span>
              <q-icon :name="open[index] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                size="18px" style="color:var(--ds-text-3); flex-shrink:0" />
            </div>
          </button>

          <!-- Contenido desplegable -->
          <transition name="collapse">
            <div v-if="open[index]" class="changelog-body">
              <ul class="changelog-list">
                <li v-for="item in release.changes" :key="item.text" class="changelog-item">
                  <span class="item-badge" :class="item.type">{{ badgeLabel(item.type) }}</span>
                  <span class="item-text">{{ item.text }}</span>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>

      <div class="changelog-footer">
        DevSpace v{{ currentVersion }} · Alpha · Hecho con ☕ y mucho código
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const currentVersion = '0.3.0'

const badgeLabel = t => ({ new: 'Nuevo', fix: 'Fix', improve: 'Mejora', breaking: 'Cambio' }[t] || t)

const releases = [
  {
    version: 'v0.3.0',
    type: 'alpha',
    date: '21 Jun 2026',
    title: 'Productividad y personalización',
    changes: [
      { type: 'new',     text: 'Las notas ahora renderizan markdown: títulos, listas, negrita, cursiva, bloques de cita, separadores y enlaces con clic.' },
      { type: 'new',     text: 'Las tareas muestran su fecha límite directamente en la tarjeta, con colores que indican si están vencidas, son para hoy o para pronto.' },
      { type: 'new',     text: 'Puedes filtrar las tareas del tablero por prioridad, persona asignada o texto de búsqueda sin salir de la vista.' },
      { type: 'new',     text: 'Ahora puedes duplicar una tarea desde su menú con un solo clic.' },
      { type: 'new',     text: 'Botón para ocultar las tareas completadas y ver solo lo que falta por hacer.' },
      { type: 'new',     text: 'El formulario de tareas incluye campo de fecha límite.' },
      { type: 'new',     text: 'Puedes editar cualquier tarea directamente desde la tarjeta, no solo cambiar su estado.' },
      { type: 'new',     text: 'Nueva sección "Mi perfil" donde puedes cambiar tu nombre y contraseña desde la app.' },
      { type: 'new',     text: 'Exporta cualquier proyecto como archivo JSON con todas sus tareas, notas, comandos y más.' },
      { type: 'new',     text: 'Cuando alguien te asigna una tarea, recibes un email de notificación automático.' },
      { type: 'new',     text: 'Puedes dejar comentarios en cualquier tarea y ver los del resto del equipo en tiempo real.' },
      { type: 'new',     text: 'Feed de actividad por proyecto: ve quién creó tareas, notas, invitó miembros o comentó, con tiempo relativo.' },
      { type: 'improve', text: 'El logo en la barra de navegación se ve más pulido.' },
      { type: 'improve', text: 'El menú de usuario ahora incluye acceso directo al perfil.' },
    ],
  },
  {
    version: 'v0.2.0',
    type: 'alpha',
    date: '21 Jun 2026',
    title: 'Colaboración, IA y más fluidez',
    changes: [
      { type: 'new',     text: 'Ahora puedes arrastrar las tareas directamente entre columnas del tablero para actualizar su estado.' },
      { type: 'new',     text: 'Sube archivos soltándolos en la pantalla, sin buscar el botón. Puedes subir varios a la vez.' },
      { type: 'new',     text: 'Genera documentación, READMEs o explicaciones técnicas con IA desde el editor de notas, solo describe qué necesitas.' },
      { type: 'new',     text: '¿Olvidaste tu contraseña? Ahora puedes recuperarla desde el login y recibirás un enlace por correo.' },
      { type: 'new',     text: 'Asigna tareas a los miembros de tu equipo directamente desde la tarjeta.' },
      { type: 'new',     text: 'Puedes cambiar el rol de cada miembro de tu proyecto (miembro o administrador) cuando quieras.' },
      { type: 'improve', text: 'La búsqueda ahora encuentra cosas en todos los proyectos donde participas, no solo en los tuyos.' },
      { type: 'improve', text: 'Los proyectos compartidos contigo ya no muestran opciones que no puedes usar, como editar o eliminar.' },
      { type: 'fix',     text: 'Corregido un problema por el que algunos usuarios no podían iniciar sesión si la sesión anterior no había cerrado bien.' },
    ],
  },
  {
    version: 'v0.1.0',
    type: 'alpha',
    date: '21 Jun 2025',
    title: 'Arrancamos',
    changes: [
      { type: 'new', text: 'Crea tu cuenta y accede a tu espacio de trabajo personal.' },
      { type: 'new', text: 'Organiza tu trabajo en proyectos con color propio.' },
      { type: 'new', text: 'Gestiona tareas en un tablero visual con tres estados: pendiente, en progreso y completado.' },
      { type: 'new', text: 'Escribe notas técnicas con soporte para bloques de código con colores.' },
      { type: 'new', text: 'Guarda comandos y snippets frecuentes; la IA te ayuda a escribir la descripción.' },
      { type: 'new', text: 'Guarda links, tarjetas rápidas y archivos dentro de cada proyecto.' },
      { type: 'new', text: 'Busca en todo tu workspace desde un solo lugar.' },
      { type: 'new', text: 'Invita a tu equipo a un proyecto por email.' },
      { type: 'new', text: 'Cambia entre modo oscuro, claro o el de tu sistema cuando quieras.' },
    ],
  },
]

// Primera entrada abierta por defecto
const open = ref(releases.map((_, i) => i === 0))

function toggle(i) {
  open.value[i] = !open.value[i]
}
</script>

<style scoped>
/* ── Content wrapper ── */
.changelog-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 16px 80px;
}

/* ── Hero ── */
.changelog-hero { text-align: center; margin-bottom: 40px; }
.changelog-badge {
  display: inline-block;
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  background: rgba(249,115,22,0.12); color: var(--ds-orange);
  border: 1px solid rgba(249,115,22,0.25); border-radius: 20px;
  padding: 3px 12px; margin-bottom: 14px;
}
.changelog-title {
  font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
  margin: 0 0 10px; color: var(--ds-text-1);
}
.changelog-subtitle {
  font-size: 14px; color: var(--ds-text-2); line-height: 1.6; margin: 0;
}

/* ── Timeline ── */
.changelog-timeline { display: flex; flex-direction: column; gap: 8px; }

/* ── Entry card ── */
.changelog-entry {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: 10px;
  overflow: hidden;
}

/* ── Trigger button ── */
.changelog-trigger {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px;
  background: none; border: none; cursor: pointer;
  text-align: left; color: inherit;
}
.changelog-trigger:hover { background: var(--ds-bg-hover); }

.trigger-left  { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
.trigger-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.version-chip {
  font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
  padding: 2px 8px; border-radius: 5px; flex-shrink: 0;
  background: var(--ds-bg-2); color: var(--ds-text-2); border: 1px solid var(--ds-border-md);
}
.version-chip.alpha {
  background: rgba(249,115,22,0.1); color: var(--ds-orange);
  border-color: rgba(249,115,22,0.2);
}

.trigger-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.trigger-title {
  font-size: 13px; font-weight: 600; color: var(--ds-text-1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.trigger-date { font-size: 11px; color: var(--ds-text-3); }

.changes-count {
  font-size: 11px; color: var(--ds-text-3);
  white-space: nowrap;
}

/* ── Body ── */
.changelog-body { padding: 0 16px 16px; border-top: 1px solid var(--ds-border); }

.changelog-list {
  list-style: none; margin: 12px 0 0; padding: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.changelog-item { display: flex; align-items: baseline; gap: 8px; line-height: 1.5; }
.item-text { font-size: 13px; color: var(--ds-text-2); }

.item-badge {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; padding: 1px 5px; border-radius: 3px;
  flex-shrink: 0; margin-top: 1px;
}
.item-badge.new     { background: rgba(34,197,94,0.12);  color: #22C55E; }
.item-badge.fix     { background: rgba(249,115,22,0.12); color: #F97316; }
.item-badge.improve { background: rgba(56,189,248,0.12); color: #38BDF8; }
.item-badge.breaking{ background: rgba(239,68,68,0.12);  color: #EF4444; }

/* ── Footer ── */
.changelog-footer {
  margin-top: 48px; text-align: center;
  font-size: 12px; color: var(--ds-text-3);
}

/* ── Collapse animation ── */
.collapse-enter-active,
.collapse-leave-active { transition: opacity 160ms ease, max-height 200ms ease; max-height: 600px; overflow: hidden; }
.collapse-enter-from,
.collapse-leave-to    { opacity: 0; max-height: 0; }

/* ── Responsive ── */
@media (max-width: 480px) {
  .changelog-content { padding: 28px 12px 60px; }
  .changelog-title   { font-size: 22px; }
  .changes-count     { display: none; }
  .trigger-title     { font-size: 12px; }
}
</style>
