# Loading States & Skeletons Documentation

Comprehensive loading state components with spinners, skeletons, and smooth animations.

## Features

✅ **Spinner Component**: Multiple sizes and variants  
✅ **Skeleton Loaders**: Text, circular, rectangular, rounded variants  
✅ **Shimmer Effect**: Smooth shimmer animation  
✅ **Pulse Animation**: Alternative pulse animation  
✅ **Skeleton Cards**: Pre-built card skeletons  
✅ **Button Loading**: Integrated with Button component  
✅ **No Layout Shift**: Fixed dimensions prevent layout shift  
✅ **Accessible**: ARIA labels and roles  
✅ **Dark Mode**: Full dark mode support  
✅ **Performance**: CSS animations, no JavaScript  

## Spinner Component

### Basic Usage

```tsx
import { Spinner } from '@/components/Spinner'

<Spinner />
```

### Sizes

```tsx
<Spinner size="small" />   // 16px
<Spinner size="medium" />  // 20px (default)
<Spinner size="large" />   // 32px
<Spinner size="xlarge" />  // 48px
```

### Variants

```tsx
<Spinner variant="primary" />    // Primary brand color
<Spinner variant="secondary" />   // Gray
<Spinner variant="white" />       // White (for dark backgrounds)
<Spinner variant="gray" />        // Light gray
```

### With Text

```tsx
import { SpinnerWithText } from '@/components/Spinner'

<SpinnerWithText text="Loading..." />
<SpinnerWithText size="large" text="Please wait..." />
```

### Inline

```tsx
import { SpinnerInline } from '@/components/Spinner'

<p>Loading content <SpinnerInline /> in the middle of text.</p>
```

## Skeleton Component

### Basic Usage

```tsx
import { Skeleton } from '@/components/Skeleton'

<Skeleton />
```

### Variants

#### Text
```tsx
<Skeleton variant="text" width={200} />
<SkeletonText lines={3} />
```

#### Circular
```tsx
<Skeleton variant="circular" size="medium" />
<SkeletonCircle size="large" />
```

#### Rectangular
```tsx
<Skeleton variant="rectangular" width={300} height={100} />
<SkeletonRectangle width={200} height={150} />
```

#### Rounded
```tsx
<Skeleton variant="rounded" width={300} height={100} />
```

### Sizes

```tsx
<SkeletonCircle size="small" />   // 40px
<SkeletonCircle size="medium" />  // 64px
<SkeletonCircle size="large" />   // 96px
```

### Animations

#### Shimmer (Default)
```tsx
<Skeleton variant="rectangular" width={300} height={100} shimmer />
```

#### Pulse
```tsx
<Skeleton variant="rectangular" width={300} height={100} shimmer={false} />
```

### Custom Dimensions

```tsx
<Skeleton width={250} height={80} />
<Skeleton width="100%" height={200} />
```

## Skeleton Cards

### Default Card

```tsx
import { SkeletonCard } from '@/components/SkeletonCard'

<SkeletonCard />
```

### Variants

```tsx
<SkeletonCard variant="default" />   // Full card with image
<SkeletonCard variant="compact" />    // Compact version
<SkeletonCard variant="detailed" />   // With extra details
```

### Options

```tsx
<SkeletonCard 
  showImage={true}
  showAvatar={true}
  lines={3}
/>
```

### Listing Card

```tsx
import { SkeletonListingCard } from '@/components/SkeletonCard'

<SkeletonListingCard />
```

### Table Skeleton

```tsx
import { SkeletonTable } from '@/components/SkeletonCard'

<SkeletonTable rows={5} columns={4} />
```

### List Skeleton

```tsx
import { SkeletonList } from '@/components/SkeletonCard'

<SkeletonList items={5} showAvatar={true} />
```

## Button Loading States

The Button component has built-in loading support:

```tsx
import { Button } from '@/components/Button'

<Button variant="primary" isLoading>
  Loading...
</Button>
```

## Complete Examples

### Page Loading

```tsx
import { SpinnerWithText, SkeletonCard } from '@/components'

function LoadingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-8">
        <SpinnerWithText size="large" text="Loading page..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
```

### List Loading

```tsx
import { SkeletonList } from '@/components/SkeletonCard'

function LoadingList() {
  return <SkeletonList items={5} showAvatar={true} />
}
```

### Table Loading

```tsx
import { SkeletonTable } from '@/components/SkeletonCard'

function LoadingTable() {
  return <SkeletonTable rows={10} columns={5} />
}
```

### Inline Loading

```tsx
import { SpinnerInline, SkeletonText } from '@/components'

function LoadingContent() {
  return (
    <div>
      <p>Loading content <SpinnerInline /> in text.</p>
      <SkeletonText lines={3} />
    </div>
  )
}
```

## Props

### Spinner Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | `'medium'` | Spinner size |
| `variant` | `'primary' \| 'secondary' \| 'white' \| 'gray'` | `'primary'` | Color variant |
| `label` | `string` | - | ARIA label |

### Skeleton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circular' \| 'rectangular' \| 'rounded'` | `'rectangular'` | Shape variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size (for circular) |
| `width` | `string \| number` | - | Custom width |
| `height` | `string \| number` | - | Custom height |
| `shimmer` | `boolean` | `true` | Enable shimmer animation |
| `lines` | `number` | - | Number of text lines |

### SkeletonCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Card style |
| `showImage` | `boolean` | `true` | Show image skeleton |
| `showAvatar` | `boolean` | `true` | Show avatar skeleton |
| `lines` | `number` | `3` | Number of text lines |

## Accessibility

- **ARIA Labels**: All loading components have proper ARIA labels
- **Role Attributes**: `role="status"` for screen readers
- **Screen Reader Text**: Loading text announced to screen readers
- **Focus Management**: No focus traps during loading

## Performance

- **CSS Animations**: All animations use CSS (no JavaScript)
- **GPU Accelerated**: Transform-based animations
- **Optimized**: Minimal DOM nodes
- **No Layout Shift**: Fixed dimensions prevent reflow

## Best Practices

1. **Match Content**: Skeleton should match the actual content structure
2. **Fixed Dimensions**: Use fixed width/height to prevent layout shift
3. **Appropriate Size**: Use appropriate spinner size for context
4. **Clear Labels**: Provide descriptive loading text
5. **Timeout Handling**: Show error state after reasonable timeout

## Examples

See `LoadingStates.tsx` for comprehensive examples of all features.
