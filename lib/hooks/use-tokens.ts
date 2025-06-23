import { useState, useEffect, useCallback } from 'react'

export interface Token {
  id: number
  name: string
  value: string
  isActive: boolean
  usageToday: number
  limitPerDay: number
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    callLogs: number
  }
}

export interface TokenStats {
  totalTokens: number
  activeTokens: number
  totalUsageToday: number
  totalLimitPerDay: number
  averageUsageRate: number
  lastActivity: {
    time: string | null
    tokenName: string | null
  }
}

// Token管理Hook
export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [stats, setStats] = useState<TokenStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/tokens')
      const result = await response.json()

      if (result.success) {
        setTokens(result.data.tokens)
        setStats(result.data.stats)
      } else {
        setError(result.error || 'Failed to fetch tokens')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  // 创建Token
  const createToken = useCallback(async (data: {
    name: string
    key: string
    limitPerDay: number
  }) => {
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          value: data.key, // API使用value字段
          limitPerDay: data.limitPerDay
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchTokens() // 重新获取数据
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }, [fetchTokens])

  // 更新Token
  const updateToken = useCallback(async (id: number, data: {
    name?: string
    limitPerDay?: number
    isActive?: boolean
    value?: string
  }) => {
    try {
      const response = await fetch(`/api/tokens/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchTokens() // 重新获取数据
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }, [fetchTokens])

  // 删除Token
  const deleteToken = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/tokens/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchTokens() // 重新获取数据
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }, [fetchTokens])

  // 重置Token使用量
  const resetTokenUsage = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/tokens/${id}/reset`, {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        await fetchTokens() // 重新获取数据
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }, [fetchTokens])

  // 测试Token
  const testToken = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/tokens/${id}/test`, {
        method: 'POST'
      })

      const result = await response.json()

      return result
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }, [])

  return {
    tokens,
    stats,
    loading,
    error,
    refetch: fetchTokens,
    createToken,
    updateToken,
    deleteToken,
    resetTokenUsage,
    testToken
  }
}
