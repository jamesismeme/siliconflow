# SiliconFlow Platform

基于 Next.js 14 和 SiliconFlow API 构建的在线大模型调用工具平台。

## 🚀 功能特性

- **多模型支持** - 支持对话、图像生成、语音处理、文本处理等4大类AI能力
- **智能Token管理** - 自动轮询和负载均衡，确保高可用性
- **管理控制台** - 安全的后台管理界面，支持Token管理和系统监控
- **实时统计** - 详细的使用统计和性能监控
- **安全认证** - 管理员密码保护，数据库存储Token
- **响应式设计** - 完美适配桌面端和移动端

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **状态管理**: Zustand
- **认证**: bcryptjs (密码哈希)
- **部署**: Vercel

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd siliconflow-platform
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 数据库配置

1. 在 [Supabase](https://supabase.com/) 创建新项目
2. 在 SQL Editor 中执行 `supabase-schema.sql` 文件
3. 复制数据库连接字符串

### 4. 环境配置

复制环境变量模板：

```bash
cp .env.example
```

编辑 `.env.local` 文件，填入必要的配置：

```env
# 数据库配置 (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# SiliconFlow API配置
SILICONFLOW_BASE_URL="https://api.siliconflow.cn/v1"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. 数据库设置

```bash
# 生成Prisma客户端
pnpm db:generate

# 推送数据库模式 (如果需要)
pnpm db:push
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
siliconflow-platform/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # 仪表板路由组
│   ├── api/              # API路由
│   └── globals.css       # 全局样式
├── components/           # React组件
│   ├── ui/              # 基础UI组件
│   └── layout/          # 布局组件
├── lib/                 # 工具库
│   ├── db/             # 数据库相关
│   ├── utils/          # 工具函数
│   └── types/          # 类型定义
├── prisma/             # Prisma配置
└── public/             # 静态资源
```

## 🔧 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 数据库操作
pnpm db:push      # 推送模式到数据库
pnpm db:generate  # 生成Prisma客户端
pnpm db:seed      # 初始化数据
pnpm db:studio    # 打开数据库管理界面
```

## 🚀 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 环境变量配置

在 Vercel 中配置以下环境变量：

- `DATABASE_URL` - Supabase 数据库连接字符串
- `SILICONFLOW_BASE_URL` - SiliconFlow API基础URL
- `NEXTAUTH_SECRET` - NextAuth 密钥
- `NEXTAUTH_URL` - 应用URL

## 📖 使用说明

### 用户界面
- 访问 `/dashboard` - 模型调用界面
- 支持对话、图像生成、语音处理、文本处理

### 管理控制台
- 访问 `/console/login` - 管理员登录
- Token管理、系统监控、统计数据

### API 接口

```bash
POST /api/invoke         # 模型调用
GET /api/tokens          # Token管理
GET /api/stats           # 统计数据
POST /api/console/auth   # 管理员认证
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [SiliconFlow API 文档](https://docs.siliconflow.cn/)
- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Prisma 文档](https://www.prisma.io/docs)
