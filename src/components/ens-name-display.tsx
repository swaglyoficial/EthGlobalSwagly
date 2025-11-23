/**
 * ============================================
 * COMPONENTE: ENS Name Display
 * ============================================
 *
 * Muestra el nombre ENS del usuario o su dirección acortada
 */

'use client'

import { useUserEnsName } from '@/hooks/useUserEnsName'

interface EnsNameDisplayProps {
  address: string
  showFullAddress?: boolean
  className?: string
}

/**
 * Acorta una dirección de wallet para mostrarla
 */
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Componente que muestra el nombre ENS o la dirección acortada
 */
export function EnsNameDisplay({
  address,
  showFullAddress = false,
  className = '',
}: EnsNameDisplayProps) {
  const { ensFullName, isLoading } = useUserEnsName(address)

  if (isLoading) {
    return (
      <span className={`animate-pulse ${className}`}>
        Loading...
      </span>
    )
  }

  if (ensFullName) {
    return (
      <span className={`font-medium text-yellow-500 ${className}`} title={address}>
        {ensFullName}
      </span>
    )
  }

  return (
    <span className={`font-mono text-gray-400 ${className}`} title={address}>
      {showFullAddress ? address : shortenAddress(address)}
    </span>
  )
}
