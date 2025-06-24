'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Bot,
  Home,
  MessageSquare,
  Image,
  Mic,
  FileText,
  Users
} from 'lucide-react'

const navigation = [
  {
    name: '概览',
    href: '/dashboard',
    icon: Home,
    description: '平台概览和快速操作'
  },
  {
    name: '模型调用',
    href: '/dashboard/models',
    icon: Bot,
    description: '调用各种AI模型',
    children: [
      { name: '单次对话', href: '/dashboard/models/chat', icon: MessageSquare },
      { name: '多轮对话', href: '/dashboard/models/conversation', icon: Users },
      { name: '图像生成', href: '/dashboard/models/image', icon: Image },
      { name: '语音处理', href: '/dashboard/models/audio', icon: Mic },
      { name: '文本处理', href: '/dashboard/models/text', icon: FileText },
    ]
  },

]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64 relative", className)}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
      </div>

      {/* 边框 */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

      <div className="relative z-10 space-y-3 py-6">
        <div className="px-4 py-2">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const hasActiveChild = item.children?.some(child => pathname === child.href)
              const isParentActive = isActive || hasActiveChild

              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                      isParentActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg backdrop-blur-sm"
                        : "text-gray-300 hover:bg-gray-800/40 hover:text-white hover:border-gray-600/50 border border-transparent"
                    )}
                  >
                    {/* 活跃状态的光效 */}
                    {isParentActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
                    )}

                    <Icon className={cn(
                      "mr-3 h-5 w-5 transition-all duration-300 relative z-10",
                      isParentActive
                        ? "text-blue-400 drop-shadow-sm"
                        : "text-gray-400 group-hover:text-blue-300 group-hover:scale-110"
                    )} />
                    <span className="relative z-10 font-medium">{item.name}</span>

                    {/* 悬停效果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>

                  {/* 子菜单 - 始终显示，避免布局跳转 */}
                  {item.children && (
                    <div className={cn(
                      "ml-6 mt-2 space-y-1 relative",
                      isParentActive ? "block" : "hidden"
                    )}>
                      {/* 连接线 */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b transition-all duration-300",
                        isParentActive
                          ? "from-blue-500/50 via-blue-400/30 to-transparent"
                          : "from-transparent to-transparent"
                      )} />

                      {item.children.map((child) => {
                        const ChildIcon = child.icon
                        const isChildActive = pathname === child.href

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300 group relative ml-4",
                              isParentActive
                                ? isChildActive
                                  ? "bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-white border border-blue-400/40 shadow-md backdrop-blur-sm"
                                  : "text-gray-300 hover:bg-gray-700/40 hover:text-white hover:border-gray-500/30 border border-transparent"
                                : "invisible"
                            )}
                          >
                            {/* 活跃子项的光效 */}
                            {isChildActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-300/5 animate-pulse rounded-lg" />
                            )}

                            {/* 连接点 */}
                            <div className={cn(
                              "absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300",
                              isChildActive
                                ? "bg-blue-400 shadow-lg shadow-blue-400/50"
                                : "bg-gray-600 group-hover:bg-blue-300"
                            )} />

                            <ChildIcon className={cn(
                              "mr-3 h-4 w-4 transition-all duration-300 relative z-10",
                              isChildActive
                                ? "text-blue-300 drop-shadow-sm"
                                : "text-gray-400 group-hover:text-blue-200 group-hover:scale-105"
                            )} />
                            <span className="relative z-10">{child.name}</span>

                            {/* 悬停效果 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-blue-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
