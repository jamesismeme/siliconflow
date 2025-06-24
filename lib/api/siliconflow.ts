import axios, { AxiosInstance, AxiosResponse } from 'axios'

// SiliconFlow API 配置
const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'

// API 响应类型定义
export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ImageGenerationResponse {
  created: number
  data: Array<{
    url: string
    b64_json?: string
  }>
}

export interface EmbeddingResponse {
  object: string
  data: Array<{
    object: string
    embedding: number[]
    index: number
  }>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export interface AudioTranscriptionResponse {
  text: string
}

// SiliconFlow API 客户端类
export class SiliconFlowClient {
  private client: AxiosInstance
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.client = axios.create({
      baseURL: SILICONFLOW_BASE_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30秒超时
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[SiliconFlow] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[SiliconFlow] Request error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[SiliconFlow] Response: ${response.status}`)
        return response
      },
      (error) => {
        console.error('[SiliconFlow] Response error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // 对话模型调用
  async chatCompletion(params: {
    model: string
    messages: Array<{ role: string; content: string }>
    temperature?: number
    max_tokens?: number
    top_p?: number
    stream?: boolean
  }): Promise<ChatCompletionResponse> {
    const response: AxiosResponse<ChatCompletionResponse> = await this.client.post('/chat/completions', {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 1024,
      top_p: params.top_p || 0.9,
      stream: params.stream || false,
    })
    return response.data
  }

  // 图像生成
  async imageGeneration(params: {
    model: string
    prompt: string
    n?: number
    size?: string
    response_format?: string
  }): Promise<ImageGenerationResponse> {
    const response: AxiosResponse<ImageGenerationResponse> = await this.client.post('/images/generations', {
      model: params.model,
      prompt: params.prompt,
      n: params.n || 1,
      size: params.size || '1024x1024',
      response_format: params.response_format || 'url',
    })
    return response.data
  }

  // 文本嵌入
  async embeddings(params: {
    model: string
    input: string | string[]
    encoding_format?: string
  }): Promise<EmbeddingResponse> {
    const response: AxiosResponse<EmbeddingResponse> = await this.client.post('/embeddings', {
      model: params.model,
      input: params.input,
      encoding_format: params.encoding_format || 'float',
    })
    return response.data
  }

  // 重排序
  async rerank(params: {
    model: string
    query: string
    documents: string[]
    top_n?: number
    return_documents?: boolean
  }) {
    const response = await this.client.post('/rerank', {
      model: params.model,
      query: params.query,
      documents: params.documents,
      top_n: params.top_n || 10,
      return_documents: params.return_documents || true,
    })
    return response.data
  }

  // 语音转文字
  async audioTranscription(params: {
    model: string
    file: File | Blob
    language?: string
    response_format?: string
  }): Promise<AudioTranscriptionResponse> {
    try {
      const formData = new FormData()
      formData.append('file', params.file)
      formData.append('model', params.model)
      if (params.language) formData.append('language', params.language)
      if (params.response_format) formData.append('response_format', params.response_format)

      console.log('[SiliconFlow] Audio transcription request:', {
        model: params.model,
        fileName: params.file instanceof File ? params.file.name : 'blob',
        fileSize: params.file.size,
        language: params.language,
        response_format: params.response_format
      })

      const response: AxiosResponse<AudioTranscriptionResponse> = await this.client.post('/audio/transcriptions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('[SiliconFlow] Audio transcription response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[SiliconFlow] Audio transcription error:', error)

      // 如果是 Axios 错误，尝试获取更详细的错误信息
      if (error.response) {
        console.error('[SiliconFlow] Error response status:', error.response.status)
        console.error('[SiliconFlow] Error response data:', error.response.data)

        // 如果响应数据是字符串（可能是 HTML 错误页面），抛出更有意义的错误
        if (typeof error.response.data === 'string') {
          throw new Error(`API Error (${error.response.status}): ${error.response.data.substring(0, 100)}...`)
        }
      }

      throw error
    }
  }

  // 文字转语音
  async audioSpeech(params: {
    model: string
    input: string
    voice?: string
    response_format?: string
    speed?: number
  }) {
    const response = await this.client.post('/audio/speech', {
      model: params.model,
      input: params.input,
      voice: params.voice || 'alloy',
      response_format: params.response_format || 'mp3',
      speed: params.speed || 1.0,
    }, {
      responseType: 'blob',
    })
    return response.data
  }

  // 获取模型列表
  async getModels() {
    const response = await this.client.get('/models')
    return response.data
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/models')
      return true
    } catch (error) {
      console.error('[SiliconFlow] Health check failed:', error)
      return false
    }
  }
}

// 创建默认客户端实例
export function createSiliconFlowClient(apiKey: string): SiliconFlowClient {
  return new SiliconFlowClient(apiKey)
}

// 导出常用模型名称
export const MODELS = {
  // 对话模型
  CHAT: {
    QWEN3_8B: 'Qwen/Qwen3-8B',
    DEEPSEEK_R1: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
    GLM_Z1_9B: 'THUDM/GLM-Z1-9B-0414',
    GLM_4_9B: 'THUDM/GLM-4-9B-0414',
    QWEN_CODER: 'Qwen/Qwen2.5-Coder-7B-Instruct',
  },
  // 嵌入模型
  EMBEDDING: {
    BGE_M3: 'BAAI/bge-m3',
    BGE_LARGE_ZH: 'BAAI/bge-large-zh-v1.5',
    BGE_LARGE_EN: 'BAAI/bge-large-en-v1.5',
    BCE_BASE: 'netease-youdao/bce-embedding-base_v1',
  },
  // 重排序模型
  RERANK: {
    BGE_RERANKER_M3: 'BAAI/bge-reranker-v2-m3',
    BCE_RERANKER: 'netease-youdao/bce-reranker-base_v1',
  },
  // 语音模型
  AUDIO: {
    SENSE_VOICE: 'FunAudioLLM/SenseVoiceSmall',
  },
  // 图像模型
  IMAGE: {
    KOLORS: 'Kwai-Kolors/Kolors',
  },
} as const
