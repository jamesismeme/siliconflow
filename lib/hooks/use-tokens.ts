import { useCallback } from 'react'
import { useTokenStore, useTokenActions } from '@/lib/stores/token-store'
import type { Token, TokenStats, TokenInput } from '@/lib/storage/types'

// 重新导出类型以保持兼容性
export type { Token, TokenStats, TokenInput }

// Token管理Hook - 使用新的 LocalStorage 系统
export function useTokens() {
  const tokens = useTokenStore(state => state.tokens)
  const stats = useTokenStore(state => state.stats)
  const loading = useTokenStore(state => state.loading)
  const error = useTokenStore(state => state.error)
  const { loadTokens } = useTokenActions()

  const refetch = useCallback(() => {
    loadTokens()
  }, [loadTokens])

  return {
    tokens,
    stats,
    loading,
    error,
    refetch
  }
}

// 综合Token操作Hook（保持向后兼容）
export function useTokenOperations() {
  const {
    addToken,
    updateToken,
    removeToken,
    toggleTokenStatus,
    selectBestToken,
    recordTokenUsage,
    resetDailyUsage,
    validateToken,
    getTokenDisplayValue,
    isTokenNearLimit
  } = useTokenActions()

  const createToken = useCallback(async (data: {
    name: string
    key: string
    limitPerDay: number
  }) => {
    const tokenInput: TokenInput = {
      name: data.name,
      value: data.key,
      limitPerDay: data.limitPerDay,
      isActive: true
    }

    return await addToken(tokenInput)
  }, [addToken])

  const updateTokenData = useCallback(async (id: string, data: {
    name?: string
    isActive?: boolean
    limitPerDay?: number
    value?: string
  }) => {
    return await updateToken(id, data)
  }, [updateToken])

  const deleteToken = useCallback(async (id: string) => {
    return await removeToken(id)
  }, [removeToken])

  const resetTokenUsage = useCallback((id: string) => {
    // 重置单个 Token 的使用量
    updateToken(id, { usageToday: 0 })
  }, [updateToken])

  const testToken = useCallback(async (value: string) => {
    // 验证 Token 格式
    const validation = validateToken(value)
    return {
      success: validation.isValid,
      error: validation.error
    }
  }, [validateToken])

  return {
    createToken,
    updateToken: updateTokenData,
    deleteToken,
    resetTokenUsage,
    testToken,
    toggleTokenStatus,
    selectBestToken,
    recordTokenUsage,
    resetDailyUsage,
    validateToken,
    getTokenDisplayValue,
    isTokenNearLimit
  }
}
