/**
 * 客户端统计 Hook
 * 基于 LocalStorage 数据进行统计计算
 */

import { useState, useCallback, useMemo } from 'react'
import { LocalStorageManager } from '@/lib/storage'
import { useTokenStore } from '@/lib/stores/token-store'
import type { CallHistory, Token } from '@/lib/storage/types'

// 统计数据接口
export interface ClientStatsData {
  overview: {
    totalCalls: number
    totalTokens: number
    totalErrors: number
    successRate: number
    averageResponseTime: number
  }
  models: {
    [modelName: string]: {
      calls: number
      errors: number
      averageResponseTime: number
      lastUsed: string
    }
  }
  tokens: {
    [tokenId: string]: {
      name: string
      calls: number
      errors: number
      usageToday: number
      limitPerDay: number
      lastUsed: string
    }
  }
  timeline: {
    date: string
    calls: number
    errors: number
    averageResponseTime: number
  }[]
  categories: {
    [category: string]: {
      calls: number
      errors: number
      averageResponseTime: number
    }
  }
}

// 使用统计接口
export interface ClientUsageStats {
  period: 'today' | 'week' | 'month'
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  successRate: number
  averageResponseTime: number
  totalTokensUsed: number
  topModels: {
    name: string
    calls: number
    percentage: number
  }[]
  topTokens: {
    id: string
    name: string
    calls: number
    percentage: number
  }[]
  hourlyDistribution: {
    hour: number
    calls: number
  }[]
  errorTypes: {
    type: string
    count: number
    percentage: number
  }[]
}

// 客户端统计计算工具
class ClientStatsCalculator {
  private history: CallHistory[]
  private tokens: Token[]

  constructor(history: CallHistory[], tokens: Token[]) {
    this.history = history
    this.tokens = tokens
  }

  // 根据时间段过滤历史记录
  private filterByPeriod(period: 'today' | 'week' | 'month'): CallHistory[] {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(0)
    }

    return this.history.filter(call => new Date(call.timestamp) >= startDate)
  }

  // 计算基础统计
  calculateBasicStats(period: 'today' | 'week' | 'month' = 'today'): ClientStatsData {
    const filteredHistory = this.filterByPeriod(period)
    
    const totalCalls = filteredHistory.length
    const successfulCalls = filteredHistory.filter(call => call.result.success).length
    const failedCalls = totalCalls - successfulCalls
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0

    // 计算平均响应时间
    const responseTimes = filteredHistory
      .filter(call => call.result.metadata?.responseTime)
      .map(call => call.result.metadata!.responseTime)
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0

    // 按模型统计
    const modelStats: { [key: string]: any } = {}
    filteredHistory.forEach(call => {
      if (!modelStats[call.model]) {
        modelStats[call.model] = {
          calls: 0,
          errors: 0,
          responseTimes: [],
          lastUsed: call.timestamp
        }
      }
      modelStats[call.model].calls++
      if (!call.result.success) {
        modelStats[call.model].errors++
      }
      if (call.result.metadata?.responseTime) {
        modelStats[call.model].responseTimes.push(call.result.metadata.responseTime)
      }
      if (new Date(call.timestamp) > new Date(modelStats[call.model].lastUsed)) {
        modelStats[call.model].lastUsed = call.timestamp
      }
    })

    // 处理模型统计
    const models: { [key: string]: any } = {}
    Object.keys(modelStats).forEach(model => {
      const stats = modelStats[model]
      models[model] = {
        calls: stats.calls,
        errors: stats.errors,
        averageResponseTime: stats.responseTimes.length > 0
          ? stats.responseTimes.reduce((sum: number, time: number) => sum + time, 0) / stats.responseTimes.length
          : 0,
        lastUsed: stats.lastUsed
      }
    })

    // 按 Token 统计
    const tokens: { [key: string]: any } = {}
    this.tokens.forEach(token => {
      const tokenCalls = filteredHistory.filter(call => 
        call.result.metadata?.tokenId === token.id
      )
      const tokenErrors = tokenCalls.filter(call => !call.result.success)
      
      tokens[token.id] = {
        name: token.name,
        calls: tokenCalls.length,
        errors: tokenErrors.length,
        usageToday: token.usageToday,
        limitPerDay: token.limitPerDay,
        lastUsed: token.lastUsedAt || ''
      }
    })

    // 按类别统计
    const categories: { [key: string]: any } = {}
    filteredHistory.forEach(call => {
      const category = call.type
      if (!categories[category]) {
        categories[category] = {
          calls: 0,
          errors: 0,
          responseTimes: []
        }
      }
      categories[category].calls++
      if (!call.result.success) {
        categories[category].errors++
      }
      if (call.result.metadata?.responseTime) {
        categories[category].responseTimes.push(call.result.metadata.responseTime)
      }
    })

    Object.keys(categories).forEach(category => {
      const stats = categories[category]
      categories[category] = {
        calls: stats.calls,
        errors: stats.errors,
        averageResponseTime: stats.responseTimes.length > 0
          ? stats.responseTimes.reduce((sum: number, time: number) => sum + time, 0) / stats.responseTimes.length
          : 0
      }
    })

    // 时间线统计（按天）
    const timelineMap: { [key: string]: any } = {}
    filteredHistory.forEach(call => {
      const date = new Date(call.timestamp).toISOString().split('T')[0]
      if (!timelineMap[date]) {
        timelineMap[date] = {
          calls: 0,
          errors: 0,
          responseTimes: []
        }
      }
      timelineMap[date].calls++
      if (!call.result.success) {
        timelineMap[date].errors++
      }
      if (call.result.metadata?.responseTime) {
        timelineMap[date].responseTimes.push(call.result.metadata.responseTime)
      }
    })

    const timeline = Object.keys(timelineMap).map(date => ({
      date,
      calls: timelineMap[date].calls,
      errors: timelineMap[date].errors,
      averageResponseTime: timelineMap[date].responseTimes.length > 0
        ? timelineMap[date].responseTimes.reduce((sum: number, time: number) => sum + time, 0) / timelineMap[date].responseTimes.length
        : 0
    })).sort((a, b) => a.date.localeCompare(b.date))

    return {
      overview: {
        totalCalls,
        totalTokens: this.tokens.length,
        totalErrors: failedCalls,
        successRate,
        averageResponseTime
      },
      models,
      tokens,
      timeline,
      categories
    }
  }

  // 计算使用统计
  calculateUsageStats(period: 'today' | 'week' | 'month' = 'today'): ClientUsageStats {
    const filteredHistory = this.filterByPeriod(period)
    const basicStats = this.calculateBasicStats(period)

    // 计算 Top 模型
    const modelCounts = Object.entries(basicStats.models)
      .map(([name, stats]: [string, any]) => ({
        name,
        calls: stats.calls,
        percentage: basicStats.overview.totalCalls > 0 
          ? (stats.calls / basicStats.overview.totalCalls) * 100 
          : 0
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5)

    // 计算 Top Token
    const tokenCounts = Object.entries(basicStats.tokens)
      .map(([id, stats]: [string, any]) => ({
        id,
        name: stats.name,
        calls: stats.calls,
        percentage: basicStats.overview.totalCalls > 0 
          ? (stats.calls / basicStats.overview.totalCalls) * 100 
          : 0
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5)

    // 计算小时分布
    const hourlyMap: { [key: number]: number } = {}
    for (let i = 0; i < 24; i++) {
      hourlyMap[i] = 0
    }
    
    filteredHistory.forEach(call => {
      const hour = new Date(call.timestamp).getHours()
      hourlyMap[hour]++
    })

    const hourlyDistribution = Object.entries(hourlyMap).map(([hour, calls]) => ({
      hour: parseInt(hour),
      calls
    }))

    // 计算错误类型
    const errorMap: { [key: string]: number } = {}
    filteredHistory
      .filter(call => !call.result.success)
      .forEach(call => {
        const errorType = call.result.error || 'Unknown Error'
        errorMap[errorType] = (errorMap[errorType] || 0) + 1
      })

    const errorTypes = Object.entries(errorMap).map(([type, count]) => ({
      type,
      count,
      percentage: basicStats.overview.totalErrors > 0 
        ? (count / basicStats.overview.totalErrors) * 100 
        : 0
    }))

    return {
      period,
      totalCalls: basicStats.overview.totalCalls,
      successfulCalls: basicStats.overview.totalCalls - basicStats.overview.totalErrors,
      failedCalls: basicStats.overview.totalErrors,
      successRate: basicStats.overview.successRate,
      averageResponseTime: basicStats.overview.averageResponseTime,
      totalTokensUsed: this.tokens.reduce((sum, token) => sum + token.usageToday, 0),
      topModels: modelCounts,
      topTokens: tokenCounts,
      hourlyDistribution,
      errorTypes
    }
  }
}

// 客户端统计Hook
export function useClientStats(period: 'today' | 'week' | 'month' = 'today') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const tokens = useTokenStore(state => state.tokens)
  
  const data = useMemo(() => {
    try {
      setLoading(true)
      setError(null)
      
      const history = LocalStorageManager.getHistory()
      const calculator = new ClientStatsCalculator(history, tokens)
      const stats = calculator.calculateBasicStats(period)
      
      setLoading(false)
      return stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return null
    }
  }, [period, tokens])

  const refetch = useCallback(() => {
    // 由于使用 useMemo，数据会自动重新计算
  }, [])

  return {
    data,
    loading,
    error,
    refetch
  }
}

// 客户端使用统计Hook
export function useClientUsageStats(period: 'today' | 'week' | 'month' = 'today') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const tokens = useTokenStore(state => state.tokens)
  
  const data = useMemo(() => {
    try {
      setLoading(true)
      setError(null)
      
      const history = LocalStorageManager.getHistory()
      const calculator = new ClientStatsCalculator(history, tokens)
      const stats = calculator.calculateUsageStats(period)
      
      setLoading(false)
      return stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return null
    }
  }, [period, tokens])

  const refetch = useCallback(() => {
    // 由于使用 useMemo，数据会自动重新计算
  }, [])

  return {
    data,
    loading,
    error,
    refetch
  }
}
