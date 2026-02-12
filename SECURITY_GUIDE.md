# Supabase认证安全配置指南

## ✅ 已自动处理的（Supabase内置）

### 🔐 密码安全
- **bcrypt哈希**：密码使用bcrypt算法哈希存储
- **盐值处理**：自动生成随机盐值
- **密码策略**：可配置最小长度、复杂度要求

### 🎫 JWT令牌管理
- **自动生成**：登录时自动生成JWT访问令牌
- **刷新机制**：自动处理令牌刷新
- **过期管理**：访问令牌15分钟，刷新令牌长期有效
- **安全签名**：使用HS256算法签名

### 🔒 会话安全
- **HTTPS强制**：生产环境必须使用HTTPS
- **令牌存储**：安全存储在localStorage/httpOnly cookies
- **跨站请求伪造防护**：内置CSRF保护

## 🔧 你需要手动配置的

### 1. 数据库行级安全 (RLS)
在Supabase控制台 → SQL Editor中执行：

```sql
-- 启用RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的客户记录
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. 认证设置配置
在Supabase控制台 → Authentication → Settings：

#### 密码策略
- ✅ 启用 "Enable email confirmations"
- ✅ 设置 "Minimum password length" 为 8
- ✅ 启用 "Enable password strength enforcement"

#### 站点URL
- 设置 "Site URL" 为你的域名 (生产环境)
- 设置 "Redirect URLs" 为你的应用URL

#### 速率限制
- 设置登录尝试限制 (推荐：5次/分钟)

### 3. 环境变量安全
确保 `.env.local` 文件：
- ✅ 不提交到Git (已在 .gitignore)
- ✅ 只包含公开密钥 (anon key)
- ❌ 不要包含service_role key

### 4. 生产环境配置
- ✅ 使用HTTPS
- ✅ 设置正确的CORS策略
- ✅ 启用数据库备份
- ✅ 监控认证日志

## 🛡️ 安全最佳实践

### 客户端安全
- ✅ 使用最新版本的Supabase客户端
- ✅ 验证所有用户输入
- ✅ 使用TypeScript进行类型安全

### API安全
- ✅ 启用RLS所有表
- ✅ 使用auth.uid()进行用户验证
- ✅ 避免在客户端存储敏感数据

### 监控和日志
- ✅ 监控认证失败事件
- ✅ 设置告警阈值
- ✅ 定期审查访问日志

## 🚨 安全检查清单

- [ ] RLS已在customers表启用
- [ ] 用户策略正确配置
- [ ] 密码策略已设置
- [ ] 邮箱验证已启用
- [ ] 环境变量安全存储
- [ ] HTTPS在生产环境启用
- [ ] CORS策略正确配置

## 🔍 测试认证

1. 注册新用户
2. 验证邮箱确认
3. 登录测试
4. 访问受保护路由
5. 验证数据隔离（不同用户看不到彼此数据）

## 📞 故障排除

### 常见问题
- **登录失败**：检查邮箱确认状态
- **权限错误**：验证RLS策略
- **令牌过期**：检查网络连接，Supabase自动刷新

### 调试工具
- Supabase控制台 → Authentication → Users
- 浏览器开发者工具 → Application → Local Storage
- 网络请求检查JWT令牌