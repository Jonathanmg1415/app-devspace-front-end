<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="ds-page-title">Calendario</div>
        <div style="font-size:12px; color:var(--ds-text-3); margin-top:2px">
          {{ monthLabel }} {{ currentYear }}
        </div>
      </div>
      <div class="row items-center" style="gap:6px">
        <!-- Shared calendars indicator -->
        <div v-if="store.members.length" class="row items-center" style="gap:-4px; margin-right:4px">
          <q-avatar v-for="m in store.members.slice(0,3)" :key="m.id"
            size="22px"
            :style="{ background: m.user?.avatar ? 'transparent' : nameToColor(m.user?.name), color:'#fff', fontSize:'9px', fontWeight:'700', border:'2px solid var(--ds-bg-0)', marginLeft: m !== store.members[0] ? '-6px' : '0' }">
            <img v-if="m.user?.avatar" :src="m.user.avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />
            <span v-else>{{ m.user?.name?.[0]?.toUpperCase() || '?' }}</span>
          </q-avatar>
        </div>
        <q-btn flat dense size="sm" icon="people" style="color:var(--ds-text-2); height:34px"
          :label="$q.screen.gt.xs ? 'Compartir' : ''" @click="openShare">
          <q-tooltip>Compartir calendario</q-tooltip>
        </q-btn>
        <q-btn color="primary" icon="add" :label="$q.screen.gt.xs ? 'Nuevo evento' : ''"
          size="sm" style="height:34px" @click="openNew()" />
      </div>
    </div>

    <!-- Navegación mes -->
    <div class="row items-center justify-between q-mb-md">
      <q-btn flat round dense icon="chevron_left" style="color:var(--ds-text-2)" @click="prevMonth" />
      <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)">
        {{ monthLabel }} {{ currentYear }}
      </div>
      <q-btn flat round dense icon="chevron_right" style="color:var(--ds-text-2)" @click="nextMonth" />
    </div>

    <!-- Grid de días de la semana -->
    <div class="cal-weekdays">
      <div v-for="d in weekDays" :key="d" class="cal-weekday">{{ d }}</div>
    </div>

    <!-- Grid del calendario -->
    <div v-if="store.loading" class="flex flex-center q-py-xl">
      <q-spinner size="32px" color="primary" />
    </div>
    <div v-else class="cal-grid">
      <div v-for="(day, i) in calendarDays" :key="i"
        class="cal-cell"
        :class="{
          'cal-cell--other':   !day.currentMonth,
          'cal-cell--today':    day.isToday,
          'cal-cell--weekend':  day.isWeekend,
        }"
        @click="openNew(day.date)">

        <div class="cal-day-num" :class="{ 'cal-day-num--today': day.isToday }">
          {{ day.day }}
        </div>

        <!-- Eventos del día -->
        <div class="cal-events">
          <div v-for="ev in day.events" :key="ev.id"
            class="cal-event"
            :class="{ 'cal-event--shared': ev.owner?.id !== auth.user?.id }"
            :style="eventStyle(ev)"
            @click.stop="openEdit(ev)">

            <!-- Ícono tipo -->
            <q-icon
              :name="ev.allDay ? 'wb_sunny' : 'schedule'"
              size="9px"
              class="cal-event-icon"
              :style="{ color: ev.color }" />

            <!-- Hora -->
            <span class="cal-event-time" v-if="!ev.allDay">{{ formatTime(ev.startDate) }}</span>

            <!-- Título -->
            <span class="cal-event-title">{{ ev.title }}</span>

            <!-- Avatar dueño si es compartido -->
            <span v-if="ev.owner?.id !== auth.user?.id"
              class="cal-event-avatar"
              :style="{ background: ev.owner?.avatar ? 'transparent' : nameToColor(ev.owner?.name) }"
              :title="ev.owner?.name">
              <img v-if="ev.owner?.avatar" :src="ev.owner.avatar"
                style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block" />
              <span v-else style="color:#fff;font-size:8px;font-weight:700">{{ ev.owner?.name?.[0]?.toUpperCase() }}</span>
            </span>
          </div>

          <!-- Indicador si hay más -->
          <div v-if="day.extraCount > 0" class="cal-extra" @click.stop="openDayView(day)">
            +{{ day.extraCount }} más
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Dialog crear / editar evento ─── -->
    <q-dialog v-model="eventDialog" persistent>
      <q-card style="width:min(440px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div class="row items-center">
            <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)" class="col">
              {{ editingEvent ? 'Editar evento' : 'Nuevo evento' }}
            </div>
            <q-btn v-if="editingEvent" flat round dense icon="delete_outline" size="sm"
              style="color:var(--ds-negative)" @click="confirmDelete(editingEvent)" />
          </div>
        </q-card-section>

        <q-card-section style="padding:16px 24px" class="q-gutter-sm">
          <!-- Color pick + título en la misma fila -->
          <div class="row items-center" style="gap:8px">
            <div class="color-swatch" :style="{ background: form.color }">
              <q-popup-proxy cover>
                <div class="color-palette">
                  <div v-for="c in eventColors" :key="c"
                    class="color-dot"
                    :style="{ background: c }"
                    :class="{ active: form.color === c }"
                    @click="form.color = c" />
                </div>
              </q-popup-proxy>
            </div>
            <q-input v-model="form.title" label="Título del evento" outlined dense class="col" />
          </div>

          <div class="row q-gutter-sm items-center">
            <q-toggle v-model="form.allDay" label="Todo el día" dense size="sm" />
          </div>

          <div class="row q-gutter-sm">
            <q-input v-model="form.startDate" label="Inicio" outlined dense
              :type="form.allDay ? 'date' : 'datetime-local'" class="col" />
            <q-input v-model="form.endDate" label="Fin (opcional)" outlined dense
              :type="form.allDay ? 'date' : 'datetime-local'" class="col" clearable />
          </div>

          <q-select v-model="form.project" :options="projectOptions" label="Proyecto (opcional)"
            outlined dense emit-value map-options clearable />

          <q-input v-model="form.description" label="Descripción (opcional)" outlined dense
            type="textarea" rows="2" />
        </q-card-section>

        <q-card-actions align="right" style="padding:0 24px 20px; gap:8px">
          <q-btn flat label="Cancelar" size="sm" @click="eventDialog = false; resetForm()"
            style="color:var(--ds-text-2)" />
          <q-btn color="primary" :label="editingEvent ? 'Guardar' : 'Crear'" size="sm"
            :loading="saving" style="min-width:72px; height:34px"
            @click="editingEvent ? handleEdit() : handleCreate()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ─── Dialog vista de día (más eventos) ─── -->
    <q-dialog v-model="dayViewDialog">
      <q-card style="width:min(360px,96vw)">
        <q-card-section style="padding:20px 20px 0">
          <div class="row items-center">
            <div style="font-size:14px; font-weight:600; color:var(--ds-text-1)" class="col">
              {{ dayViewDate ? formatFullDate(dayViewDate) : '' }}
            </div>
            <q-btn flat round dense icon="close" size="sm" style="color:var(--ds-text-2)" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section style="padding:12px 20px 20px">
          <div style="display:flex; flex-direction:column; gap:6px">
            <div v-for="ev in dayViewEvents" :key="ev.id"
              class="day-view-event"
              :style="{ borderLeft: `3px solid ${ev.color}`, background: ev.color + '0D' }"
              @click="dayViewDialog = false; openEdit(ev)">

              <!-- Color strip + content -->
              <div style="flex:1; min-width:0">
                <div class="row items-center" style="gap:5px">
                  <q-icon :name="ev.allDay ? 'wb_sunny' : 'schedule'" size="12px" :style="{ color: ev.color }" />
                  <span style="font-size:13px; font-weight:600; color:var(--ds-text-1); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                    {{ ev.title }}
                  </span>
                </div>
                <div class="row items-center q-mt-xs" style="gap:6px; flex-wrap:wrap">
                  <span style="font-size:11px; color:var(--ds-text-3)">
                    <q-icon name="access_time" size="10px" /> {{ ev.allDay ? 'Todo el día' : formatTime(ev.startDate) }}
                  </span>
                  <span v-if="ev.project" style="font-size:11px; color:var(--ds-text-3)">
                    <q-icon name="folder" size="10px" /> {{ ev.project.name }}
                  </span>
                </div>
              </div>

              <!-- Avatar si es compartido -->
              <div v-if="ev.owner?.id !== auth.user?.id"
                class="dv-owner-avatar"
                :style="{ background: nameToColor(ev.owner?.name) }"
                :title="ev.owner?.name">
                {{ ev.owner?.name?.[0]?.toUpperCase() }}
              </div>
            </div>
          </div>
          <q-btn flat size="sm" label="Agregar evento" icon="add" class="q-mt-sm"
            style="color:var(--ds-orange)" @click="dayViewDialog = false; openNew(dayViewDate)" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ─── Dialog compartir calendario ─── -->
    <q-dialog v-model="shareDialog" persistent>
      <q-card style="width:min(400px,96vw)">
        <q-card-section style="padding:24px 24px 0">
          <div class="row items-center">
            <div style="font-size:15px; font-weight:600; color:var(--ds-text-1)" class="col">Compartir calendario</div>
            <q-btn flat round dense icon="close" size="sm" style="color:var(--ds-text-2)" v-close-popup />
          </div>
          <div style="font-size:12px; color:var(--ds-text-3); margin-top:4px">
            Los usuarios invitados podrán ver tus eventos en su calendario.
          </div>
        </q-card-section>
        <q-card-section style="padding:16px 24px">
          <div class="row q-gutter-sm">
            <q-input v-model="inviteEmail" label="Email del usuario" outlined dense class="col"
              @keyup.enter="handleInvite" />
            <q-btn color="primary" label="Invitar" size="sm" style="height:40px; align-self:flex-end"
              :loading="inviting" :disable="!inviteEmail" @click="handleInvite" />
          </div>
        </q-card-section>
        <q-separator style="background:var(--ds-border)" />
        <q-card-section style="padding:12px 24px; max-height:240px; overflow-y:auto">
          <div v-if="!store.members.length" class="flex flex-center column q-py-md" style="color:var(--ds-text-3)">
            <q-icon name="people_outline" size="32px" style="opacity:0.3" />
            <p style="font-size:12px; margin-top:6px">Solo tú ves este calendario</p>
          </div>
          <div v-for="m in store.members" :key="m.id" class="member-row">
            <q-avatar size="30px" :style="{ background: m.user?.avatar ? 'transparent' : nameToColor(m.user?.name), color:'#fff', fontSize:'12px', fontWeight:'700' }">
              <img v-if="m.user?.avatar" :src="m.user.avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />
              <span v-else>{{ m.user?.name?.[0]?.toUpperCase() || '?' }}</span>
            </q-avatar>
            <div class="col" style="min-width:0">
              <div style="font-size:13px; font-weight:500; color:var(--ds-text-1)">{{ m.user?.name }}</div>
              <div style="font-size:11px; color:var(--ds-text-3)">{{ m.user?.email }}</div>
            </div>
            <q-btn flat round dense size="xs" icon="close" style="color:var(--ds-text-3)"
              @click="handleRemoveMember(m)">
              <q-tooltip>Quitar acceso</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-actions align="right" style="padding:8px 24px 20px">
          <q-btn flat label="Cerrar" size="sm" v-close-popup style="color:var(--ds-text-2)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useEventsStore } from 'src/stores/events'
import { useProjectsStore } from 'src/stores/projects'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'

const $q           = useQuasar()
const store        = useEventsStore()
const projectsStore = useProjectsStore()
const auth         = useAuthStore()
const { projects } = storeToRefs(projectsStore)

// ── Estado del mes ──
const now          = new Date()
const currentYear  = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1) // 1-12

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const weekDays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const monthLabel = computed(() => MONTHS[currentMonth.value - 1])

// ── Paleta de colores ──
const eventColors = ['#F97316','#22C55E','#38BDF8','#A78BFA','#F43F5E','#FBBF24','#34D399','#60A5FA','#E879F9','#6B7280']

// ── Form ──
const eventDialog = ref(false)
const saving      = ref(false)
const editingEvent = ref(null)
const blankForm = () => ({ title:'', description:'', startDate:'', endDate:'', allDay:false, color:'#F97316', project:null })
const form = ref(blankForm())

// ── Day view ──
const dayViewDialog = ref(false)
const dayViewDate   = ref(null)
const dayViewEvents = ref([])

// ── Share ──
const shareDialog = ref(false)
const inviteEmail = ref('')
const inviting    = ref(false)

// ── Proyectos ──
const projectOptions = computed(() =>
  projects.value.map(p => ({ label: p.name, value: p.id }))
)

// ── Calendario grid ──
const calendarDays = computed(() => {
  const year  = currentYear.value
  const month = currentMonth.value
  const today = new Date()

  const firstDay = new Date(year, month - 1, 1)
  // Lunes = 0, necesitamos que el primer día del mes caiga en la columna correcta
  let startDow = firstDay.getDay() - 1 // 0=lun, 6=dom
  if (startDow < 0) startDow = 6

  const totalDays = new Date(year, month, 0).getDate()
  const days = []

  // Días del mes anterior
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, -i)
    days.push(makeDay(d, false))
  }
  // Días del mes actual
  for (let d = 1; d <= totalDays; d++) {
    days.push(makeDay(new Date(year, month - 1, d), true))
  }
  // Días del mes siguiente para completar la grilla (múltiplo de 7)
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push(makeDay(new Date(year, month, d), false))
    }
  }
  return days
})

function makeDay(date, currentMonth) {
  const today   = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const dow     = date.getDay() // 0=dom, 6=sab
  const isWeekend = dow === 0 || dow === 6

  const dayEvents = store.events.filter(ev => {
    const evDate = new Date(ev.startDate)
    return evDate.toDateString() === date.toDateString()
  }).sort((a, b) => {
    if (a.allDay && !b.allDay) return -1
    if (!a.allDay && b.allDay) return 1
    return new Date(a.startDate) - new Date(b.startDate)
  })

  const MAX_VISIBLE = 3
  return {
    date, day: date.getDate(), currentMonth, isToday, isWeekend,
    events:     dayEvents.slice(0, MAX_VISIBLE),
    extraCount: Math.max(0, dayEvents.length - MAX_VISIBLE),
  }
}

// ── Navegación ──
function prevMonth() {
  if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
  else currentMonth.value++
}

watch([currentYear, currentMonth], () => store.fetchMonth(currentYear.value, currentMonth.value))

onMounted(async () => {
  if (!projects.value.length) await projectsStore.fetchAll()
  store.fetchMonth(currentYear.value, currentMonth.value)
  store.fetchMembers()
})

// ── Form helpers ──
const pad = n => String(n).padStart(2, '0')

// ISO UTC → datetime-local string (uses LOCAL time methods so display is correct)
function toLocalInput(dateStr, allDay) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (allDay) return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// datetime-local string (local time, no timezone) → ISO UTC string for backend
function localInputToISO(str) {
  if (!str) return null
  return new Date(str).toISOString()
}

// Local Date object → "YYYY-MM-DD" using LOCAL date methods (avoids UTC-date mismatch)
function dateToLocalISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}

function openNew(date) {
  resetForm()
  if (date) {
    const localDate = dateToLocalISODate(date)
    form.value.startDate = localDate + 'T09:00'
  }
  eventDialog.value = true
}

function openEdit(ev) {
  editingEvent.value = ev
  form.value = {
    title:       ev.title,
    description: ev.description || '',
    startDate:   toLocalInput(ev.startDate, ev.allDay),
    endDate:     ev.endDate ? toLocalInput(ev.endDate, ev.allDay) : '',
    allDay:      ev.allDay,
    color:       ev.color || '#F97316',
    project:     typeof ev.project === 'object' ? ev.project?.id : ev.project ?? null,
  }
  eventDialog.value = true
}

function resetForm() { editingEvent.value = null; form.value = blankForm() }

function buildDatePayload(f) {
  return {
    ...f,
    startDate: localInputToISO(f.startDate),
    endDate:   f.endDate ? localInputToISO(f.endDate) : null,
  }
}

async function handleCreate() {
  if (!form.value.title || !form.value.startDate) {
    $q.notify({ type: 'warning', message: 'Título y fecha de inicio son requeridos' }); return
  }
  saving.value = true
  try {
    const payload = buildDatePayload(form.value)
    if (!payload.endDate) delete payload.endDate
    if (!payload.project) delete payload.project
    await store.create(payload)
    eventDialog.value = false; resetForm()
    $q.notify({ type: 'positive', message: 'Evento creado' })
  } catch { $q.notify({ type: 'negative', message: 'Error al crear evento' }) }
  finally { saving.value = false }
}

async function handleEdit() {
  if (!form.value.title || !editingEvent.value) return
  saving.value = true
  try {
    const payload = buildDatePayload(form.value)
    if (!payload.endDate) { payload.endDate = null }
    if (!payload.project) { payload.clearProject = true; delete payload.project }
    await store.update(editingEvent.value.id, payload)
    eventDialog.value = false; resetForm()
    $q.notify({ type: 'positive', message: 'Evento actualizado' })
  } catch { $q.notify({ type: 'negative', message: 'Error al actualizar' }) }
  finally { saving.value = false }
}

function confirmDelete(ev) {
  $q.dialog({ title: 'Eliminar evento', message: `¿Eliminar "${ev.title}"?`, cancel: true })
    .onOk(async () => {
      await store.remove(ev.id)
      eventDialog.value = false; resetForm()
      $q.notify({ type: 'positive', message: 'Evento eliminado' })
    })
}

function openDayView(day) {
  dayViewDate.value  = day.date
  dayViewEvents.value = store.events.filter(ev => {
    return new Date(ev.startDate).toDateString() === day.date.toDateString()
  })
  dayViewDialog.value = true
}

// ── Share ──
async function openShare() { shareDialog.value = true; await store.fetchMembers() }

async function handleInvite() {
  if (!inviteEmail.value) return
  inviting.value = true
  try {
    await store.invite(inviteEmail.value)
    inviteEmail.value = ''
    $q.notify({ type: 'positive', message: 'Calendario compartido' })
  } catch (err) {
    const s = err.response?.status
    if (s === 404) $q.notify({ type: 'warning', message: 'No existe ninguna cuenta con ese email' })
    else if (s === 409) $q.notify({ type: 'warning', message: 'Ya compartiste con este usuario' })
    else if (s === 400) $q.notify({ type: 'warning', message: 'No puedes compartir contigo mismo' })
    else $q.notify({ type: 'negative', message: 'Error al invitar' })
  } finally { inviting.value = false }
}

async function handleRemoveMember(m) {
  $q.dialog({ title: 'Quitar acceso', message: `¿Quitar acceso a ${m.user?.name}?`, cancel: true })
    .onOk(async () => { await store.removeMember(m.id); $q.notify({ type: 'positive', message: 'Acceso removido' }) })
}

// ── Formatters ──
function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}
function formatFullDate(date) {
  return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ── Color consistente por nombre de usuario ──
const USER_PALETTE = [
  '#6366F1','#8B5CF6','#D946EF','#EC4899','#F43F5E',
  '#F97316','#F59E0B','#10B981','#14B8A6','#06B6D4',
  '#3B82F6','#0EA5E9','#84CC16','#A855F7','#64748B',
]
function nameToColor(name) {
  if (!name) return '#6366F1'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return USER_PALETTE[hash % USER_PALETTE.length]
}

// ── Estilo de evento según dueño ──
function eventStyle(ev) {
  const isOwn = ev.owner?.id === auth.user?.id
  if (isOwn) {
    return {
      background: ev.color + '28',
      borderLeft: `3px solid ${ev.color}`,
      color: ev.color,
    }
  }
  // Evento compartido: borde punteado + fondo más tenue
  return {
    background: ev.color + '14',
    border: `1px dashed ${ev.color}88`,
    color: ev.color + 'CC',
  }
}
</script>

<style scoped>
/* ── Weekdays header ── */
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}
.cal-weekday {
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ds-text-3);
  padding: 8px 0;
}
.cal-weekday:nth-child(6),
.cal-weekday:nth-child(7) { color: var(--ds-orange); opacity: 0.6; }

/* ── Calendar grid ── */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  animation: fadeIn 300ms ease both;
}

/* ── Day cell ── */
.cal-cell {
  min-height: 106px;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  padding: 7px;
  cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease, transform 140ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 140ms ease;
  overflow: hidden;
  position: relative;
}
.cal-cell:hover {
  border-color: var(--ds-orange);
  background: var(--ds-bg-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  z-index: 2;
}
.cal-cell--other {
  background: transparent;
  opacity: 0.38;
  border-color: transparent;
}
.cal-cell--other:hover { opacity: 0.7; }
.cal-cell--today {
  border-color: var(--ds-orange) !important;
  background: var(--ds-orange-dim) !important;
}
.cal-cell--weekend { background: rgba(0,0,0,0.03); }

/* number badge */
.cal-day-num {
  font-size: 11px;
  font-weight: 700;
  color: var(--ds-text-3);
  margin-bottom: 5px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 140ms ease, color 140ms ease;
}
.cal-day-num--today {
  background: var(--ds-orange);
  color: #fff;
  box-shadow: 0 2px 8px var(--ds-orange-glow);
}

/* ── Events in cell ── */
.cal-events { display: flex; flex-direction: column; gap: 2px; }

.cal-event {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  font-weight: 500;
  padding: 2px 5px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition: filter 120ms ease, transform 120ms ease, opacity 120ms ease;
}
.cal-event:hover { filter: brightness(1.18); transform: translateX(1px); }
.cal-event--shared { opacity: 0.82; }
.cal-event--shared:hover { opacity: 1; }

.cal-event-icon { flex-shrink: 0; opacity: 0.8; }
.cal-event-time {
  font-size: 9px;
  font-weight: 700;
  opacity: 0.85;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.cal-event-title { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.cal-event-avatar {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  font-size: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
}

.cal-extra {
  font-size: 10px;
  font-weight: 600;
  color: var(--ds-text-3);
  padding: 2px 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 120ms ease, color 120ms ease;
}
.cal-extra:hover { background: var(--ds-orange-dim); color: var(--ds-orange); }

/* ── Color picker ── */
.color-swatch {
  width: 34px; height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
  cursor: pointer;
  border: 2px solid rgba(255,255,255,0.15);
  transition: transform 140ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 140ms ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.22);
}
.color-swatch:hover { transform: scale(1.12); box-shadow: 0 4px 14px rgba(0,0,0,0.3); }

.color-palette {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 12px;
  background: var(--ds-bg-1);
  border: 1px solid var(--ds-border);
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0,0,0,0.28);
}
.color-dot {
  width: 24px; height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 140ms cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.color-dot:hover { transform: scale(1.22); }
.color-dot.active {
  box-shadow: 0 0 0 2px var(--ds-bg-0), 0 0 0 4px currentColor;
  transform: scale(1.1);
}

/* ── Day overflow view ── */
.day-view-event {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: filter 120ms ease, transform 120ms ease;
}
.day-view-event:hover { filter: brightness(1.08); transform: translateX(2px); }

.dv-owner-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.22);
}

/* ── Members list ── */
.member-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--ds-border);
  transition: background 120ms ease;
}
.member-row:last-child { border-bottom: none; }

/* ── Mobile ── */
@media (max-width: 599px) {
  .cal-cell { min-height: 64px; padding: 4px; }
  .cal-event-time, .cal-event-owner { display: none; }
  .cal-event { font-size: 9.5px; padding: 1px 4px; border-radius: 3px; }
  .cal-day-num { font-size: 10px; width: 18px; height: 18px; }
  .cal-grid { gap: 2px; }
}
</style>
