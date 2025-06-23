import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

// 登录验证
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '请输入用户名和密码' },
        { status: 400 }
      )
    }

    // 查找管理员用户
    const admin = await prisma.adminUser.findUnique({
      where: { username: username.toLowerCase() }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 检查账户是否被锁定
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return NextResponse.json(
        { success: false, error: '账户已被锁定，请稍后再试' },
        { status: 423 }
      )
    }

    // 检查账户是否激活
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: '账户已被禁用' },
        { status: 403 }
      )
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)

    if (isValidPassword) {
      // 登录成功，重置登录尝试次数并更新最后登录时间
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          loginAttempts: 0,
          lastLoginAt: new Date(),
          lockedUntil: null
        }
      })

      // 设置认证cookie，有效期24小时
      const response = NextResponse.json({ success: true })

      response.cookies.set('console-auth', `${admin.id}:${admin.username}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24小时
        path: '/console'
      })

      return response
    } else {
      // 密码错误，增加登录尝试次数
      const newAttempts = admin.loginAttempts + 1
      const shouldLock = newAttempts >= 5

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null // 锁定30分钟
        }
      })

      return NextResponse.json(
        {
          success: false,
          error: shouldLock
            ? '登录失败次数过多，账户已被锁定30分钟'
            : `用户名或密码错误 (剩余尝试次数: ${5 - newAttempts})`
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('[Console Auth] Login error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 验证登录状态
export async function GET() {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('console-auth')

    if (!authCookie?.value) {
      return NextResponse.json({ authenticated: false })
    }

    // 解析cookie值 (格式: "userId:username")
    const [userId, username] = authCookie.value.split(':')

    if (!userId || !username) {
      return NextResponse.json({ authenticated: false })
    }

    // 验证用户是否仍然存在且激活
    const admin = await prisma.adminUser.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, username: true, isActive: true }
    })

    if (admin && admin.isActive && admin.username === username) {
      return NextResponse.json({
        authenticated: true,
        user: { id: admin.id, username: admin.username }
      })
    } else {
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error('[Console Auth] Check auth error:', error)
    return NextResponse.json({ authenticated: false })
  }
}

// 登出
export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true })
    
    response.cookies.delete('console-auth')
    
    return response
  } catch (error) {
    console.error('[Console Auth] Logout error:', error)
    return NextResponse.json(
      { success: false, error: '登出失败' },
      { status: 500 }
    )
  }
}
