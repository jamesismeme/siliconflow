import { useState, useEffect, useCallback } from 'react'

// 统计数据类型定义
export interface StatsOverview {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  successRate: number
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
}

export interface TokenStats {
  id: number
  name: string
  usageToday: number
  limitPerDay: number
  usageRate: number
  callsInPeriod: number
  lastUsedAt: string | null
  status: 'healthy' | 'warning' | 'exhausted'
}

export interface ModelStats {
  name: string
  calls: number
  avgResponseTime: number
  percentage: number
}

export interface HourlyTrend {
  hour: number
  time: string
  total: number
  success: number
  avgResponseTime: number
}

export interface StatsData {
  period: string
  timeRange: {
    start: string
    end: string
  }
  overview: StatsOverview
  tokens: TokenStats[]
  models: ModelStats[]
  trends: {
    hourly: HourlyTrend[]
  }
}

export interface UsageStats {
  timeRange: {
    start: string
    end: string
    days: number
  }
  summary: {
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    totalTokens: number
    avgResponseTime: number
  }
  trends: {
    daily: Array<{
      date: string
      total: number
      success: number
      failed: number
      successRate: number
      avgResponseTime: number
      totalTokens: number
    }>
  }
  models: Array<{
    name: string
    total: number
    success: number
    failed: number
    successRate: number
    avgResponseTime: number
    totalTokens: number
    dailyData: Array<{ calls: number; success: number }>
  }>
  tokens: Array<{
    tokenId: number
    name: string
    total: number
    success: number
    failed: number
    successRate: number
    avgResponseTime: number
  }>
  responseTimeDistribution: Array<{
    label: string
    count: number
    percentage: number
  }>
}

export interface LogEntry {
  id: number
  success: boolean
  modelName: string
  responseTime: number | null
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number
  errorMessage: string | null
  userAgent: string | null
  ipAddress: string | null
  createdAt: string
  token: {
    id: number
    name: string
  } | null
}

export interface LogsData {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    success: string | null
    modelName: string | null
    tokenId: string | null
    startDate: string | null
    endDate: string | null
    search: string | null
  }
  summary: {
    total: number
    successful: number
    failed: number
    successRate: number
    avgResponseTime: number
  }
  logs: LogEntry[]
  analysis: {
    errors: Array<{
      message: string
      count: number
      percentage: number
    }>
    models: Array<{
      name: string
      count: number
      avgResponseTime: number
      percentage: number
    }>
    tokens: Array<{
      tokenId: number
      tokenName: string
      count: number
      percentage: number
    }>
  }
}

// 基础统计Hook
export function useStats(period: 'today' | 'week' | 'month' = 'today') {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stats?period=${period}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch statistics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    data,
    loading,
    error,
    refetch: fetchStats
  }
}

// 使用统计Hook
export function useUsageStats(days: number = 7) {
  const [data, setData] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsageStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stats/usage?days=${days}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch usage statistics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchUsageStats()
  }, [fetchUsageStats])

  return {
    data,
    loading,
    error,
    refetch: fetchUsageStats
  }
}

// 日志Hook
export function useLogs(filters: {
  page?: number
  limit?: number
  success?: boolean | null
  modelName?: string
  tokenId?: number
  startDate?: string
  endDate?: string
  search?: string
} = {}) {
  const [data, setData] = useState<LogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.success !== undefined && filters.success !== null) {
        params.append('success', filters.success.toString())
      }
      if (filters.modelName) params.append('model', filters.modelName)
      if (filters.tokenId) params.append('tokenId', filters.tokenId.toString())
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/logs?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch logs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // 导出日志
  const exportLogs = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      console.log('开始导出:', format, '过滤器:', filters)

      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          filters
        })
      })

      console.log('响应状态:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        console.log('CSV导出成功')
      } else {
        const result = await response.json()
        console.log('JSON响应:', result)

        if (result.success) {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], {
            type: 'application/json'
          })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `logs-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
          console.log('JSON导出成功，记录数:', result.count)
        } else {
          throw new Error(result.error || 'Export failed')
        }
      }
    } catch (err) {
      console.error('Export failed:', err)
      throw err
    }
  }, [filters])

  return {
    data,
    loading,
    error,
    refetch: fetchLogs,
    exportLogs
  }
}
