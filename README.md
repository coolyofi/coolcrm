# CoolCRM - 客户关系管理系统

一个现代化的客户关系管理系统，基于 Next.js 16、React 19 和 Supabase 构建。

## ✨ 功能特性

### 🔐 认证系统
- 用户注册和登录
- JWT令牌安全认证
- 密码bcrypt哈希存储
- 邮箱验证支持
- 自动会话管理

### 👥 客户管理
- 添加新客户
- 编辑客户信息
- 查看客户历史记录
- 客户数据隔离（用户只能访问自己的数据）
- **地理位置支持**：自动获取当前位置，支持手动调整地址
- **拜访记录**：记录每次拜访的位置、时间和备注

### 👤 用户设置
- 修改密码
- 设置昵称
- 查看账户信息
- 个人资料管理

### 🎨 现代化UI
- 暗色主题设计
- 响应式布局
- 骨架屏加载状态
- Toast通知反馈
- 无障碍性支持

### 🛡️ 安全特性
- 数据库行级安全 (RLS)
- 输入验证 (Zod)
- XSS防护
- CSRF保护

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.local.example .env.local
```

2. 配置 Supabase：
   - 访问 [Supabase](https://supabase.com) 创建新项目
   - 在 `.env.local` 中设置：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

建议在 `.env.local` 中还包含以下可选/服务端变量（仅在服务器端使用）：

```env
# 服务端角色密钥，具有更高权限，仅用于服务器端操作（API route / server action）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 可选：在部署时设置 NODE_ENV=production
# 以及任何第三方服务的 API keys（不要将其暴露为 NEXT_PUBLIC_*）
```

3. 创建数据库表：
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
```

4. 启用行级安全：
```sql
-- 启用RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 客户表策略
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- 拜访记录策略
CREATE POLICY "Users can view own visits" ON visits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visits" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visits" ON visits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visits" ON visits
  FOR DELETE USING (auth.uid() = user_id);
```

### 运行项目
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始使用。

## 📁 项目结构

```
coolcrm/
├── app/                    # Next.js App Router
│   ├── add/               # 添加客户页面
│   ├── edit/[id]/         # 编辑客户页面
│   ├── history/           # 客户历史记录
│   ├── login/             # 登录页面
│   ├── settings/          # 用户设置页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React组件
│   ├── AuthProvider.tsx   # 认证上下文
│   ├── ErrorBoundary.tsx  # 错误边界
│   └── Navigation.tsx     # 导航组件
├── lib/                   # 工具库
│   └── supabase.ts        # Supabase客户端配置
├── middleware.ts          # Next.js中间件
└── SECURITY_GUIDE.md      # 安全配置指南
```

## 🛠️ 技术栈

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod
- **State**: SWR (数据缓存)
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

## 📜 可用脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行ESLint检查
```

## 🔒 安全配置

详细的安全配置请参考 [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)

### 关键安全措施
- ✅ 密码bcrypt哈希
- ✅ JWT令牌认证
- ✅ 数据库行级安全
- ✅ 输入验证和消毒
- ✅ HTTPS强制 (生产环境)

## 🚀 部署

### Vercel (推荐)
1. 连接GitHub仓库
2. 设置环境变量
3. 自动部署

### 其他平台
确保设置正确的环境变量和数据库连接。

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题，请提交 [Issue](https://github.com/yourusername/coolcrm/issues) 或联系开发团队。

---

由 Next.js 和 Supabase 构建的现代化CRM系统。
