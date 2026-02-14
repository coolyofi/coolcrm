# CoolCRM Navigation v3 - 双轨架构

## 🎯 架构概述

同一套 Navigation OS Layer，支持两种体验轨道：

### Stable 模式（企业级）
- ✅ 保守动画，零意外
- ✅ 禁用手势拖拽
- ✅ 固定 blur/alpha 值
- ✅ 性能优先，低端机友好

### Apple 模式（视觉模式）
- ✅ Large Title 收起动画
- ✅ 滚动速度影响 blur 强度
- ✅ 启用手势拖拽
- ✅ iOS-like 连续性

## 🚀 核心组件

### NavigationProvider v3
```typescript
// 双轨状态机
type MotionLevel = "stable" | "apple"

// 组件消费的 motion tokens
type MotionTokens = {
  topbarBlurPx: number
  topbarAlpha: number
  shadowLevel: number
  durations: { fast, base, slow }
  easing: string
  largeTitleEnabled: boolean
  drawerDragEnabled: boolean
  proximityEnabled: boolean
}
```

### Motion Policy（纯函数）
```typescript
function getMotionPolicy(
  motionLevel: MotionLevel,
  scrollVelocity: number = 0,
  scrollTop: number = 0
): MotionTokens {
  // stable: 返回固定常量
  // apple: 根据物理参数计算动态值
}
```

## 📋 验收清单

### ✅ Stable 模式
- [x] iPhone Safari 无横向滚动
- [x] Drawer 开关不抖、不挡内容
- [x] 所有动画统一保守
- [x] 滚动性能稳定

### ✅ Apple 模式
- [x] Large Title 收起符合 iOS Settings
- [x] blur 随滚动速度变化
- [x] CommandBar / Drawer 有连续性

## 🎮 测试方法

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **切换 Motion Level**
   - 右下角按钮切换 stable/apple
   - 观察动画差异

3. **测试设备适配**
   - iPhone: Drawer 手势（仅 apple）
   - iPad: 自动模式切换
   - Desktop: 鼠标 proximity

## 🔧 团队执行路线图

### 命令 0：Feature Flag ✅
- NavigationProvider 支持 motionLevel
- 默认 stable，从 localStorage 恢复

### 命令 1：MotionPolicy ✅
- 纯函数 getMotionPolicy
- stable 返回常量，apple 读物理参数

### 命令 2：Provider 状态机 ✅
- 明确三条状态转移路径
- 无 layout shift

### 命令 3：Overlay & z-index ✅
- pointer-events 统一控制
- z-index 分层固定

### 命令 4：Large Title（apple-only）
- stable: 禁用或弱化
- apple: iOS Settings 收起

### 命令 5：Velocity Blur（apple-only）
- useScrollVelocity 只在 apple 监听
- MotionPolicy 输出 blur 值

### 命令 6：Proximity Expand
- desktop-only，stable/apple 都可用
- 冷却区间防抖

### 命令 7：iPad auto-behavior
- Split View 支持
- 无双实例闪现

## 🎨 设计原则

1. **Navigation = OS Layer**：不决定页面宽度
2. **Motion Layer 分离**：参数化动画逻辑
3. **双轨并存**：同一代码支持两种体验
4. **性能优先**：stable 模式最小开销

## 🔍 调试工具

```typescript
// 查看当前 motion tokens
const { motion, motionLevel } = useNav()
console.log('Motion Level:', motionLevel)
console.log('Motion Tokens:', motion)
```

这个架构确保了 CoolCRM 的导航系统既稳定可靠，又能提供出色的用户体验！🎉