import { NextRequest, NextResponse } from 'next/server'
import { tokenScheduler } from '@/lib/api/tokens'
import { getModelByName } from '@/lib/constants/models'
import { prisma } from '@/lib/db/prisma'

// API 请求类型定义
interface InvokeRequest {
  model: string
  type: 'chat' | 'image' | 'embedding' | 'rerank' | 'audio-transcription' | 'audio-speech'
  parameters: any
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
    const { model, type, parameters } = body

    // 验证请求参数
    if (!model || !type || !parameters) {
      return NextResponse.json(
        { error: 'Missing required parameters: model, type, parameters' },
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

    let apiResponse: any
    let usedTokenId: number

    // 根据类型调用不同的API
    switch (type) {
      case 'chat':
        const chatResponse = await tokenScheduler.executeWithToken(
          async (client) => {
            return await client.chatCompletion({
              model,
              messages: parameters.messages || [],
              temperature: parameters.temperature || modelConfig.parameters.temperature?.default || 0.7,
              max_tokens: parameters.max_tokens || modelConfig.parameters.max_tokens?.default || 1024,
              top_p: parameters.top_p || modelConfig.parameters.top_p?.default || 0.9,
              stream: parameters.stream || false
            })
          },
          model
        )
        apiResponse = chatResponse.result
        usedTokenId = chatResponse.tokenId
        break

      case 'image':
        const imageResponse = await tokenScheduler.executeWithToken(
          async (client) => {
            return await client.imageGeneration({
              model,
              prompt: parameters.prompt || '',
              n: parameters.n || 1,
              size: parameters.size || '1024x1024',
              response_format: parameters.response_format || 'url'
            })
          },
          model
        )
        apiResponse = imageResponse.result
        usedTokenId = imageResponse.tokenId
        break

      case 'embedding':
        const embeddingResponse = await tokenScheduler.executeWithToken(
          async (client) => {
            return await client.embeddings({
              model,
              input: parameters.input || '',
              encoding_format: parameters.encoding_format || 'float'
            })
          },
          model
        )
        apiResponse = embeddingResponse.result
        usedTokenId = embeddingResponse.tokenId
        break

      case 'rerank':
        const rerankResponse = await tokenScheduler.executeWithToken(
          async (client) => {
            return await client.rerank({
              model,
              query: parameters.query || '',
              documents: parameters.documents || [],
              top_n: parameters.top_n || 10,
              return_documents: parameters.return_documents !== false
            })
          },
          model
        )
        apiResponse = rerankResponse.result
        usedTokenId = rerankResponse.tokenId
        break

      case 'audio-transcription':
        if (!parameters.file) {
          return NextResponse.json(
            { error: 'File is required for audio transcription' },
            { status: 400 }
          )
        }
        const transcriptionResponse = await tokenScheduler.executeWithToken(
          async (client) => {
            return await client.audioTranscription({
              model,
              file: parameters.file,
              language: parameters.language,
              response_format: parameters.response_format || 'json'
            })
          },
          model
        )
        apiResponse = transcriptionResponse.result
        usedTokenId = transcriptionResponse.tokenId
        break

      case 'audio-speech':
        const speechResponse = await tokenScheduler.executeWithToken(
          async (client) => {
            return await client.audioSpeech({
              model,
              input: parameters.input || '',
              voice: parameters.voice || 'alloy',
              response_format: parameters.response_format || 'mp3',
              speed: parameters.speed || 1.0
            })
          },
          model
        )
        apiResponse = speechResponse.result
        usedTokenId = speechResponse.tokenId
        break

      default:
        return NextResponse.json(
          { error: `Unsupported type: ${type}` },
          { status: 400 }
        )
    }

    const responseTime = Date.now() - startTime

    // 记录成功的调用日志
    await recordCallLog({
      modelName: model,
      success: true,
      responseTime,
      inputTokens: apiResponse.usage?.prompt_tokens || 0,
      outputTokens: apiResponse.usage?.completion_tokens || 0,
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: getClientIP(request),
      tokenId: usedTokenId
    })

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

    // 记录失败的调用日志
    await recordCallLog({
      modelName: 'unknown',
      success: false,
      responseTime,
      errorMessage: error.message || 'Unknown error',
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: getClientIP(request)
    })

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

// 记录调用日志
async function recordCallLog(data: {
  modelName: string
  success: boolean
  responseTime: number
  inputTokens?: number
  outputTokens?: number
  errorMessage?: string
  userAgent: string
  ipAddress: string
  tokenId?: number
}) {
  try {
    await prisma.callLog.create({
      data: {
        tokenId: data.tokenId,
        modelName: data.modelName,
        success: data.success,
        responseTime: data.responseTime,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        errorMessage: data.errorMessage,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('[API] Failed to record call log:', error)
  }
}

// 获取客户端IP地址
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// 健康检查接口
export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    
    // 获取Token统计
    const tokenStats = await tokenScheduler.getTokenStats()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      tokens: tokenStats
    })
  } catch (error) {
    console.error('[API] Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      },
      { status: 503 }
    )
  }
}
