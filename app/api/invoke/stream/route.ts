import { NextRequest } from 'next/server'
import { tokenScheduler } from '@/lib/api/tokens'
import { getModelByName } from '@/lib/constants/models'
import { prisma } from '@/lib/db/prisma'

// API 请求类型定义
interface StreamInvokeRequest {
  model: string
  type: 'chat'
  parameters: any
}

// 流式对话接口
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let usedTokenId: number | undefined
  let totalInputTokens = 0
  let totalOutputTokens = 0

  try {
    const body: StreamInvokeRequest = await request.json()
    const { model, type, parameters } = body

    // 验证请求参数
    if (!model || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: model, type' }),
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

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 估算输入token数量
          if (parameters.messages && Array.isArray(parameters.messages)) {
            const totalInputText = parameters.messages.map((msg: any) => msg.content || '').join(' ')
            totalInputTokens = Math.ceil(totalInputText.length * 0.75) // 简单估算
          }

          // 执行流式对话
          const { result, tokenId } = await tokenScheduler.executeWithToken(
            async (client) => {
              // 直接使用fetch进行流式请求
              const response = await fetch(`${process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'}/chat/completions`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${client.apiKey}`,
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
                        // 尝试解析token使用信息
                        try {
                          const parsed = JSON.parse(data)
                          if (parsed.usage) {
                            totalInputTokens = parsed.usage.prompt_tokens || 0
                            totalOutputTokens = parsed.usage.completion_tokens || 0
                            console.log(`[Stream API] Token usage: input=${totalInputTokens}, output=${totalOutputTokens}`)
                          }
                          // 如果没有usage信息，尝试从choices中估算
                          if (!parsed.usage && parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                            // 简单估算：每个字符约等于0.75个token（中文）
                            const content = parsed.choices[0].delta.content
                            totalOutputTokens += Math.ceil(content.length * 0.75)
                          }
                        } catch (e) {
                          // 忽略解析错误，继续处理
                        }

                        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
                      }
                    }
                  }
                }
              } finally {
                reader.releaseLock()
              }
            },
            model
          )

          usedTokenId = tokenId

          // 记录调用日志
          const endTime = Date.now()
          const responseTime = endTime - startTime

          await prisma.callLog.create({
            data: {
              tokenId: usedTokenId,
              modelName: model,
              responseTime,
              success: true,
              inputTokens: totalInputTokens || 0,
              outputTokens: totalOutputTokens || 0,
              userAgent: request.headers.get('user-agent') || '',
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
              createdAt: new Date(startTime)
            }
          })

          controller.close()

        } catch (error) {
          console.error('[Stream API] Error:', error)
          
          // 发送错误信息
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          )
          controller.close()

          // 记录错误日志
          const endTime = Date.now()
          const responseTime = endTime - startTime

          await prisma.callLog.create({
            data: {
              tokenId: usedTokenId,
              modelName: model,
              responseTime,
              success: false,
              errorMessage,
              userAgent: request.headers.get('user-agent') || '',
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
              createdAt: new Date(startTime)
            }
          })
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
