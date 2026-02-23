# Layout Templates & Patterns

Reusable layout primitives for consistent page structure across the app.

## Included components

- `Container`: standard width wrappers (`narrow`, `default`, `wide`, `full`)
- `Section`: spacing presets with optional built-in container wrapper
- `TwoColumnLayout`: responsive two-column templates
- `ThreeColumnLayout`: responsive three-column templates
- `SidebarLayout`: sidebar + main pattern with optional sticky sidebar
- `GridLayout`: common card/grid templates

## Width presets

- `narrow`: readable content sections
- `default`: forms and dashboards
- `wide`: marketing pages and dense grids
- `full`: edge-to-edge layouts

## Spacing presets

- `none`, `xs`, `sm`, `md`, `lg`, `xl`

## Example usage

```tsx
import {
  Section,
  TwoColumnLayout,
  SidebarLayout,
  GridLayout,
} from '@/components/layouts'

<Section spacing="xl" containerWidth="wide">
  <TwoColumnLayout
    split="content-main"
    left={<FiltersPanel />}
    right={<ListingsGrid />}
  />
</Section>

<Section spacing="lg">
  <SidebarLayout sidebar={<ProfileNav />} stickySidebar>
    <GridLayout template="cards-3">
      <StatCard />
      <StatCard />
      <StatCard />
    </GridLayout>
  </SidebarLayout>
</Section>
```

## Notes

- All layouts are mobile-first and stack by default.
- Use `gap` props to keep spacing consistent instead of ad-hoc utilities.
- `Section` + `Container` should be the default outer page pattern.

