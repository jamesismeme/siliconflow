'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare,
  Image,
  Mic,
  FileText,
  Bot,
  Search,
  Filter,
  Zap
} from 'lucide-react'

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

interface ModelSelectorProps {
  selectedModel?: ModelConfig | null
  onModelSelect: (model: ModelConfig) => void
  category?: string
  showRecommendedOnly?: boolean
}

// 图标映射
const categoryIcons = {
  chat: MessageSquare,
  code: Bot,
  embedding: FileText,
  rerank: FileText,
  audio: Mic,
  image: Image
}

export function ModelSelector({ 
  selectedModel, 
  onModelSelect, 
  category,
  showRecommendedOnly = false 
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [filteredModels, setFilteredModels] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(category || 'all')
  const [showRecommended, setShowRecommended] = useState(showRecommendedOnly)

  // 获取模型列表
  useEffect(() => {
    async function fetchModels() {
      try {
        const params = new URLSearchParams()

        // 如果传入了category参数，强制使用该分类
        const effectiveCategory = category || selectedCategory

        if (effectiveCategory !== 'all') params.append('category', effectiveCategory)
        if (showRecommended) params.append('recommended', 'true')

        const response = await fetch(`/api/models?${params}`)
        const data = await response.json()

        if (data.success) {
          setModels(data.data.models)
        }
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [category, selectedCategory, showRecommended])

  // 过滤模型
  useEffect(() => {
    let filtered = models

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredModels(filtered)
  }, [models, searchTerm])

  const formatLimits = (limits: ModelConfig['limits']) => {
    const parts = []
    if (limits.rpm > 0) parts.push(`RPM: ${limits.rpm.toLocaleString()}`)
    if (limits.tpm) parts.push(`TPM: ${limits.tpm.toLocaleString()}`)
    if (limits.ipm) parts.push(`IPM: ${limits.ipm}`)
    if (limits.ipd) parts.push(`IPD: ${limits.ipd}`)
    return parts.length > 0 ? parts.join(' | ') : '暂不限制'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">加载模型列表...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索模型..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            style={{
              color: 'white !important',
              backgroundColor: 'rgb(31, 41, 55)',
              borderColor: 'rgb(55, 65, 81)'
            }}
          />
        </div>
        <div className="flex gap-2">
          {/* 只有在没有指定category时才显示分类选择器 */}
          {!category && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-700">所有类别</SelectItem>
                <SelectItem value="chat" className="text-white hover:bg-gray-700">对话模型</SelectItem>
                <SelectItem value="code" className="text-white hover:bg-gray-700">代码模型</SelectItem>
                <SelectItem value="embedding" className="text-white hover:bg-gray-700">嵌入模型</SelectItem>
                <SelectItem value="rerank" className="text-white hover:bg-gray-700">重排序</SelectItem>
                <SelectItem value="audio" className="text-white hover:bg-gray-700">语音模型</SelectItem>
                <SelectItem value="image" className="text-white hover:bg-gray-700">图像模型</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            variant={showRecommended ? "default" : "outline"}
            onClick={() => setShowRecommended(!showRecommended)}
            size="sm"
            className="h-10"
          >
            <Zap className="h-4 w-4 mr-2" />
            <span className="button-text">推荐</span>
          </Button>
        </div>
      </div>

      {/* 模型列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => {
          const Icon = categoryIcons[model.category]
          const isSelected = selectedModel?.id === model.id

          return (
            <Card
              key={model.id}
              className={`cursor-pointer transition-all duration-300 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 ${
                isSelected ? 'ring-2 ring-blue-500 bg-gray-700/50' : ''
              }`}
              onClick={() => onModelSelect(model)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
                      {model.category}
                    </Badge>
                  </div>
                  {model.recommended && (
                    <Badge className="text-xs bg-blue-600 hover:bg-blue-700">
                      <Zap className="h-3 w-3 mr-1" />
                      推荐
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base text-white">{model.displayName}</CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  {model.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium mb-1 text-gray-300">特性</p>
                  <div className="flex flex-wrap gap-1">
                    {model.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                        {feature}
                      </Badge>
                    ))}
                    {model.features.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                        +{model.features.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1 text-gray-300">使用限制</p>
                  <p className="text-xs text-gray-400">
                    {formatLimits(model.limits)}
                  </p>
                </div>
                {model.contextLength > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1 text-gray-300">上下文长度</p>
                    <p className="text-xs text-gray-400">
                      {model.contextLength.toLocaleString()} tokens
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">没有找到匹配的模型</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setShowRecommended(false)
            }}
            className="mt-2"
          >
            <span className="button-text">清除筛选</span>
          </Button>
        </div>
      )}
    </div>
  )
}
