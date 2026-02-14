# Navigation System Architecture - Stable v1

## Overview

This document describes the refactored navigation system implementing a single source of truth pattern with proper OS-level layering.

## Key Principles

1. **Single Entry Point**: `NavigationRoot.tsx` ensures only one navigation instance renders at any breakpoint
2. **Three-Layer Contract**: Navigation / TopBar / ContentScroll with proper z-index separation
3. **Token-Based Design**: No magic numbers - all values from `tokens.ts`
4. **Device-Aware Rendering**: Mobile gets drawer, tablet/desktop get sidebar (mutual exclusion)

## File Structure

```
components/navigation/
├── NavigationProvider.tsx    # Single source of truth for state
├── NavigationRoot.tsx         # Single render entry (mutual exclusion)
├── AppShell.tsx              # OS-layer 3-layer shell
├── Sidebar.tsx               # Desktop/tablet sidebar (full-height)
├── DrawerOverlay.tsx         # Mobile drawer (with interaction blocking)
├── TopBar.tsx                # Mobile topbar
├── tokens.ts                 # z-index, dimensions, motion tokens
├── constants.ts              # Menu items
├── useNav.ts                 # Thin wrapper
└── hooks/
    ├── useNavigation.ts      # Unified hook export
    └── useBreakpoint.ts      # Device detection utility
```

## Architecture

### 1. NavigationProvider (State Management)

**Single source of truth** for:
- `deviceMode`: "mobile" | "tablet" | "desktop"
- `navMode`: "drawer" | "sidebar" (derived from deviceMode)
- `sidebarState`: "expanded" | "collapsed"
- `drawerOpen`: boolean
- `motionLevel`: "stable" | "apple"
- `topbarHeight`: number

**Hook**: `useNav()` or `useNavigation()` (alias)

### 2. NavigationRoot (Render Entry)

**Mutual exclusion logic**:
- Mobile: Renders `DrawerOverlay + TopBar` ONLY
- Tablet/Desktop: Renders `SidebarDesktop` ONLY

This prevents the "double sidebar" bug by ensuring single instance per breakpoint.

### 3. AppShell (OS Layer)

**Three-layer structure**:

```tsx
<div>
  {/* Layer 1: Navigation (fixed, z-index: 50/60/70) */}
  <NavigationRoot />
  
  {/* Layer 3: Content (scrollable, z-index: 0) */}
  <main id="content-scroll">
    {children}
  </main>
</div>
```

**Contract enforced**:
- Body scroll locked (globals.css)
- Only #content-scroll scrolls
- Content has proper margins/padding for nav/topbar
- Z-index uses tokens (no inline values)

### 4. Sidebar (Full-Height)

**Structure**:
```tsx
<aside> {/* fixed, h-screen */}
  <div> {/* padding wrapper */}
    <div> {/* glass container, flex-col */}
      <div>{/* Logo */}</div>
      <nav className="flex-1">{/* Menu */}</nav>
      <div className="mt-auto">{/* Bottom actions */}</div>
    </div>
  </div>
</aside>
```

**Key features**:
- Fixed positioning (left-0, top-0, h-screen)
- Menu area uses `flex-1` (flexible height)
- Bottom actions use `mt-auto` (stick to bottom)
- Width from tokens (260px expanded, 72px collapsed)

### 5. DrawerOverlay (Mobile)

**Interaction blocking**:
```tsx
<div style={{ zIndex: Z_INDEX.DRAWER_BACKDROP }}>
  {/* Backdrop - blocks clicks when open */}
  <div 
    style={{ pointerEvents: open ? 'auto' : 'none' }}
    onClick={close}
  />
  
  {/* Drawer panel - always captures to prevent propagation */}
  <div style={{ 
    zIndex: Z_INDEX.DRAWER,
    pointerEvents: 'auto' 
  }}>
    {/* Menu content */}
  </div>
</div>
```

**Key features**:
- Only renders when drawer is open (returns null when closed)
- Backdrop blocks interaction when open, allows when closed
- Panel always captures events to prevent propagation
- Z-index from tokens (backdrop: 60, drawer: 70)

### 6. TopBar (Mobile)

**Key features**:
- Fixed positioning with z-index from tokens (40)
- Menu button opens drawer
- Title with collapse animation (if largeTitleEnabled)
- Primary action (+) for quick add
- Height from tokens (60px normal, 72px large)

## Tokens System

All magic numbers replaced with semantic tokens:

```typescript
// Z-Index Layers
Z_INDEX = {
  CONTENT: 0,
  TOPBAR: 40,
  SIDEBAR: 50,
  DRAWER_BACKDROP: 60,
  DRAWER: 70,
  MODAL: 90,
}

// Navigation Dimensions
NAV_DIMENSIONS = {
  SIDEBAR_EXPANDED: 260,
  SIDEBAR_COLLAPSED: 72,
  TOPBAR_HEIGHT: 60,
  TOPBAR_HEIGHT_LARGE: 72,
}

// Breakpoints
BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
}
```

## Motion System (Dual-Track)

### Stable Mode (Default)
- Conservative, predictable animations
- No velocity-based effects
- Motion tokens: fast (120ms), base (200ms), slow (300ms)
- Large title collapse: DISABLED
- Drawer drag: DISABLED

### Apple Mode (Optional)
- Dynamic, iOS-like animations
- Scroll velocity blur
- Large title collapse: ENABLED
- Drawer drag: ENABLED
- Floating command bar (future)

Toggle via: `nav.setMotionLevel("stable" | "apple")`

## Glow Containment

All glow effects properly contained:

1. **Ambient light**: `z-index: -1`, `pointer-events: none`
2. **Glass components**: `overflow: hidden` clips blur
3. **Card glows**: Internal absolute positioned elements
4. **Button glows**: `::before` pseudo-elements with `z-index: -1`

No glows pierce through or block interactive elements.

## Device Modes & Breakpoints

| Mode | Width | Navigation | TopBar |
|------|-------|------------|--------|
| Mobile | ≤ 767px | Drawer | Yes |
| Tablet | 768-1023px | Sidebar | No |
| Desktop | ≥ 1024px | Sidebar | No |

**iPad behavior**:
- Landscape: Sidebar expanded (better use of space)
- Portrait: Sidebar collapsed (more content space)

## Usage Examples

### Basic Hook Usage

```typescript
import { useNavigation } from '@/components/navigation/hooks/useNavigation'

function MyComponent() {
  const nav = useNavigation()
  
  // Access state
  console.log(nav.mode)        // "mobile" | "tablet" | "desktop"
  console.log(nav.sidebar)     // "expanded" | "collapsed" | "closed"
  console.log(nav.drawerOpen)  // boolean
  
  // Actions
  nav.open()                   // Open sidebar/drawer
  nav.close()                  // Close sidebar/drawer
  nav.toggle()                 // Toggle state
  
  // Motion
  nav.setMotionLevel("apple")  // Switch to Apple motion
  console.log(nav.motion)      // Motion tokens
}
```

### Device Detection Only

```typescript
import { useBreakpoint } from '@/components/navigation/hooks/useBreakpoint'

function MyComponent() {
  const { deviceMode, isMobile, isTablet, isDesktop } = useBreakpoint()
  
  if (isMobile) {
    return <MobileView />
  }
  
  return <DesktopView />
}
```

## Testing Checklist

- [ ] No double sidebar at any breakpoint
- [ ] Mobile drawer opens/closes correctly
- [ ] Mobile content blocked when drawer open
- [ ] Mobile content clickable when drawer closed
- [ ] Tablet sidebar shows (no drawer)
- [ ] Desktop sidebar shows (no topbar)
- [ ] Sidebar collapse/expand works
- [ ] Topbar shows only on mobile
- [ ] Content scroll works properly
- [ ] Body scroll is locked
- [ ] Z-index layering correct
- [ ] No glow piercing
- [ ] Motion level toggle works
- [ ] Reduced motion respected

## Migration Guide

### From Old useNav/useNavMode

**Before:**
```typescript
import { useNavMode } from './components/navigation/useNavMode'
```

**After:**
```typescript
import { useNavigation } from './components/navigation/hooks/useNavigation'
// or
import { useNav } from './components/navigation/NavigationProvider'
```

### Component Imports

**Before:**
```typescript
import { Sidebar } from './components/navigation/Sidebar'
import { DrawerOverlay } from './components/navigation/DrawerOverlay'
```

**After:**
```typescript
// Don't import navigation components directly!
// They're managed by NavigationRoot in AppShell
// Just use the navigation hooks to control state
```

## Benefits

1. **No Double Rendering**: Single entry point prevents duplication
2. **Proper Layering**: Z-index tokens prevent stacking context issues
3. **Predictable Behavior**: Device mode directly maps to navigation type
4. **Better Performance**: Only one navigation instance mounted
5. **Easier Testing**: Clear separation of concerns
6. **Maintainable**: All values in tokens.ts
7. **Accessible**: Proper pointer-events and interaction blocking

## Future Enhancements

- [ ] Large Title component (iOS Settings style)
- [ ] Floating Command Bar (Apple motion mode)
- [ ] Edge swipe gesture (drawer)
- [ ] Scroll contract enforcement (advanced)
- [ ] Navigation animations (shared element transitions)
