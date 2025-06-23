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
import { useUsageStats } from '@/lib/hooks/use-stats'
import { TrendChart } from '@/components/stats/trend-chart'
import { CustomBarChart } from '@/components/stats/bar-chart'
import { CustomPieChart } from '@/components/stats/pie-chart'

export default function UsageStatsPage() {
  const [days, setDays] = useState(7)
  const [activeTab, setActiveTab] = useState('overview')
  const { data: usageStats, loading, error, refetch } = useUsageStats(days)

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
              详细的使用数据分析和趋势 ({usageStats.timeRange.days}天数据)
            </p>
          </div>
        <div className="flex items-center space-x-2">
          <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="1" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">1天</SelectItem>
              <SelectItem value="3" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">3天</SelectItem>
              <SelectItem value="7" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">7天</SelectItem>
              <SelectItem value="14" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">14天</SelectItem>
              <SelectItem value="30" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">30天</SelectItem>
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
            <div className="text-2xl font-bold text-white">{usageStats.summary.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              {days}天内的总调用次数
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
              {usageStats.summary.totalCalls > 0
                ? ((usageStats.summary.successfulCalls / usageStats.summary.totalCalls) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-gray-400">
              {usageStats.summary.successfulCalls}/{usageStats.summary.totalCalls} 成功
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
              {(usageStats.summary.avgResponseTime / 1000).toFixed(2)}s
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
              {usageStats.summary.totalTokens.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">
              输入+输出Token总数
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
          {/* 每日趋势图表 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-blue-400" />
                每日调用趋势
              </CardTitle>
              <CardDescription className="text-gray-400">
                过去{days}天的调用量和成功率变化
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={usageStats.trends.daily.map(day => ({
                  time: day.date,
                  total: day.total,
                  success: day.success,
                  failed: day.failed,
                  avgResponseTime: day.avgResponseTime
                }))}
                type="line"
                height={350}
                showResponseTime={true}
              />
            </CardContent>
          </Card>

          {/* 成功率和响应时间对比 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">每日成功率</CardTitle>
                <CardDescription className="text-gray-400">
                  过去{days}天的成功率变化
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomBarChart
                  data={usageStats.trends.daily.map(day => ({
                    name: new Date(day.date).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric'
                    }),
                    value: Math.round(day.successRate),
                    color: day.successRate >= 95 ? '#82ca9d' : day.successRate >= 90 ? '#ffc658' : '#ff7c7c'
                  }))}
                  height={250}
                  showValues={true}
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Token消耗分布</CardTitle>
                <CardDescription className="text-gray-400">
                  过去{days}天的Token使用情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomBarChart
                  data={usageStats.trends.daily.map(day => ({
                    name: new Date(day.date).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric'
                    }),
                    value: day.totalTokens
                  }))}
                  height={250}
                  showValues={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {/* 模型调用量对比 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-green-400" />
                模型调用量对比
              </CardTitle>
              <CardDescription className="text-gray-400">
                各模型的调用量和成功失败分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomBarChart
                data={usageStats.models.slice(0, 8).map(model => ({
                  name: model.name.split('/').pop() || model.name,
                  value: model.total,
                  success: model.success,
                  failed: model.failed
                }))}
                type="stacked"
                height={350}
                showValues={false}
              />
            </CardContent>
          </Card>

          {/* 模型性能分析 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">模型成功率对比</CardTitle>
                <CardDescription className="text-gray-400">
                  各模型的成功率表现
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomBarChart
                  data={usageStats.models.slice(0, 6).map(model => ({
                    name: model.name.split('/').pop() || model.name,
                    value: Math.round(model.successRate),
                    color: model.successRate >= 95 ? '#82ca9d' : model.successRate >= 90 ? '#ffc658' : '#ff7c7c'
                  }))}
                  height={250}
                  showValues={true}
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">模型响应时间对比</CardTitle>
                <CardDescription className="text-gray-400">
                  各模型的平均响应时间
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomBarChart
                  data={usageStats.models.slice(0, 6).map(model => ({
                    name: model.name.split('/').pop() || model.name,
                    value: Math.round(model.avgResponseTime / 1000 * 100) / 100, // 转换为秒并保留2位小数
                    color: model.avgResponseTime < 3000 ? '#82ca9d' : model.avgResponseTime < 10000 ? '#ffc658' : '#ff7c7c'
                  }))}
                  height={250}
                  showValues={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* 模型详细列表 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">模型详细统计</CardTitle>
              <CardDescription className="text-gray-400">
                各模型的详细性能数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.models.map((model, index) => (
                  <div key={model.name} className="p-4 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{model.name}</h4>
                          <p className="text-sm text-gray-400">
                            平均响应: {(model.avgResponseTime / 1000).toFixed(2)}s
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{model.total} 次调用</div>
                        <Badge className={`${model.successRate >= 95 ? "bg-green-600 hover:bg-green-700" : model.successRate >= 90 ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"} text-white`}>
                          {model.successRate.toFixed(1)}% 成功
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">成功: </span>
                        <span className="font-medium text-green-400">{model.success}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">失败: </span>
                        <span className="font-medium text-red-400">{model.failed}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Token: </span>
                        <span className="font-medium text-white">{model.totalTokens.toLocaleString()}</span>
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
                各Token的调用分布和性能表现
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.tokens.map((token) => (
                  <div key={token.tokenId} className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{token.name}</h4>
                      <p className="text-sm text-gray-400">
                        平均响应: {(token.avgResponseTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{token.total} 次调用</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-400">{token.success} 成功</span>
                        <span className="text-red-400">{token.failed} 失败</span>
                        <Badge className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600">
                          {token.successRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* 响应时间分布 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">响应时间分布</CardTitle>
              <CardDescription className="text-gray-400">
                调用响应时间的分布情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.responseTimeDistribution.map((range) => (
                  <div key={range.label} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-white">{range.label}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${range.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-white">{range.count}</span>
                        <span className="text-xs text-gray-400 w-12">
                          {range.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
