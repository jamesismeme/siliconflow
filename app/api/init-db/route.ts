import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  return await initializeDatabase()
}

export async function POST(request: NextRequest) {
  return await initializeDatabase()
}

async function initializeDatabase() {
  try {
    console.log('开始初始化数据库...')

    // 清理现有数据
    await prisma.callLog.deleteMany()
    await prisma.token.deleteMany()
    await prisma.userSetting.deleteMany()
    await prisma.systemStats.deleteMany()
    await prisma.modelStats.deleteMany()
    await prisma.adminUser.deleteMany()

    // 从环境变量读取API Token
    const tokensFromEnv = process.env.SILICONFLOW_TOKENS?.split(',') || []

    if (tokensFromEnv.length > 0) {
      const tokenData = tokensFromEnv.map((token, index) => ({
        name: `SiliconFlow Token ${index + 1}`,
        value: token.trim(),
        isActive: true,
        limitPerDay: 1000,
        usageToday: 0,
      }))

      const tokens = await prisma.token.createMany({
        data: tokenData,
      })

      console.log(`创建了 ${tokens.count} 个Token`)
    }

    // 创建管理员账户
    const adminPassword = 'a95xg4exa7efq'
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    await prisma.adminUser.create({
      data: {
        username: 'weier',
        passwordHash: hashedPassword,
        isActive: true,
      },
    })

    console.log('创建了管理员账户: weier')

    // 创建示例用户设置
    await prisma.userSetting.create({
      data: {
        userId: 'default-user',
        defaultModel: 'Qwen/Qwen3-8B',
        preferences: JSON.stringify({
          theme: 'light',
          language: 'zh-CN',
          autoSave: true,
          showAdvancedOptions: false,
        }),
      },
    })

    console.log('创建了默认用户设置')

    // 创建今日系统统计
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.systemStats.create({
      data: {
        date: today,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalTokens: 0,
        avgResponseTime: 0,
      },
    })

    console.log('创建了今日系统统计')

    // 创建推荐模型的统计记录
    const recommendedModels = [
      'Qwen/Qwen3-8B',
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
      'BAAI/bge-m3',
      'BAAI/bge-reranker-v2-m3',
      'FunAudioLLM/SenseVoiceSmall',
      'Kwai-Kolors/Kolors',
      'Qwen/Qwen2.5-Coder-7B-Instruct',
    ]

    for (const modelName of recommendedModels) {
      await prisma.modelStats.create({
        data: {
          modelName,
          date: today,
          callCount: 0,
          successCount: 0,
          totalTokens: 0,
          avgResponseTime: 0,
        },
      })
    }

    console.log(`创建了 ${recommendedModels.length} 个模型的统计记录`)

    console.log('数据库初始化完成！')

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      data: {
        tokensCreated: tokensFromEnv.length,
        adminCreated: true,
        modelsInitialized: recommendedModels.length
      }
    })

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json({
      success: false,
      message: '数据库初始化失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
