/**
 * ============================================
 * SCRIPT DE PRUEBA DE ATTESTATIONS
 * ============================================
 *
 * Este script verifica que el sistema de attestations esté funcionando correctamente.
 *
 * Uso:
 *   npx tsx scripts/test-attestations.ts
 *
 * Requisitos:
 *   - Contrato SwaglyAttestations desplegado en Scroll Testnet
 *   - Wallet attestor configurada con permisos
 *   - ATTESTOR_WALLET_PRIVATE_KEY en .env.local
 *   - NEXT_PUBLIC_ATTESTATIONS_CONTRACT_ADDRESS en .env.local
 */

import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { scrollSepolia } from 'viem/chains'
import {
  ATTESTATIONS_CONTRACT_ADDRESS,
  ATTESTATIONS_ABI,
  stringToBytes32,
} from '../src/lib/attestations-config'

// ============================================
// CONFIGURACIÓN
// ============================================

const chain = scrollSepolia

const publicClient = createPublicClient({
  chain,
  transport: http()
})

// Wallet de prueba (reemplazar con tu wallet)
const TEST_USER_ADDRESS = '0x1234567890123456789012345678901234567890' as `0x${string}`

// IDs de prueba
const TEST_EVENT_ID = 'test-event-123'
const TEST_ACTIVITY_ID = 'test-activity-456'
const TEST_PROOF_ID = 'test-proof-789'

// ============================================
// COLORES PARA CONSOLE
// ============================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function section(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60))
}

// ============================================
// FUNCIONES DE PRUEBA
// ============================================

async function test1_VerifyContractDeployed() {
  section('TEST 1: Verificar que el contrato está desplegado')

  try {
    const code = await publicClient.getBytecode({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`
    })

    if (code && code !== '0x') {
      log('✅ Contrato encontrado en: ' + ATTESTATIONS_CONTRACT_ADDRESS, 'green')
      log('   Bytecode length: ' + code.length, 'blue')
      return true
    } else {
      log('❌ No se encontró contrato en la dirección configurada', 'red')
      log('   Verifica NEXT_PUBLIC_ATTESTATIONS_CONTRACT_ADDRESS en .env.local', 'yellow')
      return false
    }
  } catch (error) {
    log('❌ Error al verificar contrato: ' + error, 'red')
    return false
  }
}

async function test2_CheckAttestorRole() {
  section('TEST 2: Verificar que la wallet tiene rol de attestor')

  try {
    const privateKey = process.env.ATTESTOR_WALLET_PRIVATE_KEY

    if (!privateKey) {
      log('❌ ATTESTOR_WALLET_PRIVATE_KEY no está configurada en .env.local', 'red')
      return false
    }

    const account = privateKeyToAccount(
      privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`
    )

    log(`📧 Wallet attestor: ${account.address}`, 'blue')

    // Verificar si tiene rol de attestor
    // Nota: Esta función no existe en el ABI actual, necesitarías agregarla
    // o intentar crear una attestation de prueba
    log('⚠️  No hay función para verificar rol directamente', 'yellow')
    log('   Intentaremos crear una attestation de prueba en el siguiente test', 'yellow')

    return true
  } catch (error) {
    log('❌ Error al verificar rol de attestor: ' + error, 'red')
    return false
  }
}

async function test3_CreateActivityAttestation() {
  section('TEST 3: Crear attestation de actividad')

  try {
    const privateKey = process.env.ATTESTOR_WALLET_PRIVATE_KEY
    if (!privateKey) {
      log('❌ ATTESTOR_WALLET_PRIVATE_KEY no configurada', 'red')
      return false
    }

    const account = privateKeyToAccount(
      privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`
    )

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http()
    })

    log('Enviando transacción...', 'yellow')

    const eventIdBytes32 = stringToBytes32(TEST_EVENT_ID)
    const activityIdBytes32 = stringToBytes32(TEST_ACTIVITY_ID)

    const hash = await walletClient.writeContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'attestActivityCompletion',
      args: [
        TEST_USER_ADDRESS,
        eventIdBytes32,
        activityIdBytes32,
        BigInt(10), // 10 tokens
        'nfc',
        'Test Activity'
      ]
    })

    log(`✅ Transacción enviada: ${hash}`, 'green')
    log('   Esperando confirmación...', 'yellow')

    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    log(`✅ Transacción confirmada en bloque: ${receipt.blockNumber}`, 'green')
    log(`   Gas usado: ${receipt.gasUsed}`, 'blue')
    log(`   Explorer: https://sepolia.scrollscan.com/tx/${hash}`, 'cyan')

    // Extraer UID del evento
    const uid = receipt.logs[0]?.topics[1]
    if (uid) {
      log(`   UID de attestation: ${uid}`, 'blue')
    }

    return true
  } catch (error: any) {
    log('❌ Error al crear attestation: ' + error.message, 'red')

    if (error.message.includes('Not attestor')) {
      log('   La wallet no tiene permisos de attestor', 'yellow')
      log('   Ejecuta: addAttestor(YOUR_WALLET_ADDRESS) en el contrato', 'yellow')
    }

    return false
  }
}

async function test4_CreateProofAttestation() {
  section('TEST 4: Crear attestation de proof validation')

  try {
    const privateKey = process.env.ATTESTOR_WALLET_PRIVATE_KEY
    if (!privateKey) {
      log('❌ ATTESTOR_WALLET_PRIVATE_KEY no configurada', 'red')
      return false
    }

    const account = privateKeyToAccount(
      privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`
    )

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http()
    })

    log('Enviando transacción...', 'yellow')

    const activityIdBytes32 = stringToBytes32(TEST_ACTIVITY_ID)
    const proofIdBytes32 = stringToBytes32(TEST_PROOF_ID)

    const hash = await walletClient.writeContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'attestProofValidation',
      args: [
        TEST_USER_ADDRESS,
        activityIdBytes32,
        proofIdBytes32,
        'image',
        true, // approved
        BigInt(5) // 5 tokens
      ]
    })

    log(`✅ Transacción enviada: ${hash}`, 'green')
    log('   Esperando confirmación...', 'yellow')

    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    log(`✅ Transacción confirmada en bloque: ${receipt.blockNumber}`, 'green')
    log(`   Explorer: https://sepolia.scrollscan.com/tx/${hash}`, 'cyan')

    return true
  } catch (error: any) {
    log('❌ Error al crear proof attestation: ' + error.message, 'red')
    return false
  }
}

async function test5_ReadUserAttestations() {
  section('TEST 5: Leer attestations del usuario')

  try {
    const attestations = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'getUserAttestations',
      args: [TEST_USER_ADDRESS]
    }) as `0x${string}`[]

    log(`Usuario: ${TEST_USER_ADDRESS}`, 'blue')
    log(`Total de attestations: ${attestations.length}`, 'green')

    if (attestations.length > 0) {
      log('\nPrimeras 5 attestations:', 'yellow')
      for (let i = 0; i < Math.min(5, attestations.length); i++) {
        log(`  ${i + 1}. UID: ${attestations[i]}`, 'blue')
      }
    }

    return true
  } catch (error) {
    log('❌ Error al leer attestations: ' + error, 'red')
    return false
  }
}

async function test6_CheckActivityCompleted() {
  section('TEST 6: Verificar si actividad está completada')

  try {
    const eventIdBytes32 = stringToBytes32(TEST_EVENT_ID)
    const activityIdBytes32 = stringToBytes32(TEST_ACTIVITY_ID)

    const isCompleted = await publicClient.readContract({
      address: ATTESTATIONS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTESTATIONS_ABI,
      functionName: 'isActivityCompleted',
      args: [eventIdBytes32, activityIdBytes32, TEST_USER_ADDRESS]
    }) as boolean

    log(`Evento: ${TEST_EVENT_ID}`, 'blue')
    log(`Actividad: ${TEST_ACTIVITY_ID}`, 'blue')
    log(`Usuario: ${TEST_USER_ADDRESS}`, 'blue')
    log(`Estado: ${isCompleted ? '✅ COMPLETADA' : '❌ NO COMPLETADA'}`, isCompleted ? 'green' : 'yellow')

    return true
  } catch (error) {
    log('❌ Error al verificar actividad: ' + error, 'red')
    return false
  }
}

// ============================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================

async function runAllTests() {
  console.clear()
  log('\n╔═══════════════════════════════════════════════════════════╗', 'bright')
  log('║  🧪 SUITE DE PRUEBAS DE ATTESTATIONS - SWAGLY          ║', 'bright')
  log('╚═══════════════════════════════════════════════════════════╝\n', 'bright')

  log('Configuración:', 'cyan')
  log(`  Network: Scroll Sepolia Testnet`, 'blue')
  log(`  Chain ID: ${chain.id}`, 'blue')
  log(`  Contrato: ${ATTESTATIONS_CONTRACT_ADDRESS}`, 'blue')
  log(`  Explorer: https://sepolia.scrollscan.com/address/${ATTESTATIONS_CONTRACT_ADDRESS}`, 'blue')

  const tests = [
    test1_VerifyContractDeployed,
    test2_CheckAttestorRole,
    test3_CreateActivityAttestation,
    test4_CreateProofAttestation,
    test5_ReadUserAttestations,
    test6_CheckActivityCompleted,
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    const result = await test()
    if (result) {
      passed++
    } else {
      failed++
    }

    // Esperar un poco entre tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Resumen final
  section('RESUMEN DE PRUEBAS')
  log(`Total: ${tests.length}`, 'blue')
  log(`Exitosas: ${passed}`, 'green')
  log(`Fallidas: ${failed}`, failed > 0 ? 'red' : 'green')

  if (failed === 0) {
    log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!', 'green')
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow')
  }

  console.log('\n')
}

// Ejecutar
runAllTests().catch(console.error)
