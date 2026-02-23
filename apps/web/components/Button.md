# Button Component Documentation

Comprehensive button component system with multiple variants, sizes, states, and features.

## Features

✅ **Three Variants**: Primary, Secondary, Tertiary/Ghost  
✅ **Three Sizes**: Small, Medium, Large  
✅ **Multiple States**: Default, Hover, Active, Disabled, Loading  
✅ **Icon Support**: Left and right icon positioning  
✅ **Full Width**: Option for full-width buttons  
✅ **Button Groups**: Horizontal and vertical grouping with attached/spaced options  
✅ **Accessible**: Proper focus states, ARIA support, keyboard navigation  
✅ **Touch Optimized**: Minimum touch targets (44px for medium, 48px for large)  
✅ **Dark Mode**: Full dark mode support  
✅ **TypeScript**: Fully typed with TypeScript interfaces  

## Basic Usage

```tsx
import { Button } from '@/components/Button'

function MyComponent() {
  return (
    <Button variant="primary" size="medium">
      Click Me
    </Button>
  )
}
```

## Variants

### Primary
Main action button with primary brand color.

```tsx
<Button variant="primary">Primary Button</Button>
```

### Secondary
Secondary action button with neutral styling.

```tsx
<Button variant="secondary">Secondary Button</Button>
```

### Tertiary/Ghost
Subtle button with border and transparent background.

```tsx
<Button variant="tertiary">Tertiary Button</Button>
```

## Sizes

### Small
```tsx
<Button size="small">Small Button</Button>
```
- Height: 36px (minimum)
- Padding: `px-3 py-1.5`
- Text: `text-sm`
- Icon: 16px (h-4 w-4)

### Medium (Default)
```tsx
<Button size="medium">Medium Button</Button>
```
- Height: 44px (WCAG AA compliant touch target)
- Padding: `px-4 py-2`
- Text: `text-base`
- Icon: 20px (h-5 w-5)

### Large
```tsx
<Button size="large">Large Button</Button>
```
- Height: 48px (WCAG AAA compliant touch target)
- Padding: `px-6 py-3`
- Text: `text-lg`
- Icon: 24px (h-6 w-6)

## States

### Default
Normal button state.

```tsx
<Button variant="primary">Default</Button>
```

### Loading
Shows spinner and disables interaction.

```tsx
<Button variant="primary" isLoading>Loading...</Button>
```

### Disabled
Disabled state with reduced opacity.

```tsx
<Button variant="primary" disabled>Disabled</Button>
```

### Hover & Active
Automatically handled with CSS transitions and active scale effect.

## Icons

### Left Icon
```tsx
import { Plus } from 'lucide-react'

<Button variant="primary" leftIcon={Plus}>Add Item</Button>
```

### Right Icon
```tsx
import { ArrowRight } from 'lucide-react'

<Button variant="primary" rightIcon={ArrowRight}>Continue</Button>
```

### Both Icons
```tsx
import { Save, Check } from 'lucide-react'

<Button variant="primary" leftIcon={Save} rightIcon={Check}>
  Save Changes
</Button>
```

## Full Width

```tsx
<Button variant="primary" fullWidth>
  Full Width Button
</Button>
```

## Button Groups

### Horizontal Attached
Buttons connected together horizontally.

```tsx
import { ButtonGroup } from '@/components/ButtonGroup'

<ButtonGroup attached>
  <Button variant="primary">Save</Button>
  <Button variant="primary">Cancel</Button>
  <Button variant="primary">Delete</Button>
</ButtonGroup>
```

### Horizontal Spaced
Buttons with spacing between them.

```tsx
<ButtonGroup>
  <Button variant="secondary">Edit</Button>
  <Button variant="secondary">Share</Button>
  <Button variant="secondary">Delete</Button>
</ButtonGroup>
```

### Vertical Attached
Buttons connected together vertically.

```tsx
<ButtonGroup orientation="vertical" attached>
  <Button variant="primary">Option 1</Button>
  <Button variant="primary">Option 2</Button>
  <Button variant="primary">Option 3</Button>
</ButtonGroup>
```

### Mixed Variants
Different button variants in the same group.

```tsx
<ButtonGroup>
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="tertiary">Tertiary</Button>
</ButtonGroup>
```

## Props

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `leftIcon` | `LucideIcon` | - | Icon component for left side |
| `rightIcon` | `LucideIcon` | - | Icon component for right side |
| `fullWidth` | `boolean` | `false` | Make button full width |
| `disabled` | `boolean` | - | Disable button |
| `children` | `React.ReactNode` | - | Button content |

### ButtonGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Group orientation |
| `attached` | `boolean` | `false` | Connect buttons together |
| `children` | `React.ReactNode` | - | Button elements |

## Accessibility

- **Keyboard Navigation**: Full keyboard support (Enter, Space)
- **Focus Indicators**: Clear focus rings with `focus:ring-2`
- **ARIA**: Proper button roles and states
- **Screen Readers**: Loading state announced with `sr-only` text
- **Touch Targets**: Minimum 44px height for medium, 48px for large (WCAG compliant)
- **Disabled State**: Properly disabled with `disabled` attribute and visual feedback

## Examples

### Complete Example
```tsx
import { Button, ButtonGroup } from '@/components/Button'
import { Plus, Save, X } from 'lucide-react'

function ActionButtons() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button 
          variant="primary" 
          size="large" 
          leftIcon={Plus}
          fullWidth
        >
          Create New
        </Button>
        <Button 
          variant="secondary" 
          size="large"
          fullWidth
        >
          View All
        </Button>
      </div>

      <ButtonGroup attached>
        <Button variant="primary" leftIcon={Save}>Save</Button>
        <Button variant="secondary">Export</Button>
        <Button variant="tertiary" leftIcon={X}>Cancel</Button>
      </ButtonGroup>
    </div>
  )
}
```

### Form Actions
```tsx
<div className="flex gap-2 justify-end">
  <Button variant="tertiary" onClick={handleCancel}>
    Cancel
  </Button>
  <Button 
    variant="primary" 
    onClick={handleSubmit}
    isLoading={isSubmitting}
  >
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </Button>
</div>
```

### Icon Only (Custom)
```tsx
<Button 
  variant="tertiary" 
  size="small"
  leftIcon={Heart}
  aria-label="Add to favorites"
/>
```

## Performance

- CSS transitions (no JavaScript animations)
- Minimal DOM nodes
- Efficient Tailwind CSS classes
- No unnecessary re-renders

## Mobile Optimization

- Touch-friendly sizes (minimum 44px height)
- Active state with scale effect for tactile feedback
- Full width option for mobile layouts
- Responsive spacing in button groups

## Examples

See `ButtonVariants.tsx` for comprehensive examples of all features and variants.
