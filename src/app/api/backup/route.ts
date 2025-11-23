import { NextRequest, NextResponse } from 'next/server'
import {
  createBackupToStoracha,
  startAutomaticBackups,
  stopAutomaticBackups,
  areBackupsRunning,
  getBackupStats
} from '@/lib/storacha-backup'

/**
 * GET /api/backup
 * Obtener estado de los backups automáticos
 */
export async function GET(request: NextRequest) {
  try {
    const stats = getBackupStats()

    return NextResponse.json({
      success: true,
      stats: {
        isRunning: stats.isRunning,
        lastBackupTimestamp: stats.lastBackupTimestamp,
        lastBackupCid: stats.lastBackupCid,
        backupCount: stats.backupCount,
        ipfsUrl: stats.lastBackupCid ? `https://${stats.lastBackupCid}.ipfs.w3s.link` : null
      }
    })
  } catch (error) {
    console.error('Error getting backup stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de backup' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/backup
 * Ejecutar backup manual o controlar backups automáticos
 *
 * Body:
 * {
 *   "action": "manual" | "start" | "stop"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'El campo "action" es requerido' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'manual':
        // Ejecutar backup manual
        const result = await createBackupToStoracha()

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Backup manual completado exitosamente',
            data: {
              cid: result.cid,
              ipfsUrl: result.cid ? `https://${result.cid}.ipfs.w3s.link` : null,
              scansCount: result.scansCount,
              activitiesCount: result.activitiesCount
            }
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              error: result.error || 'Error al crear backup'
            },
            { status: 500 }
          )
        }

      case 'start':
        // Iniciar backups automáticos
        if (areBackupsRunning()) {
          return NextResponse.json({
            success: true,
            message: 'Los backups automáticos ya están corriendo'
          })
        }

        startAutomaticBackups()

        return NextResponse.json({
          success: true,
          message: 'Backups automáticos iniciados (cada 60 segundos)'
        })

      case 'stop':
        // Detener backups automáticos
        if (!areBackupsRunning()) {
          return NextResponse.json({
            success: true,
            message: 'Los backups automáticos ya están detenidos'
          })
        }

        stopAutomaticBackups()

        return NextResponse.json({
          success: true,
          message: 'Backups automáticos detenidos'
        })

      default:
        return NextResponse.json(
          { error: 'Acción no válida. Usa: "manual", "start", o "stop"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error en endpoint de backup:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
