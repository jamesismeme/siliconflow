import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bot, 
  Coins, 
  BarChart3, 
  Settings,
  MessageSquare,
  Image,
  Mic,
  FileText,
  Activity,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">
          欢迎使用 SiliconFlow Platform，管理您的AI模型调用
        </p>
      </div>

      {/* 快速统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日调用</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% 较昨日
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              系统运行正常
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃Token</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              共3个Token可用
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均响应</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">
              响应速度良好
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 模型调用 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              模型调用
            </CardTitle>
            <CardDescription>
              快速调用各种AI模型，支持18个免费模型
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/models/chat">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  对话模型
                </Button>
              </Link>
              <Link href="/dashboard/models/image">
                <Button variant="outline" className="w-full justify-start">
                  <Image className="mr-2 h-4 w-4" />
                  图像生成
                </Button>
              </Link>
              <Link href="/dashboard/models/audio">
                <Button variant="outline" className="w-full justify-start">
                  <Mic className="mr-2 h-4 w-4" />
                  语音处理
                </Button>
              </Link>
              <Link href="/dashboard/models/text">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  文本处理
                </Button>
              </Link>
            </div>
            <Link href="/dashboard/models">
              <Button className="w-full">
                查看所有模型
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 系统管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              系统管理
            </CardTitle>
            <CardDescription>
              管理Token、查看统计和配置系统
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Link href="/dashboard/tokens">
                <Button variant="outline" className="w-full justify-start">
                  <Coins className="mr-2 h-4 w-4" />
                  Token管理
                </Button>
              </Link>
              <Link href="/dashboard/stats">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  统计面板
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  系统设置
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 推荐模型 */}
      <Card>
        <CardHeader>
          <CardTitle>推荐模型</CardTitle>
          <CardDescription>
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
                href: '/dashboard/models/chat'
              },
              {
                name: 'Kwai-Kolors/Kolors',
                category: '图像生成',
                description: '中文内容渲染优秀，适合创意图像生成',
                icon: Image,
                href: '/dashboard/models/image'
              },
              {
                name: 'BAAI/bge-m3',
                category: '文本嵌入',
                description: '多语言支持，适合语义搜索和匹配',
                icon: FileText,
                href: '/dashboard/models/text'
              },
              {
                name: 'SenseVoiceSmall',
                category: '语音识别',
                description: '多语言ASR，速度比Whisper快15倍',
                icon: Mic,
                href: '/dashboard/models/audio'
              },
              {
                name: 'Qwen2.5-Coder-7B',
                category: '代码生成',
                description: '专注代码生成与修复，开发效率神器',
                icon: Bot,
                href: '/dashboard/models/chat'
              },
              {
                name: 'DeepSeek-R1-0528',
                category: '数学推理',
                description: '数学推理能力突出，适合复杂计算',
                icon: Bot,
                href: '/dashboard/models/chat'
              },
            ].map((model) => {
              const Icon = model.icon
              return (
                <Link key={model.name} href={model.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{model.category}</span>
                      </div>
                      <CardTitle className="text-sm">{model.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">
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
  )
}
