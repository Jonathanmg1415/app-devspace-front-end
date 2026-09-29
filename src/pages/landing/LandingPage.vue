<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="landing-bg">
        <div class="landing-grid-lines" />

        <div class="landing-nav">
          <div class="landing-brand">
            <img src="/favicon.png" alt="DevSpace" class="landing-logo" />
            <span>Dev<span class="text-orange">Space</span></span>
          </div>
          <div class="landing-nav-actions">
            <q-btn flat no-caps label="Iniciar sesión" to="/auth/login" class="nav-btn" />
            <q-btn unelevated no-caps label="Crear cuenta" to="/auth/register" color="primary" class="nav-btn-cta" />
          </div>
        </div>

        <section class="landing-hero">
          <div class="hero-badge">Workspace técnico personal</div>
          <h1 class="hero-title">
            Todo tu trabajo técnico,<br />
            en <span class="text-orange">un solo lugar</span>
          </h1>
          <p class="hero-subtitle">
            Proyectos, tareas, notas, comandos, archivos y calendario — con IA que te ayuda
            a redactar documentos y convertir imágenes o texto en tareas accionables.
          </p>
          <div class="hero-actions">
            <q-btn unelevated no-caps label="Crear cuenta gratis" to="/auth/register"
              color="primary" class="hero-btn-cta" icon-right="arrow_forward" />
            <q-btn flat no-caps label="Ya tengo cuenta" to="/auth/login" class="hero-btn-secondary" />
          </div>
        </section>

        <section class="landing-features">
          <div class="features-grid">
            <div v-for="f in features" :key="f.title" class="feature-card">
              <q-icon :name="f.icon" size="22px" class="feature-icon" />
              <div class="feature-title">{{ f.title }}</div>
              <div class="feature-desc">{{ f.desc }}</div>
            </div>
          </div>
        </section>

        <section class="landing-cta">
          <div class="cta-title">¿Listo para ordenar tu trabajo?</div>
          <q-btn unelevated no-caps label="Crear cuenta gratis" to="/auth/register"
            color="primary" class="hero-btn-cta" icon-right="arrow_forward" />
        </section>

        <footer class="landing-footer">
          DevSpace — workspace personal
        </footer>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
const features = [
  {
    icon: 'folder_open',
    title: 'Proyectos',
    desc: 'Organizá tu trabajo en proyectos independientes, cada uno con su propio espacio.',
  },
  {
    icon: 'task_alt',
    title: 'Tareas y Kanban',
    desc: 'Lista de tareas con prioridad, estado y recurrencia, o tablero Kanban para seguir el flujo visual.',
  },
  {
    icon: 'event',
    title: 'Calendario multi',
    desc: 'Varios calendarios con nombre y color propios, compartibles por separado, con tareas simples por día.',
  },
  {
    icon: 'description',
    title: 'Notas',
    desc: 'Notas enriquecidas por proyecto para documentar decisiones, ideas o contexto.',
  },
  {
    icon: 'link',
    title: 'Links',
    desc: 'Guardá y organizá enlaces relevantes de cada proyecto sin perderlos entre pestañas.',
  },
  {
    icon: 'terminal',
    title: 'Comandos y snippets',
    desc: 'Comandos frecuentes guardados y descritos automáticamente con IA para no reescribirlos nunca más.',
  },
  {
    icon: 'attach_file',
    title: 'Archivos',
    desc: 'Subí y organizá archivos por proyecto, disponibles desde cualquier lugar.',
  },
  {
    icon: 'auto_awesome',
    title: 'Asistente de IA',
    desc: 'Generá documentos, describí comandos y extraé tareas desde texto o imágenes con un asistente integrado.',
  },
  {
    icon: 'groups',
    title: 'Colaboración',
    desc: 'Compartí proyectos y calendarios con tu equipo, con actividad y permisos por miembro.',
  },
]
</script>

<style scoped>
.landing-bg {
  background: var(--ds-bg-0);
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  height: 100%;
}

.text-orange { color: var(--ds-orange); }

.landing-nav {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.landing-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ds-text-1);
}

.landing-logo {
  height: 32px;
  width: 32px;
  border-radius: 50%;
}

.landing-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn { color: var(--ds-text-2); font-size: 13px; }
.nav-btn-cta { font-size: 13px; height: 36px; padding: 0 16px; }

.landing-hero {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 64px 24px 48px;
  text-align: center;
  box-sizing: border-box;
}

.hero-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: var(--ds-orange);
  background: var(--ds-orange-dim);
  border: 1px solid var(--ds-orange-glow);
  border-radius: 999px;
  padding: 5px 14px;
  margin-bottom: 20px;
}

.hero-title {
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  color: var(--ds-text-1);
  margin: 0 0 16px;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--ds-text-2);
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto 32px;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn-cta { font-size: 14px; height: 42px; padding: 0 22px; font-weight: 600; }
.hero-btn-secondary { font-size: 14px; height: 42px; padding: 0 18px; color: var(--ds-text-2); }

.landing-features {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 24px 64px;
  width: 100%;
  box-sizing: border-box;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.feature-card {
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 20px;
  transition: border-color var(--ds-transition), transform var(--ds-transition);
}

.feature-card:hover {
  border-color: var(--ds-border-lg);
  transform: translateY(-2px);
}

.feature-icon {
  color: var(--ds-orange);
  margin-bottom: 10px;
}

.feature-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--ds-text-1);
  margin-bottom: 6px;
}

.feature-desc {
  font-size: 12.5px;
  color: var(--ds-text-2);
  line-height: 1.5;
}

.landing-cta {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 32px 24px 64px;
}

.cta-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ds-text-1);
  margin-bottom: 20px;
}

.landing-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: var(--ds-text-3);
  border-top: 1px solid var(--ds-border);
}
</style>
