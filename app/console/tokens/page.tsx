'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Coins,
  Plus,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Power,
  PowerOff,
  Trash2,
  RefreshCw,
  Copy,
  RotateCcw,
  Info
} from 'lucide-react'
import { useTokens } from '@/lib/hooks/use-tokens'
import { toast } from 'sonner'

export default function TokensPage() {
  const { tokens, stats, loading, error, refetch, createToken, updateToken, deleteToken, resetTokenUsage } = useTokens()

  // 对话框状态
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [batchAddDialogOpen, setBatchAddDialogOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<any>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '', // 仅用于编辑时
    key: '',
    limitPerDay: 1000
  })

  // 批量添加表单状态
  const [batchFormData, setBatchFormData] = useState({
    tokens: '',
    limitPerDay: 1000
  })

  // 编辑模式标识
  const [isEditMode, setIsEditMode] = useState(false)

  // 获取Token显示名称（后4位）
  const getTokenDisplayName = (tokenValue: string, index: number) => {
    if (tokenValue && tokenValue.includes('...')) {
      // 已经是脱敏的格式，提取后8位，取最后4位
      const parts = tokenValue.split('...')
      const suffix = parts[1] || '0000'
      return suffix.slice(-4)
    }
    // 如果没有脱敏格式，使用默认
    return `token${index + 1}`
  }

  // 获取Token圆形显示（后4位）
  const getTokenCircleDisplay = (tokenValue: string) => {
    if (tokenValue && tokenValue.includes('...')) {
      const parts = tokenValue.split('...')
      const suffix = parts[1] || '0000'
      return suffix.slice(-4)
    }
    return '****'
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      limitPerDay: 1000
    })
    setIsEditMode(false)
  }

  // 处理添加Token
  const handleAddToken = async () => {
    if (!formData.key) {
      toast.error('请填写Token密钥')
      return
    }

    // 自动生成Token名称（后4位）
    const keyParts = formData.key.split('-')
    const lastPart = keyParts[keyParts.length - 1] || ''
    const tokenName = lastPart.slice(-4) || '0000'

    const result = await createToken({
      name: tokenName,
      key: formData.key,
      limitPerDay: formData.limitPerDay
    })

    if (result.success) {
      toast.success(`Token添加成功，名称：${tokenName}`)
      setAddDialogOpen(false)
      resetForm()
    } else {
      toast.error(result.error || '添加失败')
    }
  }

  // 处理编辑Token
  const handleEditToken = async () => {
    if (!selectedToken) return

    // 构建更新数据
    const updateData: any = {
      name: formData.name,
      limitPerDay: formData.limitPerDay
    }

    // 如果Token密钥有变化，也更新密钥
    if (formData.key && formData.key !== selectedToken.value) {
      updateData.value = formData.key
    }

    const result = await updateToken(selectedToken.id, updateData)

    if (result.success) {
      toast.success('Token更新成功')
      setEditDialogOpen(false)
      setSelectedToken(null)
      setIsEditMode(false)
      resetForm()
    } else {
      toast.error(result.error || '更新失败')
    }
  }

  // 处理切换Token状态
  const handleToggleToken = async (token: any) => {
    const result = await updateToken(token.id, {
      isActive: !token.isActive
    })

    if (result.success) {
      toast.success(`Token已${token.isActive ? '停用' : '启用'}`)
    } else {
      toast.error(result.error || '操作失败')
    }
  }

  // 处理删除Token
  const handleDeleteToken = async () => {
    if (!selectedToken) return

    const result = await deleteToken(selectedToken.id)
    if (result.success) {
      toast.success('Token删除成功')
      setDeleteDialogOpen(false)
      setSelectedToken(null)
    } else {
      toast.error(result.error || '删除失败')
    }
  }

  // 打开删除确认对话框
  const openDeleteDialog = (token: any) => {
    setSelectedToken(token)
    setDeleteDialogOpen(true)
  }

  // 处理批量添加Token
  const handleBatchAddTokens = async () => {
    if (!batchFormData.tokens.trim()) {
      toast.error('请输入Token密钥')
      return
    }

    // 解析Token列表（按行分割）
    const tokenLines = batchFormData.tokens.trim().split('\n').filter(line => line.trim())
    const results = []
    let successCount = 0
    let failCount = 0

    for (const tokenKey of tokenLines) {
      const trimmedKey = tokenKey.trim()
      if (!trimmedKey) continue

      // 自动生成Token名称
      const keyParts = trimmedKey.split('-')
      const lastPart = keyParts[keyParts.length - 1] || ''
      const tokenName = lastPart.slice(-4) || '0000'

      const result = await createToken({
        name: tokenName,
        key: trimmedKey,
        limitPerDay: batchFormData.limitPerDay
      })

      if (result.success) {
        successCount++
      } else {
        failCount++
        results.push(`${tokenName}: ${result.error}`)
      }
    }

    // 显示结果
    if (successCount > 0) {
      toast.success(`成功添加 ${successCount} 个Token`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} 个Token添加失败`)
    }

    if (successCount > 0) {
      setBatchAddDialogOpen(false)
      setBatchFormData({ tokens: '', limitPerDay: 1000 })
    }
  }

  // 处理重置使用量
  const handleResetUsage = async (token: any) => {
    if (!confirm(`确定要重置Token "${token.name}" 的今日使用量吗？`)) {
      return
    }

    const result = await resetTokenUsage(token.id)
    if (result.success) {
      toast.success('使用量重置成功')
    } else {
      toast.error(result.error || '重置失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = async (token: any) => {
    setSelectedToken(token)

    // 获取完整Token值
    try {
      const response = await fetch(`/api/tokens/${token.id}/full`)
      const result = await response.json()

      if (result.success && result.data.value) {
        setFormData({
          name: result.data.name, // 使用API返回的实际名称
          key: result.data.value, // 显示完整Token值
          limitPerDay: token.limitPerDay
        })
      } else {
        // 如果获取失败，使用脱敏值
        setFormData({
          name: token.name, // 使用当前Token的实际名称
          key: token.value,
          limitPerDay: token.limitPerDay
        })
        toast.error('获取完整Token失败，显示脱敏值')
      }
    } catch (error) {
      // 如果请求失败，使用脱敏值
      setFormData({
        name: token.name, // 使用当前Token的实际名称
        key: token.value,
        limitPerDay: token.limitPerDay
      })
      toast.error('获取完整Token失败')
    }

    setIsEditMode(true)
    setEditDialogOpen(true)
  }

  // 打开详情对话框
  const openDetailDialog = (token: any) => {
    setSelectedToken(token)
    setDetailDialogOpen(true)
  }

  // 复制Token - 需要获取完整Token
  const copyToken = async (tokenId: number) => {
    try {
      // 调用API获取完整Token
      const response = await fetch(`/api/tokens/${tokenId}/full`)
      const result = await response.json()

      if (result.success && result.data.value) {
        await navigator.clipboard.writeText(result.data.value)
        toast.success('完整Token已复制到剪贴板')
      } else {
        toast.error('获取完整Token失败')
      }
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 批量更新Token名称格式
  const updateTokenNames = async () => {
    try {
      const response = await fetch('/api/tokens/update-names', {
        method: 'POST'
      })
      const result = await response.json()

      if (result.success) {
        toast.success(`已更新 ${result.updatedCount} 个Token的名称格式`)
        refetch() // 重新获取数据
      } else {
        toast.error(result.error || '更新失败')
      }
    } catch (error) {
      toast.error('更新Token名称失败')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        <CheckCircle className="w-3 h-3 mr-1" />活跃
      </Badge>
    ) : (
      <Badge className="bg-gray-600 hover:bg-gray-700 text-white">
        <AlertCircle className="w-3 h-3 mr-1" />停用
      </Badge>
    )
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return limit > 0 ? Math.round((used / limit) * 100) : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Token管理</h1>
          <p className="text-muted-foreground">加载Token数据中...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
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
          <h1 className="text-3xl font-bold tracking-tight">Token管理</h1>
          <p className="text-muted-foreground">管理您的API Token，监控使用情况和配置限制</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>加载Token失败: {error}</span>
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
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
              <Coins className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">API Token管理</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Token管理
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              管理您的API Token，监控使用情况和配置限制，确保API访问的安全性
            </p>
          </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={batchAddDialogOpen} onOpenChange={(open) => {
            setBatchAddDialogOpen(open)
            if (!open) {
              setBatchFormData({ tokens: '', limitPerDay: 1000 })
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                <span className="button-text">批量添加</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">批量添加Token</DialogTitle>
                <DialogDescription className="text-gray-400">
                  一次性添加多个API Token，每行一个Token密钥
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="batch-tokens" className="text-gray-300">Token密钥列表</Label>
                  <Textarea
                    id="batch-tokens"
                    value={batchFormData.tokens}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, tokens: e.target.value }))}
                    placeholder="请输入Token密钥，每行一个：&#10;sk-abc...&#10;sk-def...&#10;sk-ghi..."
                    className="min-h-[200px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    每行输入一个完整的Token密钥，名称将自动生成为后4位字符
                  </p>
                </div>
                <div>
                  <Label htmlFor="batch-limit" className="text-gray-300">RPM限制 (每分钟请求数)</Label>
                  <Input
                    id="batch-limit"
                    type="number"
                    value={batchFormData.limitPerDay}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, limitPerDay: parseInt(e.target.value) || 1000 }))}
                    placeholder="1000"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    RPM (Requests Per Minute): 每分钟最大请求次数<br/>
                    例如：1000表示每分钟最多1000次请求，理论上一天最多可发送1,440,000次请求
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setBatchAddDialogOpen(false)}>
                    <span className="button-text">取消</span>
                  </Button>
                  <Button onClick={handleBatchAddTokens}>
                    <span className="button-text">批量添加</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addDialogOpen} onOpenChange={(open) => {
            setAddDialogOpen(open)
            if (!open) {
              resetForm() // 关闭时重置表单
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                <span className="button-text">添加Token</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">添加新Token</DialogTitle>
                <DialogDescription className="text-gray-400">
                  添加一个新的API Token来访问SiliconFlow服务
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key" className="text-gray-300">Token密钥</Label>
                  <Textarea
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="请输入完整的Token密钥，例如：sk-..."
                    className="min-h-[80px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Token名称将自动生成为Token密钥的后4位字符
                  </p>
                </div>
                <div>
                  <Label htmlFor="limit" className="text-gray-300">RPM限制 (每分钟请求数)</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={formData.limitPerDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, limitPerDay: parseInt(e.target.value) || 1000 }))}
                    placeholder="1000"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    RPM (Requests Per Minute): 每分钟最大请求次数<br/>
                    例如：1000表示每分钟最多1000次请求，理论上一天最多可发送1,440,000次请求
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    <span className="button-text">取消</span>
                  </Button>
                  <Button onClick={handleAddToken}>
                    <span className="button-text">添加Token</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* RPM/TPM 概念说明卡片 */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50 backdrop-blur-sm mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" />
            RPM 和 TPM 概念说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h4 className="font-semibold text-blue-400 mb-2">RPM (Requests Per Minute)</h4>
              <p className="text-sm text-gray-300">
                每分钟最大请求次数。例如：RPM为1000表示每分钟最多可发送1000次API请求。
              </p>
              <p className="text-xs text-gray-400 mt-1">
                理论上一天最多：1000 × 60 × 24 = 1,440,000次请求
              </p>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h4 className="font-semibold text-purple-400 mb-2">TPM (Tokens Per Minute)</h4>
              <p className="text-sm text-gray-300">
                每分钟最大token数，与请求数量无关，而是与每次prompt或返回的token长度有关。
              </p>
              <p className="text-xs text-gray-400 mt-1">
                例如：TPM为50000，单次请求2000 tokens，则每分钟最多25次请求
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">总Token数</CardTitle>
            <Coins className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalTokens || 0}</div>
            <p className="text-xs text-gray-400">
              {stats?.activeTokens || 0} 个活跃
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">今日总调用</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsageToday || 0}</div>
            <p className="text-xs text-gray-400">
              总RPM: {stats?.totalLimitPerDay || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">平均使用率</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.averageUsageRate || 0}%</div>
            <p className="text-xs text-gray-400">
              负载均衡良好
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">最后活动</CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.lastActivity.time ? new Date(stats.lastActivity.time).toLocaleString('zh-CN') : '无'}
            </div>
            <p className="text-xs text-gray-400">
              {stats?.lastActivity.tokenName || '暂无活动'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Token列表</h2>
        <div className="grid gap-4">
          {tokens.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white">暂无Token</h3>
                  <p className="text-gray-400 mb-4">添加您的第一个API Token开始使用</p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="button-text">添加Token</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            tokens.map((token, index) => {
              const displayName = getTokenDisplayName(token.value, index)
              const circleDisplay = getTokenCircleDisplay(token.value)

              return (
                <Card key={token.id} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full">
                          <span className="text-sm font-semibold text-blue-400">
                            {circleDisplay}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{displayName}</CardTitle>
                          <CardDescription className="text-gray-400">创建于 {new Date(token.createdAt).toLocaleDateString('zh-CN')}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(token.isActive)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium text-gray-300">今日使用</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {token.usageToday}
                        </p>
                        <p className="text-xs text-gray-400">
                          RPM限制: {token.limitPerDay}/分钟
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">使用率</p>
                        <p className="text-2xl font-bold text-white">
                          {getUsagePercentage(token.usageToday, token.limitPerDay)}%
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              getUsagePercentage(token.usageToday, token.limitPerDay) > 80 ? 'bg-red-500' :
                              getUsagePercentage(token.usageToday, token.limitPerDay) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(getUsagePercentage(token.usageToday, token.limitPerDay), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">最后使用</p>
                        <p className="text-lg font-semibold text-white">
                          {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleString('zh-CN') : '从未使用'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailDialog(token)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="button-text">详情</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(token)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="button-text">编辑</span>
                        </Button>
                        <Button
                          variant={token.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleToken(token)}
                        >
                          {token.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-1" />
                              <span className="button-text">停用</span>
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-1" />
                              <span className="button-text">启用</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* 编辑Token对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) {
          resetForm() // 关闭时重置表单
          setSelectedToken(null)
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">编辑Token</DialogTitle>
            <DialogDescription className="text-gray-400">
              修改Token的名称、密钥和RPM限制
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-gray-300">Token名称</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Token名称"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-key" className="text-gray-300">Token密钥</Label>
              <Textarea
                id="edit-key"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="sk-..."
                className="min-h-[80px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                修改Token密钥将更新API访问凭证
              </p>
            </div>
            <div>
              <Label htmlFor="edit-limit" className="text-gray-300">RPM限制 (每分钟请求数)</Label>
              <Input
                id="edit-limit"
                type="number"
                value={formData.limitPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, limitPerDay: parseInt(e.target.value) || 1000 }))}
                placeholder="1000"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                RPM (Requests Per Minute): 每分钟最大请求次数<br/>
                例如：1000表示每分钟最多1000次请求，理论上一天最多可发送1,440,000次请求
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setEditDialogOpen(false)
                resetForm()
              }}>
                <span className="button-text">取消</span>
              </Button>
              <Button onClick={handleEditToken}>
                <span className="button-text">保存更改</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Token详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Token详情</DialogTitle>
            <DialogDescription className="text-gray-400">
              查看Token的详细信息和使用统计
            </DialogDescription>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-gray-300">Token名称</Label>
                  <p className="text-sm font-medium text-white">
                    {selectedToken.name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">状态</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedToken.isActive)}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Token值</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-800 text-gray-300 px-2 py-1 rounded flex-1">
                      {selectedToken.value}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await copyToken(selectedToken.id)
                      }}
                      title="复制完整Token"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    点击复制按钮将复制完整的Token密钥
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">创建时间</Label>
                  <p className="text-sm text-white">{new Date(selectedToken.createdAt).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <Label className="text-gray-300">今日使用量</Label>
                  <p className="text-sm font-medium text-white">
                    {selectedToken.usageToday} 次 (RPM限制: {selectedToken.limitPerDay}/分钟)
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">最后使用</Label>
                  <p className="text-sm text-white">
                    {selectedToken.lastUsedAt ? new Date(selectedToken.lastUsedAt).toLocaleString('zh-CN') : '从未使用'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleResetUsage(selectedToken)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    <span className="button-text">重置使用量</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setDetailDialogOpen(false)
                      await openEditDialog(selectedToken)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="button-text">编辑</span>
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailDialogOpen(false)
                    openDeleteDialog(selectedToken)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="button-text">删除Token</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">确认删除Token</DialogTitle>
            <DialogDescription className="text-gray-400">
              您确定要删除这个Token吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          {selectedToken && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full">
                  <span className="text-sm font-semibold text-blue-400">
                    {getTokenCircleDisplay(selectedToken.value)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{selectedToken.name}</p>
                  <p className="text-sm text-gray-400">
                    创建于 {new Date(selectedToken.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              <span className="button-text">取消</span>
            </Button>
            <Button variant="destructive" onClick={handleDeleteToken}>
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="button-text">确认删除</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
