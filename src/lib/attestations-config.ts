/**
 * ============================================
 * CONFIGURACIÓN DEL CONTRATO DE ATTESTATIONS
 * ============================================
 *
 * Este archivo contiene la configuración para el contrato SwaglyAttestations
 * que registra todas las actividades y validaciones on-chain.
 */

// ============================================
// DIRECCIONES DE CONTRATOS
// ============================================

/**
 * Dirección del contrato SwaglyAttestations
 * Desplegado en Scroll Sepolia Testnet
 */
export const ATTESTATIONS_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ATTESTATIONS_CONTRACT_ADDRESS || '0xA9fdE7d55Fbc7fD94e361A63860E650521000595'

/**
 * Chain ID donde está desplegado el contrato de attestations
 * - Ethereum Mainnet: 1
 * - Scroll Mainnet: 534352
 * - Scroll Sepolia: 534351
 */
export const ATTESTATIONS_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_ATTESTATIONS_CHAIN_ID || '534351')

// ============================================
// ABI DEL CONTRATO
// ============================================

/**
 * ABI del contrato SwaglyAttestations
 * Solo incluye las funciones que vamos a usar desde el backend
 */
export const ATTESTATIONS_ABI = [
  // ============================================
  // FUNCIONES DE LECTURA
  // ============================================
  {
    "inputs": [{"internalType": "bytes32", "name": "uid", "type": "bytes32"}],
    "name": "getAttestation",
    "outputs": [{
      "components": [
        {"internalType": "bytes32", "name": "uid", "type": "bytes32"},
        {"internalType": "address", "name": "recipient", "type": "address"},
        {"internalType": "address", "name": "attestor", "type": "address"},
        {"internalType": "enum AttestationType", "name": "attestationType", "type": "uint8"},
        {"internalType": "enum AttestationStatus", "name": "status", "type": "uint8"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "uint256", "name": "expirationTime", "type": "uint256"},
        {"internalType": "bytes32", "name": "schemaId", "type": "bytes32"},
        {"internalType": "bytes", "name": "data", "type": "bytes"}
      ],
      "internalType": "struct Attestation",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserAttestations",
    "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "uid", "type": "bytes32"}],
    "name": "isValid",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "eventId", "type": "bytes32"},
      {"internalType": "bytes32", "name": "activityId", "type": "bytes32"},
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "isActivityCompleted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "uid", "type": "bytes32"}],
    "name": "decodeActivityCompletion",
    "outputs": [{
      "components": [
        {"internalType": "bytes32", "name": "eventId", "type": "bytes32"},
        {"internalType": "bytes32", "name": "activityId", "type": "bytes32"},
        {"internalType": "uint256", "name": "tokensAwarded", "type": "uint256"},
        {"internalType": "string", "name": "scanType", "type": "string"},
        {"internalType": "string", "name": "activityName", "type": "string"},
        {"internalType": "uint256", "name": "completedAt", "type": "uint256"}
      ],
      "internalType": "struct ActivityCompletionData",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "uid", "type": "bytes32"}],
    "name": "decodeProofValidation",
    "outputs": [{
      "components": [
        {"internalType": "bytes32", "name": "activityId", "type": "bytes32"},
        {"internalType": "bytes32", "name": "proofId", "type": "bytes32"},
        {"internalType": "string", "name": "proofType", "type": "string"},
        {"internalType": "bool", "name": "approved", "type": "bool"},
        {"internalType": "address", "name": "validator", "type": "address"},
        {"internalType": "uint256", "name": "tokensAwarded", "type": "uint256"},
        {"internalType": "uint256", "name": "validatedAt", "type": "uint256"}
      ],
      "internalType": "struct ProofValidationData",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },

  // ============================================
  // FUNCIONES DE ESCRITURA
  // ============================================
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "bytes32", "name": "eventId", "type": "bytes32"},
      {"internalType": "bytes32", "name": "activityId", "type": "bytes32"},
      {"internalType": "uint256", "name": "tokensAwarded", "type": "uint256"},
      {"internalType": "string", "name": "scanType", "type": "string"},
      {"internalType": "string", "name": "activityName", "type": "string"}
    ],
    "name": "attestActivityCompletion",
    "outputs": [{"internalType": "bytes32", "name": "uid", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "bytes32", "name": "activityId", "type": "bytes32"},
      {"internalType": "bytes32", "name": "proofId", "type": "bytes32"},
      {"internalType": "string", "name": "proofType", "type": "string"},
      {"internalType": "bool", "name": "approved", "type": "bool"},
      {"internalType": "uint256", "name": "tokensAwarded", "type": "uint256"}
    ],
    "name": "attestProofValidation",
    "outputs": [{"internalType": "bytes32", "name": "uid", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "uid", "type": "bytes32"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "revoke",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ============================================
  // FUNCIONES DE GESTIÓN DE ROLES
  // ============================================
  {
    "inputs": [{"internalType": "address", "name": "_attestor", "type": "address"}],
    "name": "addAttestor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_validator", "type": "address"}],
    "name": "addValidator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ============================================
  // EVENTOS
  // ============================================
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "uid", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "recipient", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "attestor", "type": "address"},
      {"indexed": false, "internalType": "enum AttestationType", "name": "attestationType", "type": "uint8"},
      {"indexed": false, "internalType": "bytes32", "name": "schemaId", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "AttestationCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "uid", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "revoker", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "AttestationRevoked",
    "type": "event"
  }
] as const

// ============================================
// TIPOS Y ENUMS
// ============================================

/**
 * Tipos de attestation soportados
 */
export enum AttestationType {
  ACTIVITY_COMPLETION = 0,
  PROOF_VALIDATION = 1,
  PASSPORT_CLAIM = 2,
  REFERRAL_VERIFICATION = 3,
  TRANSACTION_PROOF = 4
}

/**
 * Estados de una attestation
 */
export enum AttestationStatus {
  ACTIVE = 0,
  REVOKED = 1,
  EXPIRED = 2
}

/**
 * Interface para una attestation
 */
export interface Attestation {
  uid: `0x${string}`
  recipient: `0x${string}`
  attestor: `0x${string}`
  attestationType: AttestationType
  status: AttestationStatus
  timestamp: bigint
  expirationTime: bigint
  schemaId: `0x${string}`
  data: `0x${string}`
}

/**
 * Interface para datos de completación de actividad
 */
export interface ActivityCompletionData {
  eventId: `0x${string}`
  activityId: `0x${string}`
  tokensAwarded: bigint
  scanType: string
  activityName: string
  completedAt: bigint
}

/**
 * Interface para datos de validación de evidencia
 */
export interface ProofValidationData {
  activityId: `0x${string}`
  proofId: `0x${string}`
  proofType: string
  approved: boolean
  validator: `0x${string}`
  tokensAwarded: bigint
  validatedAt: bigint
}

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Convierte un string o UUID a bytes32
 * @param value - String o UUID a convertir
 * @returns bytes32 hash
 */
export function stringToBytes32(value: string): `0x${string}` {
  // Si es un UUID, removemos los guiones
  const cleanValue = value.replace(/-/g, '')

  // Si ya es un hash válido (empieza con 0x y tiene 66 caracteres), lo retornamos
  if (cleanValue.startsWith('0x') && cleanValue.length === 66) {
    return cleanValue as `0x${string}`
  }

  // Convertimos a bytes32 usando keccak256
  const encoder = new TextEncoder()
  const data = encoder.encode(value)

  // Para simplificar, usamos un hash simple en el servidor
  // En producción, usa ethers.utils.keccak256 o similar
  return `0x${Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0')}` as `0x${string}`
}

/**
 * Convierte bigint a número de forma segura
 * @param value - BigInt a convertir
 * @returns Número
 */
export function bigIntToNumber(value: bigint): number {
  return Number(value)
}

/**
 * Convierte timestamp de bigint a Date
 * @param timestamp - Timestamp en bigint
 * @returns Date object
 */
export function timestampToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp) * 1000)
}
