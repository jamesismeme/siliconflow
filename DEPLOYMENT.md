# SiliconFlow Platform - Vercel 部署指南

## 🚀 部署前准备

### 1. 环境要求
- Node.js 18+
- Vercel CLI
- Supabase 数据库 (PostgreSQL)

### 2. 必需的环境变量

在 Vercel 项目设置中配置以下环境变量：

```bash
# Supabase 数据库配置
DATABASE_URL="postgresql://postgres:zxG3B?A&JsE5zSS@db.tjhwvysdxprrqcihjyje.supabase.co:5432/postgres"

# SiliconFlow API 配置
SILICONFLOW_API_KEY="your-siliconflow-api-key-here"
SILICONFLOW_BASE_URL="https://api.siliconflow.cn/v1"

# 多个 Token 配置 (请替换为您的真实Token)
SILICONFLOW_TOKENS="token1,token2,token3,token4"

# 管理控制台密码
CONSOLE_PASSWORD="a95xg4exa7efq"

# NextAuth 配置
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# 应用配置
NODE_ENV="production"
```

## 📋 部署步骤

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 初始化项目
```bash
vercel
```

### 4. 配置 Supabase 数据库
1. ✅ 已配置项目：`SiliconFlow Platform`
2. ✅ 数据库密码：`zxG3B?A&JsE5zSS`
3. ✅ 项目引用：`tjhwvysdxprrqcihjyje`
4. 在 SQL Editor 中执行 `supabase-schema.sql` 中的所有SQL语句
5. 数据库连接字符串已配置完成

### 5. 运行数据库迁移
```bash
# 拉取环境变量
vercel env pull .env.local

# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构
npx prisma db push

# 运行种子数据
npx prisma db seed
```

### 6. 部署到生产环境
```bash
vercel --prod
```

## 🔧 部署后配置

### 1. 验证功能
- [ ] 访问主页: `https://your-domain.vercel.app`
- [ ] 测试模型调用功能
- [ ] 访问管理控制台: `https://your-domain.vercel.app/console`
- [ ] 使用密码登录

### 2. 监控设置
- [ ] 检查 Vercel 函数日志
- [ ] 监控数据库连接
- [ ] 验证 API 调用统计

### 3. 安全检查
- [ ] 确认环境变量已正确设置
- [ ] 验证管理控制台密码保护
- [ ] 检查 API 密钥安全性

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `DATABASE_URL` 格式
   - 确认数据库服务可访问

2. **API 调用失败**
   - 验证 `SILICONFLOW_TOKENS` 有效性
   - 检查 API 密钥权限

3. **控制台无法访问**
   - 确认 `CONSOLE_PASSWORD` 设置正确
   - 检查中间件配置

### 日志查看
```bash
# 查看函数日志
vercel logs

# 查看实时日志
vercel logs --follow
```

## 📊 性能优化

### 1. 数据库优化
- 定期清理旧日志数据
- 监控数据库性能指标

### 2. API 优化
- 启用响应缓存
- 监控 API 调用频率

### 3. 前端优化
- 启用 Vercel Edge 缓存
- 优化静态资源加载

## 🔄 更新部署

### 自动部署
- 推送到 main 分支自动触发部署
- 通过 GitHub Actions 集成

### 手动部署
```bash
# 部署最新版本
vercel --prod

# 部署特定分支
vercel --prod --branch feature-branch
```

## 📞 支持

如遇到部署问题，请检查：
1. Vercel 控制台错误日志
2. 数据库连接状态
3. 环境变量配置
4. API 密钥有效性
