'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Copy,
  Download,
  Eye,
  EyeOff,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  FileText,
  Volume2
} from 'lucide-react'

// 结果数据接口
interface ApiResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    model: string
    type: string
    responseTime: number
    timestamp: string
  }
}

interface ResultDisplayProps {
  result: ApiResult | null
  loading: boolean
  modelType: 'chat' | 'image' | 'embedding' | 'rerank' | 'audio' | 'code'
}

export function ResultDisplay({ result, loading, modelType }: ResultDisplayProps) {
  const [showRawData, setShowRawData] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // 复制到剪贴板
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // 下载结果
  const downloadResult = () => {
    if (!result) return

    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `result-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 格式化响应时间
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // 渲染对话结果
  const renderChatResult = (data: any) => {
    const choice = data.choices?.[0]
    if (!choice) return null

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">生成内容</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(choice.message.content, 'content')}
            >
              {copiedField === 'content' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copiedField === 'content' ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea
            value={choice.message.content}
            readOnly
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        
        {data.usage && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">输入Token:</span>
              <p className="text-muted-foreground">{data.usage.prompt_tokens}</p>
            </div>
            <div>
              <span className="font-medium">输出Token:</span>
              <p className="text-muted-foreground">{data.usage.completion_tokens}</p>
            </div>
            <div>
              <span className="font-medium">总Token:</span>
              <p className="text-muted-foreground">{data.usage.total_tokens}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 渲染图像结果
  const renderImageResult = (data: any) => {
    const images = data.data || []
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">生成的图像</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {images.map((image: any, index: number) => (
            <div key={index} className="space-y-2">
              {image.url ? (
                <div className="relative">
                  <Image
                    src={image.url}
                    alt={`Generated image ${index + 1}`}
                    width={512}
                    height={512}
                    className="w-full rounded-lg border"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(image.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(image.url, `image-${index}`)}
                    >
                      {copiedField === `image-${index}` ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 渲染嵌入结果
  const renderEmbeddingResult = (data: any) => {
    const embeddings = data.data || []
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">向量嵌入</h4>
        {embeddings.map((item: any, index: number) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">向量 {index + 1}</span>
              <Badge variant="outline">
                {item.embedding?.length || 0} 维
              </Badge>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs font-mono text-muted-foreground">
                [{item.embedding?.slice(0, 5).map((v: number) => v.toFixed(4)).join(', ')}...]
              </p>
            </div>
          </div>
        ))}
        
        {data.usage && (
          <div className="text-sm">
            <span className="font-medium">使用Token:</span>
            <span className="text-muted-foreground ml-2">{data.usage.total_tokens}</span>
          </div>
        )}
      </div>
    )
  }

  // 渲染语音结果
  const renderAudioResult = (data: any) => {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">转录文本</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(data.text, 'audio-text')}
            >
              {copiedField === 'audio-text' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copiedField === 'audio-text' ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea
            value={data.text || ''}
            readOnly
            className="min-h-[100px]"
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            处理中...
          </CardTitle>
          <CardDescription>
            正在调用模型，请稍候
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">模型正在处理您的请求...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            结果展示
          </CardTitle>
          <CardDescription>
            调用模型后结果将在这里显示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            等待模型调用结果...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              调用结果
            </CardTitle>
            <CardDescription>
              {result.metadata && (
                <div className="flex items-center gap-4 mt-1">
                  <span>模型: {result.metadata.model}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatResponseTime(result.metadata.responseTime)}
                  </span>
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showRawData ? '隐藏' : '查看'} 原始数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadResult}
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.success ? (
          <div>
            {/* 根据模型类型渲染不同的结果 */}
            {modelType === 'chat' && renderChatResult(result.data)}
            {modelType === 'image' && renderImageResult(result.data)}
            {modelType === 'embedding' && renderEmbeddingResult(result.data)}
            {modelType === 'audio' && renderAudioResult(result.data)}
            {(modelType === 'code' || modelType === 'rerank') && renderChatResult(result.data)}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">调用失败</h4>
            <p className="text-red-600 text-sm">{result.error}</p>
          </div>
        )}

        {/* 原始数据展示 */}
        {showRawData && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">原始响应数据</h4>
            <Textarea
              value={JSON.stringify(result, null, 2)}
              readOnly
              className="min-h-[200px] font-mono text-xs"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
