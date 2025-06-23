import { NextRequest } from 'next/server'
import { createSiliconFlowClient } from '@/lib/api/siliconflow'
import { getModelByName } from '@/lib/constants/models'

export const runtime = 'nodejs'

// API 请求类型定义
interface StreamInvokeRequest {
  model: string
  type: 'chat'
  token: string
  parameters: any
}

// 流式对话接口
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: StreamInvokeRequest = await request.json()
    const { model, type, parameters, token } = body

    // 验证请求参数
    if (!model || !type || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: model, type, token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 验证模型配置
    const modelConfig = getModelByName(model)
    if (!modelConfig) {
      return new Response(
        JSON.stringify({ error: `Model ${model} not found` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 只支持对话模型的流式输出
    if (type !== 'chat') {
      return new Response(
        JSON.stringify({ error: 'Streaming only supported for chat models' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 创建 SiliconFlow 客户端
    const client = createSiliconFlowClient(token)

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 直接使用fetch进行流式请求
          const response = await fetch(`${process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: parameters.messages || [],
              temperature: parameters.temperature || modelConfig.parameters.temperature?.default || 0.7,
              max_tokens: parameters.max_tokens || modelConfig.parameters.max_tokens?.default || 1024,
              top_p: parameters.top_p || modelConfig.parameters.top_p?.default || 0.9,
              stream: true
            })
          })

          if (!response.ok) {
            throw new Error(`SiliconFlow API error: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body from SiliconFlow API')
          }

          const decoder = new TextDecoder()
          let buffer = ''

          try {
            while (true) {
              const { done, value } = await reader.read()

              if (done) {
                console.log('[Stream API] Stream ended')
                break
              }

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim()
                  console.log('[Stream API] Received data:', data)

                  if (data === '[DONE]') {
                    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
                    console.log('[Stream API] Stream completed')
                    return
                  }

                  if (data && data !== '') {
                    controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }

          controller.close()

        } catch (error) {
          console.error('[Stream API] Error:', error)

          // 发送错误信息
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          )
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('[Stream API] Request Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
