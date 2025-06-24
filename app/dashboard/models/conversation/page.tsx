'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useTokenStore } from '@/lib/stores/token-store'
import { useStreamChatApi } from '@/lib/hooks/use-api'
import { ModelConfig, getModelsByCategory } from '@/lib/constants/models'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  MessageCircle,
  Send,
  Trash2,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  Users,
  Loader2,
  Copy
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  modelId?: string
}

interface ConversationState {
  selectedModels: ModelConfig[]
  conversations: Record<string, Message[]>
  isLoading: Record<string, boolean>
}

// 消息渲染组件，支持代码高亮
const MessageContent = ({ content, isStreaming }: { content: string; isStreaming?: boolean }) => {
  return (
    <div className="text-sm text-gray-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const isInline = !className

            return !isInline && language ? (
              <SyntaxHighlighter
                style={oneDark as any}
                language={language}
                PreTag="div"
                className="rounded-md my-2"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            )
          },
          p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-200">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic mb-2 text-gray-300">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
      {/* 流式输入光标效果 */}
      {isStreaming && content && (
        <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />
      )}
    </div>
  )
}

export default function ConversationPage() {
  const [input, setInput] = useState('')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [conversationState, setConversationState] = useState<ConversationState>({
    selectedModels: [],
    conversations: {},
    isLoading: {}
  })
  
  const tokens = useTokenStore(state => state.tokens)
  const loadTokens = useTokenStore(state => state.loadTokens)
  const { streamChat } = useStreamChatApi()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取对话模型
  const chatModels = getModelsByCategory('chat')
  const recommendedModels = chatModels.filter(model => model.recommended)

  // Token 状态检查
  const hasTokens = tokens.length > 0
  const hasAvailableTokens = tokens.some(token =>
    token.isActive && token.usageToday < token.limitPerDay
  )

  // 确保 Token 数据已加载
  useEffect(() => {
    loadTokens()
  }, [])

  // 初始化推荐模型
  useEffect(() => {
    if (recommendedModels.length > 0 && conversationState.selectedModels.length === 0) {
      setConversationState(prev => ({
        ...prev,
        selectedModels: recommendedModels
      }))
    }
  }, [recommendedModels])

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversationState.conversations])

  // 模型选择处理
  const handleModelToggle = (model: ModelConfig, checked: boolean) => {
    setConversationState(prev => ({
      ...prev,
      selectedModels: checked 
        ? [...prev.selectedModels, model]
        : prev.selectedModels.filter(m => m.name !== model.name)
    }))
  }

  // 全选/全不选
  const handleSelectAll = () => {
    setConversationState(prev => ({
      ...prev,
      selectedModels: chatModels
    }))
  }

  const handleSelectNone = () => {
    setConversationState(prev => ({
      ...prev,
      selectedModels: []
    }))
  }

  const handleSelectRecommended = () => {
    setConversationState(prev => ({
      ...prev,
      selectedModels: recommendedModels
    }))
  }

  // 发送消息给所有选中的模型（流式响应）
  const handleSendMessage = async () => {
    if (!input.trim() || conversationState.selectedModels.length === 0) {
      toast.error('请输入消息并选择至少一个模型')
      return
    }

    if (!hasTokens) {
      toast.error('请先添加 API Token')
      return
    }

    if (!hasAvailableTokens) {
      toast.error('所有 Token 已达到每分钟限制，请添加新的 Token 或等待重置')
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    // 为每个选中的模型添加用户消息、AI占位消息和设置加载状态
    const assistantMessageIds: Record<string, string> = {}

    setConversationState(prev => {
      const newConversations = { ...prev.conversations }
      const newIsLoading = { ...prev.isLoading }

      prev.selectedModels.forEach(model => {
        if (!newConversations[model.name]) {
          newConversations[model.name] = []
        }

        // 添加用户消息
        newConversations[model.name] = [...newConversations[model.name], userMessage]

        // 创建AI占位消息
        const assistantMessageId = `assistant-${model.name}-${Date.now()}`
        assistantMessageIds[model.name] = assistantMessageId

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          modelId: model.name
        }

        newConversations[model.name] = [...newConversations[model.name], assistantMessage]
        newIsLoading[model.name] = true
      })

      return {
        ...prev,
        conversations: newConversations,
        isLoading: newIsLoading
      }
    })

    setInput('')

    // 为每个模型启动独立的流式对话
    conversationState.selectedModels.forEach(async (model) => {
      try {
        console.log(`[多轮对话] 开始流式对话 - 模型: ${model.name}`)

        // 获取当前模型的消息历史（不包括刚添加的AI占位消息）
        const currentMessages = conversationState.conversations[model.name] || []
        const userMessages = currentMessages.filter(msg => msg.role === 'user')
        const messageHistory = [...userMessages, userMessage].map(msg => ({ role: msg.role, content: msg.content }))

        const assistantMessageId = assistantMessageIds[model.name]

        await streamChat(
          model.name,
          messageHistory,
          {}, // parameters
          // onChunk: 处理流式数据块
          (chunk: string) => {
            console.log(`[多轮对话] 模型 ${model.name} 收到数据块:`, chunk)
            setConversationState(prev => {
              const newConversations = { ...prev.conversations }
              if (newConversations[model.name]) {
                const messages = [...newConversations[model.name]]
                const messageIndex = messages.findIndex(msg => msg.id === assistantMessageId)
                if (messageIndex !== -1) {
                  const updatedMessage = {
                    ...messages[messageIndex],
                    content: messages[messageIndex].content + chunk
                  }
                  messages[messageIndex] = updatedMessage
                  newConversations[model.name] = messages
                  console.log(`[多轮对话] 模型 ${model.name} 更新后内容长度:`, updatedMessage.content.length)
                } else {
                  console.error(`[多轮对话] 模型 ${model.name} 找不到消息ID:`, assistantMessageId)
                }
              } else {
                console.error(`[多轮对话] 模型 ${model.name} 对话记录不存在`)
              }
              return {
                ...prev,
                conversations: newConversations
              }
            })
          },
          // onComplete: 流式输出完成
          () => {
            console.log(`[多轮对话] 模型 ${model.name} 流式输出完成`)
            setConversationState(prev => ({
              ...prev,
              isLoading: {
                ...prev.isLoading,
                [model.name]: false
              }
            }))
          }
        )
      } catch (error) {
        console.error(`[多轮对话] 模型 ${model.name} 响应失败:`, error)
        setConversationState(prev => ({
          ...prev,
          conversations: {
            ...prev.conversations,
            [model.name]: prev.conversations[model.name]?.map(msg =>
              msg.id === assistantMessageIds[model.name]
                ? { ...msg, content: `抱歉，${model.displayName} 响应失败: ${error instanceof Error ? error.message : '未知错误'}` }
                : msg
            ) || []
          },
          isLoading: {
            ...prev.isLoading,
            [model.name]: false
          }
        }))
        toast.error(`模型 ${model.displayName} 响应失败`)
      }
    })
  }

  // 清空单个模型的对话
  const clearModelConversation = (modelName: string) => {
    setConversationState(prev => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [modelName]: []
      }
    }))
    toast.info('已清空对话记录')
  }

  // 清空所有对话
  const clearAllConversations = () => {
    setConversationState(prev => ({
      ...prev,
      conversations: {},
      isLoading: {}
    }))
    toast.info('已清空所有对话记录')
  }

  // 复制消息
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 导出单个模型对话
  const exportModelConversation = (modelName: string) => {
    const messages = conversationState.conversations[modelName] || []
    if (messages.length === 0) {
      toast.error('没有对话记录可导出')
      return
    }

    const content = messages.map(msg => 
      `**${msg.role === 'user' ? '用户' : 'AI'}**: ${msg.content}`
    ).join('\n\n')

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `对话记录_${modelName}_${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('对话记录已导出')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* 页面标题 */}
        <div>
          <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">多轮对话</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              多轮对话
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            与多个AI模型同时对话，比较不同模型的回答，体验多样化的AI交互
          </p>
        </div>

        {/* Token 状态检查 */}
        {!hasTokens && (
          <Card className="bg-red-900/20 border-red-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <div>
                  <h3 className="font-semibold text-red-300">请先配置 API Token</h3>
                  <p className="text-sm text-red-200/80">
                    需要添加 API Token 才能使用对话功能
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="ml-auto">
                  <a href="/console/tokens">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="button-text">配置 Token</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!hasAvailableTokens && hasTokens && (
          <Card className="bg-red-900/20 border-red-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <div>
                  <h3 className="font-semibold text-red-300">Token 额度不足</h3>
                  <p className="text-sm text-red-200/80">
                    所有 Token 已达到每分钟限制，请添加新的 Token 或等待重置
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="ml-auto">
                  <a href="/console/tokens">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="button-text">管理 Token</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 模型选择面板 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-400" />
                  模型选择
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  已选择 {conversationState.selectedModels.length} / {chatModels.length} 个模型
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelSelector(!showModelSelector)}
              >
                {showModelSelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="button-text ml-2">{showModelSelector ? '收起' : '展开'}</span>
              </Button>
            </div>
          </CardHeader>

          {showModelSelector && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* 快捷操作 */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    全选 ({chatModels.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectNone}>
                    全不选
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectRecommended}>
                    仅推荐 ({recommendedModels.length})
                  </Button>
                </div>

                {/* 模型列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chatModels.map((model) => {
                    const isSelected = conversationState.selectedModels.some(m => m.name === model.name)
                    return (
                      <div
                        key={model.name}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-900/20 border-blue-700/50'
                            : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => handleModelToggle(model, !isSelected)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-400 hover:border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {model.displayName}
                              </span>
                              {model.recommended && (
                                <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                                  推荐
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">
                              {model.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 对话区域 */}
        {conversationState.selectedModels.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {conversationState.selectedModels.map((model) => {
              const messages = conversationState.conversations[model.name] || []
              const isLoading = conversationState.isLoading[model.name] || false

              return (
                <Card key={model.name} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-blue-400" />
                          {model.displayName}
                          {model.recommended && (
                            <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                              推荐
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                          {messages.length > 0 ? `${Math.floor(messages.length / 2)} 轮对话` : '暂无对话'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportModelConversation(model.name)}
                          disabled={messages.length === 0}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearModelConversation(model.name)}
                          disabled={messages.length === 0}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">还没有对话记录</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-900/20 border border-blue-700/50 ml-4'
                                : 'bg-gray-800/50 border border-gray-700/50 mr-4'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-300">
                                    {message.role === 'user' ? '用户' : 'AI'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <MessageContent
                                  content={message.content}
                                  isStreaming={message.role === 'assistant' && isLoading && !!message.content}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="h-6 w-6 p-0 flex-shrink-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}

                      {isLoading && messages.filter(m => m.role === 'assistant').every(m => !m.content) && (
                        <div className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg mr-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                            <span className="text-sm text-gray-300">{model.displayName} 正在思考...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* 输入区域 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">发送消息</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllConversations}
                    disabled={Object.keys(conversationState.conversations).length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="button-text">清空所有</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请输入您的问题..."
                  className="min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {conversationState.selectedModels.length > 0
                      ? `将发送给 ${conversationState.selectedModels.length} 个模型`
                      : '请先选择模型'
                    }
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !input.trim() ||
                      conversationState.selectedModels.length === 0 ||
                      !hasTokens ||
                      !hasAvailableTokens ||
                      Object.values(conversationState.isLoading).some(loading => loading)
                    }
                    className="min-w-[100px]"
                  >
                    {Object.values(conversationState.isLoading).some(loading => loading) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        发送中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        发送消息
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}