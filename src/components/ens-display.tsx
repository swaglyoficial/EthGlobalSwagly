/**
 * ============================================
 * COMPONENTE DE VISUALIZACIÓN ENS
 * ============================================
 *
 * Muestra el nombre ENS del usuario o un botón para registrarlo
 */

'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { EnsRegistrationModal } from './ens-registration-modal'
import { useUserEnsName } from '@/hooks/useUserEnsName'

export function EnsDisplay() {
  const account = useActiveAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { ensFullName, ensName, isLoading, refresh } = useUserEnsName(account?.address)

  const handleSuccess = (newEnsName: string) => {
    // Refrescar datos del usuario
    refresh()
  }

  // Siempre mostrar el componente si hay una cuenta conectada
  if (!account) {
    return (
      <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
        <p className="text-sm text-gray-400 text-center">
          Connect your wallet to register an ENS name
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
          <span className="animate-pulse">Loading ENS...</span>
        </div>
      </div>
    )
  }

  if (ensFullName) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Your ENS Name</p>
          <p className="text-lg font-semibold text-yellow-500">{ensFullName}</p>
        </div>
        <div className="flex-shrink-0">
          <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded-full">
            Verified
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">Get Your ENS Name</p>
            <p className="text-xs text-gray-400 mt-1">
              Claim your unique identity on Swagly
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-yellow-500/50"
        >
          Register ENS Name
        </button>
      </div>

      <EnsRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
