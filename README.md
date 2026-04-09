# Afini (`afini.app`)

Plataforma Next.js para **crear y evaluar redes de afinidad**: funnel con IA (Gemini), registro de participantes con geolocalización opcional, paneles por rol, métricas por período y mapas de calor por **intención de voto** y **sentimiento (IA)**.

## Documentación para desarrollo y Cursor

| Documento | Contenido |
|-----------|-----------|
| [**AGENTS.md**](./AGENTS.md) | Contexto del proyecto, stack, carpetas, convenciones — **léelo primero en Cursor**. |
| [**docs/ARCHITECTURE.md**](./docs/ARCHITECTURE.md) | Modelo de datos, APIs, flujos funnel y dashboard. |
| [**docs/README.md**](./docs/README.md) | Índice de esta carpeta. |
| [**docs/NEON_PRISMA_DEPLOY.md**](./docs/NEON_PRISMA_DEPLOY.md) | Cómo aplicar migraciones Prisma en Neon (release y producción). |

## Requisitos

- Node.js 20+
- PostgreSQL (local o remoto)

## Configuración rápida

```bash
cp .env.example .env
# Edita .env: DATABASE_URL, AUTH_SECRET, clave Gemini (ver .env.example)

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Usuarios de prueba tras el seed (contraseña por defecto en `DEV_SEED_PASSWORD`):

- `super@afini.local` — súper administrador  
- `admin@afini.local` — administrador de la campaña demo  
- `lider@afini.local` — líder digital (funnel: `/c/demo/demo-token-1`)

## Scripts npm

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Semilla + coordenadas de prueba (Colombia) en votantes sin geo |
| `npm run db:studio` | Prisma Studio |

## Tecnologías principales

Next.js 16 · React 19 · Prisma · NextAuth · Vercel AI SDK (Google Gemini) · Leaflet / OpenStreetMap · libphonenumber-js

## Licencia y despliegue

Proyecto privado. En producción (`afini.app`): definir `NEXT_PUBLIC_APP_URL`, HTTPS, y variables de `.env.example`.

Un producto de cyelos.com