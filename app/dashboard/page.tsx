'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bot,
  MessageSquare,
  Image,
  Mic,
  FileText,
  Activity,
  TrendingUp,
  Users,
  Zap,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useClientStats } from '@/lib/hooks/use-client-stats'
import { useTokenStore } from '@/lib/stores/token-store'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { data: stats, loading, error, refetch } = useClientStats('today')
  const tokens = useTokenStore(state => state.tokens)
  const tokenStats = useTokenStore(state => state.stats)

  // 计算统计数据
  const successRate = stats?.overview?.totalCalls && stats.overview.totalCalls > 0
    ? Math.round(stats.overview.successRate)
    : 100

  const avgResponseTime = stats?.overview.averageResponseTime
    ? (stats.overview.averageResponseTime / 1000).toFixed(1)
    : '1.2'

  // 检查 Token 状态
  const hasTokens = tokens.length > 0
  const activeTokens = tokens.filter(token => token.isActive).length
  const hasAvailableTokens = tokens.some(token =>
    token.isActive && token.usageToday < token.limitPerDay
  )
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* 页面标题 */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">AI模型控制中心</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              欢迎回来
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            管理您的AI模型调用，监控系统状态，探索强大的AI能力
          </p>
        </div>

        {/* Token 状态提示 */}
        {!hasTokens ? (
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-yellow-500/20">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-300">需要配置 API Token</h3>
                    <p className="text-sm text-yellow-200/80">
                      请先添加您的 SiliconFlow API Token 以开始使用模型服务
                    </p>
                  </div>
                </div>
                <Link href="/console/tokens">
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    配置 Token
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : !hasAvailableTokens ? (
          <Card className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-300">Token 额度不足</h3>
                    <p className="text-sm text-red-200/80">
                      所有 Token 已达到每日限制，请添加新的 Token 或等待重置
                    </p>
                  </div>
                </div>
                <Link href="/console/tokens">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    管理 Token
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-300">Token 状态正常</h3>
                    <p className="text-sm text-green-200/80">
                      {activeTokens} 个活跃 Token，系统运行正常
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {tokenStats && (
                    <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                      使用率: {tokenStats.averageUsageRate.toFixed(1)}%
                    </Badge>
                  )}
                  <Link href="/console/tokens">
                    <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/10">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 快速统计卡片 */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-20" />
                  <div className="h-5 w-5 bg-gray-700 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-700 rounded animate-pulse mb-2 w-16" />
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span>加载统计数据失败</span>
                <Button variant="outline" size="sm" onClick={refetch}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重试
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">今日调用</CardTitle>
                <div className="relative">
                  <Activity className="h-5 w-5 text-blue-400" />
                  <div className="absolute inset-0 h-5 w-5 text-blue-400 animate-pulse opacity-30 group-hover:opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.overview.totalCalls.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats?.overview?.totalCalls && stats.overview.totalCalls > 0 ? '系统活跃' : '暂无调用'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">成功率</CardTitle>
                <div className="relative">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="absolute inset-0 h-5 w-5 text-green-400 animate-pulse opacity-30 group-hover:opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">{successRate}%</div>
                <p className={`text-xs flex items-center gap-1 ${
                  successRate >= 95 ? 'text-green-400' : successRate >= 90 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  <CheckCircle className="h-3 w-3" />
                  {successRate >= 95 ? '系统运行正常' : successRate >= 90 ? '运行良好' : '需要关注'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">平均响应</CardTitle>
                <div className="relative">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <div className="absolute inset-0 h-5 w-5 text-purple-400 animate-pulse opacity-30 group-hover:opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">{avgResponseTime}s</div>
                <p className={`text-xs flex items-center gap-1 ${
                  parseFloat(avgResponseTime) < 2 ? 'text-green-400' :
                  parseFloat(avgResponseTime) < 5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  <Clock className="h-3 w-3" />
                  {parseFloat(avgResponseTime) < 2 ? '响应速度优秀' :
                   parseFloat(avgResponseTime) < 5 ? '响应速度良好' : '响应较慢'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 快速操作 */}
        <div className="grid gap-6 md:grid-cols-1">
          {/* 模型调用 */}
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-white text-xl">
                <div className="relative p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <Bot className="h-6 w-6 text-blue-400" />
                  <div className="absolute inset-0 rounded-xl bg-blue-400/20 animate-pulse" />
                </div>
                模型调用
              </CardTitle>
              <CardDescription className="text-gray-300 text-base mt-2">
                快速调用各种AI模型，支持18个免费模型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <Link href="/dashboard/models/chat" className="group">
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                        <MessageSquare className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">对话模型</h3>
                        <p className="text-sm text-gray-400 mt-1">智能对话交互</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/models/image" className="group">
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                        <Image className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">图像生成</h3>
                        <p className="text-sm text-gray-400 mt-1">AI创意绘画</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/models/audio" className="group">
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                        <Mic className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">语音处理</h3>
                        <p className="text-sm text-gray-400 mt-1">语音识别转录</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/models/text" className="group">
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                        <FileText className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-yellow-300 transition-colors">文本处理</h3>
                        <p className="text-sm text-gray-400 mt-1">文本分析嵌入</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 优化的分隔线 */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gradient-to-r from-gray-900/80 to-gray-800/50 px-4 py-1 rounded-full text-sm text-gray-400 border border-gray-700/50">或</span>
                </div>
              </div>

              <Link href="/dashboard/models" className="block">
                <div className="relative p-4 rounded-2xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/90 hover:to-purple-500/90 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 group">
                  <div className="flex items-center justify-center gap-3 text-white">
                    <Sparkles className="h-5 w-5 group-hover:animate-spin" />
                    <span className="font-semibold">查看所有模型</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>


        </div>

        {/* 推荐模型 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              推荐模型
            </CardTitle>
            <CardDescription className="text-gray-400">
              基于SiliconFlow平台的推荐配置，性能优异的免费模型
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Qwen/Qwen3-8B',
                  category: '对话模型',
                  description: '支持思考模式，推理、代码、数学能力强',
                  icon: MessageSquare,
                  href: '/dashboard/models/chat',
                  color: 'text-blue-400'
                },
                {
                  name: 'Kwai-Kolors/Kolors',
                  category: '图像生成',
                  description: '中文内容渲染优秀，适合创意图像生成',
                  icon: Image,
                  href: '/dashboard/models/image',
                  color: 'text-purple-400'
                },
                {
                  name: 'BAAI/bge-m3',
                  category: '文本嵌入',
                  description: '多语言支持，适合语义搜索和匹配',
                  icon: FileText,
                  href: '/dashboard/models/text',
                  color: 'text-yellow-400'
                },
                {
                  name: 'SenseVoiceSmall',
                  category: '语音识别',
                  description: '多语言ASR，速度比Whisper快15倍',
                  icon: Mic,
                  href: '/dashboard/models/audio',
                  color: 'text-green-400'
                },
                {
                  name: 'Qwen2.5-Coder-7B',
                  category: '代码生成',
                  description: '专注代码生成与修复，开发效率神器',
                  icon: Bot,
                  href: '/dashboard/models/chat',
                  color: 'text-blue-400'
                },
                {
                  name: 'DeepSeek-R1-0528',
                  category: '数学推理',
                  description: '数学推理能力突出，适合复杂计算',
                  icon: Bot,
                  href: '/dashboard/models/chat',
                  color: 'text-purple-400'
                },
              ].map((model) => {
                const Icon = model.icon
                return (
                  <Link key={model.name} href={model.href}>
                    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-4 w-4 ${model.color}`} />
                          <span className="text-xs text-gray-400">{model.category}</span>
                        </div>
                        <CardTitle className="text-sm text-white group-hover:text-blue-300 transition-colors">
                          {model.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-xs text-gray-400">
                          {model.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
