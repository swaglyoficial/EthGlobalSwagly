'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, TrendingUp, Users, Scan, Coins, Award, BarChart3, Loader2, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface TheGraphAnalytics {
  totalScans: number
  totalUsers: number
  totalTokens: number
  averageScansPerUser: number
  recentScans: Array<{
    id: string
    timestamp: Date
    userAddress: string
    userNickname: string | null
    activityName: string
    tokensAwarded: number
  }>
  topActivities: Array<{
    name: string
    scans: number
    tokens: number
  }>
  topUsers: Array<{
    address: string
    nickname: string | null
    scans: number
    tokens: number
    rank: number
  }>
  hourlyActivity: Array<{
    hour: string
    scans: number
    users: number
  }>
  dailyTimeline: Array<{
    date: string
    scans: number
    users: number
    tokens: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<TheGraphAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        // Usar datos mock para demostración
        const response = await fetch('/api/analytics?type=overview&useMock=true')
        const data = await response.json()

        if (data.success) {
          setAnalytics(data.data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-cyan-200">Indexando datos con The Graph...</p>
        </div>
      </main>
    )
  }

  if (!analytics) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
        <div className="text-center">
          <p className="text-cyan-100">Error al cargar analíticas</p>
          <Button asChild className="mt-4">
            <Link href="/admin">Volver al dashboard</Link>
          </Button>
        </div>
      </main>
    )
  }

  const COLORS = ['#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#a855f7']

  const glassCard =
    'border-cyan-500/20 bg-black/60 text-cyan-100 shadow-[0_0_28px_rgba(0,240,255,0.1)] backdrop-blur'

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-cyan-50">
      {/* Background decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="neon-grid absolute inset-0 opacity-10" aria-hidden />
        <div
          className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-cyan-500/15 blur-[120px]"
          aria-hidden
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] h-80 w-80 rounded-full bg-cyan-400/20 blur-[140px]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="flex flex-col gap-4 rounded-3xl border border-cyan-500/30 bg-black/60 p-6 shadow-[0_0_38px_rgba(0,240,255,0.15)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                size="icon"
                className="border-cyan-500/60 bg-black/40 text-cyan-100 hover:bg-cyan-500/10"
              >
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">Analytics Dashboard</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-cyan-200/80">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span>Powered by <span className="font-semibold text-purple-400">The Graph</span> Protocol</span>
                  <div className="ml-2 flex items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Indexado en tiempo real</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Métricas principales */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className={glassCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-300">
                Total Scans
              </CardTitle>
              <Scan className="h-5 w-5 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analytics.totalScans}</div>
              <p className="text-xs text-cyan-200/60 mt-1">Stickers escaneados</p>
            </CardContent>
          </Card>

          <Card className={glassCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-300">
                Usuarios Activos
              </CardTitle>
              <Users className="h-5 w-5 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analytics.totalUsers}</div>
              <p className="text-xs text-cyan-200/60 mt-1">{(analytics.averageScansPerUser).toFixed(1)} scans por usuario</p>
            </CardContent>
          </Card>

          <Card className={glassCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-300">
                Tokens Distribuidos
              </CardTitle>
              <Coins className="h-5 w-5 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analytics.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-cyan-200/60 mt-1">SWAG tokens</p>
            </CardContent>
          </Card>

          <Card className={glassCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-300">
                Engagement Rate
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {((analytics.totalScans / analytics.topActivities.length) || 0).toFixed(1)}
              </div>
              <p className="text-xs text-cyan-200/60 mt-1">Scans por actividad</p>
            </CardContent>
          </Card>
        </section>

        {/* Timeline de actividad */}
        <Card className={glassCard}>
          <CardHeader>
            <CardTitle className="text-white">Actividad por Día</CardTitle>
            <CardDescription className="text-cyan-200/70">
              Scans, usuarios y tokens distribuidos en los últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                <XAxis dataKey="date" stroke="#06b6d4" tick={{ fontSize: 12 }} />
                <YAxis stroke="#06b6d4" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#06b6d4" strokeWidth={2} name="Scans" />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} name="Usuarios" />
                <Line type="monotone" dataKey="tokens" stroke="#f59e0b" strokeWidth={2} name="Tokens" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráficas */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Actividades */}
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle className="text-white">Top Actividades por Scans</CardTitle>
              <CardDescription className="text-cyan-200/70">
                Actividades más populares
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topActivities} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                  <XAxis type="number" stroke="#06b6d4" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#06b6d4"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="scans" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Actividad por hora */}
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle className="text-white">Actividad por Hora</CardTitle>
              <CardDescription className="text-cyan-200/70">
                Scans realizados por hora del día
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                  <XAxis dataKey="hour" stroke="#06b6d4" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#06b6d4" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="scans" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className={glassCard}>
          <CardHeader>
            <CardTitle className="text-white">Top 5 Usuarios - Leaderboard</CardTitle>
            <CardDescription className="text-cyan-200/70">
              Usuarios más activos por tokens ganados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topUsers.map((user, index) => (
                <div
                  key={user.address}
                  className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-black/40 p-4 transition-colors hover:bg-cyan-500/5"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-500/20 text-gray-400' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      #{user.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {user.nickname || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                      </div>
                      <div className="text-xs text-cyan-200/60">
                        {user.address.slice(0, 10)}...{user.address.slice(-8)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-cyan-200/80">{user.scans} scans</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{user.tokens.toLocaleString()}</div>
                      <div className="text-xs text-cyan-200/60">SWAG tokens</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de scans recientes */}
        <Card className={glassCard}>
          <CardHeader>
            <CardTitle className="text-white">Scans Recientes</CardTitle>
            <CardDescription className="text-cyan-200/70">
              Últimos 10 stickers escaneados (indexados por The Graph)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/20">
                    <th className="pb-3 text-left font-medium text-cyan-300">Usuario</th>
                    <th className="pb-3 text-left font-medium text-cyan-300">Actividad</th>
                    <th className="pb-3 text-center font-medium text-cyan-300">Tokens</th>
                    <th className="pb-3 text-right font-medium text-cyan-300">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentScans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="border-b border-cyan-500/10 transition-colors hover:bg-cyan-500/5"
                    >
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-white">
                            {scan.userNickname || `${scan.userAddress.slice(0, 6)}...${scan.userAddress.slice(-4)}`}
                          </div>
                          <div className="text-xs text-cyan-200/60">{scan.userAddress.slice(0, 10)}...</div>
                        </div>
                      </td>
                      <td className="py-3 text-cyan-100">{scan.activityName}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                          +{scan.tokensAwarded} SWAG
                        </span>
                      </td>
                      <td className="py-3 text-right text-xs text-cyan-200/60">
                        {new Date(scan.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
