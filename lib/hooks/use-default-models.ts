'use client'

import { useState, useEffect } from 'react'

export interface DefaultModels {
  chatModel: string
  imageModel: string
  audioModel: string
  textModel: string
  baseUrl: string
}

const DEFAULT_SETTINGS: DefaultModels = {
  chatModel: 'Qwen/Qwen3-8B',
  imageModel: 'Kwai-Kolors/Kolors',
  audioModel: 'FunAudioLLM/SenseVoiceSmall',
  textModel: 'BAAI/bge-m3',
  baseUrl: 'https://api.siliconflow.cn/v1'
}

const STORAGE_KEY = 'siliconflow_default_models'

export function useDefaultModels() {
  const [settings, setSettings] = useState<DefaultModels>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  // 加载设置
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedSettings = JSON.parse(stored)
        setSettings(prev => ({ ...prev, ...parsedSettings }))
      }
    } catch (error) {
      console.error('加载默认模型设置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = (newSettings: Partial<DefaultModels>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings))
      return true
    } catch (error) {
      console.error('保存默认模型设置失败:', error)
      return false
    }
  }

  const updateSetting = (key: keyof DefaultModels, value: string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
  }

  const saveSetting = (key: keyof DefaultModels, value: string) => {
    const newSettings = { ...settings, [key]: value }
    return saveSettings(newSettings)
  }

  const saveAllSettings = () => {
    return saveSettings(settings)
  }

  // 获取特定类型的默认模型
  const getDefaultModel = (type: 'chat' | 'image' | 'audio' | 'text'): string => {
    switch (type) {
      case 'chat':
        return settings.chatModel
      case 'image':
        return settings.imageModel
      case 'audio':
        return settings.audioModel
      case 'text':
        return settings.textModel
      default:
        return ''
    }
  }

  return {
    settings,
    loading,
    updateSetting,
    saveSetting,
    saveAllSettings,
    getDefaultModel,
    loadSettings
  }
}
