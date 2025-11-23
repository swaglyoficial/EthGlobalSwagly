/**
 * ============================================
 * API: Verificar Disponibilidad de Nombre ENS
 * ============================================
 *
 * Verifica si un subdominio de swagly.eth está disponible
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkSubdomainAvailability, isValidEnsName, normalizeEnsName } from '@/lib/ens-manager'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Normalizar y validar nombre
    const normalizedName = normalizeEnsName(name)

    if (!isValidEnsName(normalizedName)) {
      return NextResponse.json(
        {
          available: false,
          error: 'Invalid name. Use only lowercase letters, numbers, and hyphens (3-30 characters)',
        },
        { status: 400 }
      )
    }

    // Verificar en la base de datos local primero
    const existingUser = await prisma.user.findFirst({
      where: {
        ensName: normalizedName,
      },
    })

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: 'This name is already taken in our database',
      })
    }

    // Verificar on-chain en Ethereum Mainnet
    const { available, address } = await checkSubdomainAvailability(normalizedName)

    return NextResponse.json({
      available,
      name: normalizedName,
      fullName: `${normalizedName}.swagly.eth`,
      ...(address && { currentOwner: address }),
    })
  } catch (error) {
    console.error('Error checking ENS availability:', error)
    return NextResponse.json(
      { error: 'Failed to check name availability' },
      { status: 500 }
    )
  }
}
