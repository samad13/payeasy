# PayEasy Design System

## 🎨 Overview

This design system establishes the visual foundation for PayEasy, ensuring consistency, accessibility, and professional quality across all user interfaces. The design tokens are implemented in `tailwind.config.ts` and exported for use across the application.

---

## 📐 Design Principles

1. **Mobile-First**: All components are designed for mobile devices first, then enhanced for larger screens
2. **Accessibility**: WCAG 2.1 AAA compliance where possible, minimum AA compliance throughout
3. **Consistency**: Predictable patterns that build user confidence
4. **Performance**: Efficient animations and optimized rendering
5. **Flexibility**: Scalable system that grows with the product

---

## 🎨 Color System

### Primary Colors - Stellar Violet

Our brand color representing innovation and blockchain technology.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#F5EBFF` | Lightest backgrounds |
| 100 | `#E6CCFF` | Light backgrounds |
| 200 | `#CC99FF` | Hover states |
| 300 | `#B366FF` | Disabled states |
| 400 | `#9933FF` | Secondary actions |
| **500** | **`#7D00FF`** | **Primary brand color** |
| 600 | `#6400CC` | Hover on primary |
| 700 | `#4B0099` | Active states |
| 800 | `#320066` | Dark backgrounds |
| 900 | `#190033` | Darkest backgrounds |
| 950 | `#0D001A` | Near black |

**Usage:**
```tsx
// Background
<div className="bg-primary-500">

// Text
<p className="text-primary-600">

// Border
<button className="border-primary-500">
```

### Secondary Colors - Neutral Grays

Used for text, backgrounds, and UI elements.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#F9FAFB` | Page backgrounds |
| 100 | `#F3F4F6` | Card backgrounds |
| 200 | `#E5E7EB` | Borders |
| 300 | `#D1D5DB` | Dividers |
| 400 | `#9CA3AF` | Placeholder text |
| 500 | `#6B7280` | Secondary text |
| 600 | `#4B5563` | Body text |
| 700 | `#374151` | Headings |
| 800 | `#1F2937` | Dark mode text |
| 900 | `#111827` | Dark mode backgrounds |
| 950 | `#030712` | Near black |

### Accent Colors - Tech Blue

Used for links, info states, and interactive elements.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#EFF6FF` | Light backgrounds |
| 100 | `#DBEAFE` | Hover backgrounds |
| 200-400 | Various | Interactive states |
| **500** | **`#3178C6`** | **Main accent color** |
| 600-950 | Various | Darker states |

### Semantic Colors

#### Success (Green)
- **Primary**: `success-500` (`#22C55E`)
- **Usage**: Success messages, completed states, positive actions

#### Warning (Amber)
- **Primary**: `warning-500` (`#F59E0B`)
- **Usage**: Warnings, cautionary messages, pending states

#### Error (Red)
- **Primary**: `error-500` (`#EF4444`)
- **Usage**: Error messages, destructive actions, validation errors

#### Info (Sky Blue)
- **Primary**: `info-500` (`#0EA5E9`)
- **Usage**: Informational messages, tips, neutral notifications

---

## ✍️ Typography System

### Type Scale

Our typography system uses a hierarchical scale optimized for readability and visual hierarchy.

#### Display Headings (Marketing/Hero)

| Class | Size | Line Height | Weight | Letter Spacing |
|-------|------|-------------|--------|----------------|
| `text-display-2xl` | 72px | 1.1 | 700 | -0.02em |
| `text-display-xl` | 60px | 1.1 | 700 | -0.02em |
| `text-display-lg` | 48px | 1.2 | 700 | -0.01em |

**Usage:**
```tsx
<h1 className="text-display-2xl">Hero Headline</h1>
```

#### Headings (Content)

| Class | Size | Line Height | Weight | Letter Spacing |
|-------|------|-------------|--------|----------------|
| `text-h1` | 36px | 1.2 | 700 | -0.01em |
| `text-h2` | 30px | 1.3 | 700 | -0.01em |
| `text-h3` | 24px | 1.3 | 600 | 0 |
| `text-h4` | 20px | 1.4 | 600 | 0 |
| `text-h5` | 18px | 1.4 | 600 | 0 |
| `text-h6` | 16px | 1.5 | 600 | 0 |

**Usage:**
```tsx
<h1 className="text-h1">Page Title</h1>
<h2 className="text-h2">Section Heading</h2>
```

#### Body Text

| Class | Size | Line Height | Weight | Letter Spacing |
|-------|------|-------------|--------|----------------|
| `text-body-xl` | 20px | 1.6 | 400 | 0 |
| `text-body-lg` | 18px | 1.6 | 400 | 0 |
| `text-body-base` | 16px | 1.6 | 400 | 0 |
| `text-body-sm` | 14px | 1.5 | 400 | 0 |
| `text-body-xs` | 12px | 1.5 | 400 | 0.01em |

**Usage:**
```tsx
<p className="text-body-base">Standard paragraph text</p>
<span className="text-body-sm">Secondary information</span>
```

#### Mobile-Optimized Typography

For enhanced mobile readability:

| Class | Size | Usage |
|-------|------|-------|
| `text-xs-mobile` | 12px | Small labels on mobile |
| `text-sm-mobile` | 14px | Secondary text on mobile |
| `text-base-mobile` | 16px | Body text on mobile |
| `text-lg-mobile` | 18px | Large text on mobile |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Subheadings |
| `font-bold` | 700 | Headings |
| `font-extrabold` | 800 | Display text |

---

## 📏 Spacing System

### Base Unit: 4px

Our spacing system uses a 4px base unit for consistency and alignment.

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `space-0` | 0 | 0px | No spacing |
| `space-0.5` | 0.125rem | 2px | Micro adjustments |
| `space-1` | 0.25rem | 4px | Minimal spacing |
| `space-2` | 0.5rem | 8px | Tight spacing |
| `space-3` | 0.75rem | 12px | Small spacing |
| `space-4` | 1rem | 16px | Standard spacing |
| `space-5` | 1.25rem | 20px | Medium spacing |
| `space-6` | 1.5rem | 24px | Large spacing |
| `space-8` | 2rem | 32px | Extra large spacing |
| `space-10` | 2.5rem | 40px | Section spacing |
| `space-12` | 3rem | 48px | Large section spacing |
| `space-16` | 4rem | 64px | Page section spacing |
| `space-20` | 5rem | 80px | Major section spacing |
| `space-24` | 6rem | 96px | Hero spacing |

**Extended spacing available:** 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96

### Touch-Friendly Spacing

For mobile interactions:
- `touch-sm`: 44px (WCAG AA minimum)
- `touch`: 48px (WCAG AAA recommended)

### Usage Examples

```tsx
// Padding
<div className="p-4">        {/* 16px all sides */}
<div className="px-6 py-4">  {/* 24px horizontal, 16px vertical */}

// Margin
<div className="mb-8">       {/* 32px bottom margin */}
<div className="space-y-4">  {/* 16px vertical spacing between children */}

// Gap (Flexbox/Grid)
<div className="flex gap-4"> {/* 16px gap between items */}
```

---

## 🎭 Shadow System

### Elevation Shadows

Our shadow system creates depth and hierarchy.

| Class | Usage | Example |
|-------|-------|---------|
| `shadow-xs` | Subtle elevation | Input fields |
| `shadow-sm` | Small cards | Form elements |
| `shadow-base` | Standard cards | Content cards |
| `shadow-md` | Elevated cards | Hover states |
| `shadow-lg` | Modals | Dialog boxes |
| `shadow-xl` | High elevation | Dropdowns, popovers |
| `shadow-2xl` | Maximum elevation | Full-screen modals |

### Colored Shadows

For emphasis on interactive elements:
- `shadow-primary`: Primary brand shadow
- `shadow-accent`: Accent color shadow

### Inner Shadows

For inset effects:
- `shadow-inner`: Subtle inner shadow
- `shadow-inner-lg`: Deeper inner shadow

### Mobile Shadows

Optimized for mobile:
- `shadow-mobile`: Standard mobile shadow
- `shadow-mobile-lg`: Large mobile shadow

### Focus Shadows

For accessibility:
- `shadow-focus`: Primary focus ring
- `shadow-focus-accent`: Accent focus ring

**Usage:**
```tsx
<div className="shadow-md hover:shadow-lg transition-shadow">
  Hover to see shadow change
</div>

<button className="focus:shadow-focus">
  Accessible focus state
</button>
```

---

## 🔲 Border Radius System

### Radius Scale

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `rounded-none` | 0 | 0px | Sharp corners |
| `rounded-sm` | 0.125rem | 2px | Subtle rounding |
| `rounded-base` | 0.25rem | 4px | Standard buttons |
| `rounded-md` | 0.375rem | 6px | Form inputs |
| `rounded-lg` | 0.5rem | 8px | Cards |
| `rounded-xl` | 0.75rem | 12px | Large cards |
| `rounded-2xl` | 1rem | 16px | Modals |
| `rounded-3xl` | 1.5rem | 24px | Special elements |
| `rounded-full` | 9999px | Full | Pills, avatars |

**Usage:**
```tsx
<button className="rounded-lg">Standard Button</button>
<div className="rounded-full">Avatar</div>
<input className="rounded-md">Form Input</input>
```

---

## 🎬 Animation & Motion System

### Motion Principles

1. **Purposeful**: Every animation should have a clear purpose
2. **Subtle**: Animations should enhance, not distract
3. **Fast**: Keep animations quick (150-300ms for most interactions)
4. **Consistent**: Use the same timing and easing throughout

### Duration Scale

| Class | Duration | Usage |
|-------|----------|-------|
| `duration-instant` | 75ms | Instant feedback |
| `duration-fast` | 150ms | Quick transitions |
| `duration-base` | 200ms | Standard transitions |
| `duration-moderate` | 300ms | Moderate animations |
| `duration-slow` | 400ms | Slow animations |
| `duration-slower` | 500ms | Very slow animations |
| `duration-slowest` | 700ms | Entrance animations |

### Easing Functions

| Class | Function | Usage |
|-------|----------|-------|
| `ease-smooth` | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing |
| `ease-in-smooth` | cubic-bezier(0.4, 0, 1, 1) | Accelerating animations |
| `ease-out-smooth` | cubic-bezier(0, 0, 0.2, 1) | Decelerating animations |
| `ease-bounce` | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Playful bounce |

### Pre-built Animations

#### Slide Animations
- `animate-slide-up`: Slide up from bottom
- `animate-slide-down`: Slide down from top
- `animate-slide-in-right`: Slide in from right
- `animate-slide-in-left`: Slide in from left

#### Fade Animations
- `animate-fade-in`: Simple fade in
- `animate-fade-out`: Simple fade out
- `animate-fade-in-up`: Fade in while moving up
- `animate-fade-in-down`: Fade in while moving down

#### Scale Animations
- `animate-scale-in`: Scale in from center
- `animate-scale-out`: Scale out to center

#### Utility Animations
- `animate-spin-slow`: Slow spin (3s)
- `animate-pulse-slow`: Slow pulse (3s)
- `animate-bounce-slow`: Slow bounce (2s)

### Usage Examples

```tsx
// Transitions
<button className="transition-all duration-base ease-smooth hover:scale-105">
  Hover Me
</button>

// Entrance animations
<div className="animate-fade-in-up">
  Content appears with fade and slide
</div>

// Slide transitions
<div className="animate-slide-up">
  Modal slides up from bottom
</div>
```

### Performance Guidelines

1. **Prefer transform and opacity**: These properties are GPU-accelerated
2. **Avoid animating**: width, height, top, left (use transform instead)
3. **Use will-change sparingly**: Only on elements that will definitely animate
4. **Reduce motion**: Respect `prefers-reduced-motion` media query

```tsx
// Good: Uses transform
<div className="transition-transform hover:translate-y-[-2px]">

// Bad: Animates position
<div className="transition-all hover:top-[-2px]">
```

---

## ♿ Accessibility Standards

### Color Contrast

- **Text**: Minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- **Interactive Elements**: Minimum 3:1 contrast ratio
- **Focus Indicators**: Always visible, minimum 3px, high contrast

### Touch Targets

- **Minimum Size**: 44x44px (WCAG AA)
- **Recommended Size**: 48x48px (WCAG AAA)
- **Spacing**: Minimum 8px between touch targets

**Implementation:**
```tsx
<button className="min-h-touch min-w-touch">
  Accessible Button
</button>
```

### Focus Management

All interactive elements must have visible focus states:

```tsx
<button className="focus:outline-none focus:shadow-focus focus:ring-2 focus:ring-primary-500">
  Accessible Focus
</button>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must follow logical reading order
- Provide skip links for repetitive navigation

### Screen Readers

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Provide `aria-label` for icon-only buttons
- Use `aria-live` regions for dynamic content
- Include visible text labels for all form inputs

### Motion & Animation

Respect user preferences for reduced motion:

```tsx
<div className="motion-safe:animate-fade-in motion-reduce:opacity-100">
  Respects user motion preferences
</div>
```

### Color Blindness

- Never use color alone to convey information
- Provide icons or text labels alongside color indicators
- Test with color blindness simulators

---

## 🎯 Usage Patterns

### Cards

```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-base">
  <h3 className="text-h3 text-secondary-800 mb-4">Card Title</h3>
  <p className="text-body-base text-secondary-600">Card content...</p>
</div>
```

### Buttons

```tsx
// Primary Button
<button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-base focus:shadow-focus">
  Primary Action
</button>

// Secondary Button
<button className="bg-secondary-200 hover:bg-secondary-300 text-secondary-800 font-semibold py-3 px-6 rounded-lg transition-all duration-base">
  Secondary Action
</button>

// Outline Button
<button className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-all duration-base">
  Outline Action
</button>
```

### Form Inputs

```tsx
<input 
  type="text"
  className="w-full px-4 py-3 rounded-md border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-fast text-body-base"
  placeholder="Enter text..."
/>
```

### Modals

```tsx
<div className="fixed inset-0 z-modal flex items-center justify-center p-4">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
  
  {/* Modal */}
  <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
    <h2 className="text-h2 mb-4">Modal Title</h2>
    <p className="text-body-base text-secondary-600">Modal content...</p>
  </div>
</div>
```

### Alerts

```tsx
// Success Alert
<div className="bg-success-50 border-l-4 border-success-500 p-4 rounded-md">
  <p className="text-success-800 font-medium">Success message</p>
</div>

// Error Alert
<div className="bg-error-50 border-l-4 border-error-500 p-4 rounded-md">
  <p className="text-error-800 font-medium">Error message</p>
</div>
```

---

## 📦 Z-Index System

To prevent z-index conflicts, use our predefined scale:

| Class | Value | Usage |
|-------|-------|-------|
| `z-0` | 0 | Base level |
| `z-10` | 10 | Slightly elevated |
| `z-20` | 20 | More elevated |
| `z-30` | 30 | Even more elevated |
| `z-40` | 40 | Highly elevated |
| `z-50` | 50 | Very high |
| `z-dropdown` | 1000 | Dropdown menus |
| `z-sticky` | 1020 | Sticky headers |
| `z-fixed` | 1030 | Fixed elements |
| `z-modal-backdrop` | 1040 | Modal backdrops |
| `z-modal` | 1050 | Modals |
| `z-popover` | 1060 | Popovers |
| `z-tooltip` | 1070 | Tooltips |

---

## 🔄 Responsive Design

All components should follow mobile-first approach:

```tsx
<div className="text-body-sm md:text-body-base lg:text-body-lg">
  Responsive text that grows with screen size
</div>

<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

### Breakpoints

- `xs`: 375px (Small phones)
- `sm`: 640px (Large phones)
- `md`: 768px (Tablets)
- `lg`: 1024px (Laptops)
- `xl`: 1280px (Desktops)
- `2xl`: 1536px (Large desktops)

---

## 🚀 Getting Started

### For Developers

1. **Import design tokens**: All tokens are in `tailwind.config.ts`
2. **Use utility classes**: Apply Tailwind classes directly in JSX
3. **Follow patterns**: Use the usage patterns section as reference
4. **Check accessibility**: Ensure all components meet WCAG AA standards

### For Designers

1. **Figma setup**: Use the design tokens to set up Figma variables
2. **Component library**: Build components following this system
3. **Maintain consistency**: Always use defined tokens, never arbitrary values
4. **Document deviations**: If you need new tokens, document and propose them

---

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Motion Guidelines](https://material.io/design/motion)

---

## 🔄 Updates & Versioning

**Version**: 1.0.0  
**Last Updated**: February 23, 2026

### Change Log

- **1.0.0** (Feb 23, 2026): Initial design system establishment
  - Comprehensive color palette with semantic colors
  - Typography hierarchy (13 text sizes)
  - 4px-based spacing system
  - Shadow and border radius scales
  - Motion and animation system
  - Accessibility standards
  - Z-index system

---

## 🤝 Contributing

When proposing changes to the design system:

1. **Document the need**: Explain why the change is necessary
2. **Provide examples**: Show use cases and mockups
3. **Consider impact**: How will this affect existing components?
4. **Maintain consistency**: Does it fit with existing patterns?
5. **Update docs**: Keep this document in sync with code

---

**Questions?** Contact the design team or open an issue in the repository.
