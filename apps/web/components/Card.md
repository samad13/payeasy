# Card Component Documentation

Premium card components with multiple variants, hover effects, and comprehensive features.

## Features

✅ **Three Variants**: Elevated, Outlined, and Filled  
✅ **Hover Effects**: Smooth animations and shadow transitions  
✅ **Icon Support**: Header icons with styled containers  
✅ **Badge Support**: Multiple badge variants (default, primary, success, warning, danger)  
✅ **Action Buttons**: Header action area with icon buttons  
✅ **Responsive**: Mobile-optimized with responsive padding  
✅ **Accessible**: Semantic HTML, ARIA support, keyboard navigation  
✅ **Dark Mode**: Full dark mode support  
✅ **TypeScript**: Fully typed with TypeScript interfaces  

## Basic Usage

```tsx
import { Card, CardHeader, CardContent } from '@/components/Card'

function MyCard() {
  return (
    <Card variant="elevated" hoverable>
      <CardHeader title="Card Title" subtitle="Card subtitle" />
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  )
}
```

## Variants

### Elevated (Default)
Shadow-based design with hover lift effect.

```tsx
<Card variant="elevated" hoverable>
  <CardHeader title="Elevated Card" />
  <CardContent>Content</CardContent>
</Card>
```

### Outlined
Border-focused design with transparent background.

```tsx
<Card variant="outlined" hoverable>
  <CardHeader title="Outlined Card" />
  <CardContent>Content</CardContent>
</Card>
```

### Filled
Background color variant with subtle border.

```tsx
<Card variant="filled" hoverable>
  <CardHeader title="Filled Card" />
  <CardContent>Content</CardContent>
</Card>
```

## With Icon

```tsx
import { Home } from 'lucide-react'

<Card variant="elevated" icon={Home}>
  <CardHeader title="Property Listing" subtitle="123 Main St" />
  <CardContent>Content</CardContent>
</Card>
```

## With Badge

```tsx
import { CardBadge } from '@/components/Card'

<Card 
  variant="elevated" 
  badge={<CardBadge variant="primary">Featured</CardBadge>}
>
  <CardHeader title="Premium Listing" />
  <CardContent>Content</CardContent>
</Card>
```

## With Actions

```tsx
import { CardAction } from '@/components/Card'
import { MoreVertical, Heart } from 'lucide-react'

<Card 
  variant="elevated"
  actions={
    <>
      <CardAction icon={Heart} aria-label="Favorite" />
      <CardAction icon={MoreVertical} aria-label="More options" />
    </>
  }
>
  <CardHeader title="Card with Actions" />
  <CardContent>Content</CardContent>
</Card>
```

## With Footer

```tsx
<Card 
  variant="elevated"
  footer={
    <div className="flex justify-between">
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  }
>
  <CardHeader title="Card with Footer" />
  <CardContent>Content</CardContent>
</Card>
```

## Complete Example

```tsx
import { Card, CardHeader, CardContent, CardBadge, CardAction } from '@/components/Card'
import { Home, Heart, MoreVertical } from 'lucide-react'

<Card 
  variant="elevated" 
  hoverable
  icon={Home}
  badge={<CardBadge variant="success">Available</CardBadge>}
  actions={
    <>
      <CardAction icon={Heart} aria-label="Add to favorites" />
      <CardAction icon={MoreVertical} aria-label="More options" />
    </>
  }
  header={<CardHeader title="Luxury Apartment" subtitle="Downtown District" />}
  footer={
    <button className="w-full bg-primary text-white py-2 rounded-lg">
      View Details
    </button>
  }
>
  <CardContent>
    <p>3 Bedrooms • 2 Bathrooms</p>
    <p className="text-2xl font-bold text-primary mt-2">2,000 XLM/month</p>
  </CardContent>
</Card>
```

## Badge Variants

```tsx
<CardBadge variant="default">Default</CardBadge>
<CardBadge variant="primary">Primary</CardBadge>
<CardBadge variant="success">Success</CardBadge>
<CardBadge variant="warning">Warning</CardBadge>
<CardBadge variant="danger">Danger</CardBadge>
```

## Props

### Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'elevated' \| 'outlined' \| 'filled'` | `'elevated'` | Card style variant |
| `hoverable` | `boolean` | `true` | Enable hover lift effect |
| `icon` | `LucideIcon` | - | Icon component for header |
| `badge` | `React.ReactNode` | - | Badge element |
| `actions` | `React.ReactNode` | - | Action buttons area |
| `header` | `React.ReactNode` | - | Custom header content |
| `footer` | `React.ReactNode` | - | Footer content |
| `children` | `React.ReactNode` | - | Main card content |

### CardHeader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title (required) |
| `subtitle` | `string` | - | Optional subtitle |

### CardBadge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Badge color variant |
| `children` | `React.ReactNode` | - | Badge content |

### CardAction Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `LucideIcon` | - | Icon component |
| `children` | `React.ReactNode` | - | Button content (if no icon) |

## Accessibility

- Uses semantic HTML (`<article>`, `<header>`, `<footer>`)
- Proper ARIA labels on action buttons
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

## Performance

- CSS transitions (no JavaScript animations)
- Optimized re-renders with React.memo potential
- Minimal DOM nodes
- Efficient Tailwind CSS classes

## Mobile Optimization

- Responsive padding (`p-4 sm:p-6`)
- Touch-friendly action buttons (minimum 44px)
- Mobile-optimized spacing
- Responsive grid layouts

## Examples

See `CardVariants.tsx` for comprehensive examples of all features and variants.
