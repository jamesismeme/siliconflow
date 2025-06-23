import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getDefaultModelByCategory } from '@/lib/constants/models'
import { LocalStorageManager } from '@/lib/storage'
import type { CallHistory as StorageCallHistory } from '@/lib/storage/types'

// 模型配置接口
interface ModelConfig {
  id: string
  name: string
  displayName: string
  category: 'chat' | 'embedding' | 'rerank' | 'audio' | 'image' | 'code'
  description: string
  features: string[]
  limits: {
    rpm: number
    tpm?: number
    ipm?: number
    ipd?: number
  }
  parameters: {
    temperature?: { min: number; max: number; default: number }
    max_tokens?: { min: number; max: number; default: number }
    top_p?: { min: number; max: number; default: number }
  }
  recommended: boolean
  contextLength: number
  pricing: 'free' | 'paid'
}

// 参数配置接口
interface ModelParameters {
  temperature?: number
  max_tokens?: number
  top_p?: number
  n?: number
  size?: string
  response_format?: string
  voice?: string
  speed?: number
  language?: string
  // 文本处理参数
  encoding_format?: string
  top_n?: number
  return_documents?: boolean
}

// API调用结果接口
interface ApiResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    model: string
    type: string
    responseTime: number
    timestamp: string
    tokenId?: string
    tokenName?: string
  }
}

// 调用历史记录
interface CallHistory {
  id: string
  model: string
  type: string
  parameters: ModelParameters
  result: ApiResult
  timestamp: string
}

// Store状态接口
interface ModelStore {
  // 当前选中的模型
  selectedModel: ModelConfig | null
  setSelectedModel: (model: ModelConfig | null) => void

  // 模型参数
  parameters: ModelParameters
  setParameters: (parameters: ModelParameters) => void
  updateParameter: (key: keyof ModelParameters, value: any) => void

  // API调用状态
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // 调用结果
  result: ApiResult | null
  setResult: (result: ApiResult | null) => void

  // 调用历史
  history: CallHistory[]
  addToHistory: (call: CallHistory) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void

  // 用户偏好
  preferences: {
    defaultCategory: string
    showRecommendedOnly: boolean
    autoSaveHistory: boolean
    maxHistoryItems: number
  }
  setPreferences: (preferences: Partial<ModelStore['preferences']>) => void

  // 重置状态
  reset: () => void

  // 自动选择默认模型
  selectDefaultModel: (category: 'chat' | 'image' | 'audio' | 'embedding' | 'rerank') => void

  // 强制选择指定类别的默认模型
  forceSelectDefaultModel: (category: 'chat' | 'image' | 'audio' | 'embedding' | 'rerank') => void
}

// 默认参数
const defaultParameters: ModelParameters = {
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 0.9,
  n: 1,
  size: '1024x1024',
  response_format: 'json',
  language: 'auto'
}

// 默认偏好设置
const defaultPreferences = {
  defaultCategory: 'chat',
  showRecommendedOnly: false,
  autoSaveHistory: true,
  maxHistoryItems: 50
}

// 创建Store
export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      selectedModel: null,
      parameters: defaultParameters,
      isLoading: false,
      result: null,
      history: LocalStorageManager.getHistory().map(h => ({
        id: h.id,
        model: h.model,
        type: h.type,
        parameters: h.parameters,
        result: h.result,
        timestamp: h.timestamp
      })),
      preferences: {
        ...defaultPreferences,
        ...LocalStorageManager.getSettings().preferences
      },

      // 设置选中的模型
      setSelectedModel: (model) => {
        set({ selectedModel: model })
        
        // 如果选择了新模型，重置参数为该模型的默认值
        if (model) {
          const newParams: ModelParameters = { ...defaultParameters }
          
          if (model.parameters.temperature) {
            newParams.temperature = model.parameters.temperature.default
          }
          if (model.parameters.max_tokens) {
            newParams.max_tokens = model.parameters.max_tokens.default
          }
          if (model.parameters.top_p) {
            newParams.top_p = model.parameters.top_p.default
          }

          // 根据模型类别设置特定参数
          switch (model.category) {
            case 'image':
              newParams.n = 1
              newParams.size = '1024x1024'
              newParams.response_format = 'url'
              break
            case 'audio':
              newParams.response_format = 'json'
              newParams.language = 'auto'
              break
            case 'code':
              newParams.temperature = 0.3 // 代码生成使用较低温度
              break
          }

          set({ parameters: newParams })
        }
      },

      // 设置参数
      setParameters: (parameters) => set({ parameters }),

      // 更新单个参数
      updateParameter: (key, value) => {
        const currentParams = get().parameters
        set({ 
          parameters: { 
            ...currentParams, 
            [key]: value 
          } 
        })
      },

      // 设置加载状态
      setIsLoading: (loading) => set({ isLoading: loading }),

      // 设置结果
      setResult: (result) => set({ result }),

      // 添加到历史记录
      addToHistory: (call) => {
        const { preferences } = get()

        if (!preferences.autoSaveHistory) return

        // 转换为 LocalStorage 格式
        const storageCall: StorageCallHistory = {
          id: call.id,
          model: call.model,
          type: call.type,
          parameters: call.parameters,
          result: call.result,
          timestamp: call.timestamp
        }

        // 保存到 LocalStorage
        LocalStorageManager.addToHistory(storageCall)

        // 更新本地状态
        const history = LocalStorageManager.getHistory().map(h => ({
          id: h.id,
          model: h.model,
          type: h.type,
          parameters: h.parameters,
          result: h.result,
          timestamp: h.timestamp
        }))

        set({ history })
      },

      // 清空历史记录
      clearHistory: () => {
        LocalStorageManager.clearHistory()
        set({ history: [] })
      },

      // 删除单条历史记录
      removeFromHistory: (id) => {
        LocalStorageManager.removeFromHistory(id)
        const history = LocalStorageManager.getHistory().map(h => ({
          id: h.id,
          model: h.model,
          type: h.type,
          parameters: h.parameters,
          result: h.result,
          timestamp: h.timestamp
        }))
        set({ history })
      },

      // 设置偏好
      setPreferences: (newPreferences) => {
        const currentPreferences = get().preferences
        const updatedPreferences = {
          ...currentPreferences,
          ...newPreferences
        }

        // 更新 LocalStorage 中的设置
        const currentSettings = LocalStorageManager.getSettings()
        LocalStorageManager.setSettings({
          ...currentSettings,
          preferences: updatedPreferences
        })

        set({ preferences: updatedPreferences })
      },

      // 重置状态
      reset: () => set({
        selectedModel: null,
        parameters: defaultParameters,
        isLoading: false,
        result: null,
        // 保留历史记录和偏好设置
      }),

      // 自动选择默认模型
      selectDefaultModel: (category) => {
        const defaultModel = getDefaultModelByCategory(category)
        if (defaultModel) {
          const actions = get()
          actions.setSelectedModel(defaultModel)
        }
      },

      // 强制选择指定类别的默认模型（即使已有模型）
      forceSelectDefaultModel: (category) => {
        const defaultModel = getDefaultModelByCategory(category)
        if (defaultModel) {
          const actions = get()
          actions.setSelectedModel(defaultModel)
        }
      }
    }),
    {
      name: 'model-store',
      // 只持久化部分状态
      partialize: (state) => ({
        history: state.history,
        preferences: state.preferences,
        selectedModel: state.selectedModel,
        parameters: state.parameters
      })
    }
  )
)

// 便捷的Hook
export const useSelectedModel = () => useModelStore(state => state.selectedModel)
export const useModelParameters = () => useModelStore(state => state.parameters)
export const useModelLoading = () => useModelStore(state => state.isLoading)
export const useModelResult = () => useModelStore(state => state.result)
export const useModelHistory = () => useModelStore(state => state.history)
export const useModelPreferences = () => useModelStore(state => state.preferences)
