# 🔐 Guía de Setup y Pruebas - Sistema de Attestations

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración](#configuración)
3. [Verificar Permisos](#verificar-permisos)
4. [Ejecutar Pruebas](#ejecutar-pruebas)
5. [Integración Completa](#integración-completa)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

### Contratos Desplegados

✅ **Contrato SwaglyAttestations** desplegado en Scroll Testnet
- Dirección del contrato: `__________________` (completar)
- Network: Scroll Sepolia (Chain ID: 534351)
- Explorer: https://sepolia.scrollscan.com/

### Wallets Necesarias

✅ **Wallet Attestor**: `0x645ac03f1db27080a11d3f3a01030c455c7021bd`
- Debe tener rol de ATTESTOR en el contrato
- Debe tener ETH en Scroll Testnet para gas
- **Private key requerida** (nunca compartir)

### Dependencias

```bash
npm install viem
npm install -D tsx
```

---

## ⚙️ Configuración

### Paso 1: Variables de Entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.attestations.example .env.local
```

Edita `.env.local` y completa:

```env
# Dirección del contrato SwaglyAttestations en Scroll Testnet
NEXT_PUBLIC_ATTESTATIONS_CONTRACT_ADDRESS=0x________________

# Chain ID de Scroll Testnet
NEXT_PUBLIC_ATTESTATIONS_CHAIN_ID=534351

# Private key de la wallet attestor (0x645ac03f...)
ATTESTOR_WALLET_PRIVATE_KEY=0x________________

# Address de la wallet attestor
ATTESTOR_WALLET_ADDRESS=0x645ac03f1db27080a11d3f3a01030c455c7021bd
```

### Paso 2: Configurar Rol de Attestor

Si aún no has dado permisos de attestor a tu wallet, necesitas llamar a la función `addAttestor` del contrato.

**Opción A: Desde Etherscan/Scrollscan**

1. Ve a https://sepolia.scrollscan.com/address/TU_CONTRATO_ADDRESS#writeContract
2. Conecta la wallet OWNER del contrato
3. Llama a función `addAttestor`:
   - `_attestor`: `0x645ac03f1db27080a11d3f3a01030c455c7021bd`
4. Confirma la transacción

**Opción B: Usando script (próximamente)**

```bash
npx tsx scripts/setup-attestor.ts
```

---

## 🔍 Verificar Permisos

### Verificar que el contrato está desplegado

```bash
# En Scrollscan
https://sepolia.scrollscan.com/address/TU_CONTRATO_ADDRESS
```

Debe mostrar:
- ✅ Bytecode del contrato
- ✅ Funciones del contrato
- ✅ Eventos emitidos (si ya hay attestations)

### Verificar que la wallet tiene ETH

La wallet attestor necesita ETH en Scroll Testnet para pagar gas.

**Faucets de Scroll Testnet:**
- https://sepolia.scroll.io/faucet
- https://faucet.quicknode.com/scroll/sepolia

**Verificar balance:**
```bash
https://sepolia.scrollscan.com/address/0x645ac03f1db27080a11d3f3a01030c455c7021bd
```

---

## 🧪 Ejecutar Pruebas

### Test Suite Completo

Ejecuta el script de pruebas automatizado:

```bash
npx tsx scripts/test-attestations.ts
```

Este script ejecuta 6 tests:

1. ✅ **Verificar contrato desplegado** - Verifica que el contrato existe
2. ✅ **Verificar rol de attestor** - Comprueba la wallet attestor
3. ✅ **Crear attestation de actividad** - Prueba `attestActivityCompletion()`
4. ✅ **Crear attestation de proof** - Prueba `attestProofValidation()`
5. ✅ **Leer attestations** - Prueba `getUserAttestations()`
6. ✅ **Verificar actividad completada** - Prueba `isActivityCompleted()`

### Salida Esperada

```
╔═══════════════════════════════════════════════════════════╗
║  🧪 SUITE DE PRUEBAS DE ATTESTATIONS - SWAGLY          ║
╚═══════════════════════════════════════════════════════════╝

Configuración:
  Network: Scroll Sepolia Testnet
  Chain ID: 534351
  Contrato: 0x...
  Explorer: https://sepolia.scrollscan.com/address/0x...

============================================================
TEST 1: Verificar que el contrato está desplegado
============================================================
✅ Contrato encontrado en: 0x...
   Bytecode length: 12345

============================================================
TEST 2: Verificar que la wallet tiene rol de attestor
============================================================
📧 Wallet attestor: 0x645ac03f1db27080a11d3f3a01030c455c7021bd

============================================================
TEST 3: Crear attestation de actividad
============================================================
Enviando transacción...
✅ Transacción enviada: 0x...
   Esperando confirmación...
✅ Transacción confirmada en bloque: 123456
   Gas usado: 150000
   Explorer: https://sepolia.scrollscan.com/tx/0x...
   UID de attestation: 0x...

[... más tests ...]

============================================================
RESUMEN DE PRUEBAS
============================================================
Total: 6
Exitosas: 6
Fallidas: 0

🎉 ¡TODAS LAS PRUEBAS PASARON!
```

---

## 🔗 Integración Completa

### Flujo de Scans NFC/QR

Cuando un usuario escanea merch:

1. **Frontend** envía request a `/api/scans`
2. **Backend** valida y registra scan en BD
3. **Backend** envía tokens usando Thirdweb
4. **Backend** crea attestation on-chain ✨ (NUEVO)
5. **Usuario** recibe confirmación con:
   - Transaction hash de tokens
   - UID de attestation
   - Links a explorers

**Código en:** `src/app/api/scans/route.ts`

```typescript
// Después de enviar tokens exitosamente...
const attestation = await attestActivityCompletion({
  recipient: walletAddress,
  eventId: nfc.eventId,
  activityId: nfc.activityId,
  tokensAwarded: nfc.activity.numOfTokens,
  scanType: 'nfc',
  activityName: nfc.activity.name
})

console.log('✅ Attestation creada:', attestation.uid)
```

### Flujo de Proof Validation

Cuando un admin aprueba evidencia:

1. **Admin** aprueba proof en dashboard
2. **Backend** envía tokens al usuario
3. **Backend** actualiza estado en BD
4. **Backend** crea attestation on-chain ✨ (NUEVO)
5. **Usuario** ve aprobación con attestation UID

**Código en:** `src/app/api/admin/proofs/[id]/approve/route.ts`

```typescript
// Después de aprobar proof y enviar tokens...
const attestation = await attestProofValidation({
  recipient: proof.user.walletAddress,
  activityId: proof.activityId,
  proofId: proof.id,
  proofType: proof.type,
  approved: true,
  tokensAwarded: proof.activity.numOfTokens
})

console.log('✅ Proof attestation creada:', attestation.uid)
```

---

## 🐛 Troubleshooting

### Error: "Not attestor"

**Problema:** La wallet no tiene permisos de attestor

**Solución:**
1. Ve al contrato en Scrollscan
2. Conecta la wallet OWNER
3. Llama a `addAttestor(0x645ac03f1db27080a11d3f3a01030c455c7021bd)`

### Error: "Insufficient funds"

**Problema:** La wallet attestor no tiene ETH para gas

**Solución:**
1. Ve a faucet: https://sepolia.scroll.io/faucet
2. Solicita ETH para `0x645ac03f1db27080a11d3f3a01030c455c7021bd`
3. Verifica balance en Scrollscan

### Error: "Contract not found"

**Problema:** La dirección del contrato es incorrecta

**Solución:**
1. Verifica `NEXT_PUBLIC_ATTESTATIONS_CONTRACT_ADDRESS` en `.env.local`
2. Confirma que el contrato está en Scroll Testnet, no Mainnet
3. Verifica en Scrollscan que existe

### Error: "Activity already attested"

**Problema:** Ya existe una attestation para esa actividad + usuario

**Explicación:** Esto es correcto - el contrato previene duplicados
- Cada usuario solo puede tener UNA attestation por actividad
- Esto evita que reclamen tokens múltiples veces

**Solución:** Este es el comportamiento esperado. No es un error.

### Las attestations se crean pero no veo eventos

**Problema:** Los eventos no aparecen en Scrollscan

**Solución:**
1. Espera unos minutos (indexación puede tardar)
2. Verifica en la pestaña "Events" del contrato
3. Busca eventos `AttestationCreated`

---

## 📊 Monitoreo

### Ver Attestations de un Usuario

```typescript
import { getUserAttestations } from '@/lib/attestations-service'

const attestations = await getUserAttestations('0x...' as `0x${string}`)
console.log(`Usuario tiene ${attestations.length} attestations`)
```

### Ver Detalles de una Attestation

```typescript
import { getAttestation, decodeActivityCompletion } from '@/lib/attestations-service'

const attestation = await getAttestation('0x...' as `0x${string}`)
console.log('Recipient:', attestation.recipient)
console.log('Timestamp:', attestation.timestamp)

// Si es una attestation de actividad
const data = await decodeActivityCompletion(attestation.uid)
console.log('Activity:', data.activityName)
console.log('Tokens:', data.tokensAwarded)
```

### Explorer Links

**Contrato:**
```
https://sepolia.scrollscan.com/address/TU_CONTRATO_ADDRESS
```

**Transacción:**
```
https://sepolia.scrollscan.com/tx/TRANSACTION_HASH
```

**Eventos del contrato:**
```
https://sepolia.scrollscan.com/address/TU_CONTRATO_ADDRESS#events
```

---

## ✅ Checklist Final

Antes de ir a producción:

- [ ] Contrato desplegado en Scroll Testnet
- [ ] Wallet attestor configurada con rol
- [ ] Wallet attestor tiene ETH para gas
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Script de pruebas ejecutado exitosamente (6/6 passed)
- [ ] Integración de scans funciona
- [ ] Integración de proofs funciona
- [ ] Eventos visibles en Scrollscan
- [ ] Logs de consola muestran UIDs de attestations

---

## 🚀 Próximos Pasos

1. **API de Lectura:** Crear endpoint para ver attestations de un usuario
2. **Dashboard:** Mostrar attestations en el perfil del usuario
3. **Badges:** Crear badges basados en attestations on-chain
4. **Analytics:** Dashboard de attestations por evento/actividad

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la sección de [Troubleshooting](#troubleshooting)
2. Verifica los logs de consola
3. Revisa transacciones en Scrollscan
4. Verifica que todas las variables de entorno estén configuradas

**Recursos:**
- Scroll Testnet Explorer: https://sepolia.scrollscan.com/
- Scroll Faucet: https://sepolia.scroll.io/faucet
- Viem Docs: https://viem.sh/

---

**Última actualización:** 2024
**Versión:** 1.0.0
