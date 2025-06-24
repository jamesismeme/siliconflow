'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModelSelector } from '@/components/models/model-selector'
import { ParameterPanel } from '@/components/models/parameter-panel'
import { 
  Image as ImageIcon,
  Wand2,
  Download,
  Copy,
  Settings,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  Sparkles
} from 'lucide-react'
import { useImageApi } from '@/lib/hooks/use-api'
import { useModelStore } from '@/lib/stores/model-store'
import { useTokenStore } from '@/lib/stores/token-store'
import { toast } from 'sonner'
import Link from 'next/link'
import { AlertTriangle, CheckCircle } from 'lucide-react'

// 图像生成历史记录
interface GeneratedImage {
  id: string
  prompt: string
  url: string
  parameters: any
  timestamp: string
  isGenerating?: boolean
}

// 生成中的占位图像
interface GeneratingImage {
  id: string
  prompt: string
  parameters: any
  timestamp: string
}

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [generatingImages, setGeneratingImages] = useState<GeneratingImage[]>([])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showParameters, setShowParameters] = useState(false)

  const { generateImage, loading, error } = useImageApi()
  const {
    selectedModel,
    setSelectedModel,
    parameters,
    setParameters,
    updateParameter,
    selectDefaultModel,
    forceSelectDefaultModel
  } = useModelStore()

  // Token 状态检查
  const tokens = useTokenStore(state => state.tokens)
  const loadTokens = useTokenStore(state => state.loadTokens)
  const hasTokens = tokens.length > 0
  const hasAvailableTokens = tokens.some(token =>
    token.isActive && token.usageToday < token.limitPerDay
  )

  // 确保 Token 数据已加载
  useEffect(() => {
    loadTokens()
  }, [])

  // 确保使用正确的图像模型
  useEffect(() => {
    // 如果没有模型或者当前模型不是图像类型，强制选择默认图像模型
    if (!selectedModel || selectedModel.category !== 'image') {
      forceSelectDefaultModel('image')
    }
  }, [selectedModel, forceSelectDefaultModel])

  // 生成图像
  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel || loading) return

    // 检查 Token 可用性
    if (!hasTokens) {
      toast.error('请先添加 API Token')
      return
    }

    if (!hasAvailableTokens) {
      toast.error('所有 Token 已达到每日限制，请添加新的 Token 或等待重置')
      return
    }

    const imageCount = parameters.n || 1
    const currentPrompt = prompt.trim()
    const currentParams = { ...parameters, negative_prompt: negativePrompt || undefined }

    // 创建生成中的占位图像
    const generatingImageIds = Array.from({ length: imageCount }, (_, index) => ({
      id: `generating-${Date.now()}-${index}`,
      prompt: currentPrompt,
      parameters: currentParams,
      timestamp: new Date().toISOString()
    }))

    setGeneratingImages(generatingImageIds)
    toast.info(`开始生成 ${imageCount} 张图片...`)

    try {
      const result = await generateImage(selectedModel.name, currentPrompt, currentParams)

      if (result.success && result.data?.data) {
        const newImages = result.data.data.map((img: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          prompt: currentPrompt,
          url: img.url,
          parameters: currentParams,
          timestamp: new Date().toISOString()
        }))

        // 移除生成中的占位图像，添加真实图像
        setGeneratingImages([])
        setGeneratedImages(prev => [...newImages, ...prev])

        toast.success(`成功生成 ${newImages.length} 张图片！`)
      } else {
        setGeneratingImages([])
        toast.error('图像生成失败，请重试')
      }
    } catch (error) {
      console.error('Image generation error:', error)
      setGeneratingImages([])
      toast.error('图像生成出错，请检查网络连接')
    }
  }

  // 下载图片
  const downloadImage = async (url: string, prompt: string) => {
    try {
      toast.info('开始下载图片...')
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `generated-${prompt.slice(0, 20)}-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(downloadUrl)
      toast.success('图片下载成功！')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('图片下载失败')
    }
  }

  // 复制图片URL
  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('图片链接已复制到剪贴板')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('复制失败')
    }
  }

  // 删除图片
  const deleteImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id))
  }

  // 使用历史提示词
  const applyHistoryPrompt = (historyPrompt: string) => {
    setPrompt(historyPrompt)
    toast.info('已应用历史提示词')
  }

  // 生成中的占位组件
  const GeneratingPlaceholder = ({ generatingImage }: { generatingImage: GeneratingImage }) => (
    <div className="space-y-3">
      <div className="relative group">
        <div className="w-full aspect-square rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center overflow-hidden">
          {/* 模糊到清晰的动画背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 animate-pulse" />

          {/* 中心的生成图标 */}
          <div className="relative z-10 text-center">
            <div className="relative">
              <Sparkles className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
              <div className="absolute inset-0 h-12 w-12 mx-auto">
                <Wand2 className="h-8 w-8 text-purple-500 animate-bounce absolute top-2 left-2" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-4">AI正在创作中...</p>
            <div className="flex items-center justify-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          {/* 边框动画 */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50">
            <div className="absolute inset-[2px] rounded-lg bg-background" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium line-clamp-2">
          {generatingImage.prompt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>生成中...</span>
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>请稍候</span>
          </div>
        </div>
      </div>
    </div>
  )

  // 预设提示词
  const presetPrompts = [
    "可爱小猫咪，阳光窗台",
    "赛博朋克城市，霓虹闪烁",
    "樱花盛开，日式庭院",
    "绚烂星云，深邃太空",
    "水墨山水，云雾缭绕"
  ]

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
            <ImageIcon className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">AI图像生成</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              图像生成
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            使用AI模型生成高质量图像，支持多种风格和参数调节，释放您的创意想象
          </p>
        </div>

        {/* Token 状态提示 */}
        {!hasTokens ? (
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-yellow-500/20">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-300">需要配置 API Token</h3>
                    <p className="text-sm text-yellow-200/80">
                      请先添加您的 SiliconFlow API Token 以开始生成图像
                    </p>
                  </div>
                </div>
                <Link href="/console/tokens">
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    配置 Token
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : !hasAvailableTokens ? (
          <Card className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-300">Token 额度不足</h3>
                    <p className="text-sm text-red-200/80">
                      所有 Token 已达到每日限制，请添加新的 Token 或等待重置
                    </p>
                  </div>
                </div>
                <Link href="/console/tokens">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    管理 Token
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：生成控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 模型选择 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">选择模型</CardTitle>
                  <CardDescription className="text-sm text-gray-400">
                    {selectedModel ? selectedModel.displayName : '请选择图像生成模型'}
                  </CardDescription>
                </div>
                {selectedModel?.recommended && (
                  <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">推荐</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParameters(!showParameters)}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="button-text">参数</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModelSelector(true)}
                  className="flex-1"
                >
                  <span className="button-text">选择模型</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 提示词输入 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base text-white">提示词</CardTitle>
              <CardDescription className="text-gray-400">
                描述你想要生成的图像
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">正向提示词</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要生成的图像，例如：一只可爱的小猫咪..."
                  className="min-h-[100px] mt-2"
                />
              </div>
              
              <div>
                <Label className="text-gray-300">负向提示词（可选）</Label>
                <Textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="描述你不想要的元素，例如：模糊、低质量..."
                  className="min-h-[60px] mt-2"
                />
              </div>

              {/* 预设提示词 */}
              <div>
                <Label className="text-sm text-gray-300">快速选择</Label>
                <div className="grid gap-2 mt-2">
                  {presetPrompts.slice(0, 3).map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(preset)}
                      className="text-left h-auto p-2 text-xs justify-start"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || !selectedModel || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    生成图像
                  </>
                )}
              </Button>

              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* 参数配置 */}
          {showParameters && selectedModel && (
            <ParameterPanel
              model={selectedModel}
              parameters={parameters}
              onParametersChange={setParameters}
              disabled={loading}
            />
          )}
        </div>

        {/* 右侧：生成结果展示 */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-400" />
                    生成结果
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {generatingImages.length > 0
                      ? `正在生成 ${generatingImages.length} 张图片...`
                      : generatedImages.length > 0
                        ? `共生成了 ${generatedImages.length} 张图片`
                        : '生成的图片将在这里显示'
                    }
                  </CardDescription>
                </div>
                {(generatedImages.length > 0 || generatingImages.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGeneratedImages([])
                      setGeneratingImages([])
                      toast.info('已清空所有图片')
                    }}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="button-text">清空</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedImages.length === 0 && generatingImages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>还没有生成图片</p>
                  <p className="text-sm">输入提示词并点击生成按钮开始创作</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* 显示生成中的占位图像 */}
                  {generatingImages.map((generatingImage) => (
                    <GeneratingPlaceholder key={generatingImage.id} generatingImage={generatingImage} />
                  ))}

                  {/* 显示已完成的图像 */}
                  {generatedImages.map((image) => (
                    <div key={image.id} className="space-y-3 animate-in fade-in-50 duration-500">
                      <div className="relative group">
                        <Image
                          src={image.url}
                          alt={`Generated image: ${image.prompt}`}
                          width={512}
                          height={512}
                          className="w-full rounded-lg border aspect-square object-cover transition-all duration-300 hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>

                      {/* 操作按钮移到图片下方 */}
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadImage(image.url, image.prompt)}
                          className="h-8 px-3"
                          title="下载"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyImageUrl(image.url)}
                          className="h-8 px-3"
                          title="复制链接"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteImage(image.id)}
                          className="h-8 px-3"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium line-clamp-2 text-gray-300">
                          {image.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{new Date(image.timestamp).toLocaleString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyHistoryPrompt(image.prompt)}
                            className="h-6 px-2"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            <span className="button-text">重用</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 模型选择器弹窗 */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-400" />
                  选择图像生成模型
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowModelSelector(false)}
                >
                  <span className="button-text">关闭</span>
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <ModelSelector
                selectedModel={selectedModel}
                onModelSelect={(model) => {
                  setSelectedModel(model)
                  setShowModelSelector(false)
                }}
                category="image"
                showRecommendedOnly={false}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
