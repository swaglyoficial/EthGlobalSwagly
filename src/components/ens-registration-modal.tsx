/**
 * ============================================
 * MODAL DE REGISTRO ENS
 * ============================================
 *
 * Modal para que el usuario elija y registre su nombre ENS
 */

'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from 'thirdweb/react'

interface EnsRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (ensName: string) => void
}

export function EnsRegistrationModal({ isOpen, onClose, onSuccess }: EnsRegistrationModalProps) {
  const account = useActiveAccount()
  const [name, setName] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [availability, setAvailability] = useState<{
    available: boolean
    error?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setName('')
      setAvailability(null)
      setError(null)
    }
  }, [isOpen])

  // Validar nombre en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      if (name.length >= 3) {
        checkAvailability()
      } else {
        setAvailability(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [name])

  const checkAvailability = async () => {
    if (!name) return

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch('/api/ens/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAvailability({ available: false, error: data.error })
      } else {
        setAvailability({
          available: data.available,
          error: data.available ? undefined : data.message || 'Name is not available',
        })
      }
    } catch (err) {
      setError('Failed to check availability')
    } finally {
      setIsChecking(false)
    }
  }

  const handleRegister = async () => {
    if (!account?.address || !name || !availability?.available) return

    setIsRegistering(true)
    setError(null)

    try {
      const response = await fetch('/api/ens/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          walletAddress: account.address,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to register name')
        return
      }

      // Éxito!
      onSuccess?.(data.fullName)
      onClose()
    } catch (err) {
      setError('Failed to register name')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setName(value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl border border-yellow-500/20">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Título */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Choose Your ENS Name
          </h2>
          <p className="text-gray-400 text-sm">
            Pick a unique name for your Swagly identity
          </p>
        </div>

        {/* Input de nombre */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="yourname"
              className="w-full px-4 py-3 pr-32 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              maxLength={30}
              disabled={isRegistering}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              .swagly.eth
            </span>
          </div>

          {/* Indicador de validación */}
          {name.length >= 3 && (
            <div className="mt-2">
              {isChecking ? (
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Checking availability...
                </p>
              ) : availability ? (
                availability.available ? (
                  <p className="text-green-500 text-sm flex items-center gap-2">
                    <span>✓</span>
                    {name}.swagly.eth is available!
                  </p>
                ) : (
                  <p className="text-red-500 text-sm flex items-center gap-2">
                    <span>✗</span>
                    {availability.error || 'Name is not available'}
                  </p>
                )
              ) : null}
            </div>
          )}

          {/* Reglas del nombre */}
          <div className="mt-3 text-xs text-gray-500">
            <p>• 3-30 characters</p>
            <p>• Only lowercase letters, numbers, and hyphens</p>
            <p>• Cannot start or end with a hyphen</p>
          </div>
        </div>

        {/* Error general */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Botón de registro */}
        <button
          onClick={handleRegister}
          disabled={!availability?.available || isRegistering || isChecking}
          className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-yellow-500/50"
        >
          {isRegistering ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Registering on Ethereum...
            </span>
          ) : (
            'Register ENS Name'
          )}
        </button>

        {/* Info adicional */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-xs">
            <strong>Note:</strong> This will create a real ENS name on Ethereum Mainnet.
            The transaction will be processed by the Swagly owner wallet.
          </p>
        </div>
      </div>
    </div>
  )
}
