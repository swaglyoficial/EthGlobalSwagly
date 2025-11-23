# 🚀 Quick Start - Attestations en Swagly

## ✅ Configuración Completada

Tu sistema de attestations ya está integrado! Aquí está todo lo que se configuró:

### 📁 Archivos Creados

1. **Configuración**
   - `src/lib/attestations-config.ts` - Configuración del contrato y ABI
   - `src/lib/attestations-service.ts` - Servicio para interactuar con el contrato

2. **Integraciones**
   - `src/app/api/scans/route.ts` - ✨ Attestations de scans NFC/QR
   - `src/app/api/admin/proofs/[id]/approve/route.ts` - ✨ Attestations de proof validation

3. **Testing**
   - `scripts/test-attestations.ts` - Suite completa de pruebas
   - `ATTESTATIONS_SETUP.md` - Guía detallada de setup

4. **Configuración**
   - `.env.local.attestations` - Variables de entorno configuradas
   - `.env.attestations.example` - Template de ejemplo

---

## 🎯 Información del Contrato

```
Contrato: SwaglyAttestations
Dirección: 0xA9fdE7d55Fbc7fD94e361A63860E650521000595
Network: Scroll Sepolia Testnet
Chain ID: 534351
Explorer: https://sepolia.scrollscan.com/address/0xA9fdE7d55Fbc7fD94e361A63860E650521000595
```

### Wallet Attestor

```
Address: 0x645ac03f1db27080a11d3f3a01030c455c7021bd
Rol: ATTESTOR en el contrato
Necesita: ETH en Scroll Sepolia para gas
```

---

## 🧪 Cómo Probarlo (3 pasos)

### Paso 1: Copiar Variables de Entorno

```bash
# Copia la configuración a tu .env.local
cat .env.local.attestations >> .env.local
```

O manualmente agrega a tu `.env.local`:

```env
NEXT_PUBLIC_ATTESTATIONS_CONTRACT_ADDRESS=0xA9fdE7d55Fbc7fD94e361A63860E650521000595
NEXT_PUBLIC_ATTESTATIONS_CHAIN_ID=534351
ATTESTOR_WALLET_PRIVATE_KEY=8382d8938c0c3559781b57804c9c67343b6e0e5b483e5fc8478d36fdf8e7f7675
ATTESTOR_WALLET_ADDRESS=0x645ac03f1db27080a11d3f3a01030c455c7021bd
```

### Paso 2: Instalar Dependencias (si es necesario)

```bash
npm install viem
npm install -D tsx
```

### Paso 3: Ejecutar Tests

```bash
npx tsx scripts/test-attestations.ts
```

**Salida esperada:**

```
╔═══════════════════════════════════════════════════════════╗
║  🧪 SUITE DE PRUEBAS DE ATTESTATIONS - SWAGLY          ║
╚═══════════════════════════════════════════════════════════╝

============================================================
TEST 1: Verificar que el contrato está desplegado
============================================================
✅ Contrato encontrado en: 0xA9fdE7d55Fbc7fD94e361A63860E650521000595

============================================================
TEST 3: Crear attestation de actividad
============================================================
✅ Transacción enviada: 0x...
✅ Transacción confirmada en bloque: 123456
   Explorer: https://sepolia.scrollscan.com/tx/0x...

============================================================
RESUMEN DE PRUEBAS
============================================================
Total: 6
Exitosas: 6
Fallidas: 0

🎉 ¡TODAS LAS PRUEBAS PASARON!
```

---

## ✨ ¿Qué Hace el Sistema?

### 1. Attestations de Scans NFC/QR

Cuando un usuario escanea merch con NFC o QR:

```
User scans NFC → API validates → Send tokens → Create attestation on-chain ✨
```

**Código en:** `src/app/api/scans/route.ts`

**Resultado:**
- ✅ Scan registrado en base de datos
- ✅ Tokens enviados a la wallet del usuario
- ✅ **Attestation creada en blockchain** (nuevo!)
- ✅ UID de attestation disponible para verificación

### 2. Attestations de Proof Validation

Cuando un admin aprueba evidencia enviada por usuarios:

```
Admin approves proof → Send tokens → Update DB → Create attestation on-chain ✨
```

**Código en:** `src/app/api/admin/proofs/[id]/approve/route.ts`

**Resultado:**
- ✅ Proof marcada como aprobada
- ✅ Tokens enviados al usuario
- ✅ **Attestation de validación creada** (nuevo!)
- ✅ Historial inmutable on-chain

---

## 🔍 Verificar Attestations

### Ver en Blockchain Explorer

```bash
# Ver contrato y eventos
https://sepolia.scrollscan.com/address/0xA9fdE7d55Fbc7fD94e361A63860E650521000595#events
```

Busca eventos:
- `AttestationCreated` - Cuando se crea una attestation
- `AttestationRevoked` - Cuando se revoca una (si es necesario)

### Leer Attestations Programáticamente

```typescript
import { getUserAttestations, getAttestation } from '@/lib/attestations-service'

// Obtener todas las attestations de un usuario
const uids = await getUserAttestations('0x...')
console.log(`Usuario tiene ${uids.length} attestations`)

// Ver detalles de una attestation específica
const attestation = await getAttestation(uids[0])
console.log('Tipo:', attestation.attestationType)
console.log('Fecha:', new Date(Number(attestation.timestamp) * 1000))
```

---

## 🎮 Flujo End-to-End

### Escenario: Usuario Escanea Merch

1. **Frontend:** Usuario escanea NFC con su teléfono
   ```typescript
   POST /api/scans
   {
     userId: "uuid",
     nfcId: "uuid",
     walletAddress: "0x..."
   }
   ```

2. **Backend Valida:**
   - ✅ NFC existe y no fue escaneado antes
   - ✅ Usuario tiene pasaporte activo

3. **Backend Envía Tokens:**
   - ✅ Llama a Thirdweb API
   - ✅ Usuario recibe X tokens SWAG
   - ✅ Transaction hash: `0xabc123...`

4. **Backend Crea Attestation:** ✨
   - ✅ Llama a `attestActivityCompletion()` en blockchain
   - ✅ Registra: eventId, activityId, tokens, timestamp
   - ✅ Attestation UID: `0xdef456...`

5. **Frontend Muestra Resultado:**
   ```json
   {
     "success": true,
     "tokens": 10,
     "transactionHash": "0xabc123...",
     "attestation": {
       "uid": "0xdef456...",
       "txHash": "0x789...",
       "explorerUrl": "https://sepolia.scrollscan.com/tx/0x789..."
     }
   }
   ```

---

## 🛠️ Troubleshooting Rápido

### ❌ Error: "Not attestor"

La wallet no tiene permisos. Solución:

1. Ir a Scrollscan: https://sepolia.scrollscan.com/address/0xA9fdE7d55Fbc7fD94e361A63860E650521000595#writeContract
2. Conectar wallet OWNER del contrato
3. Llamar a `addAttestor("0x645ac03f1db27080a11d3f3a01030c455c7021bd")`

### ❌ Error: "Insufficient funds"

La wallet no tiene ETH para gas. Solución:

1. Ir a faucet: https://sepolia.scroll.io/faucet
2. Pedir ETH para `0x645ac03f1db27080a11d3f3a01030c455c7021bd`
3. Esperar confirmación

### ❌ Error: "Activity already attested"

**Esto es correcto!** El contrato previene duplicados.
- Cada usuario solo puede tener UNA attestation por actividad
- No es un bug, es una feature de seguridad

---

## 📊 Próximos Pasos (Opcionales)

### 1. API para Leer Attestations

Crear endpoint para ver historial on-chain de un usuario:

```typescript
// src/app/api/attestations/[address]/route.ts
export async function GET(request, { params }) {
  const { address } = params
  const attestations = await getUserAttestations(address)
  return NextResponse.json({ attestations })
}
```

### 2. Dashboard de Usuario

Mostrar attestations en el perfil:

```typescript
// En el perfil del usuario
const attestations = await fetch(`/api/attestations/${walletAddress}`)
const data = await attestations.json()

// Mostrar badges por cada attestation verificada
```

### 3. Analytics

Dashboard de admin para ver:
- Total de attestations creadas
- Actividades más populares
- Progreso de usuarios verificado on-chain

---

## 🎉 ¡Listo!

Tu sistema de attestations ya está funcionando. Ahora cada actividad completada y cada proof aprobada quedan registradas de forma inmutable en blockchain.

### Beneficios:

✅ **Transparencia:** Historial público y verificable
✅ **Inmutabilidad:** No se pueden alterar registros
✅ **Prevención de Fraude:** Detecta duplicados automáticamente
✅ **Portabilidad:** Los usuarios pueden demostrar sus logros en cualquier app
✅ **Interoperabilidad:** Otros contratos pueden leer las attestations

---

## 📞 Soporte

Para más detalles, consulta:
- 📖 **Guía Completa:** `ATTESTATIONS_SETUP.md`
- 🧪 **Script de Tests:** `scripts/test-attestations.ts`
- 🔍 **Explorer:** https://sepolia.scrollscan.com/

---

**Happy Building! 🚀**
