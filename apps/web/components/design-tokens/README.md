# Design Tokens

This directory contains the design tokens for the PayEasy application. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

## What are Design Tokens?

Design tokens are the single source of truth for design decisions. They help maintain consistency across the application and make it easier to update the visual design in the future.

## Structure

```
design-tokens/
├── colors.ts          # Color palette and semantic colors
├── typography.ts      # Font sizes, weights, and presets
├── spacing.ts         # Spacing scale and layout presets
├── shadows.ts         # Shadow system for elevation
├── borderRadius.ts    # Border radius scale
├── motion.ts          # Animation durations and easings
├── index.ts           # Central export point
└── README.md          # This file
```

## Usage

### Importing Tokens

```typescript
// Import all tokens
import * as tokens from '@/components/design-tokens';

// Import specific token categories
import { colors, spacing, shadows } from '@/components/design-tokens';

// Import specific functions or types
import { getColor, ColorScale } from '@/components/design-tokens/colors';
```

### Using in Components

#### Colors

```tsx
import { colors, semanticColors } from '@/components/design-tokens';

const MyComponent = () => (
  <div style={{ backgroundColor: colors.primary[500] }}>
    <p style={{ color: semanticColors.text.primary }}>Hello</p>
  </div>
);
```

#### Typography

```tsx
import { getFontSize, typographyPresets } from '@/components/design-tokens';

const heading = getFontSize('h1');

const MyHeading = () => (
  <h1 style={{
    fontSize: heading.size,
    lineHeight: heading.lineHeight,
    fontWeight: heading.fontWeight,
  }}>
    Page Title
  </h1>
);
```

#### Spacing

```tsx
import { spacing, spacingPresets } from '@/components/design-tokens';

const MyCard = () => (
  <div style={{ 
    padding: spacing[6],  // 24px
    marginBottom: spacing[8],  // 32px
    gap: spacingPresets.gap.md,
  }}>
    Card Content
  </div>
);
```

#### Shadows

```tsx
import { shadows, shadowPresets } from '@/components/design-tokens';

const MyButton = () => (
  <button style={{ 
    boxShadow: shadowPresets.button.default 
  }}>
    Click Me
  </button>
);
```

#### Motion

```tsx
import { createTransition, transitionPresets } from '@/components/design-tokens';

const MyComponent = () => (
  <div style={{ 
    transition: transitionPresets.button 
  }}>
    Animated Element
  </div>
);
```

## When to Use Design Tokens vs Tailwind Classes

### Use Tailwind Classes When:
- Building UI components with JSX/TSX
- You need responsive styles
- You want automatic purging of unused styles
- Working with standard HTML/React components

```tsx
<button className="bg-primary-500 text-white px-6 py-3 rounded-lg shadow-md">
  Click Me
</button>
```

### Use Design Tokens When:
- Working with dynamic styles in JavaScript
- Creating charts, visualizations, or canvas elements
- Need programmatic access to design values
- Building style objects in JS
- Working with third-party libraries that expect JS style objects

```tsx
import { colors, spacing } from '@/components/design-tokens';

const chartConfig = {
  color: colors.primary[500],
  backgroundColor: colors.primary[50],
  padding: spacing[4],
};
```

## Helper Functions

The design tokens include helpful utility functions:

### Color Functions
- `getColor(scale, shade)` - Get a specific color value
- Examples in `colors.ts`

### Typography Functions
- `getFontSize(size)` - Get font size properties
- `getFontWeight(weight)` - Get font weight value

### Spacing Functions
- `getSpacing(key)` - Get spacing value
- `spacingToPx(key)` - Convert spacing to pixels

### Shadow Functions
- `getShadow(key)` - Get shadow value

### Motion Functions
- `createTransition(properties, duration, easing)` - Create transition string
- `getDuration(key)` - Get duration value
- `getEasing(key)` - Get easing function

### Utility Functions
- `prefersReducedMotion()` - Check user motion preferences
- `prefersDarkMode()` - Check user color scheme preference
- `getBreakpoint(key)` - Get breakpoint value
- `getZIndex(key)` - Get z-index value

## Type Safety

All design tokens are fully typed with TypeScript:

```typescript
import { ColorScale, ColorShade, FontSize } from '@/components/design-tokens';

const scale: ColorScale = 'primary';
const shade: ColorShade = '500';
const fontSize: FontSize = 'h1';
```

## Synchronization

These design tokens are synchronized with the Tailwind configuration in `tailwind.config.ts`. Any changes to one should be reflected in the other.

- **For CSS/Tailwind**: Update `tailwind.config.ts`
- **For JS/TS**: Update files in this directory
- **For both**: Update both locations and documentation

## Versioning

Current Version: **1.0.0**

Version is tracked in `index.ts` as `DESIGN_TOKEN_VERSION`.

## Best Practices

1. **Always use tokens** - Never use arbitrary values
2. **Use semantic names** - Prefer `semanticColors.text.primary` over `colors.secondary[900]`
3. **Document exceptions** - If you must deviate, document why
4. **Keep in sync** - Ensure tokens match Tailwind config
5. **Type everything** - Use TypeScript types for safety
6. **Test responsive** - Verify token usage across breakpoints

## Contributing

When adding new tokens:

1. Add to the appropriate file (`colors.ts`, `spacing.ts`, etc.)
2. Update TypeScript types
3. Add to Tailwind config if applicable
4. Document in `docs/DESIGN_SYSTEM.md`
5. Add usage examples
6. Update version number if breaking changes

## Related Documentation

- [Design System Documentation](../../../docs/DESIGN_SYSTEM.md)
- [Tailwind Configuration](../../tailwind.config.ts)
- [Component Library](../)

## Questions?

For questions or suggestions, please:
1. Check the design system documentation
2. Review existing usage in the codebase
3. Open an issue or discussion
4. Contact the design team
