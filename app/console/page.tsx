'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Key,
  BarChart3,
  Settings,
  Activity,
  Database,
  FileText,
  Users,
  Server,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

// 快捷操作卡片
const quickActions = [
  {
    title: 'Token管理',
    description: '管理API访问令牌',
    href: '/console/tokens',
    icon: Key,
    color: 'bg-blue-600/20 text-blue-400 border-blue-600/30'
  },
  {
    title: '统计概览',
    description: '查看系统统计数据',
    href: '/console/stats',
    icon: BarChart3,
    color: 'bg-green-600/20 text-green-400 border-green-600/30'
  },
  {
    title: '实时监控',
    description: '实时系统监控',
    href: '/console/stats/realtime',
    icon: Database,
    color: 'bg-purple-600/20 text-purple-400 border-purple-600/30'
  },
  {
    title: '系统设置',
    description: '配置系统参数',
    href: '/console/settings',
    icon: Settings,
    color: 'bg-orange-600/20 text-orange-400 border-orange-600/30'
  }
]

// 系统状态指标
const systemMetrics = [
  {
    title: '在线用户',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'text-blue-400'
  },
  {
    title: '服务器状态',
    value: '正常',
    change: '99.9%',
    icon: Server,
    color: 'text-green-400'
  },
  {
    title: 'API调用',
    value: '45.2K',
    change: '+8.5%',
    icon: Zap,
    color: 'text-yellow-400'
  },
  {
    title: '响应时间',
    value: '125ms',
    change: '-5ms',
    icon: TrendingUp,
    color: 'text-purple-400'
  }
]

export default function ConsolePage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">管理控制台</h1>
          <p className="text-gray-400">
            欢迎使用 SiliconFlow 管理控制台 - {currentTime.toLocaleString('zh-CN')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 border border-red-600/30">
          <Shield className="h-5 w-5 text-red-400" />
          <span className="text-red-400 font-medium">管理员权限</span>
        </div>
      </div>

      {/* 系统状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{metric.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-800/50 ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快捷操作 */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            快捷操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className={`bg-gray-800/50 border-gray-700 hover:bg-gray-800 transition-all duration-200 cursor-pointer group ${action.color.includes('border') ? action.color : 'hover:border-gray-600'}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${action.color.split(' ')[0]} ${action.color.split(' ')[1]}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近活动 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">新用户注册</p>
                  <p className="text-xs text-gray-400">2分钟前</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">API调用峰值</p>
                  <p className="text-xs text-gray-400">5分钟前</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">系统更新完成</p>
                  <p className="text-xs text-gray-400">1小时前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 系统警告 */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              系统警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/30">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm text-white">磁盘空间不足</p>
                  <p className="text-xs text-gray-400">剩余空间: 15%</p>
                </div>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-400">暂无其他警告</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
