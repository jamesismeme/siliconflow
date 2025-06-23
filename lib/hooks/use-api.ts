import { useState, useCallback } from 'react'
import { useModelStore } from '@/lib/stores/model-store'

// API调用参数接口
interface InvokeParams {
  model: string
  type: 'chat' | 'image' | 'embedding' | 'rerank' | 'audio-transcription' | 'audio-speech'
  parameters: any
}

// API响应接口
interface ApiResponse {
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

// Hook返回值接口
interface UseApiReturn {
  invoke: (params: InvokeParams) => Promise<ApiResponse>
  loading: boolean
  error: string | null
  clearError: () => void
}

export function useApi(): UseApiReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { setIsLoading, setResult, addToHistory } = useModelStore()

  const invoke = useCallback(async (params: InvokeParams): Promise<ApiResponse> => {
    setLoading(true)
    setIsLoading(true)
    setError(null)

    try {
      console.log('[useApi] Invoking:', params)

      let requestOptions: RequestInit

      // 检查是否包含文件上传
      if (params.parameters.file && params.parameters.file instanceof File) {
        // 文件上传请求
        const formData = new FormData()
        formData.append('model', params.model)
        formData.append('type', params.type)
        formData.append('file', params.parameters.file)

        // 添加其他参数
        Object.keys(params.parameters).forEach(key => {
          if (key !== 'file' && params.parameters[key] !== undefined) {
            formData.append(key, params.parameters[key])
          }
        })

        requestOptions = {
          method: 'POST',
          body: formData
        }
      } else {
        // 普通JSON请求
        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params)
        }
      }

      const response = await fetch('/api/invoke', requestOptions)

      const result: ApiResponse = await response.json()

      // 更新Store状态
      setResult(result)

      // 添加到历史记录
      if (result.success) {
        addToHistory({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          model: params.model,
          type: params.type,
          parameters: params.parameters,
          result,
          timestamp: new Date().toISOString()
        })
      }

      if (!result.success) {
        setError(result.error || 'API调用失败')
      }

      return result
    } catch (err: any) {
      const errorMessage = err.message || '网络请求失败'
      setError(errorMessage)
      
      const errorResult: ApiResponse = {
        success: false,
        error: errorMessage
      }
      
      setResult(errorResult)
      return errorResult
    } finally {
      setLoading(false)
      setIsLoading(false)
    }
  }, [setIsLoading, setResult, addToHistory])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    invoke,
    loading,
    error,
    clearError
  }
}

// 专门用于对话模型的Hook
export function useChatApi() {
  const api = useApi()

  const chat = useCallback(async (
    model: string,
    messages: Array<{ role: string; content: string }>,
    parameters: any = {}
  ) => {
    return api.invoke({
      model,
      type: 'chat',
      parameters: {
        messages,
        ...parameters
      }
    })
  }, [api])

  return {
    ...api,
    chat
  }
}

// 流式对话Hook
export function useStreamChatApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamChat = useCallback(async (
    model: string,
    messages: Array<{ role: string; content: string }>,
    parameters: any = {},
    onChunk: (chunk: string) => void,
    onComplete: () => void
  ) => {
    setLoading(true)
    setError(null)

    try {
      console.log('[StreamChat] Starting stream for model:', model)
      const response = await fetch('/api/invoke/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          type: 'chat',
          parameters: {
            messages,
            stream: true,
            ...parameters
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[StreamChat] HTTP error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onComplete()
              return
            }

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta
              // 支持思考模式：优先使用content，如果没有则使用reasoning_content
              const content = delta?.content || delta?.reasoning_content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // 忽略解析错误
              console.log('Parse error:', e, 'Data:', data)
            }
          }
        }
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      onComplete()
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    streamChat,
    loading,
    error,
    clearError
  }
}

// 专门用于图像生成的Hook
export function useImageApi() {
  const api = useApi()

  const generateImage = useCallback(async (
    model: string,
    prompt: string,
    parameters: any = {}
  ) => {
    return api.invoke({
      model,
      type: 'image',
      parameters: {
        prompt,
        ...parameters
      }
    })
  }, [api])

  return {
    ...api,
    generateImage
  }
}

// 专门用于文本嵌入的Hook
export function useEmbeddingApi() {
  const api = useApi()

  const embed = useCallback(async (
    model: string,
    input: string | string[],
    parameters: any = {}
  ) => {
    return api.invoke({
      model,
      type: 'embedding',
      parameters: {
        input,
        ...parameters
      }
    })
  }, [api])

  return {
    ...api,
    embed
  }
}

// 专门用于重排序的Hook
export function useRerankApi() {
  const api = useApi()

  const rerank = useCallback(async (
    model: string,
    query: string,
    documents: string[],
    parameters: any = {}
  ) => {
    return api.invoke({
      model,
      type: 'rerank',
      parameters: {
        query,
        documents,
        ...parameters
      }
    })
  }, [api])

  return {
    ...api,
    rerank
  }
}

// 专门用于语音处理的Hook
export function useAudioApi() {
  const api = useApi()

  const transcribe = useCallback(async (
    model: string,
    file: File,
    parameters: any = {}
  ) => {
    // 直接传递文件对象，让后端API处理FormData
    return api.invoke({
      model,
      type: 'audio-transcription',
      parameters: {
        file,
        ...parameters
      }
    })
  }, [api])

  const synthesize = useCallback(async (
    model: string,
    text: string,
    parameters: any = {}
  ) => {
    return api.invoke({
      model,
      type: 'audio-speech',
      parameters: {
        input: text,
        ...parameters
      }
    })
  }, [api])

  return {
    ...api,
    transcribe,
    synthesize
  }
}
