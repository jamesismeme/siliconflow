/**
 * LocalStorage 管理器
 * 用于管理 SiliconFlow Platform 的本地数据存储
 */

// Token 接口
export interface Token {
  id: string
  name: string
  value: string
  isActive: boolean
  usageToday: number
  limitPerDay: number
  lastUsedAt: string | null
  createdAt: string
}

// 用户设置接口
export interface UserSettings {
  baseUrl: string
  chatModel: string
  imageModel: string
  audioModel: string
  textModel: string
  preferences: {
    defaultCategory: string
    showRecommendedOnly: boolean
    autoSaveHistory: boolean
    maxHistoryItems: number
  }
}

// 调用历史接口
export interface CallHistory {
  id: string
  model: string
  type: string
  parameters: any
  result: any
  timestamp: string
}

// Token 统计接口
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

class LocalStorageManager {
  private static instance: LocalStorageManager
  private readonly KEYS = {
    TOKENS: 'siliconflow_tokens',
    SETTINGS: 'siliconflow_settings',
    HISTORY: 'siliconflow_history'
  } as const

  private constructor() {}

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager()
    }
    return LocalStorageManager.instance
  }

  /**
   * 检查是否在客户端环境
   */
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  // ==================== Token 管理 ====================

  /**
   * 获取所有 Token
   */
  getTokens(): Token[] {
    if (!this.isClient()) {
      return []
    }
    try {
      const data = localStorage.getItem(this.KEYS.TOKENS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get tokens:', error)
      return []
    }
  }

  /**
   * 设置 Token 列表
   */
  setTokens(tokens: Token[]): void {
    if (!this.isClient()) {
      return
    }
    try {
      localStorage.setItem(this.KEYS.TOKENS, JSON.stringify(tokens))
    } catch (error) {
      console.error('Failed to set tokens:', error)
    }
  }

  /**
   * 添加新 Token
   */
  addToken(token: Omit<Token, 'id' | 'createdAt'>): Token {
    const newToken: Token = {
      ...token,
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    
    const tokens = this.getTokens()
    tokens.push(newToken)
    this.setTokens(tokens)
    return newToken
  }

  /**
   * 删除 Token
   */
  removeToken(id: string): void {
    const tokens = this.getTokens().filter(token => token.id !== id)
    this.setTokens(tokens)
  }

  /**
   * 更新 Token
   */
  updateToken(id: string, updates: Partial<Token>): void {
    const tokens = this.getTokens()
    const index = tokens.findIndex(token => token.id === id)
    if (index !== -1) {
      tokens[index] = { ...tokens[index], ...updates }
      this.setTokens(tokens)
    }
  }

  /**
   * 获取可用的 Token（按使用量排序）
   */
  getAvailableToken(): Token | null {
    const tokens = this.getTokens()
      .filter(token => token.isActive && token.usageToday < token.limitPerDay)
      .sort((a, b) => a.usageToday - b.usageToday)
    
    return tokens.length > 0 ? tokens[0] : null
  }

  /**
   * 记录 Token 使用
   */
  recordTokenUsage(tokenId: string): void {
    const tokens = this.getTokens()
    const index = tokens.findIndex(token => token.id === tokenId)
    if (index !== -1) {
      tokens[index].usageToday += 1
      tokens[index].lastUsedAt = new Date().toISOString()
      this.setTokens(tokens)
    }
  }

  /**
   * 重置每日使用量（通常在新的一天调用）
   */
  resetDailyUsage(): void {
    const tokens = this.getTokens()
    tokens.forEach(token => {
      token.usageToday = 0
    })
    this.setTokens(tokens)
  }

  /**
   * 获取 Token 统计信息
   */
  getTokenStats(): TokenStats {
    const tokens = this.getTokens()
    const activeTokens = tokens.filter(token => token.isActive)
    
    const totalUsageToday = tokens.reduce((sum, token) => sum + token.usageToday, 0)
    const totalLimitPerDay = tokens.reduce((sum, token) => sum + token.limitPerDay, 0)
    
    // 找到最近使用的 Token
    const lastUsedToken = tokens
      .filter(token => token.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())[0]

    return {
      totalTokens: tokens.length,
      activeTokens: activeTokens.length,
      totalUsageToday,
      totalLimitPerDay,
      averageUsageRate: totalLimitPerDay > 0 ? (totalUsageToday / totalLimitPerDay) * 100 : 0,
      lastActivity: {
        time: lastUsedToken?.lastUsedAt || null,
        tokenName: lastUsedToken?.name || null
      }
    }
  }

  // ==================== 用户设置 ====================

  /**
   * 获取用户设置
   */
  getSettings(): UserSettings {
    if (!this.isClient()) {
      return this.getDefaultSettings()
    }
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS)
      return data ? JSON.parse(data) : this.getDefaultSettings()
    } catch (error) {
      console.error('Failed to get settings:', error)
      return this.getDefaultSettings()
    }
  }

  /**
   * 设置用户配置
   */
  setSettings(settings: UserSettings): void {
    if (!this.isClient()) {
      return
    }
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to set settings:', error)
    }
  }

  /**
   * 更新部分设置
   */
  updateSettings(updates: Partial<UserSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...updates }
    this.setSettings(newSettings)
  }

  /**
   * 获取默认设置
   */
  getDefaultSettings(): UserSettings {
    return {
      baseUrl: 'https://api.siliconflow.cn/v1',
      chatModel: 'Qwen/Qwen2.5-7B-Instruct',
      imageModel: 'black-forest-labs/FLUX.1-schnell',
      audioModel: 'FunAudioLLM/SenseVoiceSmall',
      textModel: 'BAAI/bge-m3',
      preferences: {
        defaultCategory: 'chat',
        showRecommendedOnly: false,
        autoSaveHistory: true,
        maxHistoryItems: 50
      }
    }
  }

  // ==================== 调用历史 ====================

  /**
   * 获取调用历史
   */
  getHistory(): CallHistory[] {
    if (!this.isClient()) {
      return []
    }
    try {
      const data = localStorage.getItem(this.KEYS.HISTORY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get history:', error)
      return []
    }
  }

  /**
   * 添加到历史记录
   */
  addToHistory(call: CallHistory): void {
    try {
      const settings = this.getSettings()
      if (!settings.preferences.autoSaveHistory) {
        return
      }

      const history = this.getHistory()
      history.unshift(call) // 添加到开头
      
      // 限制历史记录数量
      const maxItems = settings.preferences.maxHistoryItems
      if (history.length > maxItems) {
        history.splice(maxItems)
      }
      
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to add to history:', error)
    }
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.KEYS.HISTORY)
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  /**
   * 删除单条历史记录
   */
  removeFromHistory(id: string): void {
    try {
      const history = this.getHistory().filter(item => item.id !== id)
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to remove from history:', error)
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 清空所有数据
   */
  clearAllData(): void {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Failed to clear all data:', error)
    }
  }

  /**
   * 导出数据
   */
  exportData(): string {
    try {
      const data = {
        tokens: this.getTokens(),
        settings: this.getSettings(),
        history: this.getHistory(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      return ''
    }
  }

  /**
   * 导入数据
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.tokens && Array.isArray(data.tokens)) {
        this.setTokens(data.tokens)
      }
      
      if (data.settings) {
        this.setSettings(data.settings)
      }
      
      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(data.history))
      }
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  /**
   * 检查是否为新用户（没有任何数据）
   */
  isNewUser(): boolean {
    return this.getTokens().length === 0
  }

  /**
   * 获取存储使用情况
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0
      Object.values(this.KEYS).forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          used += new Blob([data]).size
        }
      })

      // 大多数浏览器的 localStorage 限制是 5MB
      const available = 5 * 1024 * 1024 // 5MB in bytes
      const percentage = (used / available) * 100

      return { used, available, percentage }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}

// 导出单例实例
export default LocalStorageManager.getInstance()
