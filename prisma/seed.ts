import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// 加载环境变量
config()

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 清理现有数据
  await prisma.callLog.deleteMany()
  await prisma.token.deleteMany()
  await prisma.userSetting.deleteMany()
  await prisma.systemStats.deleteMany()
  await prisma.modelStats.deleteMany()

  // 从环境变量读取API Token
  const tokensFromEnv = process.env.SILICONFLOW_TOKENS?.split(',') || []

  if (tokensFromEnv.length === 0) {
    console.log('警告: 未找到SILICONFLOW_TOKENS环境变量，请手动添加Token')
    return
  }

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
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
