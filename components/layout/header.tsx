'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import {
  Bot,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation: Array<{ name: string; href: string; icon: any }> = []

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-400" />
            <span className="hidden font-bold sm:inline-block text-white">
              SiliconFlow Platform
            </span>
          </Link>
        </div>

        {/* 移动端菜单按钮 */}
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base text-white hover:bg-gray-800 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 transition-colors hover:text-blue-400 px-3 py-2 rounded-md",
                  pathname === item.href
                    ? "text-blue-400 bg-gray-800/50"
                    : "text-gray-300 hover:bg-gray-800/30"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 这里可以放搜索框或其他功能 */}
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-800 bg-black md:hidden">
          <nav className="flex flex-col space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-gray-800 text-blue-400"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
