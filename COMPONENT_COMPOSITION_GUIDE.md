# Component Composition Style Guide

**Navigation Layering System v2**  
**Phase 3: Complete Stacking Context Enforcement**

---

## Overview

This guide establishes rules for component composition to maintain proper stacking contexts and prevent visual layering issues. All components must follow these rules to ensure consistent navigation behavior across the application.

---

## Layer Definitions

### Navigation Layer (OS Layer)
- **Components**: `TopBar`, `DrawerOverlay`, `SidebarDesktop`
- **Z-index Range**: 40-60 (`--z-topbar`, `--z-drawer`)
- **Purpose**: System-level navigation that appears above content
- **Stacking Context**: Each component maintains its own isolated context

### Content Layer (User Layer)
- **Components**: Page content, cards, buttons, forms
- **Z-index Range**: 1 (`--z-content`)
- **Purpose**: User-facing content and interactions
- **Stacking Context**: Must not create new contexts with `transform`/`filter`

### Modal Layer (Overlay Layer)
- **Components**: Dialogs, tooltips, dropdowns
- **Z-index Range**: 80 (`--z-modal`)
- **Purpose**: Temporary overlays that block interaction
- **Stacking Context**: Isolated from navigation and content

---

## Component Rules

### 1. Z-Index Usage
```typescript
// ✅ Correct: Use CSS variables only
<div style={{ zIndex: 'var(--z-content)' }} />

// ❌ Wrong: Hardcoded z-index values
<div style={{ zIndex: 10 }} />
<div className="z-10" />
```

### 2. Transform/Filter Prohibition
```typescript
// ❌ Wrong: Transform in content components creates new stacking context
function MyCard() {
  return (
    <div style={{ transform: 'scale(1.1)' }}> // Creates stacking context!
      Content
    </div>
  )
}

// ✅ Correct: Use CSS classes or move to navigation layer
function MyCard() {
  return (
    <div className="card"> // Uses .card { overflow: hidden; }
      Content
    </div>
  )
}
```

### 3. Backdrop-Filter Usage
```typescript
// ❌ Wrong: Backdrop-filter in content creates stacking context
<div style={{ backdropFilter: 'blur(10px)' }}>
  Content
</div>

// ✅ Correct: Use glass layer classes only
<div className="glass">
  Navigation content
</div>
```

### 4. Glow Effects
```typescript
// ❌ Wrong: Box-shadow on content elements
<button style={{ boxShadow: '0 0 10px blue' }}>
  Click me
</button>

// ✅ Correct: Use glow-layer system
<button className="btn-primary"> {/* Glow handled by ::before pseudo-element */}
  Click me
</button>
```

---

## Component Categories

### Navigation Components
**Allowed**: `transform`, `filter`, `backdrop-filter`, custom z-index
**Purpose**: System-level UI that manages its own stacking contexts

```typescript
// TopBar.tsx - Navigation Layer ✅
<div style={{
  zIndex: 'var(--z-topbar)',
  backdropFilter: 'blur(20px)', // ✅ Allowed
  transform: 'translateY(0)',   // ✅ Allowed
}}>
```

### Content Components
**Prohibited**: `transform`, `filter`, `backdrop-filter` (except glass classes)
**Purpose**: User content that must not break stacking hierarchy

```typescript
// KpiCard.tsx - Content Layer ✅
<div className="glass-strong"> {/* ✅ Uses glass class */}
  <div className="card">     {/* ✅ Uses card class */}
    Content
  </div>
</div>
```

### Modal Components
**Required**: Isolated stacking context, high z-index
**Purpose**: Temporary overlays that block all interaction

```typescript
// Modal.tsx - Modal Layer ✅
<div style={{ zIndex: 'var(--z-modal)' }}>
  Modal content
</div>
```

---

## Migration Guide

### From Legacy Components

#### Step 1: Audit Z-Index Usage
```bash
# Search for hardcoded z-index values
grep -r "z-index\|zIndex" --include="*.tsx" --include="*.ts" src/
```

#### Step 2: Replace Hardcoded Values
```typescript
// Before
<div style={{ zIndex: 50 }} />

// After
<div style={{ zIndex: 'var(--z-overlay)' }} />
```

#### Step 3: Remove Transform/Filter from Content
```typescript
// Before
<div style={{ transform: 'scale(1.05)', filter: 'brightness(1.1)' }} />

// After
<div className="hover-scale" /> /* Use CSS classes instead */
```

#### Step 4: Use Glass Layer Classes
```typescript
// Before
<div style={{ backdropFilter: 'blur(10px)' }} />

// After
<div className="glass" />
```

---

## ESLint Rules

The following ESLint rules enforce these guidelines:

- `stacking-context/no-transform-in-content`: Prevents `transform` in content components
- `stacking-context/no-filter-in-content`: Prevents `filter` in content components
- `stacking-context/no-backdrop-filter-in-content`: Prevents `backdrop-filter` in content components

### Running ESLint
```bash
npm run lint  # Includes stacking context checks
```

---

## Testing Checklist

### Visual Testing
- [ ] Navigation appears above content on all screen sizes
- [ ] Drawer opens without visual artifacts
- [ ] Button glows stay within card boundaries
- [ ] Glass effects render correctly without pixel artifacts
- [ ] Modal overlays block all interaction

### Code Quality
- [ ] No hardcoded z-index values
- [ ] No `transform`/`filter` in content components
- [ ] All backdrop-filter uses glass classes
- [ ] ESLint passes with no stacking context violations

---

## FAQ

### Q: Can I use transform for hover effects?
**A**: No. Use CSS classes with `transition` properties instead. Transform creates stacking contexts that break the layering system.

### Q: How do I add glow to my custom button?
**A**: Use the `.glow-layer` system or extend `.btn-primary` styles. Do not add `box-shadow` directly to content elements.

### Q: What if I need a custom z-index?
**A**: Add it to the CSS variables in `globals.css` and document the new layer. Do not use arbitrary z-index values.

### Q: Can content components have their own stacking contexts?
**A**: No. All content must share the same stacking context to maintain proper layering with navigation.

---

## Related Documentation
- [NAVIGATION_LAYERING_SYSTEM_V2.md](NAVIGATION_LAYERING_SYSTEM_V2.md) — Architecture specification
- [ESLINT_FIXES_VERIFICATION.md](ESLINT_FIXES_VERIFICATION.md) — ESLint compliance history
- [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) — Performance improvements