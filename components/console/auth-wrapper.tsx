'use client'

import { usePathname } from 'next/navigation'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function ConsoleAuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname()

  // 如果是登录页面，直接显示内容
  if (pathname === '/console/login') {
    return <>{children}</>
  }

  // 其他页面由中间件处理认证，这里直接显示内容
  return <>{children}</>
}
