'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Zap,
  Clock,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Minus
} from 'lucide-react'
import { useStats } from '@/lib/hooks/use-stats'
import { TrendChart } from '@/components/stats/trend-chart'



export default function RealtimePage() {
  const { data: stats, loading, error, refetch } = useStats('today')

  // 获取系统状态
  const getSystemStatus = () => {
    if (!stats) return 'unknown'
    
    const successRate = stats.overview.totalCalls > 0 
      ? (stats.overview.successfulCalls / stats.overview.totalCalls * 100) 
      : 0
    
    const avgResponseTime = stats.overview.avgResponseTime
    const healthyTokens = stats.tokens.filter(t => t.status === 'healthy').length
    
    if (successRate >= 95 && avgResponseTime < 3000 && healthyTokens > 0) {
      return 'excellent'
    } else if (successRate >= 90 && avgResponseTime < 5000 && healthyTokens > 0) {
      return 'good'
    } else if (successRate >= 80 && healthyTokens > 0) {
      return 'warning'
    } else {
      return 'critical'
    }
  }

  const systemStatus = getSystemStatus()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '优秀'
      case 'good': return '良好'
      case 'warning': return '警告'
      case 'critical': return '严重'
      default: return '未知'
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">实时监控</h1>
          <p className="text-muted-foreground">系统实时状态监控和告警</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <span>加载实时数据失败: {error}</span>
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
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">实时监控</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                实时监控
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              系统实时状态监控和告警，掌握平台运行的每一个瞬间
            </p>
          </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="button-text">刷新</span>
          </Button>
        </div>
      </div>

      {/* 系统状态概览 */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {getStatusIcon(systemStatus)}
            系统状态: <span className={getStatusColor(systemStatus)}>{getStatusText(systemStatus)}</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            系统实时状态监控面板
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  <div className="h-8 bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {stats.overview.totalCalls}
                </div>
                <div className="text-sm text-gray-400">今日调用</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.overview.totalCalls > 0
                    ? ((stats.overview.successfulCalls / stats.overview.totalCalls) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-sm text-gray-400">成功率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {(stats.overview.avgResponseTime / 1000).toFixed(2)}s
                </div>
                <div className="text-sm text-gray-400">平均响应</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {stats.tokens.filter(t => t.status === 'healthy').length}/{stats.tokens.length}
                </div>
                <div className="text-sm text-gray-400">健康Token</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">暂无数据</div>
          )}
        </CardContent>
      </Card>

      {/* 实时指标 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 实时调用趋势 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-blue-400" />
              实时调用趋势
            </CardTitle>
            <CardDescription className="text-gray-400">
              最近24小时的调用量变化
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats && stats.trends.hourly.length > 0 ? (
              <TrendChart
                data={stats.trends.hourly.slice(-12)} // 显示最近12小时
                type="line"
                height={250}
                showResponseTime={false}
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                暂无趋势数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token状态监控 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Server className="h-5 w-5 text-green-400" />
              Token状态监控
            </CardTitle>
            <CardDescription className="text-gray-400">
              实时Token健康状态和使用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-3">
                {stats.tokens.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        token.status === 'healthy' ? 'bg-green-500 animate-pulse' :
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
            ) : (
              <div className="text-center text-gray-400">暂无Token数据</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 性能指标 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              响应性能
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">平均响应时间</span>
                  <Badge className={`${stats.overview.avgResponseTime < 3000 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} text-white`}>
                    {(stats.overview.avgResponseTime / 1000).toFixed(2)}s
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">最快响应</span>
                  <span className="text-sm font-medium text-white">
                    {(stats.overview.minResponseTime / 1000).toFixed(2)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">最慢响应</span>
                  <span className="text-sm font-medium text-white">
                    {(stats.overview.maxResponseTime / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">暂无性能数据</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-blue-400" />
              调用统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">成功调用</span>
                  <span className="text-sm font-medium text-green-400">
                    {stats.overview.successfulCalls}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">失败调用</span>
                  <span className="text-sm font-medium text-red-400">
                    {stats.overview.failedCalls}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">成功率</span>
                  <Badge className={`${
                    stats.overview.totalCalls > 0 &&
                    (stats.overview.successfulCalls / stats.overview.totalCalls * 100) >= 95
                      ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  } text-white`}>
                    {stats.overview.totalCalls > 0
                      ? ((stats.overview.successfulCalls / stats.overview.totalCalls) * 100).toFixed(1)
                      : 0}%
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">暂无调用数据</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-purple-400" />
              活跃模型
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats && stats.models.length > 0 ? (
              <div className="space-y-2">
                {stats.models.slice(0, 3).map((model, index) => (
                  <div key={model.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                        {index + 1}
                      </div>
                      <span className="text-sm truncate text-white">
                        {model.name.split('/').pop()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {model.calls}次
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">暂无模型数据</div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
