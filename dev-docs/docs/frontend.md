---
sidebar_position: 4
title: Frontend
---

# Frontend

Next.js 16 (App Router) con Tailwind y componentes ligeros. Este stack prioriza carga rápida, PWA y UX móvil.

## Páginas principales

- `src/app/page.tsx` — landing hero.
- `src/app/inicio/page.tsx` — onboarding/tutorial con header sticky y CTA “Conectar”.
- `src/app/shop/page.tsx` — grid de productos, lazy load y efectos.
- `src/app/events/page.tsx` — lista de eventos y misiones.
- `src/app/dashboard/page.tsx` — resumen de actividad.
- `src/app/profile/page.tsx` — perfil y stats.

## Componentes clave

- `connect-button.tsx` — botón de conexión configurado (Privy) con estilos override; acepta `label` y `styleOverrides`. CTA verde `#B5E86D`.
- `pwa-provider.tsx` — registra service worker, maneja `beforeinstallprompt` y loggea con prefijo `[PWA]`.
- `bottom-navigation.tsx` — menú inferior móvil.
- `TokenBalance` (en headers) — saldo TOKEN visible en desktop/mobile.

### Props rápidas

- `ConnectButton`: `label?: string`, `styleOverrides?: CSSProperties` para adaptar texto/estilo en navbar, dropdown o hero.
- `TokenBalance`: sin props; consume contexto de usuario para mostrar TOKEN.
- `PWAProvider`: sin props; incluir en layout raíz.
- `bottom-navigation`: usar en vistas mobile-first; links definidos dentro del componente.

## Navegación & header

- Header por página con logo + texto (`LogoSwagly.png` y `TextoLogoSwagly.png`).
- CTA “Conectar” fijo en escritorio y mobile; usa `ConnectButton` con override de color `#B5E86D` y sombra.
- Menú mobile con botón hamburguesa y dropdown; mantener sticky (`position: sticky; top: 0`) y fondo `bg-black/60` con blur.

## Estilos y colores

- Primario: `#5061EC`
- Highlight: `#FEE887`
- CTA (wallet): `#B5E86D`
- Fondo: negro/carbono con `backdrop-blur` y gradientes en headers.
- Imágenes con `object-contain` (logos) y `object-cover` (cards). Usa `priority` para logos y `sizes` responsive para evitar CLS.

## Buenas prácticas aplicadas

- Dynamic imports en modales/dialogs para reducir bundle.
- `next/font` con Inter (display `swap`) para eliminar FOIT.
- `sizes` y dimensiones explícitas en imágenes.
- Animaciones leves (`tw-animate`, gradientes) sin bloquear render.
