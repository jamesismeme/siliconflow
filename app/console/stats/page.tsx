'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Server,
  Database
} from 'lucide-react'
import { useClientStats } from '@/lib/hooks/use-client-stats'
import { useTokenStore } from '@/lib/stores/token-store'

export default function StatsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const { data: stats, loading, error, refetch } = useClientStats(period)
  const tokenStats = useTokenStore(state => state.stats)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">统计面板</h1>
          <p className="text-muted-foreground">加载统计数据中...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">统计面板</h1>
          <p className="text-muted-foreground">查看系统使用统计、性能指标和趋势分析</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <span>加载统计数据失败: {error}</span>
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  const successRate = stats.overview.totalCalls > 0
    ? Math.round(stats.overview.successRate)
    : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* 页面标题和时间范围选择 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">数据统计分析</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                统计面板
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              查看本地使用统计和性能指标，基于浏览器存储的数据分析
            </p>
          </div>
        <div className="flex items-center space-x-2">
          <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="today" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">今日</TabsTrigger>
              <TabsTrigger value="week" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">本周</TabsTrigger>
              <TabsTrigger value="month" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">本月</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 概览统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">总调用量</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.overview.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              {period === 'today' ? '今日' : period === 'week' ? '本周' : '本月'}调用总数
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">成功率</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{successRate}%</div>
            <p className="text-xs text-gray-400">
              {stats.overview.totalCalls - stats.overview.totalErrors}/{stats.overview.totalCalls} 成功
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">平均响应时间</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(stats.overview.averageResponseTime / 1000).toFixed(2)}s
            </div>
            <p className="text-xs text-gray-400">
              平均响应时间
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">活跃模型</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Object.keys(stats.models).length}</div>
            <p className="text-xs text-gray-400">
              已使用的模型数量
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token状态和模型统计 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Token状态 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Server className="h-5 w-5 text-blue-400" />
              Token状态
            </CardTitle>
            <CardDescription className="text-gray-400">
              API Token使用情况和健康状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenStats ? (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <h4 className="font-medium text-white">Token 总览</h4>
                        <p className="text-sm text-gray-400">
                          今日总调用: {tokenStats.totalUsageToday} 次
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {tokenStats.activeTokens}/{tokenStats.totalTokens}
                      </div>
                      <div className="text-xs text-gray-400">
                        活跃/总数
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    平均使用率: {tokenStats.averageUsageRate.toFixed(1)}%
                  </div>
                  {tokenStats.lastActivity.time && (
                    <div className="text-sm text-gray-400">
                      最近活动: {new Date(tokenStats.lastActivity.time).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  暂无 Token 数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 模型使用统计 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-green-400" />
              模型使用统计
            </CardTitle>
            <CardDescription className="text-gray-400">
              {period === 'today' ? '今日' : period === 'week' ? '本周' : '本月'}各模型的调用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.models).slice(0, 5).map(([modelName, modelData], index) => (
                <div key={modelName} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate text-white">{modelName}</h4>
                      <p className="text-sm text-gray-400">
                        平均响应: {(modelData.averageResponseTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{modelData.calls} 次</div>
                    <div className="text-xs text-gray-400">
                      {stats.overview.totalCalls > 0 ? ((modelData.calls / stats.overview.totalCalls) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 调用类别统计 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 调用类别分布 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              调用类别分布
            </CardTitle>
            <CardDescription className="text-gray-400">
              {period === 'today' ? '今日' : period === 'week' ? '本周' : '本月'}各类别调用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.categories).map(([category, categoryData]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <h4 className="font-medium text-white capitalize">{category}</h4>
                      <p className="text-sm text-gray-400">
                        平均响应: {(categoryData.averageResponseTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{categoryData.calls} 次</div>
                    <div className="text-xs text-gray-400">
                      错误: {categoryData.errors}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 时间线统计 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              时间线统计
            </CardTitle>
            <CardDescription className="text-gray-400">
              按日期统计的调用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.timeline.slice(-7).map((timeData) => (
                <div key={timeData.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <h4 className="font-medium text-white">{timeData.date}</h4>
                      <p className="text-sm text-gray-400">
                        平均响应: {(timeData.averageResponseTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{timeData.calls} 次</div>
                    <div className="text-xs text-gray-400">
                      错误: {timeData.errors}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统状态和建议 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              系统性能
            </CardTitle>
            <CardDescription className="text-gray-400">
              系统各项指标的健康状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">API响应时间</span>
              <Badge className={`${stats.overview.averageResponseTime < 3000 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} text-white`}>
                {stats.overview.averageResponseTime < 1000 ? "优秀" :
                 stats.overview.averageResponseTime < 3000 ? "良好" : "需优化"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Token状态</span>
              <Badge className={`${tokenStats && tokenStats.activeTokens > 0 ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}>
                {tokenStats ? `${tokenStats.activeTokens}/${tokenStats.totalTokens} 活跃` : '无Token'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">成功率</span>
              <Badge className={`${successRate >= 95 ? "bg-green-600 hover:bg-green-700" : successRate >= 90 ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"} text-white`}>
                {successRate >= 95 ? "优秀" : successRate >= 90 ? "良好" : "需关注"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">使用模型</span>
              <Badge className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600">
                {Object.keys(stats.models).length} 个模型
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-purple-400" />
              系统建议
            </CardTitle>
            <CardDescription className="text-gray-400">
              基于当前数据的优化建议
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 成功率建议 */}
            {successRate >= 95 ? (
              <div className="text-sm">
                <p className="font-medium text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  系统运行良好
                </p>
                <p className="text-gray-400">API调用成功率优秀，系统稳定</p>
              </div>
            ) : (
              <div className="text-sm">
                <p className="font-medium text-orange-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  成功率需关注
                </p>
                <p className="text-gray-400">当前成功率 {successRate}%，建议检查Token或网络状况</p>
              </div>
            )}

            {/* Token使用建议 */}
            {tokenStats && tokenStats.averageUsageRate > 80 ? (
              <div className="text-sm">
                <p className="font-medium text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Token使用率较高
                </p>
                <p className="text-gray-400">平均使用率 {tokenStats.averageUsageRate.toFixed(1)}%，建议添加更多Token</p>
              </div>
            ) : tokenStats && tokenStats.totalTokens > 0 ? (
              <div className="text-sm">
                <p className="font-medium text-blue-400 flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  Token状态良好
                </p>
                <p className="text-gray-400">Token使用率正常，负载均衡有效</p>
              </div>
            ) : (
              <div className="text-sm">
                <p className="font-medium text-red-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  缺少Token
                </p>
                <p className="text-gray-400">请添加API Token以开始使用服务</p>
              </div>
            )}

            {/* 响应时间建议 */}
            {stats.overview.averageResponseTime > 5000 && (
              <div className="text-sm">
                <p className="font-medium text-orange-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  响应时间较慢
                </p>
                <p className="text-gray-400">平均响应时间超过5秒，建议检查网络连接</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
