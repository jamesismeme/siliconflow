import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
import { tokenManager } from '@/lib/api/tokens'

// 获取Token列表和统计信息
export async function GET() {
  try {
    // 获取所有Token
    const tokens = await prisma.token.findMany({
      include: {
        _count: {
          select: {
            callLogs: {
              where: {
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)) // 今日开始
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 不返回实际的Token值，只返回脱敏信息
    const safeTokens = tokens.map(token => ({
      id: token.id,
      name: token.name,
      value: `${token.value.substring(0, 8)}...${token.value.substring(token.value.length - 8)}`,
      isActive: token.isActive,
      usageToday: token.usageToday,
      limitPerDay: token.limitPerDay,
      lastUsedAt: token.lastUsedAt,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      todayCallsCount: token._count.callLogs
    }))

    // 计算统计信息
    const totalTokens = tokens.length
    const activeTokens = tokens.filter(token => token.isActive).length
    const totalUsageToday = tokens.reduce((sum, token) => sum + token.usageToday, 0)
    const totalLimitPerDay = tokens.reduce((sum, token) => sum + token.limitPerDay, 0)
    const averageUsageRate = totalTokens > 0
      ? Math.round(tokens.reduce((sum, token) =>
          sum + (token.usageToday / token.limitPerDay * 100), 0) / totalTokens)
      : 0

    // 找到最近使用的Token
    const lastUsedToken = tokens
      .filter(token => token.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())[0]

    const stats = {
      totalTokens,
      activeTokens,
      totalUsageToday,
      totalLimitPerDay,
      averageUsageRate,
      lastActivity: {
        time: lastUsedToken?.lastUsedAt || null,
        tokenName: lastUsedToken?.name || null
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tokens: safeTokens,
        stats
      }
    })
  } catch (error) {
    console.error('[API] Failed to get tokens:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

// 创建新Token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, limitPerDay = 1000 } = body

    if (!name || !value) {
      return NextResponse.json(
        { success: false, error: 'Name and value are required' },
        { status: 400 }
      )
    }

    // 验证Token格式
    if (!value.startsWith('sk-') || value.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      )
    }

    // 检查Token是否已存在
    const existingToken = await prisma.token.findFirst({
      where: { value }
    })

    if (existingToken) {
      return NextResponse.json(
        { success: false, error: 'Token already exists' },
        { status: 409 }
      )
    }

    // 创建新Token
    const newToken = await prisma.token.create({
      data: {
        name,
        value,
        limitPerDay,
        isActive: true,
        usageToday: 0
      }
    })

    // 刷新Token管理器缓存
    await tokenManager.refreshTokens()

    return NextResponse.json({
      success: true,
      data: {
        id: newToken.id,
        name: newToken.name,
        value: `${newToken.value.substring(0, 8)}...${newToken.value.substring(newToken.value.length - 8)}`,
        isActive: newToken.isActive,
        limitPerDay: newToken.limitPerDay,
        createdAt: newToken.createdAt
      }
    })
  } catch (error) {
    console.error('[API] Failed to create token:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create token' },
      { status: 500 }
    )
  }
}

// 批量更新Token状态
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tokenIds } = body

    if (!action || !tokenIds || !Array.isArray(tokenIds)) {
      return NextResponse.json(
        { success: false, error: 'Action and tokenIds are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'activate':
        updateData = { isActive: true }
        break
      case 'deactivate':
        updateData = { isActive: false }
        break
      case 'reset-usage':
        updateData = { usageToday: 0 }
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    // 批量更新
    const result = await prisma.token.updateMany({
      where: {
        id: { in: tokenIds }
      },
      data: updateData
    })

    // 刷新Token管理器缓存
    await tokenManager.refreshTokens()

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} tokens`,
      updatedCount: result.count
    })
  } catch (error) {
    console.error('[API] Failed to update tokens:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tokens' },
      { status: 500 }
    )
  }
}
