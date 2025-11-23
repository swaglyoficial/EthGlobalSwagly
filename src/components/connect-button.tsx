/**
 * ============================================
 * CONNECT BUTTON - BOTA"N DE CONEXIA"N DE WALLET
 * ============================================
 *
 * Componente que muestra el botA3n para conectar wallets usando Thirdweb
 */

'use client'

import { type CSSProperties } from 'react'
import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react"
import { client, chains, defaultChain } from "@/../config/thirdweb"
import { inAppWallet } from "thirdweb/wallets"

// ConfiguraciA3n de wallets soportadas
const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "apple", "telegram", "passkey"]
    }
  })
]

type ConnectButtonProps = {
  label?: string
  styleOverrides?: CSSProperties
}

export const ConnectButton = ({ label = "Conectar Wallet", styleOverrides }: ConnectButtonProps) => (
  <div className="appkit-connect">
    <ThirdwebConnectButton
      client={client}
      wallets={wallets}
      chain={defaultChain}
      chains={chains}
      theme="dark"
      connectButton={{
        label,
        style: {
          background: '#FEE887',
          color: '#000000',
          borderRadius: '9999px',
          fontSize: '15px',
          fontWeight: '500',
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(254,232,135,0.45)',
          ...styleOverrides,
        }
      }}
      connectModal={{
        size: "compact",
        title: "Conectar a Swagly",
        titleIcon: "https://avatars.githubusercontent.com/u/179229932"
      }}
    />
  </div>
)
