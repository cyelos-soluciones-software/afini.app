# Arquitectura — Afini (afini.app)

Documento de referencia técnica. Para agentes de IA, priorizar también `AGENTS.md`.

## 1. Modelo de datos (Prisma)

Entidades principales (ver `prisma/schema.prisma`):

- **User** — `email`, `passwordHash`, `UserRole` (`SUPER_ADMIN` | `CAMPAIGN_ADMIN` | `LEADER`).
- **Campaign** — `slug` único, textos de campaña, `aiContext` para IA, `closingCtaText` opcional, media opcional (`bannerUrl`, `photoUrl`) y cupos: `maxLeaders` y `maxVoters` (freemium por campaña; editable por super admin).
- **CampaignAdmin** — N:N usuario administrador ↔ campaña.
- **LeaderProfile** — `uniqueUrlToken` (segmento URL funnel), `personalInfo` JSON (p. ej. `displayName`).
- **Question** — por campaña: texto pregunta, `officialAnswer`, `geminiContext`, `sortOrder`.
- **Mission** — difusión; **MissionAck** — confirmación por líder.
- **Voter** — por campaña: nombre, teléfono E.164, barrio, `votingIntention`, `latitude`/`longitude` opcionales (WGS84). **@@unique([campaignId, phone])**.
- **Interaction** — `voterId`, `chatLog` JSON (versión 1: qas, conclusión, métricas), `affinityScore`, `sentiment`.
- **AuditLog** — trazas operativas.

## 2. Autenticación y sesión

- `auth.ts`: proveedor Credentials, sesión JWT 7 días, `session.user.id` y `session.user.role`.
- `lib/auth-session.ts`: `requireAuth`, `requireRole` (redirect).
- `types/next-auth.d.ts`: extensión de tipos JWT/session.

## 3. Autorización

| Función | Uso |
|---------|-----|
| `hasCampaignAccess` | Super admin siempre; admin si fila en `CampaignAdmin`; líder si `LeaderProfile` en esa campaña. |
| `canViewCampaignHeatmap` | Solo super admin o `CampaignAdmin` de la campaña (excluye líderes). |

## 4. Funnel ciudadano

### Página

`app/c/[campaignSlug]/[leaderToken]/page.tsx` carga preguntas y pasa props a `FunnelClient`.

### Cliente (`funnel-client.tsx`)

- Estados de paso: intro, questions, contact, streaming, done.
- Teléfono: `react-phone-number-input` + validación `isValidPhoneNumber` + `isStrictE164Format`.
- Streaming: `@ai-sdk/react` `useCompletion` → `POST /api/funnel/stream` con `streamProtocol: "text"`.
- Geolocalización: `lib/citizen-geolocation.ts` antes de iniciar stream.

### API `app/api/funnel/stream/route.ts`

1. `checkFunnelRateLimit`
2. Validación `bodySchema` (Zod): `campaignSlug`, `leaderToken`, `voter`, `answers`
3. Resolución `LeaderProfile` + `Campaign` + preguntas
4. Completitud de respuestas vs IDs requeridos
5. `parseToE164`, comprobación duplicado teléfono
6. `buildFunnelUserPrompt` + `FUNNEL_SYSTEM_PROMPT` → `streamText` (Gemini)
7. `onFinish`: opcional `generateObject` métricas; `prisma.voter.create` + `interactions.create`; `writeAuditLog`

Errores HTTP: 400 validación, 404 líder, 409 duplicado, 429 rate limit, 503 sin API key.

## 5. Dashboard

- **Inicio (`/dashboard`)**:
  - `SUPER_ADMIN`: métricas globales (KPIs + “ciudadanos nuevos por día”) con filtros (30d/1m/2m/3m/personalizado).
  - `CAMPAIGN_ADMIN`: mismas métricas, pero filtradas a campañas donde es creador o está asignado en `CampaignAdmin`.
- **Campaign admin**: listado campañas con filtro y orden por `createdAt desc`, crear campañas sin límite; detalle campaña, CRUD preguntas/misiones/líderes, gráficos (`getCampaignAnalytics`), respuestas paginadas, mapas `/mapa`.
- **Super admin**: listado campañas paginado por servidor con filtro y orden por `createdAt desc`, editar cupos (`maxLeaders`, `maxVoters`) y asignar admins; CRUD de “equipo admin” (usuarios super admin).
- **Leader**: campaña asociada, misiones con ack.

Server Actions concentradas en `app/actions/campaign-manager.ts`, `super-admin.ts`, `leader.ts`, `participant-responses.ts`. Re-export mínimo en `campaign.ts`.

## 6. Export y tablas de respuestas

- `getParticipantResponsesPage` — sin PII nombre/teléfono en filas mostradas; incluye lat/lon si existen.
- `lib/participant-responses-export.ts` — XLSX por lotes; columnas fijas + dinámicas por pregunta.

Ruta API export protegida por misma lógica de acceso a campaña (revisar handler).

## 7. Mapa de calor

- Datos: `getCampaignHeatmapData` — agrupa puntos por `VotingIntention`.
- Datos: `getCampaignHeatmapSentimentData` — agrupa puntos por sentimiento IA (`Interaction.sentiment`) usando la última interacción con sentimiento no nulo por votante.
- UI: `CampaignHeatMapDynamic` (cliente) → `CampaignHeatMap` + `HeatmapLayers` con `createHeatLayer` (`lib/leaflet-heat.ts`).
- UI: `CampaignSentimentHeatMapDynamic` → `CampaignSentimentHeatMap` (capas positivo/neutral/negativo).
- Tiles: OpenStreetMap estándar (atribución obligatoria).

## 8. IA (Gemini)

- `lib/ai/gemini.ts` — resolución de API key y modelo (`GEMINI_MODEL`, default `gemini-flash-latest`).
- Prompt sistema funnel: `lib/prompts/funnel-system.ts` (no exponer al cliente).

## 9. Observabilidad y límites

- `lib/audit.ts` — persistencia best-effort.
- `lib/rate-limit.ts` — Upstash sliding window o Map en memoria por IP.

## 10. Semilla y pruebas locales

`prisma/seed.ts`: usuarios demo (`super@afini.local`, `admin@afini.local`, `lider@afini.local`), campaña demo, preguntas, misión, líder con token fijo. Al final: votantes sin coordenadas reciben puntos aleatorios alrededor de ciudades CO (`lib/colombia-geo-samples.ts`).

## 11. Despliegue

- Requiere HTTPS para geolocalización en navegador (excepto localhost).
- Variables de entorno en hosting deben incluir `AUTH_SECRET`, DB, Gemini, opcional Redis y `NEXT_PUBLIC_APP_URL`.
- SEO básico: `app/sitemap.ts` y `app/robots.ts` generan `sitemap.xml` y `robots.txt`. Se evita indexación de rutas privadas (`/dashboard`, `/api`, `/c/*`).
- Media campañas: Cloudflare R2 (S3 compatible). Ver `.env.example` (variables `R2_*`) y endpoint `POST /api/uploads/r2` para presign (PUT) desde formularios.
