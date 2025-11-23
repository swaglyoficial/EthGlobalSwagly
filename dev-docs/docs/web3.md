---
sidebar_position: 5
title: Web3 Stack
---

# Web3 Stack

Swagly usa Privy + viem para abstraer wallets y patrocinar gas, manteniendo UX sencilla en mobile y desktop.

## Cadenas y contratos

- **Redes**: enfoque multichain con Scroll (Ethereum L2) como primaria.
- **Smart wallets**: Nexus (ERC-4337) via Privy.
- **Paymaster**: patrocina transferencias y permisos (transfer + permit).

| Red               | ChainId | Rol                                    | Estado     |
| ----------------- | ------- | -------------------------------------- | ---------- |
| Scroll Mainnet    | 534352  | Producción (misiones, compras)         | Activa     |
| Ethereum Mainnet  | 1       | Compatibilidad puntual                 | Opcional   |
| Extra L2/Testnets | TBA     | Pilotos / QA multichain                | Configurar |

## Autenticación y conexión

- `connect-button.tsx` configura In-App Wallet (Privy) con login social (Google, Apple, Telegram, Passkey) y wallets Web3.
- Props `label` y `styleOverrides` permiten adaptar el CTA según contexto (hero, navbar, dropdown mobile).
- Tema oscuro para modal de conexión.

## Tokens y balance

- Token TOKEN mostrado con `TokenBalance` en headers.
- Operaciones de compra/claim se ejecutan con gas patrocinado (paymaster).
- Token del sponsor: recompensas paralelas al token TOKEN. Define origen de saldo (API/contrato) y vistas donde se refleja.

## Buenas prácticas

- Mantén el botón de conexión visible (header sticky + mobile dropdown).
- Loguea eventos Web3 críticos para debug (ej. `[PWA]`, conexión).
- Asegura que las direcciones y chainId se lean de config central (configuración Web3 del proyecto).
