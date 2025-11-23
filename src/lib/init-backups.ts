/**
 * ============================================
 * INICIALIZADOR DE BACKUPS AUTOMÁTICOS
 * ============================================
 *
 * Este archivo se encarga de iniciar los backups automáticos
 * cuando la aplicación arranca.
 */

import { startAutomaticBackups } from './storacha-backup'

let initialized = false

/**
 * Inicializar backups automáticos
 * Solo se ejecuta una vez cuando la app arranca
 */
export function initializeBackups() {
  if (initialized) {
    console.log('⚠️ Backups ya inicializados')
    return
  }

  // Verificar que estemos en el servidor
  if (typeof window !== 'undefined') {
    console.warn('⚠️ initializeBackups solo debe ejecutarse en el servidor')
    return
  }

  console.log('🚀 Inicializando sistema de backups automáticos...')

  // Iniciar backups automáticos
  startAutomaticBackups()

  initialized = true
}
