---
sidebar_position: 11
title: Tokens & Recompensas
---

# Tokens & Recompensas

## TOKEN

- Dirección en Scroll: ver `config/thirdweb.tsx` (`TOKEN_TOKEN_ADDRESS`).
- Uso: recompensas base por misiones, compras o engagement. Visible en `TokenBalance` (headers).
- Gas: operaciones patrocinadas vía paymaster (Privy).

## Token del Sponsor

- Objetivo: campañas especiales paralelas al TOKEN.
- Define: origen de saldo (API/DB o contrato), reglas de earn, expiración y vistas donde se muestra.
- UI: sigue mismo patrón que TOKEN (header, dashboard), con copy diferenciado.

## Flujos principales

- **Claim/rewards**: endpoints `claim-tokens` y `sponsors` manejan emisión; documentar payloads y límites.
- **Compras**: aseguran deducción/uso correcto del token aplicable.
- **Sync**: si el saldo viene de DB, define cron/trigger para reconciliar con cadena cuando aplique.

## Buenas prácticas

- Tabla por red con addresses de tokens y contract ABI referenciados.
- Límite y throttling en claims patrocinados.
- Logs de auditoría para entregas masivas o ajustes manuales.
