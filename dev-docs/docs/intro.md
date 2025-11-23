---
sidebar_position: 1
title: Swagly Docs
---

# Bienvenido a Swagly

Swagly es el pasaporte Web3 para eventos y misiones: conecta tu wallet (o login social), completa retos con NFC/QR y gana merch épica. La app corre sobre Next.js 16 (App Router) con Tailwind, integra Privy para smart wallets y está lista como PWA.

## Qué ofrece

- **Pasaporte + misiones**: onboarding gamificado con retos escaneables (NFC/QR) y tracking de tokens.
- **Cuentas smart**: wallet abstraída (ERC-4337) con login social y gas patrocinado (Privy).
- **Marketplace & recompensas**: tienda de merch y perfil con saldo (`TokenBalance`), badges y stats.
- **Listo para móvil**: diseño responsive, header con logo + botón de conexión y PWA instalable.
- **Tokens**: TOKEN interno para recompensas y puntos de actividad.

## Rutas clave en la app

- Inicio/landing: `src/app/page.tsx` y `src/app/inicio/page.tsx`
- Tienda: `src/app/shop/page.tsx`
- Eventos: `src/app/events/page.tsx`
- Dashboard/Perfil: `src/app/dashboard/page.tsx`, `src/app/profile/page.tsx`
- Provider PWA: `src/components/pwa-provider.tsx`
- Botón de conexión: `src/components/connect-button.tsx`

## Paleta y branding

- Azul primario `#5061EC`
- Amarillo highlight `#FEE887`
- Verde CTA (wallet) `#B5E86D`
- Fondo preferido: negro/carbono con blur y degradados.
- Logos: `static/img/LogoSwagly.png` y `static/img/TextoLogoSwagly.png`

## Cómo leer esta documentación

1. Empieza en **Visión & Arquitectura** para entender el producto.
2. Sigue con **Setup rápido** para levantar el entorno.
3. Consulta **Frontend** y **Web3** para integrar nuevas features.
4. Revisa **PWA & mobile** antes de tocar assets o service workers.
