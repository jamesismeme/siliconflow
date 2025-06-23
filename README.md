# SiliconFlow Platform

基于 Next.js 14 和 SiliconFlow API 构建的在线大模型调用工具平台。

> 🎉 **已完成 LocalStorage 迁移** - 项目已从数据库架构完全迁移到客户端存储，实现零依赖部署！

## 🚀 功能特性

- **多模型支持** - 支持对话、图像生成、语音处理、文本处理等4大类AI能力
- **本地Token管理** - 基于 LocalStorage 的安全 Token 存储，无需数据库
- **管理控制台** - 直接访问的后台管理界面，支持Token管理和系统监控
- **实时统计** - 基于客户端计算的详细使用统计和性能监控
- **隐私保护** - 所有数据存储在用户本地，确保隐私安全
- **响应式设计** - 完美适配桌面端和移动端

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **存储**: LocalStorage (客户端存储)
- **状态管理**: Zustand
- **部署**: Vercel

## 📦 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/jamesismeme/siliconflow.git
cd siliconflow
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置（可选）

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，可自定义配置：

```env
# SiliconFlow API配置
SILICONFLOW_BASE_URL="https://api.siliconflow.cn/v1"

# 应用设置
NEXT_PUBLIC_APP_NAME="SiliconFlow Platform"
NEXT_PUBLIC_APP_DESCRIPTION="在线大模型调用工具平台"
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
siliconflow-platform/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # 模型调用界面
│   ├── console/          # 管理控制台
│   ├── api/              # API路由
│   └── globals.css       # 全局样式
├── components/           # React组件
│   ├── ui/              # 基础UI组件
│   ├── models/          # 模型相关组件
│   └── layout/          # 布局组件
├── lib/                 # 工具库
│   ├── stores/          # Zustand状态管理
│   ├── hooks/           # 自定义Hooks
│   ├── storage/         # LocalStorage管理
│   └── utils/           # 工具函数
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
```

## 🚀 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（可选）
4. 部署

### 环境变量配置（可选）

在 Vercel 中可配置以下环境变量：

- `SILICONFLOW_BASE_URL` - SiliconFlow API基础URL（默认：https://api.siliconflow.cn/v1）
- `NEXT_PUBLIC_APP_NAME` - 应用名称
- `NEXT_PUBLIC_APP_DESCRIPTION` - 应用描述

## 📖 使用说明

### 用户界面
- 访问 `/dashboard` - 模型调用界面
- 支持对话、图像生成、语音处理、文本处理

### 管理控制台
- 访问 `/console` - 直接访问管理控制台
- Token管理、系统监控、统计数据
- 所有数据存储在浏览器 LocalStorage 中

### API 接口

```bash
POST /api/invoke         # 模型调用
GET /api/models          # 获取模型列表
```

### 本地存储说明

- **Token管理**: 所有 API Token 存储在浏览器 LocalStorage 中
- **使用统计**: 调用历史和统计数据本地计算和存储
- **隐私保护**: 数据不会上传到服务器，确保用户隐私
- **数据导入导出**: 支持 Token 数据的备份和恢复

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

项目仓库：[https://github.com/jamesismeme/siliconflow.git](https://github.com/jamesismeme/siliconflow.git)

## 📄 许可证

MIT License
