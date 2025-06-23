/**
 * LocalStorage 相关的类型定义
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

// Token 创建时的输入接口
export interface TokenInput {
  name: string
  value: string
  isActive?: boolean
  limitPerDay?: number
}

// Token 更新接口
export interface TokenUpdate {
  name?: string
  value?: string
  isActive?: boolean
  limitPerDay?: number
  usageToday?: number
  lastUsedAt?: string | null
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

// 用户偏好设置
export interface UserPreferences {
  defaultCategory: string
  showRecommendedOnly: boolean
  autoSaveHistory: boolean
  maxHistoryItems: number
}

// 用户设置接口
export interface UserSettings {
  baseUrl: string
  chatModel: string
  imageModel: string
  audioModel: string
  textModel: string
  preferences: UserPreferences
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

// API 调用结果接口
export interface ApiResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    model: string
    type: string
    responseTime: number
    timestamp: string
    tokenId?: string
  }
}

// 模型参数接口
export interface ModelParameters {
  temperature?: number
  max_tokens?: number
  top_p?: number
  n?: number
  size?: string
  response_format?: string
  voice?: string
  speed?: number
  language?: string
  encoding_format?: string
  top_n?: number
  return_documents?: boolean
  [key: string]: any
}

// 数据导出/导入接口
export interface ExportData {
  tokens: Token[]
  settings: UserSettings
  history: CallHistory[]
  exportedAt: string
  version: string
}

// 存储信息接口
export interface StorageInfo {
  used: number
  available: number
  percentage: number
}

// LocalStorage 键名枚举
export enum StorageKeys {
  TOKENS = 'siliconflow_tokens',
  SETTINGS = 'siliconflow_settings',
  HISTORY = 'siliconflow_history'
}

// 模型类别枚举
export enum ModelCategory {
  CHAT = 'chat',
  IMAGE = 'image',
  AUDIO = 'audio',
  EMBEDDING = 'embedding',
  RERANK = 'rerank',
  CODE = 'code'
}

// API 调用类型枚举
export enum ApiCallType {
  CHAT = 'chat',
  IMAGE = 'image',
  AUDIO_TRANSCRIPTION = 'audio-transcription',
  AUDIO_SPEECH = 'audio-speech',
  EMBEDDING = 'embedding',
  RERANK = 'rerank'
}

// Token 验证结果接口
export interface TokenValidation {
  isValid: boolean
  error?: string
  details?: {
    format: boolean
    length: boolean
    prefix: boolean
  }
}

// 使用统计接口
export interface UsageStats {
  daily: {
    calls: number
    tokens: number
    errors: number
  }
  weekly: {
    calls: number
    tokens: number
    errors: number
  }
  monthly: {
    calls: number
    tokens: number
    errors: number
  }
  models: {
    [modelName: string]: {
      calls: number
      lastUsed: string
    }
  }
}

// 错误类型枚举
export enum StorageError {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_DATA = 'INVALID_DATA',
  PARSE_ERROR = 'PARSE_ERROR',
  ACCESS_DENIED = 'ACCESS_DENIED'
}

// 存储操作结果接口
export interface StorageResult<T = any> {
  success: boolean
  data?: T
  error?: {
    type: StorageError
    message: string
  }
}

// 批量操作接口
export interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete'
  data: T
  id?: string
}

// 搜索过滤器接口
export interface SearchFilter {
  query?: string
  category?: ModelCategory
  dateRange?: {
    start: string
    end: string
  }
  status?: 'success' | 'error'
}

// 分页接口
export interface Pagination {
  page: number
  pageSize: number
  total: number
}

// 分页结果接口
export interface PaginatedResult<T> {
  data: T[]
  pagination: Pagination
}
