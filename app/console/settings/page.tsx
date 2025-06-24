'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Settings,
  Key,
  Save,
  Bot,
  Image,
  Mic,
  Type
} from 'lucide-react'
import { toast } from 'sonner'
import { useDefaultModels } from '@/lib/hooks/use-default-models'

export default function SettingsPage() {
  const { settings, loading: hookLoading, updateSetting, saveAllSettings } = useDefaultModels()
  const [loading, setLoading] = useState(false)

  const saveSettings = async () => {
    setLoading(true)
    try {
      const success = saveAllSettings()
      if (success) {
        toast.success('设置保存成功')
      } else {
        toast.error('保存失败')
      }
    } catch (error) {
      toast.error('保存设置失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* 页面标题 */}
        <div>
          <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
            <Settings className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">系统配置</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              系统设置
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            配置系统参数、API设置和用户偏好，个性化您的平台体验
          </p>
        </div>

      {/* API配置 */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-blue-400" />
            API配置
          </CardTitle>
          <CardDescription className="text-gray-400">
            配置SiliconFlow API基础地址
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-gray-300">API基础URL</Label>
            <Input
              id="baseUrl"
              placeholder="https://api.siliconflow.cn/v1"
              value={settings.baseUrl}
              onChange={(e) => updateSetting('baseUrl', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400">
              SiliconFlow API的基础地址
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 模型偏好 */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-green-400" />
            模型偏好
          </CardTitle>
          <CardDescription className="text-gray-400">
            设置各类型任务的默认模型
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chatModel" className="flex items-center gap-2 text-gray-300">
                <Bot className="h-4 w-4 text-blue-400" />
                对话模型
              </Label>
              <select
                id="chatModel"
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:border-blue-500 focus:outline-none"
                value={settings.chatModel}
                onChange={(e) => updateSetting('chatModel', e.target.value)}
              >
                <option value="Qwen/Qwen3-8B">Qwen/Qwen3-8B (推荐)</option>
                <option value="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B">deepseek-ai/DeepSeek-R1-0528-Qwen3-8B</option>
                <option value="THUDM/GLM-Z1-9B-0414">THUDM/GLM-Z1-9B-0414</option>
                <option value="THUDM/GLM-4-9B-0414">THUDM/GLM-4-9B-0414</option>
                <option value="deepseek-ai/DeepSeek-R1-Distill-Qwen-7B">deepseek-ai/DeepSeek-R1-Distill-Qwen-7B</option>
                <option value="Qwen/Qwen2.5-7B-Instruct">Qwen/Qwen2.5-7B-Instruct</option>
                <option value="Qwen/Qwen2.5-Coder-7B-Instruct">Qwen/Qwen2.5-Coder-7B-Instruct</option>
                <option value="internlm/internlm2_5-7b-chat">internlm/internlm2_5-7b-chat</option>
                <option value="Qwen/Qwen2-7B-Instruct">Qwen/Qwen2-7B-Instruct</option>
                <option value="THUDM/glm-4-9b-chat">THUDM/glm-4-9b-chat</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageModel" className="flex items-center gap-2 text-gray-300">
                <Image className="h-4 w-4 text-purple-400" />
                图像生成
              </Label>
              <select
                id="imageModel"
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:border-blue-500 focus:outline-none"
                value={settings.imageModel}
                onChange={(e) => updateSetting('imageModel', e.target.value)}
              >
                <option value="Kwai-Kolors/Kolors">Kwai-Kolors/Kolors (推荐)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audioModel" className="flex items-center gap-2 text-gray-300">
                <Mic className="h-4 w-4 text-green-400" />
                语音处理
              </Label>
              <select
                id="audioModel"
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:border-blue-500 focus:outline-none"
                value={settings.audioModel}
                onChange={(e) => updateSetting('audioModel', e.target.value)}
              >
                <option value="FunAudioLLM/SenseVoiceSmall">FunAudioLLM/SenseVoiceSmall (推荐)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textModel" className="flex items-center gap-2 text-gray-300">
                <Type className="h-4 w-4 text-yellow-400" />
                文本处理
              </Label>
              <select
                id="textModel"
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:border-blue-500 focus:outline-none"
                value={settings.textModel}
                onChange={(e) => updateSetting('textModel', e.target.value)}
              >
                <option value="BAAI/bge-m3">BAAI/bge-m3 (推荐)</option>
                <option value="BAAI/bge-large-zh-v1.5">BAAI/bge-large-zh-v1.5</option>
                <option value="BAAI/bge-large-en-v1.5">BAAI/bge-large-en-v1.5</option>
                <option value="netease-youdao/bce-embedding-base_v1">netease-youdao/bce-embedding-base_v1</option>
                <option value="BAAI/bge-reranker-v2-m3">BAAI/bge-reranker-v2-m3</option>
                <option value="netease-youdao/bce-reranker-base_v1">netease-youdao/bce-reranker-base_v1</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* 保存所有设置 */}
      <div className="flex justify-end">
        <Button size="lg" onClick={saveSettings} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          <span className="button-text">{loading ? '保存中...' : '保存所有设置'}</span>
        </Button>
      </div>
      </div>
    </div>
  )
}
