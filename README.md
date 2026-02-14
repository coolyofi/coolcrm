# CoolCRM - 现代化客户关系管理系统

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.95.3-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-38B2AC)](https://tailwindcss.com/)

一个基于 Next.js 16 和 Supabase 构建的现代化客户关系管理系统，提供完整的客户管理、拜访记录和数据分析功能。

## ✨ 核心功能

### 🔐 安全认证系统
- 用户注册与登录
- JWT 令牌认证
- 自动会话管理
- 密码安全存储
- 邮箱验证支持

### 👥 客户管理
- 新增客户信息
- 编辑客户详情
- 删除客户记录
- 客户数据隔离（用户级权限控制）
- **地理位置支持**：自动定位与手动地址输入
- **意向等级跟踪**：1-5 级客户意向评估

### 📅 拜访记录管理
- 记录客户拜访详情
- 地理位置追踪
- 拜访时间与备注
- 历史拜访查询
- 与客户关联的拜访数据

### 📊 数据分析面板
- 客户统计概览
- 月度拜访数据
- KPI 趋势分析
- 活动时间线
- 性能监控

### 🎨 现代化用户界面
- 暗色主题设计
- 响应式布局适配
- 流畅动画效果
- Toast 通知系统
- 无障碍性支持

### 🛡️ 企业级安全
- 数据库行级安全 (RLS)
- 输入数据验证 (Zod)
- XSS 与 CSRF 防护
- 敏感数据加密

## 🚀 快速开始

### 系统要求
- Node.js 18.0 或更高版本
- npm / yarn / pnpm 包管理器
- Supabase 账户

### 1. 克隆项目
```bash
git clone https://github.com/coolyofi/coolcrm.git
cd coolcrm
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置

#### 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com) 创建新项目
2. 在项目设置中获取 URL 和 API 密钥

#### 配置环境变量
创建 `.env.local` 文件并添加以下配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 可选：Vercel Analytics
# NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

> **安全提醒**：
> - `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端使用，切勿在客户端代码中暴露
> - 生产环境请使用强密码和 HTTPS

#### 数据库初始化
在 Supabase SQL 编辑器中执行以下 SQL 脚本创建表结构：

```sql
-- 客户表
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  intent_level INTEGER CHECK (intent_level >= 1 AND intent_level <= 5),
  visit_date DATE,
  contact TEXT,
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 拜访记录表
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 客户表访问策略
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- 拜访记录访问策略
CREATE POLICY "Users can view own visits" ON visits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visits" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visits" ON visits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visits" ON visits
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用应用。

## 📁 项目结构

```
coolcrm/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组
│   │   └── login/               # 登录页面
│   ├── (main)/                   # 主应用路由组
│   │   ├── add/                 # 添加客户
│   │   ├── edit/[id]/           # 编辑客户
│   │   ├── history/             # 历史记录
│   │   ├── settings/            # 用户设置
│   │   ├── visits/              # 拜访管理
│   │   └── layout.tsx           # 主布局
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 首页仪表板
├── components/                   # React 组件
│   ├── AuthProvider.tsx         # 认证上下文提供者
│   ├── ErrorBoundary.tsx        # 错误边界
│   ├── PageHeader.tsx           # 页面头部
│   ├── SWRProvider.tsx          # SWR 配置提供者
│   ├── dashboard/               # 仪表板组件
│   │   ├── ActivityFeed.tsx     # 活动时间线
│   │   ├── DashboardHeader.tsx  # 仪表板头部
│   │   ├── GoalsSection.tsx     # 目标部分
│   │   ├── KpiCard.tsx          # KPI 卡片
│   │   └── ...
│   ├── navigation/              # 导航组件
│   │   ├── AppShell.tsx         # 应用外壳
│   │   ├── NavigationProvider.tsx # 导航上下文
│   │   ├── SidebarDesktop.tsx   # 桌面侧边栏
│   │   ├── TopBar.tsx           # 顶部栏
│   │   └── ...
│   └── ...
├── lib/                         # 工具库
│   ├── api/                     # API 客户端
│   │   ├── customers.ts         # 客户 API
│   │   └── visits.ts            # 拜访 API
│   ├── dashboard-optimized.ts   # 仪表板数据优化
│   └── supabase.ts              # Supabase 客户端配置
├── hooks/                       # 自定义 Hooks
│   ├── useScrollProgress.ts     # 滚动进度
│   └── useScrollVelocity.ts     # 滚动速度
├── eslint-rules/                # ESLint 规则
├── middleware.ts                # Next.js 中间件
├── tailwind.config.js           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 项目依赖
└── README.md                    # 项目文档
```

## 🛠️ 技术栈

### 前端框架
- **Next.js 16** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript 5** - 类型安全

### 样式与 UI
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Heroicons** - 精美的 SVG 图标

### 后端服务
- **Supabase** - 开源 Firebase 替代方案
  - PostgreSQL 数据库
  - 实时订阅
  - 文件存储
  - 身份认证

### 数据管理
- **SWR** - React 数据获取库
- **React Hook Form** - 表单状态管理
- **Zod** - TypeScript 优先的模式验证

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 处理
- **Autoprefixer** - CSS 浏览器兼容性

## 📜 可用脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint 代码检查
npm run type-check   # TypeScript 类型检查
npm run test         # 运行测试（当前无测试）
```

## 🚀 部署指南

### Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署和预览

### 其他平台部署
- **Netlify**: 设置构建命令为 `npm run build`，发布目录为 `.next`
- **Railway**: 连接 GitHub 仓库，自动检测 Next.js 项目
- **Docker**: 使用提供的 Dockerfile（如果有）

确保在部署平台上设置所有必需的环境变量。

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 配置的代码规范
- 使用 Prettier 格式化代码（如果配置）

### API 设计
- RESTful API 设计原则
- 使用 Supabase RLS 确保数据安全
- 客户端和服务端分离的架构

### 性能优化
- 使用 SWR 进行数据缓存
- 图片懒加载和优化
- 代码分割和动态导入

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发环境设置
- 确保 Node.js 版本 >= 18
- 安装依赖后运行 `npm run dev`
- 提交前运行 `npm run lint` 和 `npm run type-check`

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

- 🐛 发现问题？请提交 [Issue](https://github.com/coolyofi/coolcrm/issues)
- 💡 有建议？欢迎在 Discussions 中分享
- 📧 联系我们：通过 GitHub Issues 或 Pull Requests

---

**CoolCRM** - 让客户关系管理变得简单而强大 🚀
