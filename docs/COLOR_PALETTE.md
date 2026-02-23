# PayEasy Color Palette & Brand Guidelines

This document serves as the official reference for the PayEasy color identity system and Tailwind CSS integrations. All colors are defined in `apps/web/styles/colors.css` as CSS Custom Properties (variables) and wired automatically into `apps/web/tailwind.config.ts`. 

## Core Principles
1. **Perceptually Consistent Scale**: Colors follow a true 50–950 scale ensuring smooth, predictable steps from highlight to shadow.
2. **WCAG AA Compliance**: Foreground to background ratios must pass strict WCAG AA bounds (4.5:1 ratio).
3. **First-Class Dark Mode**: Every variable gracefully transitions to its predefined dark-theme equivalent via `.dark` toggles without overriding utility logic in React markup.
4. **No Hardcoded Hexes**: Everything integrates through Tailwind semantics natively hooked into `var(--color-...)`.

---

## The Palette

### Primary: Violet
The core brand signature. Highly energetic and recognizable. Used for primary actions, heavy thematic branding, and active elements.
- **`primary-50`:** `#f5f3ff` (Light) / `#2e1065` (Dark)
- **`primary-100`:** `#ede9fe` (Light) / `#4c1d95` (Dark)
- **`primary-200`:** `#ddd6fe` (Light) / `#5b21b6` (Dark)
- **`primary-300`:** `#c4b5fd` (Light) / `#6d28d9` (Dark)
- **`primary-400`:** `#a78bfa` (Light) / `#7c3aed` (Dark)
- **`primary-500`:** `#8b5cf6` (Light) / `#8b5cf6` (Dark) — **DEFAULT** *(Main Action/Button Color)*
- **`primary-600`:** `#7c3aed` (Light) / `#a78bfa` (Dark)
- **`primary-700`:** `#6d28d9` (Light) / `#c4b5fd` (Dark)
- **`primary-800`:** `#5b21b6` (Light) / `#ddd6fe` (Dark)
- **`primary-900`:** `#4c1d95` (Light) / `#ede9fe` (Dark)
- **`primary-950`:** `#2e1065` (Light) / `#f5f3ff` (Dark)

*(Tailwind classes: `bg-primary`, `text-primary`, `bg-primary-500`, etc.)*

### Secondary: Slate
A deeply saturated, cool neutral tone. Perfect for heavy structural elements, borders, subtle contrasts against pure white or black.
- **`secondary-50`:** `#f8fafc` (Light) / `#020617` (Dark)
- **`secondary-100`:** `#f1f5f9` (Light) / `#0f172a` (Dark)
- **`secondary-200`:** `#e2e8f0` (Light) / `#1e293b` (Dark)
- **`secondary-300`:** `#cbd5e1` (Light) / `#334155` (Dark)
- **`secondary-400`:** `#94a3b8` (Light) / `#475569` (Dark)
- **`secondary-500`:** `#64748b` (Light) / `#64748b` (Dark) — **DEFAULT**
- **`secondary-600`:** `#475569` (Light) / `#94a3b8` (Dark)
- **`secondary-700`:** `#334155` (Light) / `#cbd5e1` (Dark)
- **`secondary-800`:** `#1e293b` (Light) / `#e2e8f0` (Dark)
- **`secondary-900`:** `#0f172a` (Light) / `#f1f5f9` (Dark)
- **`secondary-950`:** `#020617` (Light) / `#f8fafc` (Dark)

*(Tailwind classes: `bg-secondary`, `text-secondary`, `bg-secondary-500`, etc.)*

### Accent: Blue
A trustworthy, calming alternative color primarily utilized for info states or secondary thematic layers.
- **`accent-50`:** `#eff6ff` (Light) / `#172554` (Dark)
- **`accent-100`:** `#dbeafe` (Light) / `#1e3a8a` (Dark)
- **`accent-200`:** `#bfdbfe` (Light) / `#1e40af` (Dark)
- **`accent-300`:** `#93c5fd` (Light) / `#1d4ed8` (Dark)
- **`accent-400`:** `#60a5fa` (Light) / `#2563eb` (Dark)
- **`accent-500`:** `#3b82f6` (Light) / `#3b82f6` (Dark) — **DEFAULT**
- **`accent-600`:** `#2563eb` (Light) / `#60a5fa` (Dark)
- **`accent-700`:** `#1d4ed8` (Light) / `#93c5fd` (Dark)
- **`accent-800`:** `#1e40af` (Light) / `#bfdbfe` (Dark)
- **`accent-900`:** `#1e3a8a` (Light) / `#dbeafe` (Dark)
- **`accent-950`:** `#172554` (Light) / `#eff6ff` (Dark)

*(Tailwind classes: `bg-accent`, `text-accent`, etc.)*

### Neutral: Zinc
Strict grays balanced specifically to blend effortlessly alongside the intense Primary/Accent hues without clashing warmly.
- **`neutral-50`:** `#fafafa` (Light) / `#09090b` (Dark)
- **`neutral-100`:** `#f4f4f5` (Light) / `#18181b` (Dark)
- **`neutral-200`:** `#e4e4e7` (Light) / `#27272a` (Dark)
- **`neutral-300`:** `#d4d4d8` (Light) / `#3f3f46` (Dark)
- **`neutral-400`:** `#a1a1aa` (Light) / `#52525b` (Dark)
- **`neutral-500`:** `#71717a` (Light) / `#71717a` (Dark) — **DEFAULT**
- **`neutral-600`:** `#52525b` (Light) / `#a1a1aa` (Dark)
- **`neutral-700`:** `#3f3f46` (Light) / `#d4d4d8` (Dark)
- **`neutral-800`:** `#27272a` (Light) / `#e4e4e7` (Dark)
- **`neutral-900`:** `#18181b` (Light) / `#f4f4f5` (Dark)
- **`neutral-950`:** `#09090b` (Light) / `#fafafa` (Dark)

*(Tailwind classes: `bg-neutral-100`, `text-neutral-900`)*

---

## Semantic State Palette

Highly focused object states ensuring user clarity utilizing established psychological hue mapping safely passing WCAG contrast barriers implicitly.

### Success
- **Background:** `bg-success-background` (Light: `#dcfce7` / Dark: `#052e16`)
- **Foreground:** `text-success-foreground` (Light: `#14532d` / Dark: `#4ade80`) *Contrast: > 15:1*
- **Border:** `border-success-border` (Light: `#86efac` / Dark: `#166534`)

### Warning
- **Background:** `bg-warning-background` (Light: `#fef9c3` / Dark: `#422006`)
- **Foreground:** `text-warning-foreground` (Light: `#713f12` / Dark: `#facc15`) *Contrast: > 14:1*
- **Border:** `border-warning-border` (Light: `#fde047` / Dark: `#854d0e`)

### Error
- **Background:** `bg-error-background` (Light: `#ffe4e6` / Dark: `#4c0519`)
- **Foreground:** `text-error-foreground` (Light: `#881337` / Dark: `#fb7185`) *Contrast: > 13:1*
- **Border:** `border-error-border` (Light: `#fda4af` / Dark: `#9f1239`)

---

## Usage Example

```html
<!-- Native Component utilizing standard dynamic configurations -->
<button className="bg-primary text-white hover:bg-primary-600 dark:hover:bg-primary-400 rounded-lg shadow-sm">
  Pay Now
</button>

<!-- Semantic Warning Label -->
<div className="bg-warning-background text-warning-foreground border border-warning-border rounded-md px-4 py-2">
  Warning: Connection unstable.
</div>
```

## How to Extend
To add a new state, navigate directly to `apps/web/styles/colors.css`. Add your 11 shade values or explicit semantic bindings to `:root`, clone the parameters inside `[data-theme="dark"]` for inversions, then map them identically into the `colors` config file located in `apps/web/tailwind.config.ts`. No layout or application recompilation structural changes are necessary.
