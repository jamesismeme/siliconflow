/**
 * 设置管理 Zustand Store
 * 用于管理用户设置和偏好
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LocalStorageManager } from '@/lib/storage'
import type { UserSettings, UserPreferences } from '@/lib/storage/types'

// 设置 Store 状态接口
interface SettingsStore {
  // 状态
  settings: UserSettings
  loading: boolean
  error: string | null

  // 设置操作
  loadSettings: () => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  
  // 偏好设置
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  
  // 模型设置
  updateChatModel: (model: string) => Promise<void>
  updateImageModel: (model: string) => Promise<void>
  updateAudioModel: (model: string) => Promise<void>
  updateTextModel: (model: string) => Promise<void>
  updateBaseUrl: (url: string) => Promise<void>

  // 状态管理
  clearError: () => void
  setLoading: (loading: boolean) => void

  // 工具方法
  exportSettings: () => string
  importSettings: (jsonData: string) => Promise<{ success: boolean; error?: string }>
  getDefaultSettings: () => UserSettings
}

// 创建设置 Store
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      settings: LocalStorageManager.getSettings(),
      loading: false,
      error: null,

      // 加载设置
      loadSettings: async () => {
        try {
          set({ loading: true, error: null })
          const settings = LocalStorageManager.getSettings()
          set({ settings, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载设置失败',
            loading: false 
          })
        }
      },

      // 更新设置
      updateSettings: async (updates: Partial<UserSettings>) => {
        try {
          set({ loading: true, error: null })
          const currentSettings = get().settings
          const newSettings = { ...currentSettings, ...updates }
          
          LocalStorageManager.setSettings(newSettings)
          set({ settings: newSettings, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新设置失败',
            loading: false 
          })
        }
      },

      // 重置设置
      resetSettings: async () => {
        try {
          set({ loading: true, error: null })
          const defaultSettings = LocalStorageManager.getDefaultSettings()
          LocalStorageManager.setSettings(defaultSettings)
          set({ settings: defaultSettings, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '重置设置失败',
            loading: false 
          })
        }
      },

      // 更新偏好设置
      updatePreferences: async (updates: Partial<UserPreferences>) => {
        try {
          const currentSettings = get().settings
          const newPreferences = { ...currentSettings.preferences, ...updates }
          await get().updateSettings({ preferences: newPreferences })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新偏好失败'
          })
        }
      },

      // 更新聊天模型
      updateChatModel: async (model: string) => {
        await get().updateSettings({ chatModel: model })
      },

      // 更新图像模型
      updateImageModel: async (model: string) => {
        await get().updateSettings({ imageModel: model })
      },

      // 更新音频模型
      updateAudioModel: async (model: string) => {
        await get().updateSettings({ audioModel: model })
      },

      // 更新文本模型
      updateTextModel: async (model: string) => {
        await get().updateSettings({ textModel: model })
      },

      // 更新基础 URL
      updateBaseUrl: async (url: string) => {
        await get().updateSettings({ baseUrl: url })
      },

      // 清除错误
      clearError: () => {
        set({ error: null })
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading })
      },

      // 导出设置
      exportSettings: () => {
        const { settings } = get()
        return JSON.stringify(settings, null, 2)
      },

      // 导入设置
      importSettings: async (jsonData: string) => {
        try {
          set({ loading: true, error: null })
          const importedSettings = JSON.parse(jsonData) as UserSettings
          
          // 验证导入的设置格式
          if (!importedSettings.baseUrl || !importedSettings.chatModel) {
            throw new Error('导入的设置格式不正确')
          }
          
          LocalStorageManager.setSettings(importedSettings)
          set({ settings: importedSettings, loading: false })
          
          return { success: true }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '导入设置失败'
          set({ error: errorMsg, loading: false })
          return { success: false, error: errorMsg }
        }
      },

      // 获取默认设置
      getDefaultSettings: () => {
        return LocalStorageManager.getDefaultSettings()
      }
    }),
    {
      name: 'settings-store',
      // 持久化所有设置
      partialize: (state) => ({
        settings: state.settings
      })
    }
  )
)

// 便捷的 Hook
export const useSettings = () => useSettingsStore(state => state.settings)
export const useSettingsLoading = () => useSettingsStore(state => state.loading)
export const useSettingsError = () => useSettingsStore(state => state.error)

// 模型设置 Hook
export const useModelSettings = () => {
  const settings = useSettingsStore(state => state.settings)
  return {
    chatModel: settings.chatModel,
    imageModel: settings.imageModel,
    audioModel: settings.audioModel,
    textModel: settings.textModel,
    baseUrl: settings.baseUrl
  }
}

// 偏好设置 Hook
export const usePreferences = () => useSettingsStore(state => state.settings.preferences)

// 设置操作 Hook
export const useSettingsActions = () => {
  const store = useSettingsStore()
  return {
    loadSettings: store.loadSettings,
    updateSettings: store.updateSettings,
    resetSettings: store.resetSettings,
    updatePreferences: store.updatePreferences,
    updateChatModel: store.updateChatModel,
    updateImageModel: store.updateImageModel,
    updateAudioModel: store.updateAudioModel,
    updateTextModel: store.updateTextModel,
    updateBaseUrl: store.updateBaseUrl,
    clearError: store.clearError,
    exportSettings: store.exportSettings,
    importSettings: store.importSettings,
    getDefaultSettings: store.getDefaultSettings
  }
}

// 特定设置的便捷 Hook
export const useChatModel = () => {
  const chatModel = useSettingsStore(state => state.settings.chatModel)
  const updateChatModel = useSettingsStore(state => state.updateChatModel)
  return [chatModel, updateChatModel] as const
}

export const useImageModel = () => {
  const imageModel = useSettingsStore(state => state.settings.imageModel)
  const updateImageModel = useSettingsStore(state => state.updateImageModel)
  return [imageModel, updateImageModel] as const
}

export const useAudioModel = () => {
  const audioModel = useSettingsStore(state => state.settings.audioModel)
  const updateAudioModel = useSettingsStore(state => state.updateAudioModel)
  return [audioModel, updateAudioModel] as const
}

export const useTextModel = () => {
  const textModel = useSettingsStore(state => state.settings.textModel)
  const updateTextModel = useSettingsStore(state => state.updateTextModel)
  return [textModel, updateTextModel] as const
}

export const useBaseUrl = () => {
  const baseUrl = useSettingsStore(state => state.settings.baseUrl)
  const updateBaseUrl = useSettingsStore(state => state.updateBaseUrl)
  return [baseUrl, updateBaseUrl] as const
}

// 自动保存历史设置 Hook
export const useAutoSaveHistory = () => {
  const autoSaveHistory = useSettingsStore(state => state.settings.preferences.autoSaveHistory)
  const updatePreferences = useSettingsStore(state => state.updatePreferences)
  
  const setAutoSaveHistory = (value: boolean) => {
    updatePreferences({ autoSaveHistory: value })
  }
  
  return [autoSaveHistory, setAutoSaveHistory] as const
}

// 最大历史记录数设置 Hook
export const useMaxHistoryItems = () => {
  const maxHistoryItems = useSettingsStore(state => state.settings.preferences.maxHistoryItems)
  const updatePreferences = useSettingsStore(state => state.updatePreferences)
  
  const setMaxHistoryItems = (value: number) => {
    updatePreferences({ maxHistoryItems: value })
  }
  
  return [maxHistoryItems, setMaxHistoryItems] as const
}

export default useSettingsStore
