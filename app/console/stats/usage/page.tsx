'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  BarChart3,
  Clock,
  Activity,
  RefreshCw,
  AlertTriangle,
  Download,
  Calendar,
  Zap
} from 'lucide-react'
import { useClientUsageStats } from '@/lib/hooks/use-client-stats'
import { TrendChart } from '@/components/stats/trend-chart'
import { CustomBarChart } from '@/components/stats/bar-chart'
import { CustomPieChart } from '@/components/stats/pie-chart'

export default function UsageStatsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [activeTab, setActiveTab] = useState('overview')
  const { data: usageStats, loading, error, refetch } = useClientUsageStats(period)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        </div>
        <div className="relative z-10 space-y-8 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">使用统计</h1>
            <p className="text-gray-400">加载详细使用数据中...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        </div>
        <div className="relative z-10 space-y-8 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">使用统计</h1>
            <p className="text-gray-400">详细的使用数据分析和趋势</p>
          </div>
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span>加载使用统计失败: {error}</span>
                <Button variant="outline" size="sm" onClick={refetch}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="button-text">重试</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!usageStats) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* 页面标题和控制 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">使用量分析</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                使用统计
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              详细的使用数据分析和趋势 ({period === 'today' ? '今天' : period === 'week' ? '本周' : '本月'}数据)
            </p>
          </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={(value: 'today' | 'week' | 'month') => setPeriod(value)}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="today" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">今天</SelectItem>
              <SelectItem value="week" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">本周</SelectItem>
              <SelectItem value="month" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">本月</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 概览统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">总调用量</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{usageStats.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              {period === 'today' ? '今天' : period === 'week' ? '本周' : '本月'}的总调用次数
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">成功率</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {usageStats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-400">
              {usageStats.successfulCalls}/{usageStats.totalCalls} 成功
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
              {(usageStats.averageResponseTime / 1000).toFixed(2)}s
            </div>
            <p className="text-xs text-gray-400">
              所有成功调用的平均时间
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Token消耗</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {usageStats.totalTokensUsed.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">
              已使用Token总数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">趋势概览</TabsTrigger>
          <TabsTrigger value="models" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">模型分析</TabsTrigger>
          <TabsTrigger value="tokens" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Token分析</TabsTrigger>
          <TabsTrigger value="performance" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">性能分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 小时分布图表 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-blue-400" />
                小时分布
              </CardTitle>
              <CardDescription className="text-gray-400">
                {period === 'today' ? '今天' : period === 'week' ? '本周' : '本月'}的调用时间分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.hourlyDistribution.map((hour) => (
                  <div key={hour.hour} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-white">
                      {hour.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${usageStats.totalCalls > 0 ? (hour.calls / Math.max(...usageStats.hourlyDistribution.map(h => h.calls))) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-white">{hour.calls}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top 模型和错误类型 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Top 模型</CardTitle>
                <CardDescription className="text-gray-400">
                  使用最多的模型排行
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats.topModels.slice(0, 5).map((model, index) => (
                    <div key={model.name} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{model.name.split('/').pop() || model.name}</span>
                          <span className="text-sm text-gray-400">{model.calls} 次</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${model.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-12">
                            {model.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">错误类型分布</CardTitle>
                <CardDescription className="text-gray-400">
                  常见错误类型统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats.errorTypes.length > 0 ? (
                    usageStats.errorTypes.slice(0, 5).map((error, index) => (
                      <div key={error.type} className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-6 h-6 bg-red-500/20 rounded-full text-xs font-semibold text-red-400">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{error.type}</span>
                            <span className="text-sm text-gray-400">{error.count} 次</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${error.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-12">
                              {error.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      暂无错误记录
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {/* 模型详细统计 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-green-400" />
                模型使用统计
              </CardTitle>
              <CardDescription className="text-gray-400">
                各模型的详细使用情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.topModels.map((model, index) => (
                  <div key={model.name} className="p-4 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{model.name}</h4>
                          <p className="text-sm text-gray-400">
                            使用率: {model.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{model.calls} 次调用</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          {/* Token使用分析 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Token使用分析</CardTitle>
              <CardDescription className="text-gray-400">
                各Token的调用分布情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.topTokens.length > 0 ? (
                  usageStats.topTokens.map((token, index) => (
                    <div key={token.id} className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-purple-500/20 rounded-full text-xs font-semibold text-purple-400">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{token.name}</h4>
                          <p className="text-sm text-gray-400">
                            使用率: {token.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{token.calls} 次调用</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    暂无Token使用记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* 性能概览 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">性能概览</CardTitle>
              <CardDescription className="text-gray-400">
                系统性能指标总览
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">平均响应时间</span>
                    <span className="text-white font-medium">
                      {(usageStats.averageResponseTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">成功率</span>
                    <span className="text-white font-medium">
                      {usageStats.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">总调用次数</span>
                    <span className="text-white font-medium">
                      {usageStats.totalCalls.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">成功调用</span>
                    <span className="text-green-400 font-medium">
                      {usageStats.successfulCalls.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">失败调用</span>
                    <span className="text-red-400 font-medium">
                      {usageStats.failedCalls.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">Token使用量</span>
                    <span className="text-white font-medium">
                      {usageStats.totalTokensUsed.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
