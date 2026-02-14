# CoolCRM Navigation Stable v1 - QA Checklist

## ✅ Phase 1: Navigation 单实例化

### 1.1 AppShell 唯一入口
- [x] layout.tsx 只包一次 AppShell
- [x] 移除 AppShell 中的重复 NavigationProvider
- [x] 页面内不单独 import navigation 组件

### 1.2 单实例渲染
- [x] mobile drawer 与 desktop sidebar 不重复渲染
- [x] 条件渲染使用 return null 而非 CSS hide
- [x] 窗口 resize 时无双重 sidebar 闪烁

## ✅ Phase 2: Layer System 固定

### 2.1 Z-Index Tokens
- [x] CSS 定义统一 z-index tokens
- [x] 所有组件使用 var(--z-*) 而非硬编码 z-50
- [x] 层级顺序: Content(1) < TopBar(40) < Overlay(50) < Drawer(60)

### 2.2 Pointer Events 控制
- [x] Overlay 默认 pointer-events: none
- [x] 激活时 pointer-events: auto + opacity: 1
- [x] Drawer 关闭后内容可正常点击

## ✅ Phase 3: Sidebar 系统级重构

### 3.1 Full Height 设计
- [x] Sidebar height: 100dvh
- [x] position: fixed, top: 0, left: 0
- [x] 不参与页面 layout flow

### 3.2 Layout 结构
- [x] 顶部: Logo + 标题 (h-14)
- [x] 中间: 导航项 (flex-1, 自动填充)
- [x] 底部: Collapse 按钮 (mt-auto)
- [x] Logo baseline 与第一 icon 对齐

### 3.3 视觉一致性
- [x] 展开/折叠状态切换流畅
- [x] 图标 spacing 使用设计 tokens
- [x] 悬停状态统一

## ✅ Phase 4: Content Layout 隔离

### 4.1 Margin Logic
- [x] Desktop: sidebar expanded → margin-left: 260px
- [x] Desktop: sidebar collapsed → margin-left: 72px
- [x] Tablet: 同 desktop 逻辑
- [x] Mobile: margin-left: 0

### 4.2 Layout 稳定性
- [x] main 元素 min-width: 0, overflow-x: hidden
- [x] Sidebar 不影响 content 宽度计算
- [x] 无页面级 layout shift

## ✅ Phase 5: Scroll Container 固定

### 5.1 滚动隔离
- [x] 只有 #content-scroll 有 overflow-y: auto
- [x] body/html: overflow: hidden
- [x] Sidebar 无独立滚动

### 5.2 性能优化
- [x] overscroll-contain 防止 iOS 回弹
- [x] -webkit-overflow-scrolling: touch (iOS)

## 🎯 QA 验收标准

### 功能测试
- [ ] 页面不存在两个 sidebar ✅
- [ ] iPhone drawer 打开时可点击关闭 ✅
- [ ] Content 不被 sidebar 挤压 ✅
- [ ] 无横向滚动 ✅
- [ ] Collapse 后仍 full height ✅
- [ ] 搜索区域 vertical position 不跳动 ✅

### 设备适配
- [ ] iPhone Safari: Drawer 开关正常
- [ ] iPad: 横屏 sidebar, 竖屏 drawer
- [ ] Desktop: Sidebar proximity expand
- [ ] 窗口 resize: 无闪烁/重复渲染

### 性能表现
- [ ] 滚动流畅，无额外监听 (stable 模式)
- [ ] 内存泄漏检查通过
- [ ] Bundle size 无显著增加

## 🚀 后续规划

### 已完成 ✅
- Navigation Stable v1 架构冻结
- 双轨 motion system 基础
- 单实例渲染保证

### 下一步 (可选)
- Large Title Collapse (apple-only)
- Velocity blur 增强 (apple-only)
- iPad Split View 优化

## 📊 架构验证

**隐藏 sidebar 后，页面仍像完整 app** → ✅ PASS

这个验证确认了 Navigation 现在是真正的 **OS Layer**，而不是页面组件！

---

*最后更新: 2026-02-14*
*Navigation Stable v1 - 企业级架构完成* 🎉