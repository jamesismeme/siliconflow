/**
 * 存储管理模块统一导出
 */

// 主要管理器
export { default as LocalStorageManager } from './local-storage'
export { default as TokenManager } from './token-manager'

// 类型定义
export type {
  Token,
  TokenInput,
  TokenUpdate,
  TokenValidation,
  TokenStats,
  UserSettings,
  UserPreferences,
  CallHistory,
  ApiResult,
  ModelParameters,
  ExportData,
  StorageInfo,
  UsageStats,
  StorageResult,
  BatchOperation,
  SearchFilter,
  Pagination,
  PaginatedResult
} from './types'

// 枚举
export {
  StorageKeys,
  ModelCategory,
  ApiCallType,
  StorageError
} from './types'

// 便捷函数
import LocalStorageManager from './local-storage'
import TokenManager from './token-manager'

/**
 * 获取存储管理器实例
 */
export const getStorageManager = () => LocalStorageManager

/**
 * 获取 Token 管理器实例
 */
export const getTokenManager = () => TokenManager

/**
 * 检查是否为新用户
 */
export const isNewUser = () => LocalStorageManager.isNewUser()

/**
 * 获取可用的 Token
 */
export const getAvailableToken = () => TokenManager.getAvailableToken()

/**
 * 记录 Token 使用
 */
export const recordTokenUsage = (tokenId: string) => TokenManager.recordUsage(tokenId)

/**
 * 获取用户设置
 */
export const getUserSettings = () => LocalStorageManager.getSettings()

/**
 * 更新用户设置
 */
export const updateUserSettings = (updates: any) => LocalStorageManager.updateSettings(updates)

/**
 * 添加到调用历史
 */
export const addToHistory = (call: any) => LocalStorageManager.addToHistory(call)

/**
 * 获取调用历史
 */
export const getCallHistory = () => LocalStorageManager.getHistory()

/**
 * 清空所有数据
 */
export const clearAllData = () => LocalStorageManager.clearAllData()

/**
 * 导出所有数据
 */
export const exportAllData = () => LocalStorageManager.exportData()

/**
 * 导入数据
 */
export const importAllData = (jsonData: string) => LocalStorageManager.importData(jsonData)

/**
 * 获取存储使用情况
 */
export const getStorageInfo = () => LocalStorageManager.getStorageInfo()

/**
 * 验证 Token 格式
 */
export const validateToken = (value: string) => TokenManager.validateToken(value)

/**
 * 获取 Token 统计
 */
export const getTokenStats = () => TokenManager.getStats()

/**
 * 重置每日使用量
 */
export const resetDailyUsage = () => TokenManager.resetDailyUsage()

// 默认导出主要管理器
const StorageManager = {
  storage: LocalStorageManager,
  tokens: TokenManager,

  // 便捷方法
  isNewUser,
  getAvailableToken,
  recordTokenUsage,
  getUserSettings,
  updateUserSettings,
  addToHistory,
  getCallHistory,
  clearAllData,
  exportAllData,
  importAllData,
  getStorageInfo,
  validateToken,
  getTokenStats,
  resetDailyUsage
}

export default StorageManager
