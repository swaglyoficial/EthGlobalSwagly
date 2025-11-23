/**
 * ============================================
 * SERVICIO DE ATTESTATIONS
 * ============================================
 *
 * Este archivo contiene todas las funciones para interactuar
 * con el contrato SwaglyAttestations usando Viem.
 *
 * IMPORTANTE: Este archivo debe usarse SOLO en el backend (API routes)
 * ya que usa la private key del attestor.
 */

import { createWalletClient, createPublicClient, http, parseEther, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { scrollSepolia } from 'viem/chains'
import {
  ATTESTATIONS_CONTRACT_ADDRESS,
  ATTESTATIONS_ABI,
  AttestationType,
  type Attestation,
  type ActivityCompletionData,
  type ProofValidationData,
} from './attestations-config'

// ============================================
// CONFIGURACIÓN DEL CLIENTE
// ============================================

/**
 * Chain de Scroll Testnet
 */
const chain = scrollSepolia

/**
 * Cliente público para operaciones de lectura
 */
export const publicClient = createPublicClient({
  chain,
  transport: http()
})

/**
 * Obtener la private key del attestor desde variables de entorno
 */
function getAttestorPrivateKey(): `0x${string}` {
  const privateKey = process.env.ATTESTOR_WALLET_PRIVATE_KEY

  if (!privateKey) {
    throw new Error('ATTESTOR_WALLET_PRIVATE_KEY no está configurada en .env.local')
  }

  // Asegurar que tenga el prefijo 0x
  return privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`
}

/**
 * Crear cliente de wallet para el attestor
 */
function createAttestorWalletClient() {
  const privateKey = getAttestorPrivateKey()
  const account = privateKeyToAccount(privateKey)

  return createWalletClient({
    account,
    chain,
    transport: http()
  })
}

// ============================================
// FUNCIONES DE LECTURA
// ============================================

/**
 * Obtener una attestation por su UID
 * @param uid - UID de la attestation
 * @returns Attestation completa
 */
export async function getAttestation(uid: `0x${string}`): Promise<Attestation | null> {
  try {
    const data = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'getAttestation',
      args: [uid]
    })

    // Si el UID es 0x0, no existe
    if (data.uid === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null
    }

    return data as Attestation
  } catch (error) {
    console.error('Error al obtener attestation:', error)
    return null
  }
}

/**
 * Obtener todas las attestations de un usuario
 * @param userAddress - Dirección del usuario
 * @returns Array de UIDs de attestations
 */
export async function getUserAttestations(userAddress: `0x${string}`): Promise<`0x${string}`[]> {
  try {
    const data = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'getUserAttestations',
      args: [userAddress]
    }) as `0x${string}`[]

    return data
  } catch (error) {
    console.error('Error al obtener attestations del usuario:', error)
    return []
  }
}

/**
 * Verificar si una attestation es válida
 * @param uid - UID de la attestation
 * @returns true si es válida
 */
export async function isAttestationValid(uid: `0x${string}`): Promise<boolean> {
  try {
    const data = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'isValid',
      args: [uid]
    })

    return data as boolean
  } catch (error) {
    console.error('Error al verificar validez de attestation:', error)
    return false
  }
}

/**
 * Verificar si una actividad ya fue completada
 * @param eventId - ID del evento
 * @param activityId - ID de la actividad
 * @param userAddress - Dirección del usuario
 * @returns true si ya fue completada
 */
export async function isActivityCompleted(
  eventId: string,
  activityId: string,
  userAddress: `0x${string}`
): Promise<boolean> {
  try {
    const eventIdBytes32 = stringToBytes32(eventId)
    const activityIdBytes32 = stringToBytes32(activityId)

    const data = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'isActivityCompleted',
      args: [eventIdBytes32, activityIdBytes32, userAddress]
    })

    return data as boolean
  } catch (error) {
    console.error('Error al verificar si actividad está completada:', error)
    return false
  }
}

/**
 * Decodificar datos de activity completion
 * @param uid - UID de la attestation
 * @returns Datos decodificados
 */
export async function decodeActivityCompletion(uid: `0x${string}`): Promise<ActivityCompletionData | null> {
  try {
    const data = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'decodeActivityCompletion',
      args: [uid]
    })

    return data as ActivityCompletionData
  } catch (error) {
    console.error('Error al decodificar activity completion:', error)
    return null
  }
}

/**
 * Decodificar datos de proof validation
 * @param uid - UID de la attestation
 * @returns Datos decodificados
 */
export async function decodeProofValidation(uid: `0x${string}`): Promise<ProofValidationData | null> {
  try {
    const data = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'decodeProofValidation',
      args: [uid]
    })

    return data as ProofValidationData
  } catch (error) {
    console.error('Error al decodificar proof validation:', error)
    return null
  }
}

// ============================================
// FUNCIONES DE ESCRITURA
// ============================================

/**
 * Crear attestation de completación de actividad (NFC/QR scan)
 * @param params - Parámetros de la attestation
 * @returns UID de la attestation creada y hash de transacción
 */
export async function attestActivityCompletion(params: {
  recipient: `0x${string}`
  eventId: string
  activityId: string
  tokensAwarded: number
  scanType: 'nfc' | 'qr'
  activityName: string
}): Promise<{ uid: `0x${string}`, txHash: `0x${string}` }> {
  try {
    const walletClient = createAttestorWalletClient()

    // Convertir IDs a bytes32
    const eventIdBytes32 = stringToBytes32(params.eventId)
    const activityIdBytes32 = stringToBytes32(params.activityId)

    // Enviar transacción
    const hash = await walletClient.writeContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'attestActivityCompletion',
      args: [
        params.recipient,
        eventIdBytes32,
        activityIdBytes32,
        BigInt(params.tokensAwarded),
        params.scanType,
        params.activityName
      ]
    })

    console.log('✅ Transaction sent:', hash)

    // Esperar confirmación
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

    // Extraer el UID del evento AttestationCreated
    const attestationCreatedEvent = receipt.logs.find(log => {
      try {
        return log.topics[0] === '0x...' // Topic del evento AttestationCreated
      } catch {
        return false
      }
    })

    // El UID es el primer indexed parameter del evento AttestationCreated
    const uid = attestationCreatedEvent?.topics[1] || hash

    return {
      uid: uid as `0x${string}`,
      txHash: hash
    }
  } catch (error) {
    console.error('Error al crear attestation de actividad:', error)
    throw error
  }
}

/**
 * Crear attestation de validación de evidencia
 * @param params - Parámetros de la attestation
 * @returns UID de la attestation creada y hash de transacción
 */
export async function attestProofValidation(params: {
  recipient: `0x${string}`
  activityId: string
  proofId: string
  proofType: 'image' | 'text' | 'transaction' | 'referral'
  approved: boolean
  tokensAwarded: number
}): Promise<{ uid: `0x${string}`, txHash: `0x${string}` }> {
  try {
    const walletClient = createAttestorWalletClient()

    // Convertir IDs a bytes32
    const activityIdBytes32 = stringToBytes32(params.activityId)
    const proofIdBytes32 = stringToBytes32(params.proofId)

    // Enviar transacción
    const hash = await walletClient.writeContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'attestProofValidation',
      args: [
        params.recipient,
        activityIdBytes32,
        proofIdBytes32,
        params.proofType,
        params.approved,
        BigInt(params.tokensAwarded)
      ]
    })

    console.log('✅ Transaction sent:', hash)

    // Esperar confirmación
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

    // Extraer el UID del evento
    const uid = receipt.logs[0]?.topics[1] || hash

    return {
      uid: uid as `0x${string}`,
      txHash: hash
    }
  } catch (error) {
    console.error('Error al crear attestation de proof validation:', error)
    throw error
  }
}

/**
 * Revocar una attestation
 * @param uid - UID de la attestation a revocar
 * @param reason - Razón de la revocación
 * @returns Hash de la transacción
 */
export async function revokeAttestation(
  uid: `0x${string}`,
  reason: string
): Promise<`0x${string}`> {
  try {
    const walletClient = createAttestorWalletClient()

    const hash = await walletClient.writeContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'revoke',
      args: [uid, reason]
    })

    console.log('✅ Revocation transaction sent:', hash)

    await publicClient.waitForTransactionReceipt({ hash })

    console.log('✅ Revocation confirmed')

    return hash
  } catch (error) {
    console.error('Error al revocar attestation:', error)
    throw error
  }
}

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Convierte un string o UUID a bytes32
 * @param value - String o UUID a convertir
 * @returns bytes32 hash
 */
function stringToBytes32(value: string): `0x${string}` {
  // Si es un UUID, removemos los guiones
  const cleanValue = value.replace(/-/g, '')

  // Si ya es un hash válido (empieza con 0x y tiene 66 caracteres), lo retornamos
  if (cleanValue.startsWith('0x') && cleanValue.length === 66) {
    return cleanValue as `0x${string}`
  }

  // Convertir string a hex y padding a 32 bytes
  const hex = Buffer.from(value).toString('hex')
  const padded = hex.padEnd(64, '0')

  return `0x${padded}` as `0x${string}`
}

/**
 * Obtener el explorador de transacciones de Scroll Testnet
 * @param txHash - Hash de la transacción
 * @returns URL del explorador
 */
export function getScrollTestnetExplorerUrl(txHash: `0x${string}`): string {
  return `https://sepolia.scrollscan.com/tx/${txHash}`
}

/**
 * Obtener URL del attestation en el explorador
 * @param uid - UID de la attestation
 * @returns URL del explorador
 */
export function getAttestationExplorerUrl(uid: `0x${string}`): string {
  return `https://sepolia.scrollscan.com/address/${ATTESTATIONS_CONTRACT_ADDRESS}#readContract`
}
