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
import { useStats } from '@/lib/hooks/use-stats'
import { TrendChart } from '@/components/stats/trend-chart'
import { CustomPieChart } from '@/components/stats/pie-chart'
import { CustomBarChart } from '@/components/stats/bar-chart'

export default function StatsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const { data: stats, loading, error, refetch } = useStats(period)

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
    ? Math.round(stats.overview.successRate * 100) / 100
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
              查看系统使用统计、性能指标和趋势分析，全面掌握平台运行状况
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
              {stats.overview.successfulCalls}/{stats.overview.totalCalls} 成功
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
              {(stats.overview.avgResponseTime / 1000).toFixed(2)}s
            </div>
            <p className="text-xs text-gray-400">
              最快 {(stats.overview.minResponseTime / 1000).toFixed(2)}s | 最慢 {(stats.overview.maxResponseTime / 1000).toFixed(2)}s
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">活跃模型</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.models.length}</div>
            <p className="text-xs text-gray-400">
              共18个可用模型
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
              {stats.tokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      token.status === 'healthy' ? 'bg-green-500' :
                      token.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-white">{token.name}</h4>
                      <p className="text-sm text-gray-400">
                        今日 {token.callsInPeriod} 次调用
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {token.usageToday}/{token.limitPerDay}
                    </div>
                    <div className="text-xs text-gray-400">
                      RPM限制: {token.limitPerDay}/分钟
                    </div>
                  </div>
                </div>
              ))}
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
              {stats.models.slice(0, 5).map((model, index) => (
                <div key={model.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate text-white">{model.name}</h4>
                      <p className="text-sm text-gray-400">
                        平均响应: {(model.avgResponseTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{model.calls} 次</div>
                    <div className="text-xs text-gray-400">
                      {model.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 24小时调用趋势和模型分布 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 24小时调用趋势图表 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              24小时调用趋势
            </CardTitle>
            <CardDescription className="text-gray-400">
              最近24小时的API调用量和成功率变化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={stats.trends.hourly}
              type="area"
              height={300}
              showResponseTime={false}
            />
          </CardContent>
        </Card>

        {/* 模型调用分布饼图 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              模型调用分布
            </CardTitle>
            <CardDescription className="text-gray-400">
              {period === 'today' ? '今日' : period === 'week' ? '本周' : '本月'}各模型调用占比
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomPieChart
              data={stats.models.slice(0, 6).map(model => ({
                name: model.name.split('/').pop() || model.name,
                value: model.calls
              }))}
              height={300}
              showLegend={true}
              innerRadius={40}
            />
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
              <Badge className={`${stats.overview.avgResponseTime < 3000 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} text-white`}>
                {stats.overview.avgResponseTime < 1000 ? "优秀" :
                 stats.overview.avgResponseTime < 3000 ? "良好" : "需优化"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Token健康状态</span>
              <Badge className={`${stats.tokens.filter(t => t.status === 'healthy').length > 0 ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}>
                {stats.tokens.filter(t => t.status === 'healthy').length}/{stats.tokens.length} 健康
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">成功率</span>
              <Badge className={`${successRate >= 95 ? "bg-green-600 hover:bg-green-700" : successRate >= 90 ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"} text-white`}>
                {successRate >= 95 ? "优秀" : successRate >= 90 ? "良好" : "需关注"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">活跃模型</span>
              <Badge className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600">
                {stats.models.length} 个模型
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
                <p className="text-gray-400">所有模型响应正常，成功率优秀</p>
              </div>
            ) : (
              <div className="text-sm">
                <p className="font-medium text-orange-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  成功率需关注
                </p>
                <p className="text-gray-400">当前成功率 {successRate}%，建议检查失败原因</p>
              </div>
            )}

            {/* Token使用建议 */}
            {stats.tokens.some(t => t.status === 'exhausted') ? (
              <div className="text-sm">
                <p className="font-medium text-red-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Token额度不足
                </p>
                <p className="text-gray-400">部分Token已达到限额，建议增加Token或重置额度</p>
              </div>
            ) : stats.tokens.some(t => t.status === 'warning') ? (
              <div className="text-sm">
                <p className="font-medium text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Token使用率较高
                </p>
                <p className="text-gray-400">部分Token使用率超过80%，建议监控使用情况</p>
              </div>
            ) : (
              <div className="text-sm">
                <p className="font-medium text-blue-400 flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  Token状态良好
                </p>
                <p className="text-gray-400">所有Token运行正常，负载均衡有效</p>
              </div>
            )}

            {/* 响应时间建议 */}
            {stats.overview.avgResponseTime > 5000 && (
              <div className="text-sm">
                <p className="font-medium text-orange-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  响应时间较慢
                </p>
                <p className="text-gray-400">平均响应时间超过5秒，建议优化网络或检查模型状态</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
