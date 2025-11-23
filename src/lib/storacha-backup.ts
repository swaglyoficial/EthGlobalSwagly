/**
 * ============================================
 * SERVICIO DE BACKUP A STORACHA (IPFS)
 * ============================================
 *
 * Este servicio hace backups automáticos de los scans y actividades
 * completadas a Storacha (IPFS descentralizado) cada 60 segundos.
 */

import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * DID del espacio de Storacha
 */
const STORACHA_DID = process.env.STORACHA_DID || 'did:key:z6MkjAc9WFcFtj15dRgxELRnFbWF8sfJyuZ1Awd5tVtzQ48h'

/**
 * Private key de Storacha (base64)
 */
const STORACHA_PRIVATE_KEY = process.env.STORACHA_PRIVATE_KEY || ''

/**
 * Proof de delegación (opcional, se configura después)
 */
const STORACHA_PROOF = process.env.STORACHA_PROOF || ''

// ============================================
// ALMACENAMIENTO DUAL: VERCEL BLOB + STORACHA
// ============================================

/**
 * Subir archivo a Vercel Blob (backup primario)
 * Usamos Vercel Blob como almacenamiento principal porque es más confiable
 */
async function uploadToVercelBlob(filename: string, data: string): Promise<string> {
  try {
    const blob = await put(filename, data, {
      access: 'public',
      addRandomSuffix: false,
    })

    return blob.url
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    throw error
  }
}

/**
 * Subir archivo a Storacha/IPFS (backup secundario)
 * Esto crea una copia inmutable en IPFS
 */
async function uploadToStoracha(filename: string, data: string): Promise<string | null> {
  try {
    // Por ahora solo usamos Vercel Blob
    // En el futuro implementaremos Storacha cuando la librería esté estable
    console.log('ℹ️ Storacha upload pendiente de implementación')
    return null
  } catch (error) {
    console.error('⚠️ Error uploading to Storacha (no crítico):', error)
    return null
  }
}

/**
 * Subir a ambos servicios
 */
async function uploadToStorage(filename: string, data: string): Promise<{ vercelUrl: string, ipfsCid: string | null }> {
  try {
    // Subir a Vercel Blob (primario)
    const vercelUrl = await uploadToVercelBlob(filename, data)

    // Intentar subir a Storacha (secundario, opcional)
    const ipfsCid = await uploadToStoracha(filename, data)

    return { vercelUrl, ipfsCid }
  } catch (error) {
    console.error('Error uploading to storage:', error)
    throw error
  }
}

// ============================================
// FUNCIONES DE BACKUP
// ============================================

/**
 * Obtener todos los scans desde la última sincronización
 */
async function getScansForBackup(lastBackupTime?: Date) {
  const where = lastBackupTime
    ? { timestamp: { gt: lastBackupTime } }
    : {}

  return await prisma.scan.findMany({
    where,
    include: {
      user: {
        select: {
          walletAddress: true,
          nickname: true,
        }
      },
      nfc: {
        include: {
          activity: {
            select: {
              name: true,
              numOfTokens: true,
              eventId: true,
            }
          },
          event: {
            select: {
              name: true,
            }
          }
        }
      }
    },
    orderBy: {
      timestamp: 'asc'
    }
  })
}

/**
 * Obtener todas las actividades completadas desde la última sincronización
 */
async function getCompletedActivitiesForBackup(lastBackupTime?: Date) {
  const where = lastBackupTime
    ? {
        status: 'completed' as const,
        timestamp: { gt: lastBackupTime }
      }
    : {
        status: 'completed' as const
      }

  return await prisma.passportActivity.findMany({
    where,
    include: {
      passport: {
        include: {
          user: {
            select: {
              walletAddress: true,
              nickname: true,
            }
          },
          event: {
            select: {
              name: true,
            }
          }
        }
      },
      activity: {
        select: {
          name: true,
          numOfTokens: true,
        }
      },
      proof: {
        select: {
          proofType: true,
          status: true,
          tokensAwarded: true,
          validatedAt: true,
        }
      }
    },
    orderBy: {
      timestamp: 'asc'
    }
  })
}

/**
 * Crear backup de datos y subirlo a Storacha
 */
export async function createBackupToStoracha(): Promise<{
  success: boolean
  cid?: string
  ipfsCid?: string | null
  scansCount: number
  activitiesCount: number
  error?: string
}> {
  try {
    console.log('====================================')
    console.log('🔄 INICIANDO BACKUP A STORACHA')
    console.log('====================================')

    // Obtener timestamp del último backup
    const lastBackup = await getLastBackupTimestamp()
    console.log('📅 Último backup:', lastBackup || 'Nunca')

    // Obtener datos para backup
    const scans = await getScansForBackup(lastBackup || undefined)
    const activities = await getCompletedActivitiesForBackup(lastBackup || undefined)

    console.log(`📊 Datos a respaldar:`)
    console.log(`   - Scans: ${scans.length}`)
    console.log(`   - Actividades completadas: ${activities.length}`)

    // Si no hay datos nuevos, no hacer backup
    if (scans.length === 0 && activities.length === 0) {
      console.log('ℹ️ No hay datos nuevos para respaldar')
      return {
        success: true,
        scansCount: 0,
        activitiesCount: 0
      }
    }

    // Preparar datos para backup
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      lastBackupTimestamp: lastBackup?.toISOString() || null,
      data: {
        scans: scans.map(scan => ({
          id: scan.id,
          timestamp: scan.timestamp.toISOString(),
          isValid: scan.isValid,
          user: {
            walletAddress: scan.user.walletAddress,
            nickname: scan.user.nickname,
          },
          activity: {
            name: scan.nfc.activity.name,
            tokens: scan.nfc.activity.numOfTokens,
            eventId: scan.nfc.activity.eventId,
          },
          event: {
            name: scan.nfc.event.name,
          }
        })),
        completedActivities: activities.map(activity => ({
          timestamp: activity.timestamp.toISOString(),
          status: activity.status,
          user: {
            walletAddress: activity.passport.user.walletAddress,
            nickname: activity.passport.user.nickname,
          },
          activity: {
            name: activity.activity.name,
            tokens: activity.activity.numOfTokens,
          },
          event: {
            name: activity.passport.event.name,
          },
          proof: activity.proof ? {
            type: activity.proof.proofType,
            status: activity.proof.status,
            tokensAwarded: activity.proof.tokensAwarded,
            validatedAt: activity.proof.validatedAt?.toISOString(),
          } : null
        }))
      },
      stats: {
        totalScans: scans.length,
        totalActivities: activities.length,
        totalRecords: scans.length + activities.length
      }
    }

    // Convertir a JSON
    const jsonData = JSON.stringify(backupData, null, 2)
    const sizeKB = (new TextEncoder().encode(jsonData).length / 1024).toFixed(2)

    console.log(`📦 Tamaño del backup: ${sizeKB} KB`)

    // Nombre del archivo con timestamp
    const filename = `backups/swagly-backup-${Date.now()}.json`

    console.log('📤 Subiendo a almacenamiento persistente...')
    const { vercelUrl, ipfsCid } = await uploadToStorage(filename, jsonData)

    console.log('====================================')
    console.log('✅ BACKUP COMPLETADO EXITOSAMENTE')
    console.log('====================================')
    console.log('📍 Vercel URL:', vercelUrl)
    if (ipfsCid) {
      console.log('📍 IPFS CID:', ipfsCid)
    }
    console.log('📊 Scans respaldados:', scans.length)
    console.log('📊 Actividades respaldadas:', activities.length)
    console.log('====================================')

    // Guardar timestamp del backup
    await saveBackupTimestamp(vercelUrl)

    return {
      success: true,
      cid: vercelUrl,
      ipfsCid: ipfsCid,
      scansCount: scans.length,
      activitiesCount: activities.length
    }
  } catch (error) {
    console.error('❌ Error creando backup a Storacha:', error)
    return {
      success: false,
      scansCount: 0,
      activitiesCount: 0,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============================================
// GESTIÓN DE METADATA DE BACKUPS
// ============================================

interface BackupMetadata {
  lastBackupTimestamp: Date | null
  lastBackupCid: string | null
  backupCount: number
}

let backupMetadata: BackupMetadata = {
  lastBackupTimestamp: null,
  lastBackupCid: null,
  backupCount: 0
}

/**
 * Obtener timestamp del último backup
 */
function getLastBackupTimestamp(): Date | null {
  return backupMetadata.lastBackupTimestamp
}

/**
 * Guardar timestamp del último backup
 */
function saveBackupTimestamp(cid: string) {
  backupMetadata.lastBackupTimestamp = new Date()
  backupMetadata.lastBackupCid = cid
  backupMetadata.backupCount++
}

/**
 * Obtener estadísticas de backups
 */
export function getBackupStats() {
  return {
    ...backupMetadata,
    isRunning: backupInterval !== null
  }
}

// ============================================
// CRON JOB - EJECUTAR CADA 60 SEGUNDOS
// ============================================

let backupInterval: NodeJS.Timeout | null = null

/**
 * Iniciar backups automáticos cada 60 segundos
 */
export function startAutomaticBackups() {
  if (backupInterval) {
    console.log('⚠️ Los backups automáticos ya están corriendo')
    return
  }

  console.log('====================================')
  console.log('🚀 INICIANDO BACKUPS AUTOMÁTICOS')
  console.log('====================================')
  console.log('⏱️ Intervalo: 60 segundos')
  console.log('📍 DID:', STORACHA_DID)
  console.log('====================================')

  // Ejecutar primer backup inmediatamente
  createBackupToStoracha()

  // Configurar intervalo de 60 segundos
  backupInterval = setInterval(() => {
    createBackupToStoracha()
  }, 60 * 1000) // 60 segundos

  console.log('✅ Backups automáticos iniciados')
}

/**
 * Detener backups automáticos
 */
export function stopAutomaticBackups() {
  if (backupInterval) {
    clearInterval(backupInterval)
    backupInterval = null
    console.log('🛑 Backups automáticos detenidos')
  }
}

/**
 * Verificar si los backups automáticos están corriendo
 */
export function areBackupsRunning(): boolean {
  return backupInterval !== null
}
