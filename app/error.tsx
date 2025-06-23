'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Home,
  RefreshCw,
  AlertTriangle,
  Bug,
  Sparkles
} from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 错误图标 */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-16 w-16 text-red-400" />
                </div>
                <div className="absolute inset-0 p-6 rounded-full bg-red-500/5 animate-ping">
                  <AlertTriangle className="h-16 w-16 text-red-400/50" />
                </div>
              </div>
            </div>

            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Oops!
            </div>
          </div>

          {/* 错误信息 */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                出现了一些问题
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              应用程序遇到了意外错误。不用担心，这通常是临时性的问题。
            </p>
          </div>

          {/* 错误详情卡片 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <Bug className="h-5 w-5 text-red-400" />
                  <span className="font-medium">错误详情</span>
                </div>

                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="text-sm text-gray-300 font-mono break-all">
                    {error.message || '未知错误'}
                  </div>
                  {error.digest && (
                    <div className="text-xs text-gray-500 mt-2">
                      错误ID: {error.digest}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={reset}
              className="w-full sm:w-auto h-12 px-6"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              <span className="button-text">重试</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/'}
              className="w-full sm:w-auto h-12 px-6 border-gray-600 hover:border-gray-500"
            >
              <Home className="mr-2 h-5 w-5" />
              <span className="button-text">返回首页</span>
            </Button>
          </div>

          {/* 推荐操作 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">您可以尝试</span>
                </div>

                <div className="grid gap-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>刷新页面或重试操作</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>检查网络连接是否正常</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span>清除浏览器缓存后重试</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span>如果问题持续存在，请联系支持</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 底部提示 */}
          <div className="text-sm text-gray-500">
            如果问题持续存在，请
            <a
              href="https://github.com/jamesismeme/siliconflow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline ml-1"
            >
              报告此错误
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
