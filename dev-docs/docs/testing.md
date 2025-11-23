---
sidebar_position: 10
title: Testing & QA
---

# Testing & QA

## Checks mínimos

- **Web3**: conectar wallet (social + externa), validar chainId 534352, revisar modales y CTA “Conectar” en desktop/mobile.
- **Tokens**: verificar saldo TOKEN y token sponsor en header (`TokenBalance`) y flujos de claim/compra.
- **PWA**: manifest sin errores, SW registrado, prompt de instalación visible, modo offline carga shell básico.
- **Navegación**: header sticky + menú mobile con CTA visible; bottom navigation en mobile.
- **Imágenes**: logos con `h-auto`, `object-contain`; cards con `object-cover` y sin CLS.

## Scripts útiles

- `npm run dev` — smoke manual.
- `npm run build` — valida tipos y bundling.
- `npm run generate-icons` — requerido para PWA antes de release.

## Casos sugeridos (manual/e2e)

- Claim de tokens (TOKEN y sponsor) con paymaster activo.
- Compra en `shop` con imágenes lazy y stock controlado.
- Misiones NFC/QR: scan feliz y manejo de error.
- PWA install + launch desde homescreen.

## Revisión visual

- Ver ambos temas (claro/oscuro); contraste del CTA verde (#B5E86D) y textos principales.
- Gradientes/blur no deben afectar legibilidad de botones y links.
