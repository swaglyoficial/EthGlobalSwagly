---
sidebar_position: 8
title: Deploy & Runbook
---

# Deploy & Runbook

## Prerrequisitos

- Node 18+ y npm.
- Base de datos PostgreSQL/Supabase (`DATABASE_URL`).
- Credenciales de wallet provider (Privy) y paymaster.
- `NEXT_PUBLIC_APP_URL` para metadata/PWA.
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` (usar hasta renombrar a credencial de Privy en código).

## Build y despliegue

```bash
npm install
npx prisma generate
npm run build
```

- Vercel recomendado: variables en dashboard, habilita Edge runtime si procede.
- PWA: genera íconos con `npm run generate-icons` después de subir `public/images/LogoSwagly.png`.

## Checklist pre-release

- `npm run build` sin errores.
- Revisar `.env` en entorno: DB, credenciales Privy, URL pública, ids de paymaster.
- Verificar service worker/manifest cargan en preview (`/manifest.webmanifest`, consola `[PWA]`).
- Confirmar cadenas activas (Scroll) y addresses en `config/thirdweb.tsx` (TOKEN_TOKEN_ADDRESS).

## Runbook rápido

- **Conexión fallida de wallet**: revisar logs del provider (Privy), chainId esperado (534352), y credenciales env.
- **Errores de API**: chequea rutas en `src/app/api/**` y logs de Vercel; valida `DATABASE_URL`.
- **PWA no instala**: limpiar caché, confirmar `public/sw.js` servido y manifest sin errores.
- **Tokens no actualizan**: revisar endpoints de `sponsors`/`claim-tokens` y origen de saldo TOKEN/token sponsor en DB/contrato.
