---
sidebar_position: 12
title: Operación y QA
---

# Operación y QA

Checklist para mantener Swagly saludable y listo para shipping.

## Build y despliegue

- `npm run build` — ejecuta `prisma generate` + `next build`.
- `npm run start` — servir en modo producción.
- Vercel recomendado; garantiza HTTPS para PWA y soporta Next.js app router.

## Revisión rápida antes de PR

- **Header**: logo + CTA “Conectar” visibles y sin estirar (logos 299x265, `object-contain`, `h-auto`).
- **Navegación**: sticky, menú mobile abre/cierra y CTA presente en dropdown.
- **Imágenes**: dimensiones declaradas, `sizes` ajustadas, `priority` en logos.
- **Web3**: conecta wallet (social/in-app) y verifica chainId Scroll (Privy).
- **PWA**: service worker registrado y manifest válido (ver consola `[PWA]`).

## Observabilidad manual

- Logs `[PWA]` en consola para instalación y SW.
- Revisa consola por errores de conexión (Privy) o viem al conectar.
- Usa DevTools Lighthouse para medir PWA y CLS (imágenes con tamaños).

## Accesibilidad y UX

- Contraste suficiente con paleta: fondo negro + primario `#5061EC` + highlight `#FEE887` + CTA `#B5E86D`.
- Mantén `aria-hidden` en elementos decorativos y focus en CTAs.
- Animaciones ligeras, no bloquean interacción.
