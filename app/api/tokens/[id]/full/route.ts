import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// 获取完整Token值（用于复制）
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
      select: {
        id: true,
        name: true,
        value: true // 返回完整的Token值
      }
    })

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: token.id,
        name: token.name,
        value: token.value // 完整Token值
      }
    })

  } catch (error) {
    console.error('[Token Full API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch full token' },
      { status: 500 }
    )
  }
}
