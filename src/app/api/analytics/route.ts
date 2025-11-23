import { NextRequest, NextResponse } from 'next/server'
import { generateMockAnalytics } from '@/lib/the-graph-indexer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const useMock = searchParams.get('useMock') === 'true'

    console.log('Analytics API called')

    if (useMock) {
      const mockData = await generateMockAnalytics()
      return NextResponse.json({
        success: true,
        indexed: true,
        protocol: 'The Graph',
        data: mockData
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Only mock data is available. Use useMock=true'
    }, { status: 400 })
  } catch (error) {
    console.error('Error en analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener analytics'
    }, { status: 500 })
  }
}
