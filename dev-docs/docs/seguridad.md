---
sidebar_position: 9
title: Seguridad
---

# Seguridad

## Secretos y claves

- Usa variables de entorno para credenciales de wallet provider (Privy), paymaster y DB. Nunca commits.
- Rotar `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` cuando se migre a credencial Privy oficial.

## Acceso y roles

- Admin y endpoints sensibles (`admin`, `analytics`, `set-claim-conditions`, `sponsors`) deben validar auth y rol.
- Define una matriz de permisos: usuario, staff, admin; qué rutas/acciones puede invocar cada uno.

## Red y chains

- Enforce chainId esperado (Scroll 534352) en cliente y servidor.
- Lista blanca de RPCs por entorno para evitar MITM.

## API hardening

- Rate limiting para endpoints públicos (`upload`, `scans`, `proofs`, `claim-tokens`).
- Validación estricta de payload (tipos, longitud, files) y sanitización.
- Logs de auditoría para acciones críticas (claims, compras, cambios de stock, set-claim-conditions).

## Tokens y recompensas

- Documenta fuentes de verdad de saldo TOKEN/token sponsor (DB vs contrato) y sincronización.
- Asegura que las transferencias patrocinadas verifiquen límites, destinatarios y nonces.

## PWA y contenido

- Service worker: evitar cachear endpoints sensibles; usa estrategias network-first para HTML.
- HTTPS obligatorio en producción; verifica que manifest y SW no exponen datos privados.
