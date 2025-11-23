/**
 * ============================================
 * THE GRAPH INDEXER - SWAGLY ANALYTICS
 * ============================================
 *
 * Este servicio emula The Graph Protocol para indexar y consultar
 * datos de escaneos de stickers de forma eficiente.
 *
 * Similar a The Graph, indexamos eventos on-chain y off-chain
 * para proveer queries rápidas sin sobrecargar la base de datos principal.
 */

import { prisma } from '@/lib/prisma'

// ============================================
// TIPOS DE DATOS INDEXADOS
// ============================================

export interface ScanEvent {
  id: string
  timestamp: Date
  userAddress: string
  userNickname: string | null
  activityId: string
  activityName: string
  eventId: string
  eventName: string
  tokensAwarded: number
  scanType: 'nfc' | 'qr'
  txHash?: string
  blockNumber?: number
}

export interface ActivityStats {
  activityId: string
  activityName: string
  totalScans: number
  uniqueUsers: number
  totalTokensDistributed: number
  averageTokensPerScan: number
  firstScan: Date | null
  lastScan: Date | null
  scansPerHour: { hour: string; count: number }[]
}

export interface UserStats {
  userAddress: string
  userNickname: string | null
  totalScans: number
  totalTokensEarned: number
  activitiesCompleted: number
  firstActivity: Date | null
  lastActivity: Date | null
  rank: number
}

export interface EventStats {
  eventId: string
  eventName: string
  totalScans: number
  totalParticipants: number
  totalTokensDistributed: number
  activitiesCount: number
  topActivities: { name: string; scans: number }[]
  topUsers: { address: string; nickname: string | null; tokens: number }[]
  timeline: { date: string; scans: number; users: number }[]
}

// ============================================
// INDEXER - CONSULTAS TIPO THE GRAPH
// ============================================

/**
 * Obtener todos los eventos de escaneo (Similar a The Graph Query)
 */
export async function indexScanEvents(options?: {
  first?: number
  skip?: number
  orderBy?: 'timestamp' | 'tokensAwarded'
  orderDirection?: 'asc' | 'desc'
  where?: {
    userAddress?: string
    activityId?: string
    eventId?: string
    timestamp_gte?: Date
    timestamp_lte?: Date
  }
}): Promise<ScanEvent[]> {
  const {
    first = 100,
    skip = 0,
    orderBy = 'timestamp',
    orderDirection = 'desc',
    where = {}
  } = options || {}

  const scans = await prisma.scan.findMany({
    where: {
      ...(where.userAddress && {
        user: { walletAddress: where.userAddress }
      }),
      ...(where.timestamp_gte && {
        timestamp: { gte: where.timestamp_gte }
      }),
      ...(where.timestamp_lte && {
        timestamp: { lte: where.timestamp_lte }
      }),
    },
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
              id: true,
              name: true,
              numOfTokens: true,
              eventId: true,
            }
          },
          event: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    },
    orderBy: {
      [orderBy]: orderDirection
    },
    take: first,
    skip: skip
  })

  return scans.map(scan => ({
    id: scan.id,
    timestamp: scan.timestamp,
    userAddress: scan.user.walletAddress,
    userNickname: scan.user.nickname,
    activityId: scan.nfc.activity.id,
    activityName: scan.nfc.activity.name,
    eventId: scan.nfc.activity.eventId,
    eventName: scan.nfc.event.name,
    tokensAwarded: scan.nfc.activity.numOfTokens,
    scanType: 'nfc' as const,
  }))
}

/**
 * Obtener estadísticas por actividad
 */
export async function getActivityStats(activityId?: string): Promise<ActivityStats[]> {
  const scans = await prisma.scan.findMany({
    where: activityId ? {
      nfc: {
        activityId: activityId
      }
    } : undefined,
    include: {
      user: true,
      nfc: {
        include: {
          activity: true
        }
      }
    }
  })

  // Agrupar por actividad
  const grouped = scans.reduce((acc, scan) => {
    const actId = scan.nfc.activityId
    if (!acc[actId]) {
      acc[actId] = {
        activityId: actId,
        activityName: scan.nfc.activity.name,
        scans: [],
        users: new Set<string>()
      }
    }
    acc[actId].scans.push(scan)
    acc[actId].users.add(scan.user.walletAddress)
    return acc
  }, {} as Record<string, any>)

  // Calcular estadísticas
  return Object.values(grouped).map((group: any) => {
    const totalTokens = group.scans.reduce((sum: number, s: any) => sum + s.nfc.activity.numOfTokens, 0)
    const timestamps = group.scans.map((s: any) => s.timestamp).sort()

    // Scans por hora
    const hourlyScans = group.scans.reduce((acc: any, scan: any) => {
      const hour = new Date(scan.timestamp).toISOString().slice(0, 13) + ':00:00'
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    return {
      activityId: group.activityId,
      activityName: group.activityName,
      totalScans: group.scans.length,
      uniqueUsers: group.users.size,
      totalTokensDistributed: totalTokens,
      averageTokensPerScan: totalTokens / group.scans.length,
      firstScan: timestamps[0] || null,
      lastScan: timestamps[timestamps.length - 1] || null,
      scansPerHour: Object.entries(hourlyScans).map(([hour, count]) => ({
        hour,
        count: count as number
      }))
    }
  })
}

/**
 * Obtener estadísticas por usuario (Leaderboard)
 */
export async function getUserStats(limit: number = 100): Promise<UserStats[]> {
  const scans = await prisma.scan.findMany({
    include: {
      user: true,
      nfc: {
        include: {
          activity: true
        }
      }
    }
  })

  // Agrupar por usuario
  const grouped = scans.reduce((acc, scan) => {
    const addr = scan.user.walletAddress
    if (!acc[addr]) {
      acc[addr] = {
        userAddress: addr,
        userNickname: scan.user.nickname,
        scans: [],
        activities: new Set<string>()
      }
    }
    acc[addr].scans.push(scan)
    acc[addr].activities.add(scan.nfc.activityId)
    return acc
  }, {} as Record<string, any>)

  // Calcular estadísticas y ordenar
  const stats = Object.values(grouped).map((group: any) => {
    const totalTokens = group.scans.reduce((sum: number, s: any) => sum + s.nfc.activity.numOfTokens, 0)
    const timestamps = group.scans.map((s: any) => s.timestamp).sort()

    return {
      userAddress: group.userAddress,
      userNickname: group.userNickname,
      totalScans: group.scans.length,
      totalTokensEarned: totalTokens,
      activitiesCompleted: group.activities.size,
      firstActivity: timestamps[0] || null,
      lastActivity: timestamps[timestamps.length - 1] || null,
      rank: 0 // Se asigna después
    }
  }).sort((a, b) => b.totalTokensEarned - a.totalTokensEarned)

  // Asignar ranking
  stats.forEach((stat, index) => {
    stat.rank = index + 1
  })

  return stats.slice(0, limit)
}

/**
 * Obtener estadísticas por evento (Dashboard completo)
 */
export async function getEventStats(eventId?: string): Promise<EventStats[]> {
  const scans = await prisma.scan.findMany({
    where: eventId ? {
      nfc: {
        eventId: eventId
      }
    } : undefined,
    include: {
      user: true,
      nfc: {
        include: {
          activity: true,
          event: true
        }
      }
    }
  })

  // Agrupar por evento
  const grouped = scans.reduce((acc, scan) => {
    const evtId = scan.nfc.eventId
    if (!acc[evtId]) {
      acc[evtId] = {
        eventId: evtId,
        eventName: scan.nfc.event.name,
        scans: [],
        users: new Set<string>(),
        activities: new Map<string, { name: string; count: number }>(),
        userTokens: new Map<string, { nickname: string | null; tokens: number }>()
      }
    }

    const event = acc[evtId]
    event.scans.push(scan)
    event.users.add(scan.user.walletAddress)

    // Contar por actividad
    const actId = scan.nfc.activityId
    const actName = scan.nfc.activity.name
    if (!event.activities.has(actId)) {
      event.activities.set(actId, { name: actName, count: 0 })
    }
    event.activities.get(actId)!.count++

    // Tokens por usuario
    const userAddr = scan.user.walletAddress
    if (!event.userTokens.has(userAddr)) {
      event.userTokens.set(userAddr, { nickname: scan.user.nickname, tokens: 0 })
    }
    event.userTokens.get(userAddr)!.tokens += scan.nfc.activity.numOfTokens

    return acc
  }, {} as Record<string, any>)

  // Calcular estadísticas
  return Object.values(grouped).map((group: any) => {
    const totalTokens = group.scans.reduce((sum: number, s: any) => sum + s.nfc.activity.numOfTokens, 0)

    // Top actividades
    const topActivities = Array.from(group.activities.values())
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
      .map((a: any) => ({ name: a.name, scans: a.count }))

    // Top usuarios
    const topUsers = (Array.from(group.userTokens.entries()) as [string, any][])
      .map((entry) => ({
        address: entry[0],
        nickname: entry[1].nickname,
        tokens: entry[1].tokens
      }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10)

    // Timeline por día
    const dailyScans = group.scans.reduce((acc: any, scan: any) => {
      const date = new Date(scan.timestamp).toISOString().slice(0, 10)
      if (!acc[date]) {
        acc[date] = { scans: 0, users: new Set() }
      }
      acc[date].scans++
      acc[date].users.add(scan.user.walletAddress)
      return acc
    }, {})

    const timeline = (Object.entries(dailyScans) as [string, any][]).map((entry) => ({
      date: entry[0],
      scans: entry[1].scans,
      users: entry[1].users.size
    })).sort((a, b) => a.date.localeCompare(b.date))

    return {
      eventId: group.eventId,
      eventName: group.eventName,
      totalScans: group.scans.length,
      totalParticipants: group.users.size,
      totalTokensDistributed: totalTokens,
      activitiesCount: group.activities.size,
      topActivities,
      topUsers,
      timeline
    }
  })
}

/**
 * Generar datos de ejemplo para demostración
 */
export async function generateMockAnalytics() {
  // Esta función retorna datos mockeados para cuando no hay datos reales
  const now = new Date()
  const mockData = {
    totalScans: 156,
    totalUsers: 42,
    totalTokens: 7800,
    averageScansPerUser: 3.7,

    recentScans: Array.from({ length: 10 }, (_, i) => ({
      id: `scan-${i}`,
      timestamp: new Date(now.getTime() - i * 3600000),
      userAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      userNickname: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'][i % 5],
      activityName: ['Scan Sponsor Booth', 'Complete Workshop', 'Network Event', 'Demo Presentation'][i % 4],
      tokensAwarded: [50, 100, 75, 150][i % 4],
    })),

    topActivities: [
      { name: 'Scan Sponsor Booth', scans: 45, tokens: 2250 },
      { name: 'Complete Workshop', scans: 38, tokens: 3800 },
      { name: 'Network Event', scans: 32, tokens: 2400 },
      { name: 'Demo Presentation', scans: 25, tokens: 3750 },
      { name: 'Hackathon Submission', scans: 16, tokens: 2400 },
    ],

    topUsers: [
      { address: '0x1234...5678', nickname: 'CryptoKing', scans: 12, tokens: 1200, rank: 1 },
      { address: '0x2345...6789', nickname: 'BlockchainQueen', scans: 10, tokens: 1050, rank: 2 },
      { address: '0x3456...7890', nickname: 'Web3Wizard', scans: 9, tokens: 950, rank: 3 },
      { address: '0x4567...8901', nickname: 'NFTNinja', scans: 8, tokens: 800, rank: 4 },
      { address: '0x5678...9012', nickname: 'DeFiDegen', scans: 7, tokens: 750, rank: 5 },
    ],

    hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      scans: Math.floor(Math.random() * 15) + 1,
      users: Math.floor(Math.random() * 8) + 1,
    })),

    dailyTimeline: Array.from({ length: 7 }, (_, day) => {
      const date = new Date(now.getTime() - (6 - day) * 86400000)
      return {
        date: date.toISOString().slice(0, 10),
        scans: Math.floor(Math.random() * 30) + 10,
        users: Math.floor(Math.random() * 15) + 5,
        tokens: Math.floor(Math.random() * 2000) + 500,
      }
    })
  }

  return mockData
}
