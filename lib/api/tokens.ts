import { prisma } from '@/lib/db/prisma'
import { createSiliconFlowClient } from './siliconflow'

// Token 状态接口
export interface TokenInfo {
  id: number
  name: string
  value: string
  isActive: boolean
  usageToday: number
  limitPerDay: number
  lastUsedAt: Date | null
  createdAt: Date
}

// Token 管理类
export class TokenManager {
  private static instance: TokenManager
  private tokens: TokenInfo[] = []
  private lastRefresh: Date = new Date(0)
  private refreshInterval = 5 * 60 * 1000 // 5分钟刷新一次

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  // 刷新Token列表
  async refreshTokens(): Promise<void> {
    const now = new Date()
    if (now.getTime() - this.lastRefresh.getTime() < this.refreshInterval) {
      return // 未到刷新时间
    }

    try {
      const tokens = await prisma.token.findMany({
        where: { isActive: true },
        orderBy: { usageToday: 'asc' } // 按使用量升序排列
      })

      this.tokens = tokens.map(token => ({
        id: token.id,
        name: token.name,
        value: token.value,
        isActive: token.isActive,
        usageToday: token.usageToday,
        limitPerDay: token.limitPerDay,
        lastUsedAt: token.lastUsedAt,
        createdAt: token.createdAt
      }))

      this.lastRefresh = now
      console.log(`[TokenManager] Refreshed ${this.tokens.length} active tokens`)
    } catch (error) {
      console.error('[TokenManager] Failed to refresh tokens:', error)
      throw error
    }
  }

  // 获取可用Token
  async getAvailableToken(): Promise<TokenInfo | null> {
    await this.refreshTokens()

    // 找到使用量最少且未达到限制的Token
    // 注意：limitPerDay现在表示RPM（每分钟请求数），但这里我们仍然用作每日限制
    // 实际的RPM限制应该在API调用时进行更精确的控制
    const availableToken = this.tokens.find(token =>
      token.isActive && token.usageToday < token.limitPerDay
    )

    if (!availableToken) {
      console.warn('[TokenManager] No available tokens found')
      return null
    }

    return availableToken
  }

  // 记录Token使用
  async recordTokenUsage(tokenId: number, success: boolean, responseTime?: number): Promise<void> {
    try {
      // 更新Token使用量
      await prisma.token.update({
        where: { id: tokenId },
        data: {
          usageToday: { increment: 1 },
          lastUsedAt: new Date()
        }
      })

      // 更新本地缓存
      const tokenIndex = this.tokens.findIndex(t => t.id === tokenId)
      if (tokenIndex !== -1) {
        this.tokens[tokenIndex].usageToday += 1
        this.tokens[tokenIndex].lastUsedAt = new Date()
      }

      console.log(`[TokenManager] Recorded usage for token ${tokenId}, success: ${success}`)
    } catch (error) {
      console.error('[TokenManager] Failed to record token usage:', error)
    }
  }

  // 健康检查Token
  async healthCheckToken(token: TokenInfo): Promise<boolean> {
    try {
      const client = createSiliconFlowClient(token.value)
      return await client.healthCheck()
    } catch (error) {
      console.error(`[TokenManager] Health check failed for token ${token.id}:`, error)
      return false
    }
  }

  // 获取Token统计
  async getTokenStats(): Promise<{
    total: number
    active: number
    totalUsageToday: number
    totalLimitToday: number
    avgUsageRate: number
  }> {
    await this.refreshTokens()

    const total = this.tokens.length
    const active = this.tokens.filter(t => t.isActive).length
    const totalUsageToday = this.tokens.reduce((sum, t) => sum + t.usageToday, 0)
    const totalLimitToday = this.tokens.reduce((sum, t) => sum + t.limitPerDay, 0)
    const avgUsageRate = totalLimitToday > 0 ? (totalUsageToday / totalLimitToday) * 100 : 0

    return {
      total,
      active,
      totalUsageToday,
      totalLimitToday,
      avgUsageRate: Math.round(avgUsageRate)
    }
  }

  // 重置每日使用量（通常在每日0点调用）
  async resetDailyUsage(): Promise<void> {
    try {
      await prisma.token.updateMany({
        data: { usageToday: 0 }
      })

      // 更新本地缓存
      this.tokens.forEach(token => {
        token.usageToday = 0
      })

      console.log('[TokenManager] Daily usage reset completed')
    } catch (error) {
      console.error('[TokenManager] Failed to reset daily usage:', error)
    }
  }
}

// Token 调度器
export class TokenScheduler {
  private tokenManager: TokenManager

  constructor() {
    this.tokenManager = TokenManager.getInstance()
  }

  // 选择最佳Token
  async selectBestToken(): Promise<TokenInfo | null> {
    const token = await this.tokenManager.getAvailableToken()
    
    if (!token) {
      throw new Error('No available tokens. All tokens have reached their daily limit.')
    }

    // 可以在这里添加更复杂的选择逻辑，比如：
    // - 根据模型类型选择不同的Token
    // - 根据负载均衡算法选择
    // - 根据Token的历史成功率选择

    return token
  }

  // 执行API调用（带Token轮询）
  async executeWithToken<T>(
    apiCall: (client: any) => Promise<T>,
    modelName: string = 'unknown'
  ): Promise<{ result: T; tokenId: number }> {
    const startTime = Date.now()
    let token: TokenInfo | null = null

    try {
      token = await this.selectBestToken()
      const client = createSiliconFlowClient(token.value)

      console.log(`[TokenScheduler] Using token ${token.id} (${token.name}) for ${modelName}`)

      const result = await apiCall(client)
      const responseTime = Date.now() - startTime

      // 记录成功使用
      await this.tokenManager.recordTokenUsage(token.id, true, responseTime)

      return { result, tokenId: token.id }
    } catch (error) {
      const responseTime = Date.now() - startTime

      // 记录失败使用
      if (token) {
        await this.tokenManager.recordTokenUsage(token.id, false, responseTime)
      }

      console.error(`[TokenScheduler] API call failed:`, error)
      throw error
    }
  }
}

// 导出单例实例
export const tokenManager = TokenManager.getInstance()
export const tokenScheduler = new TokenScheduler()
