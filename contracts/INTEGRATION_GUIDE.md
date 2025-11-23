# 🔗 Guía de Integración con Backend

## Cómo Usar el Contrato desde tu Backend Node.js/Next.js

Una vez que hayas desplegado el contrato en Scroll Sepolia, sigue estos pasos para integrarlo con tu aplicación.

---

## 📦 Paso 1: Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Scroll Sepolia Testnet
NEXT_PUBLIC_SCROLL_TESTNET_CHAIN_ID=534351
SCROLL_TESTNET_RPC_URL=https://sepolia-rpc.scroll.io/

# Contrato de Attestations (REEMPLAZA con tu dirección desplegada)
NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS=0xYourContractAddressHere

# Wallet del backend (debe tener rol de attestor)
CREATOR_WALLET_ADDRESS=0xYourBackendWalletAddress
CREATOR_WALLET_PRIVATE_KEY=your_private_key_here
```

---

## 📄 Paso 2: Crear Archivos de Configuración

### **2.1. ABI del Contrato**

Crea: `src/lib/attestation-abi.ts`

```typescript
export const ATTESTATION_ABI = [
  // Funciones de escritura
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "bytes32", name: "eventId", type: "bytes32" },
      { internalType: "bytes32", name: "activityId", type: "bytes32" },
      { internalType: "uint256", name: "tokensAwarded", type: "uint256" },
      { internalType: "string", name: "scanType", type: "string" },
      { internalType: "string", name: "activityName", type: "string" }
    ],
    name: "attestActivityCompletion",
    outputs: [{ internalType: "bytes32", name: "uid", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "bytes32", name: "activityId", type: "bytes32" },
      { internalType: "bytes32", name: "proofId", type: "bytes32" },
      { internalType: "string", name: "proofType", type: "string" },
      { internalType: "bool", name: "approved", type: "bool" },
      { internalType: "uint256", name: "tokensAwarded", type: "uint256" }
    ],
    name: "attestProofValidation",
    outputs: [{ internalType: "bytes32", name: "uid", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "uid", type: "bytes32" },
      { internalType: "string", name: "reason", type: "string" }
    ],
    name: "revoke",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Funciones de lectura
  {
    inputs: [{ internalType: "bytes32", name: "uid", type: "bytes32" }],
    name: "getAttestation",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "uid", type: "bytes32" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "address", name: "attestor", type: "address" },
          { internalType: "uint8", name: "attestationType", type: "uint8" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint256", name: "expirationTime", type: "uint256" },
          { internalType: "bytes32", name: "schemaId", type: "bytes32" },
          { internalType: "bytes", name: "data", type: "bytes" }
        ],
        internalType: "struct SwaglyAttestations.Attestation",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserAttestations",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "uid", type: "bytes32" }],
    name: "isValid",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "eventId", type: "bytes32" },
      { internalType: "bytes32", name: "activityId", type: "bytes32" },
      { internalType: "address", name: "user", type: "address" }
    ],
    name: "isActivityCompleted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "uid", type: "bytes32" }],
    name: "decodeActivityCompletion",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "eventId", type: "bytes32" },
          { internalType: "bytes32", name: "activityId", type: "bytes32" },
          { internalType: "uint256", name: "tokensAwarded", type: "uint256" },
          { internalType: "string", name: "scanType", type: "string" },
          { internalType: "string", name: "activityName", type: "string" },
          { internalType: "uint256", name: "completedAt", type: "uint256" }
        ],
        internalType: "struct SwaglyAttestations.ActivityCompletionData",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Eventos
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "uid", type: "bytes32" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: true, internalType: "address", name: "attestor", type: "address" },
      { indexed: false, internalType: "uint8", name: "attestationType", type: "uint8" },
      { indexed: false, internalType: "bytes32", name: "schemaId", type: "bytes32" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "AttestationCreated",
    type: "event"
  }
] as const
```

---

### **2.2. Configuración**

Crea: `src/lib/attestation-config.ts`

```typescript
export const ATTESTATION_CONFIG = {
  // Dirección del contrato desplegado
  contractAddress: process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS as `0x${string}`,

  // Chain ID
  chainId: parseInt(process.env.NEXT_PUBLIC_SCROLL_TESTNET_CHAIN_ID || '534351'),

  // RPC URL
  rpcUrl: process.env.SCROLL_TESTNET_RPC_URL || 'https://sepolia-rpc.scroll.io/',

  // Wallet del backend
  backendWallet: process.env.CREATOR_WALLET_ADDRESS as string,
  backendPrivateKey: process.env.CREATOR_WALLET_PRIVATE_KEY as string,
}

// Helper: Convertir string UUID a bytes32
export function stringToBytes32(str: string): `0x${string}` {
  // Opción 1: Si es un UUID, quitar los guiones y agregar padding
  const cleaned = str.replace(/-/g, '')
  const padded = cleaned.padEnd(64, '0')
  return `0x${padded}` as `0x${string}`
}

// Helper: Convertir bytes32 a string UUID
export function bytes32ToString(bytes: string): string {
  return bytes.replace('0x', '').replace(/0+$/, '')
}
```

---

### **2.3. Servicio de Attestations**

Crea: `src/lib/attestation-service.ts`

```typescript
import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import { ATTESTATION_ABI } from './attestation-abi'
import { ATTESTATION_CONFIG, stringToBytes32 } from './attestation-config'

// Definir Scroll Sepolia
const scrollSepolia = defineChain({
  id: 534351,
  name: 'Scroll Sepolia',
  network: 'scroll-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io/'],
    },
    public: {
      http: ['https://sepolia-rpc.scroll.io/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Scrollscan',
      url: 'https://sepolia.scrollscan.com',
    },
  },
})

/**
 * Crear attestation de completación de actividad
 */
export async function createActivityAttestation(data: {
  userAddress: string
  eventId: string
  activityId: string
  tokensAwarded: number
  scanType: 'nfc' | 'qr'
  activityName: string
}) {
  try {
    console.log('🔐 Creating attestation for activity completion...')

    // 1. Crear cuenta desde private key
    const account = privateKeyToAccount(
      ATTESTATION_CONFIG.backendPrivateKey.startsWith('0x')
        ? (ATTESTATION_CONFIG.backendPrivateKey as `0x${string}`)
        : (`0x${ATTESTATION_CONFIG.backendPrivateKey}` as `0x${string}`)
    )

    // 2. Crear clientes
    const publicClient = createPublicClient({
      chain: scrollSepolia,
      transport: http(),
    })

    const walletClient = createWalletClient({
      account,
      chain: scrollSepolia,
      transport: http(),
    })

    // 3. Convertir IDs a bytes32
    const eventIdBytes32 = stringToBytes32(data.eventId)
    const activityIdBytes32 = stringToBytes32(data.activityId)

    console.log('📋 Attestation params:', {
      recipient: data.userAddress,
      eventId: eventIdBytes32,
      activityId: activityIdBytes32,
      tokensAwarded: data.tokensAwarded,
      scanType: data.scanType,
      activityName: data.activityName,
    })

    // 4. Llamar al contrato
    const hash = await walletClient.writeContract({
      address: ATTESTATION_CONFIG.contractAddress,
      abi: ATTESTATION_ABI,
      functionName: 'attestActivityCompletion',
      args: [
        data.userAddress as `0x${string}`,
        eventIdBytes32,
        activityIdBytes32,
        BigInt(data.tokensAwarded),
        data.scanType,
        data.activityName,
      ],
      account,
    })

    console.log('📤 Transaction sent:', hash)

    // 5. Esperar confirmación
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    })

    console.log('✅ Transaction confirmed:', receipt.transactionHash)

    // 6. Extraer UID del evento
    const logs = receipt.logs
    let uid: string | null = null

    // El UID está en el primer topic del evento AttestationCreated
    if (logs && logs.length > 0) {
      uid = logs[0].topics[1] || null
    }

    return {
      success: true,
      uid,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    }
  } catch (error) {
    console.error('❌ Error creating attestation:', error)
    throw error
  }
}

/**
 * Verificar si una actividad ya fue completada
 */
export async function isActivityCompleted(
  eventId: string,
  activityId: string,
  userAddress: string
): Promise<boolean> {
  try {
    const publicClient = createPublicClient({
      chain: scrollSepolia,
      transport: http(),
    })

    const eventIdBytes32 = stringToBytes32(eventId)
    const activityIdBytes32 = stringToBytes32(activityId)

    const isCompleted = await publicClient.readContract({
      address: ATTESTATION_CONFIG.contractAddress,
      abi: ATTESTATION_ABI,
      functionName: 'isActivityCompleted',
      args: [eventIdBytes32, activityIdBytes32, userAddress as `0x${string}`],
    })

    return isCompleted as boolean
  } catch (error) {
    console.error('Error checking activity completion:', error)
    return false
  }
}

/**
 * Obtener todas las attestations de un usuario
 */
export async function getUserAttestations(userAddress: string) {
  try {
    const publicClient = createPublicClient({
      chain: scrollSepolia,
      transport: http(),
    })

    const uids = await publicClient.readContract({
      address: ATTESTATION_CONFIG.contractAddress,
      abi: ATTESTATION_ABI,
      functionName: 'getUserAttestations',
      args: [userAddress as `0x${string}`],
    })

    return uids as string[]
  } catch (error) {
    console.error('Error getting user attestations:', error)
    return []
  }
}
```

---

## 🔌 Paso 3: Integrar con tu API de Scans

Modifica: `src/app/api/scans/route.ts`

Busca la línea **217** (después de que los tokens se envían exitosamente) y agrega:

```typescript
// ========================================
// PASO 7: Crear Attestation On-Chain
// ========================================
try {
  console.log('📝 Creating attestation on-chain...')

  const attestationResult = await createActivityAttestation({
    userAddress: walletAddress,
    eventId: nfc.eventId,
    activityId: nfc.activityId,
    tokensAwarded: nfc.activity.numOfTokens,
    scanType: 'nfc', // o 'qr' dependiendo del método
    activityName: nfc.activity.name,
  })

  console.log('✅ Attestation created:', attestationResult)

  // Guardar UID en la base de datos
  await prisma.scan.update({
    where: { id: scan.id },
    data: {
      attestationUid: attestationResult.uid,
      attestationTx: attestationResult.txHash,
    },
  })

  console.log('💾 Attestation UID saved to database')
} catch (attestationError) {
  // No fallar el scan si la attestation falla
  console.error('⚠️ Error creating attestation (scan still valid):', attestationError)
}
```

No olvides importar al inicio del archivo:

```typescript
import { createActivityAttestation } from '@/lib/attestation-service'
```

---

## 🗄️ Paso 4: Actualizar Schema de Prisma

Agrega campos para guardar el UID de la attestation:

```prisma
model Scan {
  // ... campos existentes
  attestationUid  String?  @map("attestation_uid")
  attestationTx   String?  @map("attestation_tx")
}

model ActivityProof {
  // ... campos existentes
  attestationUid  String?  @map("attestation_uid")
  attestationTx   String?  @map("attestation_tx")
}
```

Luego corre:

```bash
npx prisma generate
npx prisma db push
```

---

## ✅ Paso 5: Probar la Integración

1. **Escanea un NFC o QR** desde tu app

2. **Verifica los logs** en la consola del servidor:
   ```
   📝 Creating attestation on-chain...
   📤 Transaction sent: 0x...
   ✅ Transaction confirmed: 0x...
   💾 Attestation UID saved to database
   ```

3. **Verifica en Scrollscan:**
   - Ve a: https://sepolia.scrollscan.com/
   - Pega el transaction hash
   - Deberías ver el evento `AttestationCreated`

4. **Verifica en la base de datos:**
   ```sql
   SELECT * FROM "Scans" ORDER BY timestamp DESC LIMIT 1;
   ```
   Debe tener `attestation_uid` y `attestation_tx` llenos

---

## 🎨 Paso 6: Mostrar Attestations en el Frontend (Opcional)

Crea un componente para mostrar las attestations del usuario:

```typescript
// src/components/user-attestations.tsx
'use client'

import { useEffect, useState } from 'react'
import { getUserAttestations } from '@/lib/attestation-service'
import { useActiveAccount } from 'thirdweb/react'

export function UserAttestations() {
  const account = useActiveAccount()
  const [attestations, setAttestations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!account?.address) return

    getUserAttestations(account.address)
      .then(setAttestations)
      .finally(() => setLoading(false))
  }, [account?.address])

  if (loading) return <div>Loading attestations...</div>

  return (
    <div>
      <h3>Your On-Chain Attestations</h3>
      <p>Total: {attestations.length}</p>
      <ul>
        {attestations.map((uid) => (
          <li key={uid}>
            <code>{uid}</code>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 🚨 Troubleshooting

### **"Not attestor" error**
Tu wallet del backend no tiene permisos. En Remix:
```
addAttestor(0xYourBackendWallet)
```

### **"Invalid private key"**
Asegúrate de que `CREATOR_WALLET_PRIVATE_KEY` esté en `.env` y comience con `0x`

### **Gas estimation failed**
Verifica que tu wallet del backend tenga ETH en Scroll Sepolia

### **Attestation se crea pero UID es null**
El evento no se parseó correctamente. Verifica los logs de la transacción en Scrollscan.

---

## 📚 Recursos Adicionales

- **Documentación de viem**: https://viem.sh/
- **Scroll Sepolia Explorer**: https://sepolia.scrollscan.com/
- **Remix IDE**: https://remix.ethereum.org/

---

¡Eso es todo! Ahora cada vez que un usuario escanee un NFC/QR, se creará automáticamente una attestation on-chain inmutable. 🎉
