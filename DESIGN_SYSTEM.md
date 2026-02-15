# CoolCRM 设计系统

## 概述

CoolCRM 采用统一的设计系统，确保所有UI组件在不同页面间保持一致的外观和行为。

## 设计原则

1. **一致性** - 所有组件使用相同的视觉语言
2. **可访问性** - 遵循 WCAG 指南
3. **响应式** - 在所有设备上良好工作
4. **性能** - 优化动画和交互

## 颜色系统

使用 CSS 变量定义的颜色系统：

- `--primary`: 主要颜色 (#4da3ff 亮色, #4da3ff 暗色)
- `--danger`: 危险/错误颜色
- `--fg`: 前景色
- `--fg-muted`: muted 前景色
- `--bg`: 背景色
- `--border`: 边框色

## 组件

### Button (按钮)

统一按钮组件，支持多种变体：

```tsx
import { Button } from "@/components/ui/Button"

// 主要按钮
<Button>主要按钮</Button>

// 次要按钮
<Button variant="secondary">次要按钮</Button>

// 危险按钮
<Button variant="danger">删除</Button>

// 链接样式
<Button variant="link">链接</Button>

// 不同尺寸
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>

// 作为子组件使用
<Button asChild>
  <Link href="/add">添加客户</Link>
</Button>
```

### Card (卡片)

统一的卡片容器：

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
  </CardHeader>
  <CardContent>
    卡片内容
  </CardContent>
</Card>
```

### Typography (排版)

统一的文字样式：

```tsx
import { Typography } from "@/components/ui/Typography"

<Typography variant="h1">一级标题</Typography>
<Typography variant="h2">二级标题</Typography>
<Typography variant="p">段落文字</Typography>
<Typography variant="lead">引导文字</Typography>
<Typography variant="muted">muted 文字</Typography>
```

### EmptyState (空状态)

统一的空数据状态展示：

```tsx
import { EmptyState } from "@/components/ui/EmptyState"

// 基础空状态
<EmptyState
  title="暂无数据"
  description="这里还没有任何数据"
/>

// 带操作的空状态
<EmptyState
  icon={customIcon}
  title="暂无客户记录"
  description="现在还没有任何客户数据"
  action={{
    label: "新增客户",
    href: "/add"
  }}
/>

// 卡片样式
<EmptyState
  variant="card"
  title="没有匹配的结果"
  description="尝试调整搜索条件"
/>

// 内联样式（用于表格内）
<EmptyState
  variant="inline"
  size="sm"
  title="暂无数据"
/>
```

### DataTable (数据表格)

支持空状态的表格组件：

```tsx
import DataTable from "@/components/ui/DataTable"

<DataTable
  headers={[{ label: "名称" }, { label: "状态" }]}
  data={[
    ["项目1", "活跃"],
    ["项目2", "暂停"]
  ]}
  emptyState={{
    title: "暂无项目",
    description: "还没有任何项目数据",
    action: {
      label: "创建项目",
      href: "/projects/new"
    }
  }}
/>
```

## 布局规范

### 页面结构

所有页面应遵循以下结构：

1. **PageHeader** - 页面标题和操作按钮
2. **主要内容区域** - 使用 Card 包装内容
3. **一致的间距** - 使用 `space-y-6` 或 `gap-6`

### 卡片使用

- 仪表板卡片使用 `Card` 组件
- 表单区域使用 `Card` 包装
- 列表项可以使用 `Card` 或直接使用样式

### 按钮使用规范

- **主要操作**: `Button` (默认变体)
- **次要操作**: `Button variant="secondary"`
- **危险操作**: `Button variant="danger"`
- **链接**: `Button variant="link"` 或 `Button asChild` 包装 Link

## 迁移指南

### 从旧样式迁移到新组件

1. **按钮迁移**:
   ```tsx
   // 旧的
   <button className="bg-[var(--primary)] text-white ...">按钮</button>

   // 新的
   <Button>按钮</Button>
   ```

2. **卡片迁移**:
   ```tsx
   // 旧的
   <div className="glass-strong p-6">内容</div>

   // 新的
   <Card>内容</Card>
   ```

3. **文字迁移**:
   ```tsx
   // 旧的
   <p className="text-[var(--fg-muted)]">文字</p>

   // 新的
   <Typography variant="muted">文字</Typography>
   ```

## 最佳实践

1. **始终使用设计系统组件** - 不要创建新的样式类
2. **保持一致的命名** - 使用英文属性名，中文显示文本
3. **测试响应式** - 在不同屏幕尺寸下测试
4. **关注可访问性** - 使用语义化标签和 ARIA 属性
5. **数据缺失处理** - 使用 EmptyState 组件保持一致的空状态展示

### 数据缺失处理

#### 始终提供空状态
```tsx
// ❌ 错误的做法
{data.length === 0 && <div>暂无数据</div>}

// ✅ 正确的做法
{data.length === 0 ? (
  <EmptyState
    title="暂无数据"
    description="还没有任何数据"
    action={{ label: "添加数据", href: "/add" }}
  />
) : (
  // 数据展示
)}
```

#### 区分不同类型的空状态
- **初始状态**: 还没有数据，引导用户创建
- **搜索无结果**: 搜索条件没有匹配，建议调整条件
- **过滤无结果**: 过滤条件过于严格，建议放宽条件
- **加载失败**: 显示错误状态，提供重试选项

#### 保持布局一致性
即使在数据缺失时，也要保持页面的整体布局结构：
- 保持 PageHeader
- 保持容器宽度和间距
- 使用相同的卡片样式

#### 提供有意义的行动号召
空状态应该告诉用户：
- 发生了什么（为什么没有数据）
- 用户可以做什么（如何添加数据）
- 如何开始（提供直接的行动按钮）

## 扩展设计系统

当需要添加新组件时：

1. 在 `components/ui/` 下创建组件
2. 遵循现有的模式和接口
3. 更新 `components/ui/index.ts`
4. 添加到本文档