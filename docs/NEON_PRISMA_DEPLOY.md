# Prisma + Neon — aplicar migraciones (release y producción)

Este documento describe **cómo subir cambios de Prisma** (migraciones) a bases de datos **Neon** de forma segura para:

- **Release / staging** (validación previa)
- **Producción**

> Recomendación: **no corras migraciones automáticamente desde el build de Vercel**. Hazlas de forma controlada (manual o pipeline dedicado) para evitar ejecuciones repetidas en previews.

## Requisitos

- Tener el repo actualizado y con migraciones generadas en `prisma/migrations/*`.
- Node.js + dependencias instaladas.
- Connection strings de Neon para:
  - Release
  - Producción

## 1) Generar migración (cuando cambias `schema.prisma`)

En local, crea la migración contra tu DB de desarrollo:

```bash
npx prisma migrate dev --name <nombre_descriptivo>
```

Luego valida:

```bash
npx prisma generate
npm run build
```

Y sube esos cambios a git (`prisma/schema.prisma` + carpeta en `prisma/migrations/...`).

## 2) Aplicar migraciones en Neon (release)

Ejecuta `migrate deploy` apuntando a la URL de release.

### Opción A: exportar `DATABASE_URL` solo para el comando (recomendado)

```bash
DATABASE_URL="postgresql://...NEON_RELEASE..." npx prisma migrate deploy
```

### Opción B: exportar en tu shell (útil, pero cuidado)

```bash
export DATABASE_URL="postgresql://...NEON_RELEASE..."
npx prisma migrate deploy
```

**Verifica** qué URL está usando Prisma:

```bash
printenv DATABASE_URL
```

> Nota: si tienes `DATABASE_URL` exportado, puede “ganarle” a tu `.env`. Para evitar confusiones, usa la opción A.

## 3) Aplicar migraciones en Neon (producción)

Exactamente igual, pero con la URL de producción:

```bash
DATABASE_URL="postgresql://...NEON_PROD..." npx prisma migrate deploy
```

Si devuelve:

- `No pending migrations to apply.` → ya está al día.

## 4) ¿Cuándo correr `prisma generate`?

`prisma generate` genera el cliente de Prisma para **tu código** (Node). En deploy:

- En CI/build normalmente ya corre por `postinstall` o por el script `build` del repo.
- Para aplicar migraciones en Neon, lo crítico es `migrate deploy`. `generate` no afecta el servidor de Neon.

## 5) Flujo recomendado (resumen)

1. Cambias `prisma/schema.prisma`.
2. `npx prisma migrate dev --name ...` (local).
3. `npm run build` (verifica types y Next build).
4. `git push` (migración versionada).
5. Aplicar en **release**:
   - `DATABASE_URL="...release..." npx prisma migrate deploy`
6. Aplicar en **producción**:
   - `DATABASE_URL="...prod..." npx prisma migrate deploy`
7. Deploy en Vercel (si tu repo está conectado, el push/merge lo dispara).

## 6) Checklist de seguridad

- No comitear `.env`.
- Rotar llaves si se exponen por error.
- En Neon, usar SSL (`sslmode=require`).
- Ejecutar migraciones fuera de horas pico si son pesadas.
- Mantener `schema.prisma` y `.env.example` actualizados cuando se agregan columnas/vars nuevas (p. ej. `Campaign.bannerUrl` y variables `R2_*`).

