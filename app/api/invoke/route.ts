import { NextRequest, NextResponse } from 'next/server'
import { getModelByName } from '@/lib/constants/models'
import { createSiliconFlowClient } from '@/lib/api/siliconflow'

export const runtime = 'nodejs'

// API 请求类型定义
interface InvokeRequest {
  model: string
  type: 'chat' | 'image' | 'embedding' | 'rerank' | 'audio-transcription' | 'audio-speech'
  parameters: any
  token: string // 从前端传递的 Token
}

// 统一的模型调用接口
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 检查是否是文件上传请求
    const contentType = request.headers.get('content-type') || ''
    let body: InvokeRequest

    if (contentType.includes('multipart/form-data')) {
      // 处理文件上传
      const formData = await request.formData()
      body = {
        model: formData.get('model') as string,
        type: formData.get('type') as any,
        token: formData.get('token') as string,
        parameters: {
          file: formData.get('file'),
          language: formData.get('language'),
          response_format: formData.get('response_format')
        }
      }
    } else {
      // 处理普通JSON请求
      body = await request.json()
    }
    const { model, type, parameters, token } = body

    // 验证请求参数
    if (!model || !type || !parameters || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters: model, type, parameters, token' },
        { status: 400 }
      )
    }

    // 获取模型配置
    const modelConfig = getModelByName(model)
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unknown model: ${model}` },
        { status: 400 }
      )
    }

    console.log(`[API] Invoking ${type} model: ${model}`)

    // 创建 SiliconFlow 客户端
    const client = createSiliconFlowClient(token)
    let apiResponse: any

    // 根据类型调用不同的API
    switch (type) {
      case 'chat':
        apiResponse = await client.chatCompletion({
          model,
          messages: parameters.messages || [],
          temperature: parameters.temperature || modelConfig.parameters.temperature?.default || 0.7,
          max_tokens: parameters.max_tokens || modelConfig.parameters.max_tokens?.default || 1024,
          top_p: parameters.top_p || modelConfig.parameters.top_p?.default || 0.9,
          stream: parameters.stream || false
        })
        break

      case 'image':
        apiResponse = await client.imageGeneration({
          model,
          prompt: parameters.prompt || '',
          n: parameters.n || 1,
          size: parameters.size || '1024x1024',
          response_format: parameters.response_format || 'url'
        })
        break

      case 'embedding':
        apiResponse = await client.embeddings({
          model,
          input: parameters.input || '',
          encoding_format: parameters.encoding_format || 'float'
        })
        break

      case 'rerank':
        apiResponse = await client.rerank({
          model,
          query: parameters.query || '',
          documents: parameters.documents || [],
          top_n: parameters.top_n || 10,
          return_documents: parameters.return_documents !== false
        })
        break

      case 'audio-transcription':
        if (!parameters.file) {
          return NextResponse.json(
            { error: 'File is required for audio transcription' },
            { status: 400 }
          )
        }
        apiResponse = await client.audioTranscription({
          model,
          file: parameters.file,
          language: parameters.language,
          response_format: parameters.response_format || 'json'
        })
        break

      case 'audio-speech':
        apiResponse = await client.audioSpeech({
          model,
          input: parameters.input || '',
          voice: parameters.voice || 'alloy',
          response_format: parameters.response_format || 'mp3',
          speed: parameters.speed || 1.0
        })
        break

      default:
        return NextResponse.json(
          { error: `Unsupported type: ${type}` },
          { status: 400 }
        )
    }

    const responseTime = Date.now() - startTime

    // 返回结果
    return NextResponse.json({
      success: true,
      data: apiResponse,
      metadata: {
        model,
        type,
        responseTime,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    const responseTime = Date.now() - startTime

    console.error('[API] Invoke error:', error)

    // 返回错误信息
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        metadata: {
          responseTime,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

// 健康检查接口
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'SiliconFlow API is running'
  })
}
