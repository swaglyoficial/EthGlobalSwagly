---
sidebar_position: 3
title: Setup rápido
---

# Setup rápido

Levanta Swagly localmente y prepara las dependencias clave.

## Requisitos

- Node.js 18+ y npm
- PostgreSQL / Supabase
- Claves de Privy (client, paymaster)

## Instalación

```bash
# raíz del repo
npm install

# copiar variables
cp .env.example .env
# completa llaves de DB y Privy

# generar Prisma
npx prisma generate

# levantar en desarrollo (Turbopack)
npm run dev
```

Scripts disponibles (`package.json`):

- `npm run dev` — Next.js con Turbopack.
- `npm run build` — `prisma generate` + `next build`.
- `npm run start` — modo producción.
- `npm run generate-icons` — genera íconos PWA desde `public/images/LogoSwagly.png`.
- Ajustes multichain: `config/thirdweb.tsx` define Scroll (534352) y la dirección de TOKEN; actualiza si sumas redes.

## Estructura relevante

- `src/app/**` — páginas App Router.
- `src/components/**` — UI (e.g. `connect-button`, `pwa-provider`, `bottom-navigation`).
- `public/images/**` — assets de marca.
- `scripts/generate-pwa-icons.js` — automatiza íconos PWA.

## Variables de entorno (referencia)

- `NEXT_PUBLIC_APP_URL` — URL pública (usada en metadata/OG).
- Credenciales Privy: clientId, secret, paymaster.
- DB: `DATABASE_URL` (PostgreSQL/Supabase).

## Checks rápidos

- Ejecuta `npm run dev` y abre `http://localhost:3000`.
- Verifica en consola que PWA loguee `[PWA] Service Worker registrado exitosamente`.
- Confirma que el header muestre logo + botón “Conectar”.
