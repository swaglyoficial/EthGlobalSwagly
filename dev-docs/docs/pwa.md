---
sidebar_position: 6
title: PWA & mobile
---

# PWA & mobile

La PWA está lista; solo necesitas generar íconos con el logo de Swagly.

## Estado actual

- Manifest configurado (`public/manifest.webmanifest`) con shortcuts a Eventos, Tienda y Perfil.
- Service worker en `public/sw.js` con network-first para HTML y stale-while-revalidate para assets.
- Metadata PWA en `src/app/layout.tsx` (theme color, apple web app, icons).
- Provider en `src/components/pwa-provider.tsx` registra SW y maneja `beforeinstallprompt` con logs `[PWA]`.

## Generar íconos

Opción recomendada (script):

```bash
npm install sharp --save-dev
npm run generate-icons
```

Genera:

- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`
- `public/icons/apple-touch-icon.png`

Opcional online: PWABuilder / RealFaviconGenerator cargando `public/images/LogoSwagly.png`.

## Checks en desarrollo

1) Abre `http://localhost:3000`  
2) DevTools > Application > Manifest (sin errores)  
3) DevTools > Application > Service Workers (registrado)  
4) Busca en consola:  
```
[PWA] Service Worker registrado exitosamente
[PWA] PWA puede ser instalada. Guardando prompt para después.
```

## UX móvil

- Header sticky con fondo `bg-black/60` + blur; CTA “Conectar” visible en desktop y mobile.
- Dropdown mobile incluye CTA verde `#B5E86D` + navegación.
- `bottom-navigation.tsx` cubre accesos rápidos en mobile.
