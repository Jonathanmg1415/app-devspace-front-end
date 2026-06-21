<template>
  <div class="note-content">
    <template v-for="(block, i) in blocks" :key="i">
      <!-- Bloque de código -->
      <div v-if="block.type === 'code'" class="note-code-block">
        <div class="note-code-header">
          <span class="note-code-lang">{{ block.lang || 'code' }}</span>
          <q-btn
            flat round dense size="xs"
            icon="content_copy"
            style="color: var(--ds-text-3)"
            @click="copy(block.content)"
          >
            <q-tooltip>Copiar</q-tooltip>
          </q-btn>
        </div>
        <pre class="note-code-pre"><code :class="`lang-${block.lang}`" v-html="highlight(block.content, block.lang)" /></pre>
      </div>
      <!-- Texto con markdown -->
      <div v-else-if="block.content" class="note-md-block" v-html="renderMarkdown(block.content)" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  content: { type: String, default: '' },
})

// Parsea el contenido en bloques: texto o código
const blocks = computed(() => {
  if (!props.content) return []
  const parts = []
  // Regex: ```lang\n...content...\n```
  const codeRe = /```(\w*)\n?([\s\S]*?)```/g
  let last = 0
  let match
  while ((match = codeRe.exec(props.content)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: props.content.slice(last, match.index).trim() })
    }
    parts.push({ type: 'code', lang: match[1] || 'code', content: match[2] })
    last = match.index + match[0].length
  }
  if (last < props.content.length) {
    const remaining = props.content.slice(last).trim()
    if (remaining) parts.push({ type: 'text', content: remaining })
  }
  return parts
})

function copy(text) {
  navigator.clipboard.writeText(text)
  $q.notify({ message: 'Copiado', timeout: 800, color: 'grey-9', textColor: 'white', position: 'bottom' })
}

// ── Markdown renderer ────────────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split('\n')
  let html = ''
  let listType = ''
  let inList = false

  const closeList = () => {
    if (inList) { html += `</${listType}>`; inList = false; listType = '' }
  }

  for (const line of lines) {
    if (/^---+\s*$/.test(line)) {
      closeList(); html += '<hr class="md-hr" />'; continue
    }
    const h4 = line.match(/^####\s+(.+)/)
    const h3 = line.match(/^###\s+(.+)/)
    const h2 = line.match(/^##\s+(.+)/)
    const h1 = line.match(/^#\s+(.+)/)
    if (h4) { closeList(); html += `<h4 class="md-h4">${inlineMd(h4[1])}</h4>`; continue }
    if (h3) { closeList(); html += `<h3 class="md-h3">${inlineMd(h3[1])}</h3>`; continue }
    if (h2) { closeList(); html += `<h2 class="md-h2">${inlineMd(h2[1])}</h2>`; continue }
    if (h1) { closeList(); html += `<h1 class="md-h1">${inlineMd(h1[1])}</h1>`; continue }

    const bq = line.match(/^>\s*(.*)/)
    if (bq) { closeList(); html += `<blockquote class="md-bq">${inlineMd(bq[1])}</blockquote>`; continue }

    const ul = line.match(/^[-*]\s+(.+)/)
    if (ul) {
      if (!inList || listType !== 'ul') { closeList(); html += '<ul class="md-ul">'; inList = true; listType = 'ul' }
      html += `<li>${inlineMd(ul[1])}</li>`; continue
    }

    const ol = line.match(/^\d+\.\s+(.+)/)
    if (ol) {
      if (!inList || listType !== 'ol') { closeList(); html += '<ol class="md-ol">'; inList = true; listType = 'ol' }
      html += `<li>${inlineMd(ol[1])}</li>`; continue
    }

    if (line.trim() === '') { closeList(); html += '<div class="md-spacer"></div>'; continue }

    closeList()
    html += `<p class="md-p">${inlineMd(line)}</p>`
  }

  closeList()
  return html
}

function inlineMd(text) {
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  text = text.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>')
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>')
  return text
}

// ── Resaltado de sintaxis básico — cubre SQL, JS, CSS, Python, HTML, Bash ──
function highlight(code, lang) {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const rules = getLangRules(lang?.toLowerCase())
  if (!rules) return escaped

  return applyRules(escaped, rules)
}

function applyRules(code, rules) {
  // Marcamos zonas ya coloreadas con un placeholder para no re-procesar
  const placeholders = []
  let result = code

  for (const rule of rules) {
    result = result.replace(rule.re, (match, ...groups) => {
      const colored = `<span class="hl-${rule.cls}">${groups[0] ?? match}</span>`
      const key = `\x00${placeholders.length}\x00`
      placeholders.push(colored)
      return key
    })
  }

  // Restaurar placeholders
  placeholders.forEach((val, i) => {
    result = result.replace(`\x00${i}\x00`, val)
  })

  return result
}

function getLangRules(lang) {
  const STRING   = { re: /(&quot;.*?&quot;|'.*?'|`.*?`)/g, cls: 'str' }
  const COMMENT_SLASH = { re: /(\/\/[^\n]*)/g, cls: 'cmt' }
  const COMMENT_HASH  = { re: /(#[^\n]*)/g, cls: 'cmt' }
  const COMMENT_SQL   = { re: /(--[^\n]*)/g, cls: 'cmt' }
  const NUMBER   = { re: /\b(\d+\.?\d*)\b/g, cls: 'num' }

  if (['js', 'javascript', 'ts', 'typescript']) {
    if (['js', 'javascript', 'ts', 'typescript'].includes(lang)) {
      return [
        STRING,
        COMMENT_SLASH,
        { re: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|new|this|typeof|null|undefined|true|false)\b/g, cls: 'kw' },
        { re: /\b([A-Z][a-zA-Z0-9]*)\b/g, cls: 'type' },
        NUMBER,
      ]
    }
  }
  if (['sql'].includes(lang)) {
    return [
      STRING,
      COMMENT_SQL,
      { re: /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|INDEX|PRIMARY|KEY|NOT|NULL|AND|OR|IN|LIKE|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL|EXISTS|BETWEEN|IS)\b/gi, cls: 'kw' },
      NUMBER,
    ]
  }
  if (['css', 'scss', 'less'].includes(lang)) {
    return [
      STRING,
      { re: /(\/\*[\s\S]*?\*\/)/g, cls: 'cmt' },
      { re: /([a-z-]+)\s*:/g, cls: 'prop' },
      { re: /(#[0-9a-fA-F]{3,8})\b/g, cls: 'num' },
      NUMBER,
      { re: /(@[a-z-]+)/g, cls: 'kw' },
    ]
  }
  if (['python', 'py'].includes(lang)) {
    return [
      STRING,
      COMMENT_HASH,
      { re: /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|with|as|try|except|finally|raise|pass|break|continue|lambda|yield|async|await)\b/g, cls: 'kw' },
      NUMBER,
    ]
  }
  if (['html', 'xml', 'vue'].includes(lang)) {
    return [
      { re: /(&lt;\/?[a-zA-Z][a-zA-Z0-9-]*)/g, cls: 'tag' },
      { re: /\s([a-zA-Z:@-]+)=/g, cls: 'attr' },
      STRING,
      { re: /(&lt;!--[\s\S]*?--&gt;)/g, cls: 'cmt' },
    ]
  }
  if (['bash', 'sh', 'shell', 'zsh'].includes(lang)) {
    return [
      STRING,
      COMMENT_HASH,
      { re: /\b(if|then|else|elif|fi|for|do|done|while|case|esac|function|return|echo|export|source|cd|ls|mkdir|rm|cp|mv|grep|find|sudo|apt|npm|yarn|git|docker)\b/g, cls: 'kw' },
      { re: /(\$[A-Z_][A-Z0-9_]*|\$\{[^}]+\})/g, cls: 'var' },
      NUMBER,
    ]
  }
  // Para otros lenguajes no reconocidos, devolvemos null (sin highlighting)
  return null
}
</script>

<style scoped>
.note-content { line-height: 1.6; }

/* ── Markdown blocks ── */
.note-md-block { font-size: 13px; color: var(--ds-text-1); word-break: break-word; }

:deep(.md-p) { margin: 0 0 8px; line-height: 1.65; color: var(--ds-text-1); }
:deep(.md-spacer) { height: 6px; }

:deep(.md-h1) { font-size: 18px; font-weight: 700; margin: 16px 0 8px; color: var(--ds-text-1); letter-spacing: -0.02em; }
:deep(.md-h2) { font-size: 15px; font-weight: 700; margin: 14px 0 6px; color: var(--ds-text-1); border-bottom: 1px solid var(--ds-border); padding-bottom: 4px; }
:deep(.md-h3) { font-size: 13px; font-weight: 700; margin: 12px 0 4px; color: var(--ds-text-1); }
:deep(.md-h4) { font-size: 11px; font-weight: 600; margin: 10px 0 4px; color: var(--ds-text-2); text-transform: uppercase; letter-spacing: 0.06em; }

:deep(.md-ul), :deep(.md-ol) { margin: 4px 0 10px 0; padding-left: 20px; color: var(--ds-text-1); }
:deep(.md-ul li), :deep(.md-ol li) { margin-bottom: 3px; font-size: 13px; line-height: 1.6; }

:deep(.md-bq) {
  margin: 8px 0; padding: 6px 12px;
  border-left: 3px solid var(--ds-orange);
  background: rgba(249,115,22,0.06);
  border-radius: 0 4px 4px 0;
  color: var(--ds-text-2); font-size: 13px;
}

:deep(.md-hr) { border: none; border-top: 1px solid var(--ds-border-md); margin: 12px 0; }

:deep(.md-inline-code) {
  font-family: 'JetBrains Mono', monospace; font-size: 11.5px;
  background: var(--ds-bg-2); border: 1px solid var(--ds-border-md);
  border-radius: 3px; padding: 1px 5px; color: var(--ds-orange);
}

:deep(.md-link) { color: #38BDF8; text-decoration: none; }
:deep(.md-link:hover) { text-decoration: underline; }

.note-code-block {
  margin: 12px 0;
  border: 1px solid var(--ds-border-md);
  border-radius: var(--ds-radius-sm);
  overflow: hidden;
  background: var(--ds-bg-0);
}

.note-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px;
  background: var(--ds-bg-2);
  border-bottom: 1px solid var(--ds-border);
}

.note-code-lang {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ds-text-3);
  font-family: 'JetBrains Mono', monospace;
}

.note-code-pre {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--ds-text-1);
  background: transparent;
}

/* Colores de tokens */
:deep(.hl-kw)   { color: #C678DD; font-weight: 500; }
:deep(.hl-str)  { color: #98C379; }
:deep(.hl-cmt)  { color: var(--ds-text-3); font-style: italic; }
:deep(.hl-num)  { color: #D19A66; }
:deep(.hl-type) { color: #E5C07B; }
:deep(.hl-prop) { color: #61AFEF; }
:deep(.hl-tag)  { color: #E06C75; }
:deep(.hl-attr) { color: #D19A66; }
:deep(.hl-var)  { color: #56B6C2; }
</style>
