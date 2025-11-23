/**
 * ============================================
 * HOOK: useUserEnsName
 * ============================================
 *
 * Hook para obtener el nombre ENS del usuario desde la base de datos
 * (más rápido que leer desde la blockchain)
 */

'use client'

import { useState, useEffect } from 'react'

interface UseUserEnsNameResult {
  ensName: string | null
  ensFullName: string | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

/**
 * Hook para obtener el nombre ENS del usuario desde la base de datos
 * @param address - Dirección de wallet del usuario
 * @returns Información ENS del usuario
 */
export function useUserEnsName(address?: string): UseUserEnsNameResult {
  const [ensName, setEnsName] = useState<string | null>(null)
  const [ensFullName, setEnsFullName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchUserEnsName = async () => {
    if (!address) {
      setEnsName(null)
      setEnsFullName(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user?address=${address}`)

      // Si el usuario no existe (404), no es un error - simplemente no tiene ENS
      if (response.status === 404) {
        setEnsName(null)
        setEnsFullName(null)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()

      setEnsName(data.ensName || null)
      setEnsFullName(data.ensFullName || null)
    } catch (err) {
      console.error('Error fetching user ENS name:', err)
      // No establecer error para que el componente se muestre de todos modos
      setEnsName(null)
      setEnsFullName(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserEnsName()
  }, [address])

  return {
    ensName,
    ensFullName,
    isLoading,
    error,
    refresh: fetchUserEnsName,
  }
}
