/**
 * Token 管理 Zustand Store
 * 专门用于管理 SiliconFlow API Token 的状态
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TokenManager } from '@/lib/storage'
import type { Token, TokenInput, TokenStats } from '@/lib/storage/types'

// Token Store 状态接口
interface TokenStore {
  // 状态
  tokens: Token[]
  selectedToken: Token | null
  stats: TokenStats | null
  loading: boolean
  error: string | null

  // Token 操作
  loadTokens: () => Promise<void>
  addToken: (input: TokenInput) => Promise<{ success: boolean; error?: string }>
  updateToken: (id: string, updates: Partial<Token>) => Promise<{ success: boolean; error?: string }>
  removeToken: (id: string) => Promise<{ success: boolean; error?: string }>
  toggleTokenStatus: (id: string) => Promise<{ success: boolean; error?: string }>

  // Token 选择和使用
  selectBestToken: () => Token | null
  recordTokenUsage: (tokenId: string) => void
  resetDailyUsage: () => void

  // 统计和状态
  refreshStats: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void

  // 批量操作
  importTokens: (tokens: TokenInput[]) => Promise<{
    success: boolean
    imported: number
    failed: number
    errors: string[]
  }>
  exportTokens: () => Token[]
  clearAllTokens: () => void

  // 工具方法
  validateToken: (value: string) => { isValid: boolean; error?: string }
  getTokenDisplayValue: (token: Token) => string
  isTokenNearLimit: (token: Token, threshold?: number) => boolean
}

// 创建 Token Store
export const useTokenStore = create<TokenStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      tokens: [],
      selectedToken: null,
      stats: null,
      loading: false,
      error: null,

      // 加载 Token 列表
      loadTokens: async () => {
        try {
          set({ loading: true, error: null })
          const tokens = TokenManager.getTokens()
          const stats = TokenManager.getStats()
          set({ tokens, stats, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载 Token 失败',
            loading: false 
          })
        }
      },

      // 添加新 Token
      addToken: async (input: TokenInput) => {
        try {
          set({ loading: true, error: null })
          const result = TokenManager.addToken(input)
          
          if (result.success) {
            // 重新加载数据
            await get().loadTokens()
            return { success: true }
          } else {
            set({ error: result.error, loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '添加 Token 失败'
          set({ error: errorMsg, loading: false })
          return { success: false, error: errorMsg }
        }
      },

      // 更新 Token
      updateToken: async (id: string, updates: Partial<Token>) => {
        try {
          set({ loading: true, error: null })
          const result = TokenManager.updateToken(id, updates)
          
          if (result.success) {
            await get().loadTokens()
            return { success: true }
          } else {
            set({ error: result.error, loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '更新 Token 失败'
          set({ error: errorMsg, loading: false })
          return { success: false, error: errorMsg }
        }
      },

      // 删除 Token
      removeToken: async (id: string) => {
        try {
          set({ loading: true, error: null })
          const result = TokenManager.removeToken(id)
          
          if (result.success) {
            await get().loadTokens()
            // 如果删除的是当前选中的 Token，清除选择
            const { selectedToken } = get()
            if (selectedToken?.id === id) {
              set({ selectedToken: null })
            }
            return { success: true }
          } else {
            set({ error: result.error, loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '删除 Token 失败'
          set({ error: errorMsg, loading: false })
          return { success: false, error: errorMsg }
        }
      },

      // 切换 Token 状态
      toggleTokenStatus: async (id: string) => {
        try {
          set({ loading: true, error: null })
          const result = TokenManager.toggleTokenStatus(id)
          
          if (result.success) {
            await get().loadTokens()
            return { success: true }
          } else {
            set({ error: result.error, loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '切换状态失败'
          set({ error: errorMsg, loading: false })
          return { success: false, error: errorMsg }
        }
      },

      // 选择最佳 Token（负载均衡）
      selectBestToken: () => {
        const token = TokenManager.getRecommendedToken()
        set({ selectedToken: token })
        return token
      },

      // 记录 Token 使用
      recordTokenUsage: (tokenId: string) => {
        TokenManager.recordUsage(tokenId)
        // 更新本地状态
        const { tokens } = get()
        const updatedTokens = tokens.map(token => 
          token.id === tokenId 
            ? { ...token, usageToday: token.usageToday + 1, lastUsedAt: new Date().toISOString() }
            : token
        )
        set({ tokens: updatedTokens })
        get().refreshStats()
      },

      // 重置每日使用量
      resetDailyUsage: () => {
        TokenManager.resetDailyUsage()
        get().loadTokens()
      },

      // 刷新统计信息
      refreshStats: () => {
        const stats = TokenManager.getStats()
        set({ stats })
      },

      // 清除错误
      clearError: () => {
        set({ error: null })
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading })
      },

      // 批量导入 Token
      importTokens: async (tokens: TokenInput[]) => {
        try {
          set({ loading: true, error: null })
          const result = TokenManager.importTokens(tokens)
          
          if (result.success) {
            await get().loadTokens()
          }
          
          set({ loading: false })
          return result
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '导入 Token 失败'
          set({ error: errorMsg, loading: false })
          return {
            success: false,
            imported: 0,
            failed: tokens.length,
            errors: [errorMsg]
          }
        }
      },

      // 导出 Token
      exportTokens: () => {
        return get().tokens
      },

      // 清空所有 Token
      clearAllTokens: () => {
        const { tokens } = get()
        tokens.forEach(token => {
          TokenManager.removeToken(token.id)
        })
        set({ tokens: [], selectedToken: null, stats: null })
      },

      // 验证 Token
      validateToken: (value: string) => {
        return TokenManager.validateToken(value)
      },

      // 获取 Token 显示值
      getTokenDisplayValue: (token: Token) => {
        return TokenManager.getDisplayValue(token)
      },

      // 检查 Token 是否接近限制
      isTokenNearLimit: (token: Token, threshold = 0.8) => {
        return TokenManager.isTokenNearLimit(token, threshold)
      }
    }),
    {
      name: 'token-store',
      // 只持久化基本状态，不持久化 loading 和 error
      partialize: (state) => ({
        selectedToken: state.selectedToken
      })
    }
  )
)

// 便捷的 Hook
export const useTokens = () => useTokenStore(state => state.tokens)
export const useSelectedToken = () => useTokenStore(state => state.selectedToken)
export const useTokenStats = () => useTokenStore(state => state.stats)
export const useTokenLoading = () => useTokenStore(state => state.loading)
export const useTokenError = () => useTokenStore(state => state.error)

// Token 操作 Hook
export const useTokenActions = () => {
  const store = useTokenStore()
  return {
    loadTokens: store.loadTokens,
    addToken: store.addToken,
    updateToken: store.updateToken,
    removeToken: store.removeToken,
    toggleTokenStatus: store.toggleTokenStatus,
    selectBestToken: store.selectBestToken,
    recordTokenUsage: store.recordTokenUsage,
    resetDailyUsage: store.resetDailyUsage,
    refreshStats: store.refreshStats,
    clearError: store.clearError,
    importTokens: store.importTokens,
    exportTokens: store.exportTokens,
    clearAllTokens: store.clearAllTokens,
    validateToken: store.validateToken,
    getTokenDisplayValue: store.getTokenDisplayValue,
    isTokenNearLimit: store.isTokenNearLimit
  }
}

export default useTokenStore
