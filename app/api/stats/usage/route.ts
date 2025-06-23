import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// 详细使用统计API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7') // 默认7天
    const groupBy = searchParams.get('groupBy') || 'day' // day, hour, model

    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // 1. 获取时间序列数据
    const callLogs = await prisma.callLog.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        success: true,
        responseTime: true,
        modelName: true,
        inputTokens: true,
        outputTokens: true,
        createdAt: true,
        tokenId: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // 2. 按天分组统计
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const dayCalls = callLogs.filter(log => 
        log.createdAt >= date && log.createdAt < nextDate
      )
      
      const successCalls = dayCalls.filter(log => log.success)
      
      return {
        date: date.toISOString().split('T')[0],
        total: dayCalls.length,
        success: successCalls.length,
        failed: dayCalls.length - successCalls.length,
        successRate: dayCalls.length > 0 ? (successCalls.length / dayCalls.length * 100) : 0,
        avgResponseTime: successCalls.length > 0 
          ? successCalls.reduce((sum, log) => sum + (log.responseTime || 0), 0) / successCalls.length 
          : 0,
        totalTokens: dayCalls.reduce((sum, log) => sum + (log.inputTokens || 0) + (log.outputTokens || 0), 0)
      }
    })

    // 3. 模型使用统计
    const modelUsage = callLogs.reduce((acc, log) => {
      if (!acc[log.modelName]) {
        acc[log.modelName] = {
          name: log.modelName,
          total: 0,
          success: 0,
          failed: 0,
          totalResponseTime: 0,
          successfulResponseTime: 0,
          totalTokens: 0,
          dailyData: Array.from({ length: days }, () => ({ calls: 0, success: 0 }))
        }
      }
      
      acc[log.modelName].total++
      if (log.success) {
        acc[log.modelName].success++
        acc[log.modelName].successfulResponseTime += log.responseTime || 0
      } else {
        acc[log.modelName].failed++
      }
      acc[log.modelName].totalTokens += (log.inputTokens || 0) + (log.outputTokens || 0)
      
      // 添加到每日数据
      const dayIndex = Math.floor((log.createdAt.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      if (dayIndex >= 0 && dayIndex < days) {
        acc[log.modelName].dailyData[dayIndex].calls++
        if (log.success) {
          acc[log.modelName].dailyData[dayIndex].success++
        }
      }
      
      return acc
    }, {} as Record<string, any>)

    // 4. Token使用统计
    const tokenUsage = callLogs.reduce((acc, log) => {
      if (log.tokenId) {
        if (!acc[log.tokenId]) {
          acc[log.tokenId] = {
            tokenId: log.tokenId,
            total: 0,
            success: 0,
            failed: 0,
            avgResponseTime: 0,
            totalResponseTime: 0,
            successfulCalls: 0
          }
        }
        
        acc[log.tokenId].total++
        if (log.success) {
          acc[log.tokenId].success++
          acc[log.tokenId].successfulCalls++
          acc[log.tokenId].totalResponseTime += log.responseTime || 0
        } else {
          acc[log.tokenId].failed++
        }
      }
      return acc
    }, {} as Record<number, any>)

    // 计算Token平均响应时间
    Object.values(tokenUsage).forEach((token: any) => {
      token.avgResponseTime = token.successfulCalls > 0 
        ? token.totalResponseTime / token.successfulCalls 
        : 0
    })

    // 5. 获取Token详细信息
    const tokenIds = Object.keys(tokenUsage).map(id => parseInt(id))
    const tokens = await prisma.token.findMany({
      where: {
        id: {
          in: tokenIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    // 合并Token信息
    const tokenStats = Object.values(tokenUsage).map((usage: any) => {
      const token = tokens.find(t => t.id === usage.tokenId)
      return {
        ...usage,
        name: token?.name || `Token ${usage.tokenId}`,
        successRate: usage.total > 0 ? (usage.success / usage.total * 100) : 0
      }
    }).sort((a, b) => b.total - a.total)

    // 6. 响应时间分布统计
    const responseTimeRanges = [
      { min: 0, max: 1000, label: '< 1s' },
      { min: 1000, max: 3000, label: '1-3s' },
      { min: 3000, max: 5000, label: '3-5s' },
      { min: 5000, max: 10000, label: '5-10s' },
      { min: 10000, max: Infinity, label: '> 10s' }
    ]

    const responseTimeDistribution = responseTimeRanges.map(range => {
      const count = callLogs.filter(log => 
        log.success && 
        log.responseTime && 
        log.responseTime >= range.min && 
        log.responseTime < range.max
      ).length
      
      return {
        label: range.label,
        count,
        percentage: callLogs.length > 0 ? (count / callLogs.length * 100) : 0
      }
    })

    // 构建响应数据
    const usageStats = {
      timeRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        days
      },
      summary: {
        totalCalls: callLogs.length,
        successfulCalls: callLogs.filter(log => log.success).length,
        failedCalls: callLogs.filter(log => !log.success).length,
        totalTokens: callLogs.reduce((sum, log) => sum + (log.inputTokens || 0) + (log.outputTokens || 0), 0),
        avgResponseTime: callLogs.filter(log => log.success && log.responseTime).length > 0
          ? callLogs.filter(log => log.success && log.responseTime)
              .reduce((sum, log) => sum + (log.responseTime || 0), 0) / 
            callLogs.filter(log => log.success && log.responseTime).length
          : 0
      },
      trends: {
        daily: dailyStats
      },
      models: Object.values(modelUsage).map((model: any) => ({
        name: model.name,
        total: model.total,
        success: model.success,
        failed: model.failed,
        successRate: model.total > 0 ? (model.success / model.total * 100) : 0,
        avgResponseTime: model.success > 0 ? (model.successfulResponseTime / model.success) : 0,
        totalTokens: model.totalTokens,
        dailyData: model.dailyData
      })).sort((a, b) => b.total - a.total),
      tokens: tokenStats,
      responseTimeDistribution
    }

    return NextResponse.json({
      success: true,
      data: usageStats
    })

  } catch (error) {
    console.error('[Usage Stats API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch usage statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
