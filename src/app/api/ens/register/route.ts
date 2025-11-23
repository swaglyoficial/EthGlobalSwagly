/**
 * ============================================
 * API: Registrar Subdominio ENS
 * ============================================
 *
 * Registra un subdominio de swagly.eth para la wallet del usuario
 */

import { NextRequest, NextResponse } from 'next/server'
import { registerSubdomain, normalizeEnsName, isValidEnsName } from '@/lib/ens-manager'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, walletAddress } = await request.json()

    if (!name || !walletAddress) {
      return NextResponse.json(
        { error: 'Name and wallet address are required' },
        { status: 400 }
      )
    }

    // Normalizar y validar nombre
    const normalizedName = normalizeEnsName(name)

    if (!isValidEnsName(normalizedName)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid name. Use only lowercase letters, numbers, and hyphens (3-30 characters)',
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verificar que el usuario no tenga ya un nombre ENS
    if (user.ensName) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have an ENS name registered',
          currentName: user.ensFullName,
        },
        { status: 400 }
      )
    }

    // Verificar que el nombre no esté tomado en la DB
    const existingName = await prisma.user.findFirst({
      where: { ensName: normalizedName },
    })

    if (existingName) {
      return NextResponse.json(
        {
          success: false,
          error: 'This name is already taken',
        },
        { status: 400 }
      )
    }

    // Registrar el subdominio on-chain en Ethereum Mainnet
    const result = await registerSubdomain(normalizedName, walletAddress)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to register subdomain',
        },
        { status: 500 }
      )
    }

    // Actualizar la base de datos
    const updatedUser = await prisma.user.update({
      where: { walletAddress },
      data: {
        ensName: normalizedName,
        ensFullName: `${normalizedName}.swagly.eth`,
        ensRegistered: true,
        ensTxHash: result.txHash,
      },
    })

    return NextResponse.json({
      success: true,
      name: normalizedName,
      fullName: updatedUser.ensFullName,
      txHash: result.txHash,
      message: 'ENS name registered successfully!',
    })
  } catch (error) {
    console.error('Error registering ENS name:', error)
    return NextResponse.json(
      { error: 'Failed to register ENS name' },
      { status: 500 }
    )
  }
}
