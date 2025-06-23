import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
import { tokenManager } from '@/lib/api/tokens'

// 重置Token使用量
export async function POST(
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

    // 重置今日使用量
    const updatedToken = await prisma.token.update({
      where: { id: tokenId },
      data: {
        usageToday: 0
      }
    })

    // 刷新Token管理器缓存
    await tokenManager.refreshTokens()

    return NextResponse.json({
      success: true,
      data: {
        id: updatedToken.id,
        name: updatedToken.name,
        usageToday: updatedToken.usageToday,
        limitPerDay: updatedToken.limitPerDay
      },
      message: 'Token usage reset successfully'
    })

  } catch (error) {
    console.error('[Token Reset API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset token usage' },
      { status: 500 }
    )
  }
}
