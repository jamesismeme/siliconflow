import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { tokenManager } from '@/lib/api/tokens'

export const runtime = 'nodejs'

// 获取单个Token详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenId = parseInt(params.id)
    
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token ID' },
        { status: 400 }
      )
    }

    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        callLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10 // 最近10条调用记录
        }
      }
    })

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      )
    }

    // 脱敏处理
    const safeToken = {
      id: token.id,
      name: token.name,
      value: `${token.value.substring(0, 8)}...${token.value.substring(token.value.length - 8)}`,
      isActive: token.isActive,
      usageToday: token.usageToday,
      limitPerDay: token.limitPerDay,
      lastUsedAt: token.lastUsedAt,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      recentCalls: token.callLogs.map(log => ({
        id: log.id,
        modelName: log.modelName,
        success: log.success,
        responseTime: log.responseTime,
        createdAt: log.createdAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: safeToken
    })
  } catch (error) {
    console.error('[API] Failed to get token:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token' },
      { status: 500 }
    )
  }
}

// 更新Token
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenId = parseInt(params.id)
    
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, limitPerDay, isActive, value } = body

    // 构建更新数据
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (limitPerDay !== undefined) updateData.limitPerDay = limitPerDay
    if (isActive !== undefined) updateData.isActive = isActive
    if (value !== undefined) {
      // 验证Token格式
      if (!value.startsWith('sk-') || value.length < 20) {
        return NextResponse.json(
          { success: false, error: 'Invalid token format' },
          { status: 400 }
        )
      }

      // 检查Token是否已存在（排除当前Token）
      const existingToken = await prisma.token.findFirst({
        where: {
          value,
          id: { not: tokenId }
        }
      })

      if (existingToken) {
        return NextResponse.json(
          { success: false, error: 'Token already exists' },
          { status: 409 }
        )
      }

      updateData.value = value
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedToken = await prisma.token.update({
      where: { id: tokenId },
      data: updateData
    })

    // 刷新Token管理器缓存
    await tokenManager.refreshTokens()

    return NextResponse.json({
      success: true,
      data: {
        id: updatedToken.id,
        name: updatedToken.name,
        isActive: updatedToken.isActive,
        limitPerDay: updatedToken.limitPerDay,
        updatedAt: updatedToken.updatedAt
      }
    })
  } catch (error) {
    console.error('[API] Failed to update token:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update token' },
      { status: 500 }
    )
  }
}

// 删除Token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenId = parseInt(params.id)
    
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token ID' },
        { status: 400 }
      )
    }

    // 检查Token是否存在
    const token = await prisma.token.findUnique({
      where: { id: tokenId }
    })

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      )
    }

    // 删除相关的调用日志
    await prisma.callLog.deleteMany({
      where: { tokenId }
    })

    // 删除Token
    await prisma.token.delete({
      where: { id: tokenId }
    })

    // 刷新Token管理器缓存
    await tokenManager.refreshTokens()

    return NextResponse.json({
      success: true,
      message: 'Token deleted successfully'
    })
  } catch (error) {
    console.error('[API] Failed to delete token:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete token' },
      { status: 500 }
    )
  }
}
