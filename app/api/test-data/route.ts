import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// 创建测试数据
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'create-logs') {
      // 获取所有活跃的Token
      const tokens = await prisma.token.findMany({
        where: { isActive: true }
      })

      if (tokens.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No active tokens found'
        })
      }

      // 创建测试日志数据
      const testLogs = []
      const models = [
        'Qwen/Qwen2.5-7B-Instruct',
        'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        'BAAI/bge-m3',
        'Kwai-Kolors/Kolors',
        'FunAudioLLM/SenseVoiceSmall'
      ]

      for (let i = 0; i < 50; i++) {
        const token = tokens[Math.floor(Math.random() * tokens.length)]
        const model = models[Math.floor(Math.random() * models.length)]
        const success = Math.random() > 0.1 // 90% 成功率
        const responseTime = Math.floor(Math.random() * 10000) + 500 // 500-10500ms
        const inputTokens = Math.floor(Math.random() * 2000) + 100 // 100-2100 tokens
        const outputTokens = Math.floor(Math.random() * 1000) + 50 // 50-1050 tokens
        
        // 创建时间在过去24小时内
        const createdAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)

        testLogs.push({
          tokenId: token.id,
          modelName: model,
          success,
          responseTime,
          inputTokens: success ? inputTokens : null,
          outputTokens: success ? outputTokens : null,
          errorMessage: success ? null : 'Test error message',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          ipAddress: '127.0.0.1',
          createdAt
        })
      }

      // 批量插入测试数据
      await prisma.callLog.createMany({
        data: testLogs
      })

      return NextResponse.json({
        success: true,
        message: `Created ${testLogs.length} test log entries`,
        data: {
          logsCreated: testLogs.length,
          tokensUsed: tokens.length,
          modelsUsed: models.length
        }
      })
    }

    if (action === 'clear-logs') {
      // 清除所有测试数据
      const deleted = await prisma.callLog.deleteMany({})
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${deleted.count} log entries`,
        data: {
          deletedCount: deleted.count
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=create-logs or ?action=clear-logs'
    })

  } catch (error) {
    console.error('[Test Data API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
