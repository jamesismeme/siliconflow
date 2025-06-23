import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export function middleware(request: NextRequest) {
  // 检查是否访问 console 路径（除了登录页面）
  if (request.nextUrl.pathname.startsWith('/console') &&
      request.nextUrl.pathname !== '/console/login') {

    // 检查认证 cookie
    const authCookie = request.cookies.get('console-auth')

    if (!authCookie?.value) {
      // 未认证，重定向到登录页面
      return NextResponse.redirect(new URL('/console/login', request.url))
    }

    // 验证cookie格式 (userId:username)
    const [userId, username] = authCookie.value.split(':')
    if (!userId || !username) {
      // cookie格式无效，重定向到登录页面
      return NextResponse.redirect(new URL('/console/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/console/:path*'
  ]
}
