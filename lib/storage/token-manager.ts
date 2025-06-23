/**
 * Token 管理器
 * 专门用于管理 SiliconFlow API Token 的类
 */

import LocalStorageManager from './local-storage'
import type { Token, TokenInput, TokenUpdate, TokenValidation, TokenStats } from './types'

class TokenManager {
  private storage = LocalStorageManager

  /**
   * 验证 Token 格式
   */
  validateToken(value: string): TokenValidation {
    const details = {
      format: false,
      length: false,
      prefix: false
    }

    // 检查前缀
    details.prefix = value.startsWith('sk-')

    // 检查长度（SiliconFlow Token 通常长度在 40-100 字符之间）
    details.length = value.length >= 40 && value.length <= 100

    // 检查格式（只包含字母、数字、连字符）
    details.format = /^sk-[a-zA-Z0-9\-_]+$/.test(value)

    const isValid = details.prefix && details.length && details.format

    let error: string | undefined
    if (!isValid) {
      if (!details.prefix) {
        error = 'Token 必须以 "sk-" 开头'
      } else if (!details.length) {
        error = 'Token 长度不正确'
      } else if (!details.format) {
        error = 'Token 格式不正确，只能包含字母、数字、连字符和下划线'
      }
    }

    return {
      isValid,
      error,
      details
    }
  }

  /**
   * 添加新 Token
   */
  addToken(input: TokenInput): { success: boolean; token?: Token; error?: string } {
    try {
      // 验证 Token 格式
      const validation = this.validateToken(input.value)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // 检查是否已存在
      const existingTokens = this.storage.getTokens()
      const exists = existingTokens.some(token => token.value === input.value)
      if (exists) {
        return { success: false, error: 'Token 已存在' }
      }

      // 创建新 Token
      const newToken = this.storage.addToken({
        name: input.name || `Token ${existingTokens.length + 1}`,
        value: input.value,
        isActive: input.isActive ?? true,
        limitPerDay: input.limitPerDay ?? 1000,
        usageToday: 0,
        lastUsedAt: null
      })

      return { success: true, token: newToken }
    } catch (error) {
      return { success: false, error: '添加 Token 失败' }
    }
  }

  /**
   * 更新 Token
   */
  updateToken(id: string, updates: TokenUpdate): { success: boolean; error?: string } {
    try {
      // 如果更新 value，需要验证格式
      if (updates.value) {
        const validation = this.validateToken(updates.value)
        if (!validation.isValid) {
          return { success: false, error: validation.error }
        }

        // 检查是否与其他 Token 重复
        const existingTokens = this.storage.getTokens()
        const exists = existingTokens.some(token => token.id !== id && token.value === updates.value)
        if (exists) {
          return { success: false, error: 'Token 已存在' }
        }
      }

      this.storage.updateToken(id, updates)
      return { success: true }
    } catch (error) {
      return { success: false, error: '更新 Token 失败' }
    }
  }

  /**
   * 删除 Token
   */
  removeToken(id: string): { success: boolean; error?: string } {
    try {
      this.storage.removeToken(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: '删除 Token 失败' }
    }
  }

  /**
   * 获取所有 Token
   */
  getTokens(): Token[] {
    return this.storage.getTokens()
  }

  /**
   * 获取单个 Token
   */
  getToken(id: string): Token | null {
    const tokens = this.storage.getTokens()
    return tokens.find(token => token.id === id) || null
  }

  /**
   * 获取可用的 Token（用于 API 调用）
   */
  getAvailableToken(): Token | null {
    return this.storage.getAvailableToken()
  }

  /**
   * 记录 Token 使用
   */
  recordUsage(tokenId: string): void {
    this.storage.recordTokenUsage(tokenId)
  }

  /**
   * 切换 Token 状态
   */
  toggleTokenStatus(id: string): { success: boolean; error?: string } {
    try {
      const token = this.getToken(id)
      if (!token) {
        return { success: false, error: 'Token 不存在' }
      }

      this.storage.updateToken(id, { isActive: !token.isActive })
      return { success: true }
    } catch (error) {
      return { success: false, error: '切换状态失败' }
    }
  }

  /**
   * 重置所有 Token 的每日使用量
   */
  resetDailyUsage(): void {
    this.storage.resetDailyUsage()
  }

  /**
   * 获取 Token 统计信息
   */
  getStats(): TokenStats {
    return this.storage.getTokenStats()
  }

  /**
   * 批量导入 Token
   */
  importTokens(tokens: TokenInput[]): { 
    success: boolean
    imported: number
    failed: number
    errors: string[]
  } {
    let imported = 0
    let failed = 0
    const errors: string[] = []

    tokens.forEach((tokenInput, index) => {
      const result = this.addToken(tokenInput)
      if (result.success) {
        imported++
      } else {
        failed++
        errors.push(`第 ${index + 1} 个 Token: ${result.error}`)
      }
    })

    return {
      success: imported > 0,
      imported,
      failed,
      errors
    }
  }

  /**
   * 获取 Token 显示名称（脱敏）
   */
  getDisplayValue(token: Token): string {
    if (token.value.length <= 16) {
      return token.value
    }
    return `${token.value.substring(0, 8)}...${token.value.substring(token.value.length - 8)}`
  }

  /**
   * 检查 Token 是否接近限制
   */
  isTokenNearLimit(token: Token, threshold: number = 0.8): boolean {
    return token.usageToday >= (token.limitPerDay * threshold)
  }

  /**
   * 获取推荐的 Token（负载均衡）
   */
  getRecommendedToken(): Token | null {
    const availableTokens = this.storage.getTokens()
      .filter(token => token.isActive && token.usageToday < token.limitPerDay)
    
    if (availableTokens.length === 0) {
      return null
    }

    // 按使用率排序，选择使用率最低的
    availableTokens.sort((a, b) => {
      const usageRateA = a.usageToday / a.limitPerDay
      const usageRateB = b.usageToday / b.limitPerDay
      return usageRateA - usageRateB
    })

    return availableTokens[0]
  }

  /**
   * 预测 Token 耗尽时间
   */
  predictTokenExhaustion(tokenId: string): { 
    hoursRemaining: number | null
    exhaustionTime: string | null
  } {
    const token = this.getToken(tokenId)
    if (!token || !token.lastUsedAt) {
      return { hoursRemaining: null, exhaustionTime: null }
    }

    const remainingCalls = token.limitPerDay - token.usageToday
    if (remainingCalls <= 0) {
      return { hoursRemaining: 0, exhaustionTime: new Date().toISOString() }
    }

    // 简单的线性预测（基于当前使用率）
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const hoursElapsed = (now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60)
    
    if (hoursElapsed === 0 || token.usageToday === 0) {
      return { hoursRemaining: null, exhaustionTime: null }
    }

    const usageRate = token.usageToday / hoursElapsed // calls per hour
    const hoursRemaining = remainingCalls / usageRate

    const exhaustionTime = new Date(now.getTime() + hoursRemaining * 60 * 60 * 1000)

    return {
      hoursRemaining: Math.round(hoursRemaining * 100) / 100,
      exhaustionTime: exhaustionTime.toISOString()
    }
  }

  /**
   * 清理无效 Token
   */
  cleanupInvalidTokens(): { removed: number; errors: string[] } {
    const tokens = this.getTokens()
    let removed = 0
    const errors: string[] = []

    tokens.forEach(token => {
      const validation = this.validateToken(token.value)
      if (!validation.isValid) {
        try {
          this.removeToken(token.id)
          removed++
        } catch (error) {
          errors.push(`删除无效 Token ${token.name} 失败`)
        }
      }
    })

    return { removed, errors }
  }
}

// 导出单例实例
const tokenManager = new TokenManager()
export default tokenManager

// 导出类型
export type { Token, TokenInput, TokenUpdate, TokenValidation, TokenStats }
