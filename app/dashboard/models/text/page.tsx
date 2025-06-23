'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModelSelector } from '@/components/models/model-selector'
import { ParameterPanel } from '@/components/models/parameter-panel'
import { 
  FileText,
  Search,
  Copy,
  Settings,
  Loader2,
  Trash2,
  Plus,
  Download,
  BarChart3,
  ArrowUpDown
} from 'lucide-react'
import { useEmbeddingApi, useRerankApi } from '@/lib/hooks/use-api'
import { useModelStore } from '@/lib/stores/model-store'
import { useTokenStore } from '@/lib/stores/token-store'
import { toast } from 'sonner'
import Link from 'next/link'
import { AlertTriangle, CheckCircle } from 'lucide-react'

// 文本处理结果
interface TextProcessingResult {
  id: string
  type: 'embedding' | 'rerank'
  input: string | string[] | { query: string; documents: string[] }
  output: any
  parameters: any
  timestamp: string
}

export default function TextProcessingPage() {
  const [activeTab, setActiveTab] = useState<'embedding' | 'rerank'>('embedding')
  const [singleText, setSingleText] = useState('')
  const [batchTexts, setBatchTexts] = useState('')
  const [query, setQuery] = useState('')
  const [documents, setDocuments] = useState('')
  const [results, setResults] = useState<TextProcessingResult[]>([])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showParameters, setShowParameters] = useState(false)
  const [processingTask, setProcessingTask] = useState<{
    type: 'embedding' | 'rerank'
    input: string | string[] | { query: string; documents: string[] }
    isBatch?: boolean
  } | null>(null)
  
  const { embed, loading: embeddingLoading, error: embeddingError } = useEmbeddingApi()
  const { rerank, loading: rerankLoading, error: rerankError } = useRerankApi()
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
  const hasTokens = tokens.length > 0
  const hasAvailableTokens = tokens.some(token =>
    token.isActive && token.usageToday < token.limitPerDay
  )

  // 确保使用正确的文本处理模型
  useEffect(() => {
    const category = activeTab === 'embedding' ? 'embedding' : 'rerank'

    // 如果没有模型或者当前模型类别不匹配，强制选择对应的默认模型
    if (!selectedModel || selectedModel.category !== category) {
      forceSelectDefaultModel(category)
    }
  }, [selectedModel, activeTab, forceSelectDefaultModel])

  // 当切换选项卡时，强制切换到对应的默认模型
  useEffect(() => {
    const category = activeTab === 'embedding' ? 'embedding' : 'rerank'
    forceSelectDefaultModel(category)
  }, [activeTab, forceSelectDefaultModel])

  const loading = embeddingLoading || rerankLoading
  const error = embeddingError || rerankError

  // 处理文本嵌入
  const handleEmbedding = async (isBatch = false) => {
    if (!selectedModel || loading) return

    // 检查 Token 可用性
    if (!hasTokens) {
      toast.error('请先添加 API Token')
      return
    }

    if (!hasAvailableTokens) {
      toast.error('所有 Token 已达到每日限制，请添加新的 Token 或等待重置')
      return
    }

    const input = isBatch
      ? batchTexts.split('\n').filter(text => text.trim())
      : singleText.trim()

    if (!input || (Array.isArray(input) && input.length === 0)) return

    // 设置处理中状态
    setProcessingTask({ type: 'embedding', input, isBatch })

    const taskDescription = isBatch
      ? `开始批量处理 ${(input as string[]).length} 个文本的嵌入向量`
      : '开始生成文本嵌入向量'
    toast.info(taskDescription)

    try {
      const result = await embed(selectedModel.name, input, parameters)

      if (result.success && result.data?.data) {
        const newResult: TextProcessingResult = {
          id: `${Date.now()}`,
          type: 'embedding',
          input,
          output: result.data.data,
          parameters: { ...parameters },
          timestamp: new Date().toISOString()
        }

        setResults(prev => [newResult, ...prev])
        setProcessingTask(null)

        if (isBatch) {
          setBatchTexts('')
          toast.success(`成功生成 ${(input as string[]).length} 个文本的嵌入向量！`)
        } else {
          setSingleText('')
          toast.success('文本嵌入向量生成完成！')
        }
      } else {
        setProcessingTask(null)
        toast.error('文本嵌入处理失败，请重试')
      }
    } catch (error) {
      console.error('Embedding error:', error)
      setProcessingTask(null)
      toast.error('文本嵌入处理出错，请检查输入内容')
    }
  }

  // 处理重排序
  const handleRerank = async () => {
    if (!query.trim() || !documents.trim() || !selectedModel || loading) return

    // 检查 Token 可用性
    if (!hasTokens) {
      toast.error('请先添加 API Token')
      return
    }

    if (!hasAvailableTokens) {
      toast.error('所有 Token 已达到每日限制，请添加新的 Token 或等待重置')
      return
    }

    const docList = documents.split('\n').filter(doc => doc.trim())
    if (docList.length === 0) return

    // 设置处理中状态
    setProcessingTask({ type: 'rerank', input: { query: query.trim(), documents: docList } })
    toast.info(`开始对 ${docList.length} 个文档进行重排序`)

    try {
      const result = await rerank(selectedModel.name, query, docList, parameters)

      if (result.success && result.data?.results) {
        const newResult: TextProcessingResult = {
          id: `${Date.now()}`,
          type: 'rerank',
          input: { query, documents: docList },
          output: result.data.results,
          parameters: { ...parameters },
          timestamp: new Date().toISOString()
        }

        setResults(prev => [newResult, ...prev])
        setProcessingTask(null)
        setQuery('')
        setDocuments('')
        toast.success(`文档重排序完成！返回 ${result.data.results.length} 个结果`)
      } else {
        setProcessingTask(null)
        toast.error('文档重排序失败，请重试')
      }
    } catch (error) {
      console.error('Rerank error:', error)
      setProcessingTask(null)
      toast.error('文档重排序出错，请检查输入内容')
    }
  }

  // 复制结果
  const copyResult = async (result: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      toast.success('处理结果已复制到剪贴板')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('复制失败')
    }
  }

  // 下载结果
  const downloadResult = (result: TextProcessingResult) => {
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${result.type}-result-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('处理结果已下载为JSON文件')
  }

  // 删除结果
  const deleteResult = (id: string) => {
    setResults(prev => prev.filter(result => result.id !== id))
    toast.info('已删除处理结果')
  }

  // 格式化向量显示
  const formatVector = (vector: number[]) => {
    if (!vector || vector.length === 0) return '[]'
    const preview = vector.slice(0, 5).map(v => v.toFixed(4)).join(', ')
    return `[${preview}...] (${vector.length}维)`
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
            <FileText className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">AI文本处理</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              文本处理
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-6">
            文本嵌入和重排序，支持单个和批量处理，体验最先进的文本理解技术
          </p>
          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <h3 className="font-medium text-blue-300 mb-2">功能说明</h3>
            <div className="text-sm text-blue-400 space-y-1">
              <p><strong className="text-blue-300">文本嵌入</strong>：将文字转换为数字向量，让计算机理解文本含义。用于文本相似度计算、搜索、推荐等场景。</p>
              <p><strong className="text-blue-300">重排序</strong>：根据查询文本对候选文档按相关性重新排序。用于搜索结果优化、文档检索等场景。</p>
            </div>
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：处理控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 模型选择 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">选择模型</CardTitle>
                  <CardDescription className="text-sm text-gray-400">
                    {selectedModel ? selectedModel.displayName : '请选择文本处理模型'}
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

          {/* 功能选择 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base text-white">处理功能</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
                  <TabsTrigger value="embedding" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">文本嵌入</TabsTrigger>
                  <TabsTrigger value="rerank" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">重排序</TabsTrigger>
                </TabsList>

                <TabsContent value="embedding" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-gray-300">单个文本</Label>
                    <Textarea
                      value={singleText}
                      onChange={(e) => setSingleText(e.target.value)}
                      placeholder="输入要生成嵌入向量的文本..."
                      className="min-h-[80px] mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                    <Button
                      onClick={() => handleEmbedding(false)}
                      disabled={!singleText.trim() || !selectedModel || loading}
                      className="w-full mt-2"
                      size="sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          生成嵌入
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <Label className="text-gray-300">批量处理</Label>
                    <Textarea
                      value={batchTexts}
                      onChange={(e) => setBatchTexts(e.target.value)}
                      placeholder="每行一个文本，支持批量处理..."
                      className="min-h-[100px] mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      每行输入一个文本，将批量生成嵌入向量
                    </p>
                    <Button
                      onClick={() => handleEmbedding(true)}
                      disabled={!batchTexts.trim() || !selectedModel || loading}
                      className="w-full mt-2"
                      size="sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          批量处理中...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          批量生成
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="rerank" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-gray-300">查询文本</Label>
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="输入查询文本..."
                      className="min-h-[60px] mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">候选文档</Label>
                    <Textarea
                      value={documents}
                      onChange={(e) => setDocuments(e.target.value)}
                      placeholder="每行一个文档，将根据查询文本进行重排序..."
                      className="min-h-[120px] mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      每行输入一个候选文档
                    </p>
                  </div>

                  <Button
                    onClick={handleRerank}
                    disabled={!query.trim() || !documents.trim() || !selectedModel || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        重排序中...
                      </>
                    ) : (
                      <>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        开始重排序
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* 处理中状态显示 */}
          {processingTask && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    <span className="text-sm font-medium text-green-300">
                      {processingTask.type === 'embedding'
                        ? (processingTask.isBatch ? '批量生成嵌入向量中...' : '生成嵌入向量中...')
                        : '文档重排序中...'
                      }
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-green-400">
                    {processingTask.type === 'embedding' ? (
                      processingTask.isBatch ? (
                        `正在处理 ${(processingTask.input as string[]).length} 个文本`
                      ) : (
                        '正在将文本转换为向量表示'
                      )
                    ) : (
                      `正在对 ${((processingTask.input as any).documents as string[]).length} 个文档进行智能排序`
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-green-400 ml-2">AI正在分析文本语义</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 参数配置 */}
          {showParameters && selectedModel && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base text-white">处理参数</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === 'embedding' && (
                  <div>
                    <Label className="text-gray-300">编码格式</Label>
                    <Select
                      value={parameters.encoding_format || 'float'}
                      onValueChange={(value) => updateParameter('encoding_format', value)}
                    >
                      <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="float" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">Float</SelectItem>
                        <SelectItem value="base64" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">Base64</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeTab === 'rerank' && (
                  <>
                    <div>
                      <Label className="text-gray-300">返回数量</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={parameters.top_n || 10}
                        onChange={(e) => updateParameter('top_n', parseInt(e.target.value))}
                        className="mt-2 bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="return_documents"
                        checked={parameters.return_documents !== false}
                        onChange={(e) => updateParameter('return_documents', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <Label htmlFor="return_documents" className="text-sm text-gray-300">
                        返回文档内容
                      </Label>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：处理结果展示 */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    处理结果
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {results.length > 0
                      ? `共处理了 ${results.length} 个任务`
                      : '处理结果将在这里显示'
                    }
                  </CardDescription>
                </div>
                {results.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResults([])
                      toast.info('已清空所有处理结果')
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
              {results.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>还没有处理结果</p>
                  <p className="text-sm">输入文本并选择处理功能开始</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="border border-gray-700 bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {result.type === 'embedding' ? (
                            <BarChart3 className="h-4 w-4 text-blue-400" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-green-400" />
                          )}
                          <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                            {result.type === 'embedding' ? '文本嵌入' : '重排序'}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyResult(result.output)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadResult(result)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteResult(result.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-300">输入</Label>
                          <div className="bg-gray-700/50 text-gray-300 p-2 rounded mt-1 text-sm">
                            {result.type === 'embedding' ? (
                              Array.isArray(result.input) ? (
                                <div>
                                  <p className="font-medium mb-1">批量文本 ({result.input.length}个):</p>
                                  {result.input.slice(0, 3).map((text, index) => (
                                    <p key={index} className="truncate">• {text}</p>
                                  ))}
                                  {result.input.length > 3 && (
                                    <p className="text-muted-foreground">... 还有 {result.input.length - 3} 个</p>
                                  )}
                                </div>
                              ) : (
                                <p>{typeof result.input === 'string' ? result.input : JSON.stringify(result.input)}</p>
                              )
                            ) : (
                              <div>
                                <p className="font-medium">查询: {(result.input as any).query}</p>
                                <p className="font-medium mt-1">文档数量: {(result.input as any).documents.length}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-300">输出</Label>
                          <div className="bg-gray-700/50 text-gray-300 p-2 rounded mt-1 text-sm max-h-40 overflow-y-auto">
                            {result.type === 'embedding' ? (
                              <div>
                                {result.output.map((item: any, index: number) => (
                                  <div key={index} className="mb-2 last:mb-0">
                                    <p className="font-medium">向量 {index + 1}:</p>
                                    <p className="font-mono text-xs">
                                      {formatVector(item.embedding)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                {result.output.map((item: any, index: number) => (
                                  <div key={index} className="mb-2 last:mb-0 flex justify-between">
                                    <span className="truncate flex-1">
                                      {typeof item.document === 'string'
                                        ? item.document
                                        : typeof item.text === 'string'
                                        ? item.text
                                        : typeof item.document === 'object' && item.document?.text
                                        ? item.document.text
                                        : JSON.stringify(item.document || item.text || item)
                                      }
                                    </span>
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {item.relevance_score?.toFixed(4) || item.score?.toFixed(4) || '0.0000'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
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
                  <FileText className="h-5 w-5 text-blue-400" />
                  选择文本处理模型
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
                category={activeTab === 'embedding' ? 'embedding' : 'rerank'}
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
