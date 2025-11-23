/**
 * ============================================
 * HOOK: useEnsName
 * ============================================
 *
 * Hook para obtener el nombre ENS de una dirección
 */

'use client'

import { useState, useEffect } from 'react'
import { createThirdwebClient } from 'thirdweb'
import { ethereum } from 'thirdweb/chains'
import { getContract } from 'thirdweb/contract'
import { readContract } from 'thirdweb/transaction'

const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || 'ba7a96650ddbf17991e91a37adc04faf'

const client = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
})

// ENS Public Resolver en Ethereum Mainnet
const ENS_PUBLIC_RESOLVER_ADDRESS = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
const ENS_REVERSE_REGISTRAR_ADDRESS = '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb'

const REVERSE_REGISTRAR_ABI = [
  {
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'node',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
] as const

const RESOLVER_ABI = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

interface UseEnsNameResult {
  ensName: string | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook para obtener el nombre ENS de una dirección
 * @param address - Dirección de wallet
 * @returns Nombre ENS, estado de carga y error
 */
export function useEnsName(address?: string): UseEnsNameResult {
  const [ensName, setEnsName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setEnsName(null)
      return
    }

    const fetchEnsName = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 1. Obtener el nodo reverso para la dirección
        const reverseRegistrar = getContract({
          client,
          chain: ethereum,
          address: ENS_REVERSE_REGISTRAR_ADDRESS,
          abi: REVERSE_REGISTRAR_ABI,
        })

        const node = await readContract({
          contract: reverseRegistrar,
          method: 'node',
          params: [address as `0x${string}`],
        })

        // 2. Obtener el nombre desde el resolver
        const resolver = getContract({
          client,
          chain: ethereum,
          address: ENS_PUBLIC_RESOLVER_ADDRESS,
          abi: RESOLVER_ABI,
        })

        const name = await readContract({
          contract: resolver,
          method: 'name',
          params: [node],
        })

        // 3. Verificar que el nombre no esté vacío
        if (name && name.trim() !== '') {
          setEnsName(name)
        } else {
          setEnsName(null)
        }
      } catch (err) {
        console.error('Error fetching ENS name:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch ENS name'))
        setEnsName(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnsName()
  }, [address])

  return { ensName, isLoading, error }
}
