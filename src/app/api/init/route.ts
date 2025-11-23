import { NextRequest, NextResponse } from 'next/server'
import { initializeBackups } from '@/lib/init-backups'

/**
 * GET /api/init
 * Endpoint para inicializar servicios de la aplicación
 * Este endpoint debe ser llamado una vez cuando el servidor arranca
 */
export async function GET(request: NextRequest) {
  try {
    // Inicializar backups automáticos
    initializeBackups()

    return NextResponse.json({
      success: true,
      message: 'Servicios inicializados correctamente',
      services: {
        backups: 'running'
      }
    })
  } catch (error) {
    console.error('Error inicializando servicios:', error)
    return NextResponse.json(
      { error: 'Error al inicializar servicios' },
      { status: 500 }
    )
  }
}
