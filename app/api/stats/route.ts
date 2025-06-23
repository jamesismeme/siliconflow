import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// 统计数据接口
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today' // today, week, month

    // 获取时间范围
    const now = new Date()
    let startDate: Date
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'today':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        break
    }

    // 1. 获取基础统计数据
    const totalCalls = await prisma.callLog.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const successfulCalls = await prisma.callLog.count({
      where: {
        success: true,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const failedCalls = totalCalls - successfulCalls
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls * 100) : 0

    // 2. 获取Token使用状况
    const tokens = await prisma.token.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        usageToday: true,
        limitPerDay: true,
        lastUsedAt: true,
        _count: {
          select: {
            callLogs: {
              where: {
                createdAt: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }
      }
    })

    // 3. 获取模型调用分布
    const modelStats = await prisma.callLog.groupBy({
      by: ['modelName'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        modelName: {
          not: null
        },
        NOT: {
          modelName: ''
        }
      },
      _count: {
        id: true
      },
      _avg: {
        responseTime: true
      }
    })

    // 4. 获取响应时间统计
    const responseTimeStats = await prisma.callLog.aggregate({
      where: {
        success: true,
        responseTime: {
          not: null
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _avg: {
        responseTime: true
      },
      _min: {
        responseTime: true
      },
      _max: {
        responseTime: true
      }
    })

    // 5. 获取Token使用量统计
    const tokenUsage = await prisma.callLog.groupBy({
      by: ['tokenId'],
      where: {
        tokenId: {
          not: null
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    // 6. 获取最近24小时的趋势数据
    const hourlyStats = await prisma.callLog.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        success: true,
        responseTime: true,
        createdAt: true
      }
    })

    // 按小时分组统计
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      hour.setMinutes(0, 0, 0)
      
      const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000)
      
      const hourCalls = hourlyStats.filter(log => 
        log.createdAt >= hour && log.createdAt < hourEnd
      )
      
      return {
        hour: hour.getHours(),
        time: hour.toISOString(),
        total: hourCalls.length,
        success: hourCalls.filter(log => log.success).length,
        avgResponseTime: hourCalls.length > 0 
          ? hourCalls.reduce((sum, log) => sum + (log.responseTime || 0), 0) / hourCalls.length 
          : 0
      }
    })

    // 构建响应数据
    const stats = {
      period,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      overview: {
        totalCalls,
        successfulCalls,
        failedCalls,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: responseTimeStats._avg.responseTime || 0,
        minResponseTime: responseTimeStats._min.responseTime || 0,
        maxResponseTime: responseTimeStats._max.responseTime || 0
      },
      tokens: tokens.map(token => ({
        id: token.id,
        name: token.name,
        usageToday: token.usageToday,
        limitPerDay: token.limitPerDay,
        usageRate: Math.round((token.usageToday / token.limitPerDay) * 100),
        callsInPeriod: token._count.callLogs,
        lastUsedAt: token.lastUsedAt,
        status: token.usageToday >= token.limitPerDay ? 'exhausted' : 
                token.usageToday > token.limitPerDay * 0.8 ? 'warning' : 'healthy'
      })),
      models: modelStats.map(model => ({
        name: model.modelName,
        calls: model._count?.id || 0,
        avgResponseTime: Math.round((model._avg?.responseTime || 0) * 100) / 100,
        percentage: Math.round(((model._count?.id || 0) / totalCalls) * 100 * 100) / 100
      })).sort((a, b) => b.calls - a.calls),
      trends: {
        hourly: hourlyData
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('[Stats API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
