'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Bot,
  Sparkles,
  AlertTriangle
} from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 图标和数字 */}
          <div className="space-y-6">
            <div className="relative">
              <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-pulse">
                404
              </div>
              <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-red-500/10 blur-sm">
                404
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-12 w-12 text-red-400" />
              </div>
            </div>
          </div>

          {/* 错误信息 */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                页面未找到
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              抱歉，您访问的页面不存在或已被移动。让我们帮您找到正确的方向。
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto h-12 px-6">
                <Home className="mr-2 h-5 w-5" />
                <span className="button-text">返回首页</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto h-12 px-6 border-gray-600 hover:border-gray-500"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span className="button-text">返回上页</span>
            </Button>
          </div>

          {/* 推荐链接 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">或者试试这些页面</span>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/dashboard" className="group">
                    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Bot className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                            模型控制台
                          </div>
                          <div className="text-sm text-gray-400">
                            AI 模型调用平台
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/console" className="group">
                    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Search className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                            管理控制台
                          </div>
                          <div className="text-sm text-gray-400">
                            Token 和设置管理
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 底部提示 */}
          <div className="text-sm text-gray-500">
            如果您认为这是一个错误，请
            <a
              href="https://github.com/jamesismeme/siliconflow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline ml-1"
            >
              报告问题
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
