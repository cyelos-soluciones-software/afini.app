# Afini — guía para asistentes (Cursor / IA)

Producto **afini.app**: redes de afinidad y movilización digital. Lee este archivo al trabajar en el repo. Complementa con `README.md` (arranque) y `docs/ARCHITECTURE.md` (detalle técnico).

## Qué es el proyecto

Aplicación **Next.js (App Router)** para **crear y evaluar redes de afinidad** en campañas y territorio (p. ej. Colombia):

- **Funnel público** por enlace único por líder: `/c/[campaignSlug]/[leaderToken]` — preguntas abiertas, datos de contacto, **Gemini** genera una conclusión personalizada; se persiste **Voter** + **Interaction** (chatLog JSON, `affinityScore`, `sentiment`).
- **Dashboard** por roles: **SUPER_ADMIN**, **CAMPAIGN_ADMIN**, **LEADER**.
- **Mapas de calor** (Leaflet + OSM + `leaflet.heat`) por campaña: **intención de voto** y **sentimiento (IA)**; acceso solo súper admin y admin de campaña (`canViewCampaignHeatmap`).
- **Inicio con métricas** (`/dashboard`): KPIs + gráfico diario de ciudadanos con filtros (30d/1m/2m/3m/personalizado). Súper admin ve global; admin de campaña ve solo sus campañas.

Idioma de UI: **español**. Comentarios JSDoc y mensajes de error hacia usuario en español cuando aplique.

## Stack

| Área | Tecnología |
|------|------------|
| Framework | Next.js 16, React 19, Turbopack |
| Auth | NextAuth v5 (JWT), Credentials + bcrypt |
| DB | PostgreSQL, Prisma 5 |
| IA | Vercel AI SDK + `@ai-sdk/google` (Gemini) |
| Rate limit funnel | Upstash Redis opcional; fallback en memoria |
| Mapas | `leaflet`, `react-leaflet`, `leaflet.heat` (solo cliente, `dynamic` + `ssr: false`) |
| Teléfono | `libphonenumber-js` + `react-phone-number-input` |
| Gráficos dashboard | Recharts |
| Export respuestas | ExcelJS |
| SEO básico | `metadata` Next, `sitemap.xml`, `robots.txt` |

## Estructura de carpetas (resumen)

```
app/
  api/
    auth/[...nextauth]/     # NextAuth
    funnel/stream/          # POST streaming conclusión + creación Voter (onFinish)
    campaigns/[id]/responses/export/  # XLSX (solo admin campaña)
  c/[campaignSlug]/[leaderToken]/   # Funnel ciudadano (cliente)
  dashboard/                # Paneles por rol
  components/               # UI reutilizable (mapa: campaign-heat-map*.tsx)
  actions/                  # Server Actions ("use server")
lib/
  ai/gemini.ts              # Clave y modelo Gemini
  authz.ts                  # hasCampaignAccess, canViewCampaignHeatmap
  audit.ts                  # writeAuditLog
  funnel-theme.ts           # Tema opcional del embudo por campaña (CSS vars)
  optional-email.ts         # Validación de correo opcional en funnel
  rate-limit.ts             # checkFunnelRateLimit
  phone.ts                  # E.164, parseToE164
  funnel/                   # buildUserPrompt
  prompts/                  # FUNNEL_SYSTEM_PROMPT
  prisma.ts                 # Singleton PrismaClient
prisma/
  schema.prisma
  seed.ts                   # Usuarios demo + backfill geo Colombia en votantes sin lat/lon
auth.ts                     # Config NextAuth
```

## Roles y rutas

- **SUPER_ADMIN**: `/dashboard/super-admin` — CRUD campañas globales, asignar CAMPAIGN_ADMIN. Acceso a cualquier campaña vía `hasCampaignAccess`.
- **CAMPAIGN_ADMIN**: `/dashboard/campaign-admin` — campañas asignadas; preguntas, misiones, líderes, respuestas, mapa.
- **LEADER**: `/dashboard/leader` — su campaña, misiones, enlace funnel; **no** ve mapa de calor ni export con mismo criterio que heatmap.

Control multi-tenant: `lib/authz.ts` + `requireCampaignContext` en `campaign-manager.ts`.

## Flujo funnel (citizen)

1. Cliente: `FunnelClient` — pasos intro → preguntas → contacto (nombre, teléfono E.164, **correo opcional**, barrio, intención).
2. Antes de enviar: `requestCitizenGeolocation()` (opcional); cuerpo incluye `latitude`/`longitude` si hay permiso.
3. `POST /api/funnel/stream` — valida body (Zod), líder+campaña, respuestas completas, teléfono único por campaña, rate limit, Gemini `streamText`; al terminar stream persiste votante + interacción y métricas opcionales (`generateObject`). El correo es opcional y **no** se valida unicidad.

### Dictado por voz (Web Speech API)

En el paso de preguntas del funnel (`app/c/[campaignSlug]/[leaderToken]/funnel-client.tsx`) existe un botón de **dictado por voz**:

- **Compatibilidad**: usa `window.SpeechRecognition` o `window.webkitSpeechRecognition` (graceful degradation: si no hay soporte, no se muestra).
- **UX**: botón circular de micrófono sobre “Siguiente/Continuar”; cambia visualmente al estar escuchando.
- **Idioma**: `es-CO`, `continuous: true`, `interimResults: true`.
- **Código**: hook `hooks/useSpeechRecognition.ts`.

### Lectura de conclusión por voz (Text-to-Speech)

En el paso final del funnel (pantalla de “Gracias por participar”) hay un botón opcional para **leer la conclusión IA en voz alta** usando Web Speech API:

- **Compatibilidad**: usa `window.speechSynthesis` + `SpeechSynthesisUtterance` (si no hay soporte, no se renderiza).
- **Dónde vive**: `components/TextToSpeechButton.tsx`.
- **Lógica**: hook `hooks/useTextToSpeech.ts` (sin autoplay; `speak/pause/resume/stop`, selección de voz `es-CO`/`es-ES`/`es-MX`, cleanup `cancel()` en unmount).
- **Integración**: `app/c/[campaignSlug]/[leaderToken]/funnel-client.tsx` (justo encima del bloque `{completion}`).

### Apariencia por campaña (solo funnel `/c/...`)

- **Tema configurable por campaña**: `Campaign.funnelTheme` (JSON) permite sobrescribir variables CSS (`--background`, `--foreground`, `--muted`, `--border`, `--surface`, `--primary`, `--primary-foreground`) **solo** en el embudo público.
- **Dónde se aplica**: `app/c/[campaignSlug]/[leaderToken]/layout.tsx`.
- **Dónde se configura**: panel de admin de campaña y súper admin (sección “Colores del embudo ciudadano”).
- **Privacidad**: en el paso “Tus datos”, el enlace a `/privacidad` se abre en **nueva pestaña** para no perder avances del formulario.

Errores cliente stream: `lib/funnel-stream-error.ts` (`parseFunnelStreamError`).

## Variables de entorno

Ver `.env.example`. Críticas: `DATABASE_URL`, `AUTH_SECRET`, clave Gemini (`GOOGLE_GENERATIVE_AI_API_KEY` o `GEMINI_API_KEY`), opcional `NEXT_PUBLIC_APP_URL`, Upstash para rate limit.

### Cloudflare R2 (imágenes de campaña)

- `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- Se usan para subir **banner** y **foto** opcionales de cada campaña.

## Freemium / límites (por campaña)

- Por defecto, una campaña creada por un **administrador de campaña** inicia con:
  - **Máximo de líderes**: 1 (`FREE_TIER_MAX_LEADERS_PER_CAMPAIGN`)
  - **Máximo de ciudadanos**: 25 (`FREE_TIER_MAX_VOTERS_PER_CAMPAIGN`)
- El **SUPER_ADMIN** puede ajustar por campaña:
  - `Campaign.maxLeaders`
  - `Campaign.maxVoters`
- En el funnel, si hay “presupuesto Premium” para la campaña (ver `campaignHasPremiumVoterBudget`), el tope de ciudadanos no aplica; para líderes, la UI y acción de crear líder respetan el cupo cuando no hay Premium.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` / `start` — producción
- `npm run db:migrate` — Prisma migrate
- `npm run db:seed` — semilla + **relleno de coordenadas de prueba** en votantes sin geo (Colombia)

## Convenciones de código

- **JSDoc/TSDoc** en funciones exportadas y módulos de dominio (`lib/`, `app/actions/`, rutas `app/api`, `auth.ts`): `@param`, `@returns`, `@remarks`, `@internal` para helpers; `@module` en archivos de acciones; `@packageDocumentation` en módulos `lib` cohesivos.
- **Server Actions** en `app/actions/*`; no exponer secretos al cliente.
- **Mapa Leaflet**: gradientes sin clave entera `1` en objetos (usar `0.99`) — ver comentario en `campaign-heat-map.tsx` / incidente `IndexSizeError` con `simpleheat`.
- Cambios de esquema: migración Prisma + actualizar tipos y cualquier export/reporte.

## Puntos sensibles

- **Teléfono**: único `(campaignId, phone)` en E.164; validación doble `libphonenumber` + regex en `lib/phone.ts`.
- **Auditoría**: `writeAuditLog` no debe romper el flujo principal (try/catch interno).
- **Heatmap datos**: solo coordenadas en BD; privacidad — documentado en UI.
- **SEO / indexación**: `robots.txt` bloquea `/dashboard`, `/api` y `/c/*` para evitar indexación de áreas privadas.
- **Uploads**: las imágenes de campaña se suben a R2 vía URL firmada (PUT) y se guardan como URL pública en `Campaign.bannerUrl` y `Campaign.photoUrl`.

## Dónde ampliar contexto

- `docs/ARCHITECTURE.md` — modelo de datos, APIs, diagrama de flujo textual.
- `README.md` — instalación y enlaces rápidos.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js en este repo

Esta versión de Next puede diferir del material de entrenamiento. Ante APIs dudosas, consulta la guía en `node_modules/next/dist/docs/` o la documentación oficial de la versión del `package.json`.
<!-- END:nextjs-agent-rules -->
