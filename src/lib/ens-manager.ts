/**
 * ============================================
 * ENS MANAGER - Gestión de Subdominios
 * ============================================
 *
 * Maneja el registro de subdominios de swagly.eth en Ethereum Mainnet
 */

import { createThirdwebClient } from 'thirdweb'
import { ethereum } from 'thirdweb/chains'
import { privateKeyToAccount } from 'thirdweb/wallets'
import { prepareContractCall, sendTransaction, readContract } from 'thirdweb/transaction'
import { getContract } from 'thirdweb/contract'
import { keccak256, encodeAbiParameters } from 'thirdweb/utils'

// ============================================
// CONFIGURACIÓN
// ============================================

// Contratos ENS en Ethereum Mainnet
const ENS_NAME_WRAPPER_ADDRESS = '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401' // Name Wrapper
const ENS_PUBLIC_RESOLVER_ADDRESS = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63' // Public Resolver

// Nombre base
const BASE_DOMAIN = 'swagly.eth'

// Fuses para subdominios (según documentación ENS)
const CANNOT_UNWRAP = 1 // 2^0
const CANNOT_BURN_FUSES = 2 // 2^1
const CANNOT_TRANSFER = 4 // 2^2
const CANNOT_SET_RESOLVER = 8 // 2^3
const CANNOT_SET_TTL = 16 // 2^4
const CANNOT_CREATE_SUBDOMAIN = 32 // 2^5
const PARENT_CANNOT_CONTROL = 65536 // 2^16 - Emancipado

/**
 * Obtiene el cliente de Thirdweb
 */
function getClient() {
  const secretKey = process.env.THIRDWEB_SECRET_KEY
  if (!secretKey) {
    throw new Error('THIRDWEB_SECRET_KEY is not set in environment variables')
  }
  return createThirdwebClient({
    secretKey,
  })
}

/**
 * Obtiene la cuenta del owner
 */
function getOwnerAccount() {
  const privateKey = process.env.ENS_OWNER_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('ENS_OWNER_PRIVATE_KEY is not set in environment variables')
  }
  const client = getClient()
  return privateKeyToAccount({
    client,
    privateKey,
  })
}

// ============================================
// ABIs NECESARIOS
// ============================================

const NAME_WRAPPER_ABI = [
  {
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'label', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'ttl', type: 'uint64' },
      { name: 'fuses', type: 'uint32' },
      { name: 'expiry', type: 'uint64' },
    ],
    name: 'setSubnodeRecord',
    outputs: [{ name: 'node', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'getData',
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'fuses', type: 'uint32' },
      { name: 'expiry', type: 'uint64' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'OperationProhibited',
    type: 'error',
  },
  {
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'labelhash', type: 'bytes32' },
    ],
    name: 'Unauthorised',
    type: 'error',
  },
] as const

const RESOLVER_ABI = [
  {
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'a', type: 'address' },
    ],
    name: 'setAddr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'addr',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Implementación de namehash según la especificación ENS
 * https://docs.ens.domains/contract-api-reference/name-processing#hashing-names
 */
function getNamehash(name: string): `0x${string}` {
  if (!name) {
    return '0x0000000000000000000000000000000000000000000000000000000000000000'
  }

  // Normalizar el nombre (lowercase)
  const normalizedName = name.toLowerCase()

  let node = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`

  const labels = normalizedName.split('.').reverse()

  for (const label of labels) {
    const labelHash = keccak256(new TextEncoder().encode(label))
    // Concatenar node + labelHash y hacer hash del resultado
    const nodeBytes = hexToBytes(node)
    const labelBytes = hexToBytes(labelHash)
    const combined = new Uint8Array([...nodeBytes, ...labelBytes])
    node = keccak256(combined)
  }

  return node
}

/**
 * Calcula el labelhash de un label
 */
function getLabelhash(label: string): `0x${string}` {
  return keccak256(new TextEncoder().encode(label.toLowerCase()))
}

/**
 * Convierte hex string a bytes
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Valida que un nombre sea válido para ENS
 */
export function isValidEnsName(name: string): boolean {
  // Solo letras minúsculas, números y guiones
  const regex = /^[a-z0-9-]+$/
  if (!regex.test(name)) return false

  // Longitud entre 3 y 30 caracteres
  if (name.length < 3 || name.length > 30) return false

  // No puede empezar o terminar con guión
  if (name.startsWith('-') || name.endsWith('-')) return false

  return true
}

/**
 * Normaliza un nombre ENS (lowercase, trim)
 */
export function normalizeEnsName(name: string): string {
  return name.toLowerCase().trim()
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Verifica si un subdominio ya está registrado
 */
export async function checkSubdomainAvailability(
  subdomain: string
): Promise<{ available: boolean; address?: string }> {
  try {
    const client = getClient()
    const fullName = `${subdomain}.${BASE_DOMAIN}`
    const node = getNamehash(fullName)

    const resolverContract = getContract({
      client,
      chain: ethereum,
      address: ENS_PUBLIC_RESOLVER_ADDRESS,
      abi: RESOLVER_ABI,
    })

    let address: string | undefined

    try {
      address = await readContract({
        contract: resolverContract,
        method: 'addr',
        params: [node],
      })
    } catch (err) {
      // Si falla la lectura, asumimos que está disponible
      console.log('Unable to read resolver, assuming name is available:', err)
      address = undefined
    }

    // Si la dirección es 0x0 o undefined, está disponible
    const isAvailable = !address || address === '0x0000000000000000000000000000000000000000'

    return {
      available: isAvailable,
      address: isAvailable ? undefined : address,
    }
  } catch (error) {
    console.error('Error checking subdomain availability:', error)
    throw new Error('Failed to check subdomain availability')
  }
}

/**
 * Registra un subdominio de swagly.eth para una wallet
 */
export async function registerSubdomain(
  subdomain: string,
  walletAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const client = getClient()
    const ownerAccount = getOwnerAccount()

    // Validar nombre
    const normalizedName = normalizeEnsName(subdomain)
    if (!isValidEnsName(normalizedName)) {
      return {
        success: false,
        error: 'Invalid ENS name. Use only lowercase letters, numbers, and hyphens (3-30 characters)',
      }
    }

    // Verificar disponibilidad
    const { available } = await checkSubdomainAvailability(normalizedName)
    if (!available) {
      return {
        success: false,
        error: 'This name is already taken',
      }
    }

    const fullName = `${normalizedName}.${BASE_DOMAIN}`
    const parentNode = getNamehash(BASE_DOMAIN)
    const subdomainNode = getNamehash(fullName)

    // Usar Name Wrapper según la documentación oficial
    const nameWrapperContract = getContract({
      client,
      chain: ethereum,
      address: ENS_NAME_WRAPPER_ADDRESS,
      abi: NAME_WRAPPER_ABI,
    })

    const resolverContract = getContract({
      client,
      chain: ethereum,
      address: ENS_PUBLIC_RESOLVER_ADDRESS,
      abi: RESOLVER_ABI,
    })

    // Obtener datos del dominio padre (expiración y fuses)
    const parentTokenId = BigInt(parentNode)
    const parentData = await readContract({
      contract: nameWrapperContract,
      method: 'getData',
      params: [parentTokenId],
    })

    const parentOwner = parentData[0]
    const parentFuses = parentData[1]
    const parentExpiry = parentData[2]

    console.log('Parent domain info:', {
      owner: parentOwner,
      fuses: parentFuses,
      expiry: parentExpiry.toString(),
      ownerAccount: ownerAccount.address,
      CANNOT_CREATE_SUBDOMAIN: parentFuses & CANNOT_CREATE_SUBDOMAIN,
    })

    // Verificar que somos el owner
    if (parentOwner.toLowerCase() !== ownerAccount.address.toLowerCase()) {
      return {
        success: false,
        error: `You are not the owner of ${BASE_DOMAIN}. Owner is: ${parentOwner}`,
      }
    }

    // Verificar que podemos crear subdominios
    if (parentFuses & CANNOT_CREATE_SUBDOMAIN) {
      return {
        success: false,
        error: `Cannot create subdomains: CANNOT_CREATE_SUBDOMAIN fuse is burned on ${BASE_DOMAIN}`,
      }
    }

    // Configuración de fuses: 0 (sin restricciones) para dar flexibilidad
    // Si quieres emancipar el subdominio, usa PARENT_CANNOT_CONTROL
    const fuses = 0 // Sin restricciones por ahora

    // Crear subdominio usando setSubnodeRecord
    console.log('Creating subdomain with params:', {
      parentNode,
      label: normalizedName,
      owner: walletAddress,
      resolver: ENS_PUBLIC_RESOLVER_ADDRESS,
      ttl: 0,
      fuses,
      expiry: parentExpiry.toString(),
    })

    const setSubnodeRecordTx = prepareContractCall({
      contract: nameWrapperContract,
      method: 'setSubnodeRecord',
      params: [
        parentNode,
        normalizedName,
        walletAddress as `0x${string}`,
        ENS_PUBLIC_RESOLVER_ADDRESS as `0x${string}`,
        BigInt(0), // ttl = 0
        fuses, // Sin restricciones
        parentExpiry, // misma expiración que el padre
      ],
    })

    await sendTransaction({
      transaction: setSubnodeRecordTx,
      account: ownerAccount,
    })

    console.log('Subdomain created with Name Wrapper')

    // Establecer la dirección en el resolver
    const setAddrTx = prepareContractCall({
      contract: resolverContract,
      method: 'setAddr',
      params: [subdomainNode, walletAddress as `0x${string}`],
    })

    const addrTxResult = await sendTransaction({
      transaction: setAddrTx,
      account: ownerAccount,
    })

    console.log('Address set in resolver')

    return {
      success: true,
      txHash: addrTxResult.transactionHash,
    }
  } catch (error) {
    console.error('Error registering subdomain:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register subdomain',
    }
  }
}

/**
 * Obtiene el nombre ENS de una dirección (reverse lookup)
 */
export async function getEnsNameForAddress(address: string): Promise<string | null> {
  try {
    // Por ahora, simplemente verificamos si algún subdominio apunta a esta dirección
    // Una implementación completa requeriría configurar reverse records
    return null
  } catch (error) {
    console.error('Error getting ENS name:', error)
    return null
  }
}

/**
 * Obtiene la dirección de un nombre ENS
 */
export async function getAddressForEnsName(ensName: string): Promise<string | null> {
  try {
    const client = getClient()
    const fullName = ensName.includes('.') ? ensName : `${ensName}.${BASE_DOMAIN}`
    const node = getNamehash(fullName)

    const resolverContract = getContract({
      client,
      chain: ethereum,
      address: ENS_PUBLIC_RESOLVER_ADDRESS,
      abi: RESOLVER_ABI,
    })

    let address: string | undefined

    try {
      address = await readContract({
        contract: resolverContract,
        method: 'addr',
        params: [node],
      })
    } catch (err) {
      console.log('Unable to read resolver for ENS name:', err)
      return null
    }

    if (!address || address === '0x0000000000000000000000000000000000000000') {
      return null
    }

    return address
  } catch (error) {
    console.error('Error getting address for ENS name:', error)
    return null
  }
}
