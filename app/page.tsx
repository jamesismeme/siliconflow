import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Zap, Shield, BarChart3, ArrowRight, Sparkles, Brain, Code, MessageSquare, Image, Mic, FileText, Key, Settings, History } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* 导航栏 */}
      <nav className="relative z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-blue-400" />
                <div className="absolute inset-0 h-8 w-8 text-blue-400 animate-pulse opacity-50" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SiliconFlow Platform
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/console">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="button-text">后台管理</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button>
                  <span className="button-text">进入控制台</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">18个免费AI模型 • 企业级稳定性</span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                下一代
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
                AI 模型平台
              </span>
            </h1>

            {/* 副标题 */}
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              集成 SiliconFlow 全栈AI能力，从对话到图像生成，从语音处理到文本分析。
              <br className="hidden md:block" />
              <span className="text-gray-300">为开发者打造的专业级AI基础设施。</span>
            </p>

            {/* 提示信息 */}
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-12">
              <Key className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-300">
                开始前请先配置您的 SiliconFlow API Token
              </span>
            </div>

            {/* CTA按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/dashboard">
                <Button size="lg">
                  <span className="button-text">开始构建</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/console">
                <Button variant="outline" size="lg" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400">
                  <Key className="mr-2 h-5 w-5" />
                  <span className="button-text">配置 Token</span>
                </Button>
              </Link>
              <Link href="/dashboard/models">
                <Button variant="outline" size="lg">
                  <span className="button-text">探索模型</span>
                </Button>
              </Link>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">18+</div>
                <div className="text-sm text-gray-400">AI模型</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">7</div>
                <div className="text-sm text-gray-400">能力类别</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-sm text-gray-400">可用性</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">&lt;2s</div>
                <div className="text-sm text-gray-400">响应时间</div>
              </div>
            </div>
          </div>
        </div>

        {/* 特性卡片 */}
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">为什么选择我们</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              企业级的AI基础设施，为您的应用提供强大而稳定的AI能力支持
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <Bot className="h-12 w-12 text-blue-400 mx-auto" />
                  <div className="absolute inset-0 h-12 w-12 text-blue-400 mx-auto animate-pulse opacity-30 group-hover:opacity-50" />
                </div>
                <CardTitle className="text-white text-xl">18个免费模型</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  涵盖对话、推理、嵌入、重排序、语音、生图、代码等7大类AI能力
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <Zap className="h-12 w-12 text-yellow-400 mx-auto" />
                  <div className="absolute inset-0 h-12 w-12 text-yellow-400 mx-auto animate-pulse opacity-30 group-hover:opacity-50" />
                </div>
                <CardTitle className="text-white text-xl">高速稳定</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  智能Token轮询，确保高可用性和快速响应，平均响应时间小于2秒
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <Shield className="h-12 w-12 text-green-400 mx-auto" />
                  <div className="absolute inset-0 h-12 w-12 text-green-400 mx-auto animate-pulse opacity-30 group-hover:opacity-50" />
                </div>
                <CardTitle className="text-white text-xl">安全可靠</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  支持自定义API配置，数据加密传输，完善的错误处理和监控
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <BarChart3 className="h-12 w-12 text-purple-400 mx-auto" />
                  <div className="absolute inset-0 h-12 w-12 text-purple-400 mx-auto animate-pulse opacity-30 group-hover:opacity-50" />
                </div>
                <CardTitle className="text-white text-xl">实时监控</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  详细的使用统计，实时监控面板，帮助您优化AI应用性能
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 支持的AI能力 */}
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">全栈AI能力</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              从对话交互到内容创作，从数据分析到智能决策，一站式AI解决方案
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { name: '智能对话', icon: MessageSquare, desc: '多轮对话、角色扮演' },
              { name: '数学推理', icon: Brain, desc: '逻辑推理、问题求解' },
              { name: '代码生成', icon: Code, desc: '代码编写、调试优化' },
              { name: '文本嵌入', icon: FileText, desc: '语义理解、相似度计算' },
              { name: '语义重排', icon: BarChart3, desc: '内容排序、相关性分析' },
              { name: '语音识别', icon: Mic, desc: '语音转文字、多语言' },
              { name: '图像生成', icon: Image, desc: 'AI绘画、创意设计' },
              { name: '多语言支持', icon: Bot, desc: '全球化、本地化' }
            ].map((capability, index) => {
              const IconComponent = capability.icon
              return (
                <div
                  key={capability.name}
                  className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <IconComponent className="h-8 w-8 text-blue-400 mb-4 group-hover:text-blue-300 transition-colors" />
                    <h3 className="text-white font-semibold mb-2">{capability.name}</h3>
                    <p className="text-gray-400 text-sm">{capability.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="relative bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-3xl p-12 md:p-16 text-center border border-gray-700/50 backdrop-blur-sm overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                准备开始构建了吗？
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                立即体验强大的AI模型调用平台，开启您的AI应用之旅。
                <br className="hidden md:block" />
                免费使用，无需信用卡，即刻开始。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                    <span className="button-text">免费开始使用</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/console">
                  <Button variant="outline" size="lg" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400">
                    <Key className="mr-2 h-5 w-5" />
                    <span className="button-text">添加 API Token</span>
                  </Button>
                </Link>
                <Link href="/dashboard/models">
                  <Button variant="outline" size="lg">
                    <span className="button-text">查看文档</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="relative border-t border-gray-800/50 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">SiliconFlow Platform</span>
              </div>
              <p className="text-gray-400 max-w-md">
                为开发者打造的专业级AI基础设施，集成全栈AI能力，助力您构建下一代智能应用。
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard/models/chat" className="hover:text-white transition-colors">对话模型</Link></li>
                <li><Link href="/dashboard/models/image" className="hover:text-white transition-colors">图像生成</Link></li>
                <li><Link href="/dashboard/models/audio" className="hover:text-white transition-colors">语音处理</Link></li>
                <li><Link href="/dashboard/models/text" className="hover:text-white transition-colors">文本处理</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">平台</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">控制台</Link></li>
                <li><Link href="/console/tokens" className="hover:text-white transition-colors">Token管理</Link></li>
                <li><Link href="/console/stats" className="hover:text-white transition-colors">使用统计</Link></li>
                <li><Link href="/console/stats/usage" className="hover:text-white transition-colors">调用历史</Link></li>
                <li><Link href="/console/settings" className="hover:text-white transition-colors">系统设置</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2024 SiliconFlow Platform. 基于 SiliconFlow API 构建.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Powered by</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">SiliconFlow API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
