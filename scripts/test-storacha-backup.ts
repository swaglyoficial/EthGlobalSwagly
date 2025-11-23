/**
 * ============================================
 * SCRIPT DE PRUEBA - BACKUP A STORACHA
 * ============================================
 *
 * Este script prueba la funcionalidad de backup a Storacha
 *
 * Uso:
 * npx tsx scripts/test-storacha-backup.ts
 */

import { createBackupToStoracha } from '../src/lib/storacha-backup'

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║  🧪 PRUEBA DE BACKUP A STORACHA - SWAGLY               ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('')

  console.log('Ejecutando backup manual...')
  console.log('')

  const result = await createBackupToStoracha()

  console.log('')
  console.log('============================================================')
  console.log('RESULTADO DEL BACKUP')
  console.log('============================================================')

  if (result.success) {
    console.log('✅ Estado: EXITOSO')
    console.log('')
    console.log('📊 Estadísticas:')
    console.log(`   - Scans respaldados: ${result.scansCount}`)
    console.log(`   - Actividades respaldadas: ${result.activitiesCount}`)
    console.log(`   - Total de registros: ${result.scansCount + result.activitiesCount}`)
    console.log('')

    if (result.cid) {
      console.log('📍 IPFS CID:', result.cid)
      console.log('🔗 IPFS URL:', `https://${result.cid}.ipfs.w3s.link`)
      console.log('')
      console.log('💡 Puedes acceder al backup en:')
      console.log(`   https://w3s.link/ipfs/${result.cid}`)
    }
  } else {
    console.log('❌ Estado: FALLIDO')
    console.log('')
    console.log('⚠️ Error:', result.error)
  }

  console.log('============================================================')
  console.log('')

  // Cerrar conexión a la base de datos
  const { prisma } = await import('../src/lib/prisma')
  await prisma.$disconnect()

  process.exit(result.success ? 0 : 1)
}

main()
