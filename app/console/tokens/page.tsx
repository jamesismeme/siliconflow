'use client'

import { useState, useEffect } from 'react'
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
  Edit,
  Trash2,
  RefreshCw,
  Copy,
  Download,
  Upload,
  Power,
  PowerOff
} from 'lucide-react'
import { useTokenStore, useTokenActions } from '@/lib/stores/token-store'
import { toast } from 'sonner'

export default function TokensPage() {
  const tokens = useTokenStore(state => state.tokens)
  const stats = useTokenStore(state => state.stats)
  const loading = useTokenStore(state => state.loading)
  const error = useTokenStore(state => state.error)
  
  const {
    loadTokens,
    addToken,
    updateToken,
    removeToken,
    toggleTokenStatus,
    validateToken,
    getTokenDisplayValue,
    isTokenNearLimit,
    exportTokens,
    importTokens,
    clearAllTokens
  } = useTokenActions()

  // 初始化加载
  useEffect(() => {
    loadTokens()
  }, [loadTokens])

  // 对话框状态
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<any>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    limitPerDay: 1000
  })

  // 导入数据
  const [importData, setImportData] = useState('')

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      limitPerDay: 1000
    })
  }

  // 处理添加Token
  const handleAddToken = async () => {
    if (!formData.value) {
      toast.error('请填写Token密钥')
      return
    }

    // 验证 Token 格式
    const validation = validateToken(formData.value)
    if (!validation.isValid) {
      toast.error(validation.error || 'Token 格式不正确')
      return
    }

    const result = await addToken({
      name: formData.name || `Token-${Date.now()}`,
      value: formData.value,
      limitPerDay: formData.limitPerDay,
      isActive: true
    })

    if (result.success) {
      toast.success('Token添加成功')
      setAddDialogOpen(false)
      resetForm()
    } else {
      toast.error(result.error || '添加失败')
    }
  }

  // 处理编辑Token
  const handleEditToken = async () => {
    if (!selectedToken) return

    const result = await updateToken(selectedToken.id, {
      name: formData.name,
      value: formData.value,
      limitPerDay: formData.limitPerDay
    })

    if (result.success) {
      toast.success('Token更新成功')
      setEditDialogOpen(false)
      setSelectedToken(null)
      resetForm()
    } else {
      toast.error(result.error || '更新失败')
    }
  }

  // 处理切换Token状态
  const handleToggleToken = async (token: any) => {
    const result = await toggleTokenStatus(token.id)

    if (result.success) {
      toast.success(`Token已${token.isActive ? '停用' : '启用'}`)
    } else {
      toast.error(result.error || '操作失败')
    }
  }

  // 处理删除Token
  const handleDeleteToken = async () => {
    if (!selectedToken) return

    const result = await removeToken(selectedToken.id)
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

  // 打开编辑对话框
  const openEditDialog = (token: any) => {
    setSelectedToken(token)
    setFormData({
      name: token.name,
      value: token.value,
      limitPerDay: token.limitPerDay
    })
    setEditDialogOpen(true)
  }

  // 复制Token
  const copyToken = async (token: any) => {
    try {
      await navigator.clipboard.writeText(token.value)
      toast.success('Token已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 导出Token数据
  const handleExportTokens = () => {
    try {
      const data = exportTokens()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tokens-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Token数据已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  // 导入Token数据
  const handleImportTokens = async () => {
    if (!importData.trim()) {
      toast.error('请输入要导入的数据')
      return
    }

    try {
      const data = JSON.parse(importData)
      if (!Array.isArray(data)) {
        toast.error('导入数据格式不正确')
        return
      }

      const result = await importTokens(data)
      if (result.success) {
        toast.success(`成功导入 ${result.imported} 个Token`)
        if (result.failed > 0) {
          toast.warning(`${result.failed} 个Token导入失败`)
        }
        setImportDialogOpen(false)
        setImportData('')
      } else {
        toast.error('导入失败')
      }
    } catch (error) {
      toast.error('导入数据格式错误')
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
              <Button variant="outline" size="sm" onClick={loadTokens}>
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
              <span className="text-sm text-gray-300">本地 Token 管理</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Token管理
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              管理您的本地 API Token，所有数据存储在浏览器中，确保隐私安全
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadTokens}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleExportTokens}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  导入
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">导入Token数据</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    导入之前导出的Token数据
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-data" className="text-gray-300">JSON数据</Label>
                    <Textarea
                      id="import-data"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="粘贴导出的JSON数据..."
                      className="min-h-[200px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleImportTokens}>
                      导入
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={addDialogOpen} onOpenChange={(open) => {
              setAddDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加Token
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
                    <Label htmlFor="name" className="text-gray-300">Token名称</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="输入Token名称（可选）"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value" className="text-gray-300">Token密钥</Label>
                    <Textarea
                      id="value"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="sk-..."
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit" className="text-gray-300">每日限制</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={formData.limitPerDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, limitPerDay: parseInt(e.target.value) || 1000 }))}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleAddToken}>
                      添加
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">总Token数</CardTitle>
                <Coins className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalTokens}</div>
                <p className="text-xs text-gray-400">
                  活跃: {stats.activeTokens}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">今日使用</CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsageToday}</div>
                <p className="text-xs text-gray-400">
                  限制: {stats.totalLimitPerDay}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">使用率</CardTitle>
                <Activity className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.averageUsageRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-400">
                  平均使用率
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">最近活动</CardTitle>
                <Activity className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-white">
                  {stats.lastActivity.tokenName || '无'}
                </div>
                <p className="text-xs text-gray-400">
                  {stats.lastActivity.time ? new Date(stats.lastActivity.time).toLocaleString() : '暂无活动'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Token列表 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Token列表</h2>
            {tokens.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('确定要清空所有Token吗？此操作不可恢复。')) {
                    clearAllTokens()
                    toast.success('所有Token已清空')
                  }
                }}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                清空所有
              </Button>
            )}
          </div>

          {tokens.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">暂无Token</h3>
                  <p className="text-gray-400 mb-4">添加您的第一个API Token开始使用</p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加Token
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tokens.map((token) => (
                <Card key={token.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-400">
                              {getTokenDisplayValue(token).slice(-4)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-white truncate">
                              {token.name}
                            </h3>
                            {getStatusBadge(token.isActive)}
                            {isTokenNearLimit(token) && (
                              <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                接近限制
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {getTokenDisplayValue(token)}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-400">
                              今日使用: {token.usageToday}/{token.limitPerDay}
                            </span>
                            <span className="text-sm text-gray-400">
                              使用率: {getUsagePercentage(token.usageToday, token.limitPerDay)}%
                            </span>
                            {token.lastUsedAt && (
                              <span className="text-sm text-gray-400">
                                最后使用: {new Date(token.lastUsedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToken(token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleToken(token)}
                        >
                          {token.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(token)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(token)}
                          className="text-red-400 border-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) {
          setSelectedToken(null)
          resetForm()
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">编辑Token</DialogTitle>
            <DialogDescription className="text-gray-400">
              修改Token的配置信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-gray-300">Token名称</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-value" className="text-gray-300">Token密钥</Label>
              <Textarea
                id="edit-value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-limit" className="text-gray-300">每日限制</Label>
              <Input
                id="edit-limit"
                type="number"
                value={formData.limitPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, limitPerDay: parseInt(e.target.value) || 1000 }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleEditToken}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open)
        if (!open) setSelectedToken(null)
      }}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">删除Token</DialogTitle>
            <DialogDescription className="text-gray-400">
              确定要删除这个Token吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          {selectedToken && (
            <div className="py-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-red-400">
                      {getTokenDisplayValue(selectedToken).slice(-4)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{selectedToken.name}</h4>
                    <p className="text-sm text-gray-400">{getTokenDisplayValue(selectedToken)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleDeleteToken}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
