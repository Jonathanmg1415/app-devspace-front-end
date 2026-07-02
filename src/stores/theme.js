import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setCssVar } from 'quasar'

export const THEMES = [
  { id: 'orange',   label: 'Naranja',   color: '#F97316', emoji: '🟠' },
  { id: 'amber',    label: 'Ámbar',     color: '#F59E0B', emoji: '🟡' },
  { id: 'lime',     label: 'Lima',      color: '#84CC16', emoji: '🍏' },
  { id: 'emerald',  label: 'Esmeralda', color: '#10B981', emoji: '🟢' },
  { id: 'teal',     label: 'Teal',      color: '#14B8A6', emoji: '🫐' },
  { id: 'cyan',     label: 'Cyan',      color: '#06B6D4', emoji: '🩵' },
  { id: 'sky',      label: 'Cielo',     color: '#0EA5E9', emoji: '☁️' },
  { id: 'blue',     label: 'Azul',      color: '#3B82F6', emoji: '🔵' },
  { id: 'indigo',   label: 'Índigo',    color: '#6366F1', emoji: '🟣' },
  { id: 'violet',   label: 'Violeta',   color: '#8B5CF6', emoji: '💜' },
  { id: 'purple',   label: 'Púrpura',   color: '#A855F7', emoji: '🫆' },
  { id: 'fuchsia',  label: 'Fucsia',    color: '#D946EF', emoji: '🌸' },
  { id: 'pink',     label: 'Rosa',      color: '#EC4899', emoji: '🩷' },
  { id: 'rose',     label: 'Coral',     color: '#F43F5E', emoji: '🌺' },
  { id: 'red',      label: 'Rojo',      color: '#EF4444', emoji: '🔴' },
  { id: 'slate',    label: 'Plata',     color: '#64748B', emoji: '⬜' },
]

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

export function applyTheme(color) {
  const { r, g, b } = hexToRgb(color)
  setCssVar('primary', color)
  const root = document.documentElement
  root.style.setProperty('--ds-orange',      color)
  root.style.setProperty('--ds-orange-dim',  `rgba(${r},${g},${b},0.10)`)
  root.style.setProperty('--ds-orange-glow', `rgba(${r},${g},${b},0.22)`)
  root.style.setProperty('--ds-accent-rgb',  `${r} ${g} ${b}`)
}

const STORAGE_KEY = 'devspace_accent'

export const useThemeStore = defineStore('theme', () => {
  const accent = ref(localStorage.getItem(STORAGE_KEY) || '#F97316')

  function setAccent(color) {
    accent.value = color
    localStorage.setItem(STORAGE_KEY, color)
    applyTheme(color)
  }

  function init() {
    applyTheme(accent.value)
  }

  return { accent, themes: THEMES, setAccent, init }
})
