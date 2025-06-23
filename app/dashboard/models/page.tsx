'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Image,
  Mic,
  FileText,
  Bot,
  Zap,
  Clock,
  Users,
  Star,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// 完整的18个免费模型数据
const allModels = [
  // 对话模型 (10个)
  {
    id: 'qwen3-8b',
    name: 'Qwen/Qwen3-8B',
    category: '对话模型',
    type: 'chat',
    description: '支持思考模式，推理、代码、数学能力强，多语言支持丰富',
    icon: MessageSquare,
    features: ['多语言', '代码生成', '数学推理', '思考模式'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: true,
    href: '/dashboard/models/chat'
  },
  {
    id: 'deepseek-r1-0528',
    name: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
    category: '对话模型',
    type: 'chat',
    description: '数学推理能力突出，适合复杂计算和编程推理',
    icon: MessageSquare,
    features: ['数学推理', '逻辑推理', '编程辅助'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: true,
    href: '/dashboard/models/chat'
  },
  {
    id: 'glm-z1-9b',
    name: 'THUDM/GLM-Z1-9B-0414',
    category: '对话模型',
    type: 'chat',
    description: '智谱AI推出的高性能对话模型',
    icon: MessageSquare,
    features: ['对话生成', '文本理解', '多轮对话'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: false,
    href: '/dashboard/models/chat'
  },
  {
    id: 'glm-4-9b',
    name: 'THUDM/GLM-4-9B-0414',
    category: '对话模型',
    type: 'chat',
    description: 'GLM-4系列高性能对话模型',
    icon: MessageSquare,
    features: ['对话生成', '文本理解', '知识问答'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: false,
    href: '/dashboard/models/chat'
  },
  {
    id: 'deepseek-r1-distill',
    name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    category: '对话模型',
    type: 'chat',
    description: 'DeepSeek-R1的蒸馏版本，保持高性能的同时提升速度',
    icon: MessageSquare,
    features: ['快速推理', '高效对话', '知识蒸馏'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: false,
    href: '/dashboard/models/chat'
  },
  {
    id: 'qwen2-5-7b',
    name: 'Qwen/Qwen2.5-7B-Instruct',
    category: '对话模型',
    type: 'chat',
    description: 'Qwen2.5系列指令微调模型',
    icon: MessageSquare,
    features: ['指令遵循', '对话生成', '文本理解'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: false,
    href: '/dashboard/models/chat'
  },
  {
    id: 'qwen-coder',
    name: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    category: '对话模型',
    type: 'chat',
    description: '专注代码生成与修复，开发效率神器',
    icon: MessageSquare,
    features: ['代码生成', '代码修复', '多语言编程'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: true,
    href: '/dashboard/models/chat'
  },
  {
    id: 'internlm2-5',
    name: 'internlm/internlm2_5-7b-chat',
    category: '对话模型',
    type: 'chat',
    description: '上海AI实验室开源的高性能对话模型',
    icon: MessageSquare,
    features: ['对话生成', '知识问答', '多语言支持'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: false,
    href: '/dashboard/models/chat'
  },
  {
    id: 'qwen2-7b',
    name: 'Qwen/Qwen2-7B-Instruct',
    category: '对话模型',
    type: 'chat',
    description: 'Qwen2系列指令微调模型',
    icon: MessageSquare,
    features: ['指令遵循', '对话生成', '文本理解'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: false,
    href: '/dashboard/models/chat'
  },
  {
    id: 'glm-4-9b-chat',
    name: 'THUDM/glm-4-9b-chat',
    category: '对话模型',
    type: 'chat',
    description: 'GLM-4系列对话优化版本',
    icon: MessageSquare,
    features: ['对话优化', '上下文理解', '多轮对话'],
    limits: 'RPM: 1,000 | TPM: 50,000',
    recommended: false,
    href: '/dashboard/models/chat'
  },

  // 图像生成 (1个)
  {
    id: 'kolors',
    name: 'Kwai-Kolors/Kolors',
    category: '图像生成',
    type: 'image',
    description: '中文内容渲染优秀，适合创意图像生成',
    icon: Image,
    features: ['中英文支持', '图生图', '创意设计'],
    limits: 'IPM: 2 | IPD: 400',
    recommended: true,
    href: '/dashboard/models/image'
  },

  // 语音处理 (1个)
  {
    id: 'sensevoice',
    name: 'FunAudioLLM/SenseVoiceSmall',
    category: '语音处理',
    type: 'audio',
    description: '多语言ASR，速度比Whisper快15倍',
    icon: Mic,
    features: ['多语言', '情感识别', '高速处理'],
    limits: '暂不限制',
    recommended: true,
    href: '/dashboard/models/audio'
  },

  // 文本处理 (6个)
  {
    id: 'bge-m3',
    name: 'BAAI/bge-m3',
    category: '文本处理',
    type: 'text',
    description: '多语言支持，适合语义搜索和匹配',
    icon: FileText,
    features: ['多语言', '语义检索', '向量生成'],
    limits: 'RPM: 2,000 | TPM: 500,000',
    recommended: true,
    href: '/dashboard/models/text'
  },
  {
    id: 'bge-large-zh',
    name: 'BAAI/bge-large-zh-v1.5',
    category: '文本处理',
    type: 'text',
    description: '中文文本嵌入模型，适合中文语义理解',
    icon: FileText,
    features: ['中文优化', '语义嵌入', '文本检索'],
    limits: 'RPM: 2,000 | TPM: 500,000',
    recommended: false,
    href: '/dashboard/models/text'
  },
  {
    id: 'bge-large-en',
    name: 'BAAI/bge-large-en-v1.5',
    category: '文本处理',
    type: 'text',
    description: '英文文本嵌入模型，适合英文语义理解',
    icon: FileText,
    features: ['英文优化', '语义嵌入', '文本检索'],
    limits: 'RPM: 2,000 | TPM: 500,000',
    recommended: false,
    href: '/dashboard/models/text'
  },
  {
    id: 'bce-embedding',
    name: 'netease-youdao/bce-embedding-base_v1',
    category: '文本处理',
    type: 'text',
    description: '网易有道开源的文本嵌入模型',
    icon: FileText,
    features: ['中英文支持', '语义嵌入', '检索优化'],
    limits: 'RPM: 2,000 | TPM: 500,000',
    recommended: false,
    href: '/dashboard/models/text'
  },
  {
    id: 'bge-reranker',
    name: 'BAAI/bge-reranker-v2-m3',
    category: '文本处理',
    type: 'text',
    description: '文本重排序模型，提升检索精度',
    icon: FileText,
    features: ['重排序', '检索优化', '相关性评分'],
    limits: 'RPM: 2,000 | TPM: 500,000',
    recommended: false,
    href: '/dashboard/models/text'
  },
  {
    id: 'bce-reranker',
    name: 'netease-youdao/bce-reranker-base_v1',
    category: '文本处理',
    type: 'text',
    description: '网易有道开源的文本重排序模型',
    icon: FileText,
    features: ['重排序', '检索优化', '相关性评分'],
    limits: 'RPM: 2,000 | TPM: 500,000',
    recommended: false,
    href: '/dashboard/models/text'
  }
]

// 获取图标组件
function getIconComponent(IconComponent: any) {
  return <IconComponent className="h-6 w-6" />
}

// 获取分类统计
function getCategoryStats() {
  const chatModels = allModels.filter(m => m.type === 'chat')
  const imageModels = allModels.filter(m => m.type === 'image')
  const audioModels = allModels.filter(m => m.type === 'audio')
  const textModels = allModels.filter(m => m.type === 'text')
  const recommendedModels = allModels.filter(m => m.recommended)

  return {
    total: allModels.length,
    chat: chatModels.length,
    image: imageModels.length,
    audio: audioModels.length,
    text: textModels.length,
    recommended: recommendedModels.length
  }
}

export default function ModelsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const stats = getCategoryStats()

  // 加载设置
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.data)
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  // 设置为默认模型
  const setAsDefault = async (model: any) => {
    if (!settings) return

    setLoading(true)
    try {
      const newSettings = { ...settings }

      // 根据模型类型更新对应的默认设置
      switch (model.type) {
        case 'chat':
          newSettings.chatModel = model.name
          break
        case 'image':
          newSettings.imageModel = model.name
          break
        case 'audio':
          newSettings.audioModel = model.name
          break
        case 'text':
          newSettings.textModel = model.name
          break
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      const result = await response.json()
      if (result.success) {
        setSettings(newSettings)
        toast.success(`已设置 ${model.name} 为默认${model.category}`)
      } else {
        toast.error(result.error || '设置失败')
      }
    } catch (error) {
      toast.error('设置默认模型失败')
    } finally {
      setLoading(false)
    }
  }

  // 检查是否为当前默认模型
  const isDefaultModel = (model: any) => {
    if (!settings) return false

    switch (model.type) {
      case 'chat':
        return settings.chatModel === model.name
      case 'image':
        return settings.imageModel === model.name
      case 'audio':
        return settings.audioModel === model.name
      case 'text':
        return settings.textModel === model.name
      default:
        return false
    }
  }

  // 筛选模型
  const filteredModels = selectedCategory === 'all'
    ? allModels
    : allModels.filter(model => model.type === selectedCategory)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
              <Bot className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">18个免费AI模型</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                模型调用
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              选择合适的AI模型来完成您的任务，涵盖对话、图像、语音、文本处理等全栈AI能力
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              <span className="button-text">模型设置</span>
            </Button>
          </Link>
        </div>

        {/* 统计信息 */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">可用模型</CardTitle>
              <div className="relative">
                <Bot className="h-5 w-5 text-blue-400" />
                <div className="absolute inset-0 h-5 w-5 text-blue-400 animate-pulse opacity-30 group-hover:opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                免费开放使用
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">对话模型</CardTitle>
              <div className="relative">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                <div className="absolute inset-0 h-5 w-5 text-blue-400 animate-pulse opacity-30 group-hover:opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.chat}</div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                智能对话生成
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">图像生成</CardTitle>
              <div className="relative">
                <Image className="h-5 w-5 text-purple-400" />
                <div className="absolute inset-0 h-5 w-5 text-purple-400 animate-pulse opacity-30 group-hover:opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.image}</div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Image className="h-3 w-3" />
                创意图像生成
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">语音处理</CardTitle>
              <div className="relative">
                <Mic className="h-5 w-5 text-green-400" />
                <div className="absolute inset-0 h-5 w-5 text-green-400 animate-pulse opacity-30 group-hover:opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.audio}</div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Mic className="h-3 w-3" />
                语音识别转换
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">文本处理</CardTitle>
              <div className="relative">
                <FileText className="h-5 w-5 text-yellow-400" />
                <div className="absolute inset-0 h-5 w-5 text-yellow-400 animate-pulse opacity-30 group-hover:opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.text}</div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                语义理解检索
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="h-12"
          >
            <span className="button-text">全部模型 ({stats.total})</span>
          </Button>
          <Button
            variant={selectedCategory === 'chat' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('chat')}
            className="h-12"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="button-text">对话模型 ({stats.chat})</span>
          </Button>
          <Button
            variant={selectedCategory === 'image' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('image')}
            className="h-12"
          >
            <Image className="mr-2 h-4 w-4" />
            <span className="button-text">图像生成 ({stats.image})</span>
          </Button>
          <Button
            variant={selectedCategory === 'audio' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('audio')}
            className="h-12"
          >
            <Mic className="mr-2 h-4 w-4" />
            <span className="button-text">语音处理 ({stats.audio})</span>
          </Button>
          <Button
            variant={selectedCategory === 'text' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('text')}
            className="h-12"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="button-text">文本处理 ({stats.text})</span>
          </Button>
        </div>

        {/* 模型列表 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {selectedCategory === 'all' ? '全部模型' :
               selectedCategory === 'chat' ? '对话模型' :
               selectedCategory === 'image' ? '图像生成' :
               selectedCategory === 'audio' ? '语音处理' : '文本处理'}
            </h2>
            <p className="text-gray-400 flex items-center gap-2">
              <Bot className="h-4 w-4" />
              共 {filteredModels.length} 个模型
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => (
              <Card key={model.id} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        model.type === 'chat' ? 'bg-blue-500/10' :
                        model.type === 'image' ? 'bg-purple-500/10' :
                        model.type === 'audio' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                      }`}>
                        {React.createElement(model.icon, {
                          className: `h-5 w-5 ${
                            model.type === 'chat' ? 'text-blue-400' :
                            model.type === 'image' ? 'text-purple-400' :
                            model.type === 'audio' ? 'text-green-400' : 'text-yellow-400'
                          }`
                        })}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                          {model.category}
                        </Badge>
                        {model.recommended && (
                          <Badge className="bg-blue-600 hover:bg-blue-700">
                            推荐
                          </Badge>
                        )}
                        {isDefaultModel(model) && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                            <Star className="mr-1 h-3 w-3" />
                            默认
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white group-hover:text-blue-300 transition-colors mb-2">
                    {model.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm leading-relaxed">
                    {model.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-white">特性</h4>
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs border-gray-600 text-gray-300 hover:border-gray-500">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-white">使用限制</h4>
                    <p className="text-xs text-gray-400">{model.limits}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href={model.href} className="flex-1">
                      <Button className="w-full h-10">
                        <span className="button-text">开始使用</span>
                      </Button>
                    </Link>
                    {!isDefaultModel(model) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAsDefault(model)}
                        disabled={loading}
                        className="h-10 px-3"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredModels.length === 0 && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">该分类下暂无可用模型</p>
                <p className="text-gray-500 text-sm mt-2">请选择其他分类查看更多模型</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
