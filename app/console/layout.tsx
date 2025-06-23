'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Settings,
  Key,
  Menu,
  X,
  Shield,
  Activity,
  FileText,
  Clock
} from 'lucide-react'

const navigation = [
  {
    name: 'Token管理',
    href: '/console/tokens',
    icon: Key,
    description: '管理本地API访问令牌'
  },
  {
    name: '使用统计',
    href: '/console/stats',
    icon: BarChart3,
    description: '查看本地使用统计'
  },
  {
    name: '调用历史',
    href: '/console/stats/usage',
    icon: Activity,
    description: '查看API调用历史'
  },
  {
    name: '系统设置',
    href: '/console/settings',
    icon: Settings,
    description: '配置用户偏好设置'
  }
]

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10" />
      
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* 侧边栏 */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-600/20">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">用户控制台</h1>
                <p className="text-xs text-gray-400">User Console</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-red-600/20 text-red-400 border border-red-600/30"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-red-400" : "text-gray-400 group-hover:text-white"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* 底部信息 */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="text-xs text-gray-400">
                <div>本地存储模式</div>
                <div className="text-gray-500">LocalStorage Mode</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-72">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white">SiliconFlow 用户控制台</h2>
                <p className="text-sm text-gray-400">个人设置与数据管理</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              返回用户界面
            </Link>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
