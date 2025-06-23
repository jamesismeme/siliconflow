'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ModelSelector } from '@/components/models/model-selector'
import { ParameterPanel } from '@/components/models/parameter-panel'
import {
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  MessageSquare,
  Settings,
  Loader2,
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react'
import { useStreamChatApi } from '@/lib/hooks/use-api'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useModelStore } from '@/lib/stores/model-store'
import { useTokenStore } from '@/lib/stores/token-store'
import Link from 'next/link'

// 消息接口
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showParameters, setShowParameters] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { streamChat, loading, error } = useStreamChatApi()
  const {
    selectedModel,
    setSelectedModel,
    parameters,
    setParameters,
    forceSelectDefaultModel
  } = useModelStore()

  // Token 状态检查
  const tokens = useTokenStore(state => state.tokens)
  const hasTokens = tokens.length > 0
  const hasAvailableTokens = tokens.some(token =>
    token.isActive && token.usageToday < token.limitPerDay
  )

  // 确保使用正确的对话模型
  useEffect(() => {
    // 如果没有模型或者当前模型不是对话类型，强制选择默认对话模型
    if (!selectedModel || selectedModel.category !== 'chat') {
      forceSelectDefaultModel('chat')
    }
  }, [selectedModel, forceSelectDefaultModel])

  // 自动滚动到底部 - 使用 useCallback 优化
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [])



  useEffect(() => {
    // 只在有消息时才滚动到底部，避免页面加载时的不必要滚动
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || !selectedModel || loading) return

    // 检查 Token 可用性
    if (!hasTokens) {
      toast.error('请先添加 API Token')
      return
    }

    if (!hasAvailableTokens) {
      toast.error('所有 Token 已达到每日限制，请添加新的 Token 或等待重置')
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // 创建助手消息用于流式输出
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, assistantMessage])
    setStreamingMessageId(assistantMessageId)

    try {
      // 构建消息历史
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // 调用流式API
      await streamChat(
        selectedModel.name,
        messageHistory,
        parameters,
        // onChunk: 处理流式数据块 - 优化性能
        (chunk: string) => {
          setMessages(prev => {
            const newMessages = [...prev]
            const messageIndex = newMessages.findIndex(msg => msg.id === assistantMessageId)
            if (messageIndex !== -1) {
              newMessages[messageIndex] = {
                ...newMessages[messageIndex],
                content: newMessages[messageIndex].content + chunk
              }
            }
            return newMessages
          })
        },
        // onComplete: 流式输出完成
        () => {
          setStreamingMessageId(null)
        }
      )
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: '抱歉，发生了网络错误，请检查网络连接后重试。' }
          : msg
      ))
      setStreamingMessageId(null)
    }
  }

  // 清空对话
  const clearMessages = () => {
    setMessages([])
  }

  // 复制消息 - 使用 useCallback 优化
  const copyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('复制失败')
    }
  }, [])

  // 重新生成消息
  const regenerateMessage = async (messageIndex: number) => {
    if (!selectedModel || loading) return

    // 找到要重新生成的消息之前的所有消息
    const messagesToKeep = messages.slice(0, messageIndex)
    const lastUserMessage = messagesToKeep.filter(m => m.role === 'user').pop()

    if (!lastUserMessage) return

    // 移除当前消息及之后的所有消息
    setMessages(messagesToKeep)

    // 创建新的助手消息
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, assistantMessage])
    setStreamingMessageId(assistantMessageId)

    try {
      // 构建消息历史（不包括要重新生成的消息）
      const messageHistory = messagesToKeep.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // 调用流式API
      await streamChat(
        selectedModel.name,
        messageHistory,
        parameters,
        (chunk: string) => {
          setMessages(prev => {
            const newMessages = [...prev]
            const messageIndex = newMessages.findIndex(msg => msg.id === assistantMessageId)
            if (messageIndex !== -1) {
              newMessages[messageIndex] = {
                ...newMessages[messageIndex],
                content: newMessages[messageIndex].content + chunk
              }
            }
            return newMessages
          })
        },
        () => {
          setStreamingMessageId(null)
        }
      )
    } catch (error) {
      console.error('Regenerate error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: '抱歉，重新生成失败，请稍后重试。' }
          : msg
      ))
      setStreamingMessageId(null)
    }
  }

  // 下载对话为Markdown
  const downloadAsMarkdown = () => {
    const markdown = messages.map(msg => {
      const role = msg.role === 'user' ? '**用户**' : '**AI助手**'
      const timestamp = new Date(msg.timestamp).toLocaleString()
      return `${role} (${timestamp}):\n\n${msg.content}\n\n---\n`
    }).join('\n')

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `对话记录_${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('对话记录已下载')
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 优化 ReactMarkdown 组件配置 - 使用 useMemo 缓存
  const markdownComponents = useMemo(() => ({
    h1: ({children}: any) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
    h2: ({children}: any) => <h2 className="text-base font-bold mb-2">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
    p: ({children}: any) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({children}: any) => <ul className="list-disc list-inside mb-2">{children}</ul>,
    ol: ({children}: any) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
    li: ({children}: any) => <li className="mb-1">{children}</li>,
    code: ({children, ...props}: any) => {
      const isInline = !props.className
      return isInline ? (
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
      ) : (
        <code className="block bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto">{children}</code>
      )
    },
    pre: ({children}: any) => <pre className="bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto mb-2">{children}</pre>,
    blockquote: ({children}: any) => <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-2">{children}</blockquote>,
    strong: ({children}: any) => <strong className="font-bold">{children}</strong>,
    em: ({children}: any) => <em className="italic">{children}</em>,
  }), [])

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {/* 简化背景装饰 - 提高性能 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10" />

      <div className="relative z-10 h-full flex flex-col p-6 max-w-7xl mx-auto overflow-hidden">
        {/* 页面标题 - 紧凑版 */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">智能对话生成</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                对话模型
              </span>
            </h1>
          </div>
        </div>

        <div className="flex-1 grid gap-6 lg:grid-cols-4 min-h-0 overflow-hidden">
          {/* 主聊天区域 */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-0 overflow-hidden">
            {/* 模型选择栏 */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm flex-shrink-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MessageSquare className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {selectedModel ? selectedModel.displayName : '请选择模型'}
                      </p>
                      {selectedModel && (
                        <p className="text-sm text-gray-400">
                          {selectedModel.description}
                        </p>
                      )}
                    </div>
                    {selectedModel?.recommended && (
                      <Badge className="text-xs bg-blue-600 hover:bg-blue-700">推荐</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowParameters(!showParameters)}
                      className="h-9"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="button-text">参数</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModelSelector(!showModelSelector)}
                      className="h-9"
                    >
                      <span className="button-text">选择模型</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token 状态提示 */}
            {!hasTokens && (
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
                          请先添加您的 SiliconFlow API Token 以开始对话
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
            )}

            {!hasAvailableTokens && hasTokens && (
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
            )}

            {/* 聊天消息区域 */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm flex-1 flex flex-col min-h-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    对话
                  </CardTitle>
                  <div className="flex gap-2">
                    {messages.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAsMarkdown}
                        className="h-9"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="button-text">下载</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearMessages}
                      disabled={messages.length === 0}
                      className="h-9"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="button-text">清空</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4">
                <div
                  ref={messagesContainerRef}
                  className="flex-1 space-y-4 overflow-y-auto bg-gray-950/50 rounded-lg p-4"
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-full bg-gray-800/50 w-fit mx-auto mb-4">
                        <MessageSquare className="h-12 w-12 text-gray-600" />
                      </div>
                      <p className="text-gray-300 text-lg mb-2">开始您的第一次对话</p>
                      <p className="text-gray-500 text-sm">选择模型后输入消息即可开始智能对话</p>
                    </div>
                  ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                          <div className="flex-shrink-0">
                            {message.role === 'user' ? (
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-blue-400" />
                              </div>
                            )}
                          </div>
                          <div
                            className={`rounded-lg p-4 ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100 border border-gray-700'
                            }`}
                          >
                          <div className="text-sm">
                            {message.role === 'assistant' ? (
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={markdownComponents}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            )}
                            {streamingMessageId === message.id && (
                              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                title="复制"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {message.role === 'assistant' && message.content && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => regenerateMessage(index)}
                                  disabled={loading || streamingMessageId === message.id}
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                  title="重新生成"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                    {loading && !streamingMessageId && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                            <span className="text-sm text-gray-300">AI正在思考...</span>
                          </div>
                        </div>
                      </div>
                    )}
                <div ref={messagesEndRef} />
              </div>

                {/* 输入区域 */}
                <div className="flex-shrink-0 border-t border-gray-700 pt-4">
                  <div className="flex gap-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        selectedModel
                          ? "输入您的消息... (Shift+Enter换行，Enter发送)"
                          : "请先选择一个模型"
                      }
                      disabled={!selectedModel || loading}
                      className="min-h-[60px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || !selectedModel || loading}
                      size="lg"
                      className="h-auto px-4"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {error}
                    </p>
                  )}
                </div>
            </CardContent>
          </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-4">
            {/* 参数配置 */}
            {showParameters && (
              <ParameterPanel
                model={selectedModel}
                parameters={parameters}
                onParametersChange={setParameters}
                disabled={loading}
              />
            )}
          </div>
        </div>

        {/* 模型选择器弹窗 */}
        {showModelSelector && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    选择对话模型
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
                    setMessages([]) // 清空对话历史
                    setShowModelSelector(false)
                  }}
                  category="chat"
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
