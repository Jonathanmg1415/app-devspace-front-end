# DevSpace Frontend (Vue 3 + Quasar)

App Quasar CLI (Vite), estado con Pinia, Vue Router 4. Deploy en Vercel.

## Run / build
`quasar dev`, `quasar build`, `eslint --ext .js,.vue src/` (scripts en package.json: `dev`, `build`, `lint`).

## Estructura (`src/`)
- `boot/`: `axios.js`, `i18n.js`, `components.js`
- `components/`: compartidos + subcarpetas `cards/`, `tasks/`
- `composables/loader.js`: overlay de carga global
- `layouts/`: `AuthLayout.vue`, `MainLayout.vue`
- `pages/`: una carpeta por feature — activity, auth, calendar, cards, changelog, commands, errors, files, links, notes, profile, projects, search, tasks
- `router/index.js`: `setupRouterGuards`, gatea rutas con `meta.requiresAuth`
- `stores/` (Pinia, 13): auth, theme, projects, tasks, notes, links, commands, files, cards, comments, members, events, notifications, search
- `services/`: vacío por ahora
- `utils/routeId.js`: `encodeId`/`decodeId` — codifica IDs numéricos en base64url para las rutas (ej. `/projects/1/tasks` → `/projects/MQ/tasks`); `decodeId` también acepta strings numéricos planos por compatibilidad hacia atrás

## Auth
- JWT en `localStorage` bajo `devspace_token`; `stores/auth.js` mantiene token/user.
- `boot/axios.js`: inyecta header `Authorization`, maneja 401 (limpia token, redirige a `/auth/login`, excepto en llamadas a `/auth/me`).

## Todas las llamadas API llevan prefijo `/api`
La instancia axios usa `baseURL` = solo el host (`VITE_API_BASE_URL`); cada llamada agrega `/api/...` a mano (ej. `api.get('/api/projects')`). Esto coincide con el prefijo global `/api` que el backend aplica a todas sus rutas (ver `app-devspace-back-end/CLAUDE.md`) — confirmado correcto, no es un bug.

## Keep-alive
`boot/axios.js` pinguea `/api/health` cada 10 min para evitar que Render duerma el backend en el free tier. Ruta confirmada correcta.

## Theming
- Dark/light/system: `localStorage` key `devspace_dark`, manejado en `layouts/MainLayout.vue`, inicializado en `main.js` vía `Dark.set()` de Quasar.
- Color de acento: aparte, en `stores/theme.js` (16 presets, persiste `devspace_accent`).

## PWA
`quasar.config.js` bloque `pwa` (manifest inline, `swFilename: sw.js`, `workboxMode: generateSW`); `src-pwa/register-service-worker.js`.

## Deploy
Vercel (ver CLAUDE.md raíz para la postura de seguridad sobre acciones MCP en Vercel).
