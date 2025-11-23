---
sidebar_position: 7
title: API & Datos
---

# API & Datos

Swagly expone su backend via Next.js API Routes (`src/app/api`). Usa Prisma + PostgreSQL/Supabase para persistencia.

## Endpoints existentes (carpetas)

`src/app/api/` contiene handlers para:

- `activities`, `events`, `proofs`, `scans`, `nfcs`, `passports` — flujos de misiones/retos.
- `products`, `shop`, `purchases` — catálogo y compras.
- `sponsors`, `sponsored-transfer`, `claim-tokens` — rewards (TOKEN y token sponsor).
- `user`, `users`, `admin`, `analytics` — cuentas, métricas y administración.
- `upload`, `upload-proof-image` — manejo de archivos/evidencias.
- `set-claim-conditions` — configuración de condiciones de claim.

👉 Documenta cada handler con: método, payload esperado, auth requerida, respuesta y errores. Añade ejemplos de curl cuando estén listos.

## Datos y modelos

- Prisma es la fuente de verdad de esquemas (ejecutar `npx prisma generate` para inspeccionar). Documenta los modelos de misiones, usuarios, rewards y compras.
- Registra qué campos afectan UI crítica (ej. saldo TOKEN/token sponsor, estado de misión, stock de producto).

## Contratos y addresses

- TOKEN en Scroll: ver `config/thirdweb.tsx` (TOKEN_TOKEN_ADDRESS).
- Mantén una tabla por red con addresses de contratos usados (tokens, paymaster, cualquier factory).

## Versionado y cambios

- Cada cambio de API debe actualizar su sección aquí (métodos, payloads y side-effects).
- Anexa notas de migración cuando alteres esquemas de DB o contratos.
