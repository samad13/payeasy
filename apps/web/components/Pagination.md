# Pagination Component

A fully featured, accessible, and responsive pagination component for navigating paginated results. It includes previous/next navigation, numeric page navigation with responsive ellipses for collapsed page ranges, jump-to-page input, and results info display.

## Props Interface

The `Pagination` component accepts the following props:

| Prop | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| `currentPage` | `number` | Yes | The current active page (1-indexed). |
| `totalPages` | `number` | Yes | The total number of pages available. |
| `pageSize` | `number` | No | Number of items displayed per page. Required for Results Info display. |
| `totalResults` | `number` | No | Total number of results across all pages. Required for Results Info display. |
| `size` | `"sm" \| "md" \| "lg"` | No | Pre-defined size variant for buttons and text. Default is `"md"`. |
| `onPageChange` | `(page: number) => void` | Yes | Callback fired with the new page number when a user navigates. |

## Usage Examples

### Basic Usage

Use this for simple page traversal when you only have `currentPage` and `totalPages`.

```tsx
import { useState } from "react";
import Pagination from "@/components/Pagination";

export default function BasicPaginationDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 15;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    />
  );
}
```

### Full Featured Usage (With Results Info)

By providing `pageSize` and `totalResults`, the component automatically generates a "Showing X–Y of Z results" string that provides essential context to the user.

```tsx
import { useState } from "react";
import Pagination from "@/components/Pagination";

export default function FullPaginationDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalResults = 84; 
  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalResults={totalResults}
      size="md"
      onPageChange={(page) => setCurrentPage(page)}
    />
  );
}
```

### Different Size Variants

Pass `size="sm"` or `size="lg"` to scale the entire component including inputs and icons.

```tsx
<Pagination
  currentPage={1}
  totalPages={5}
  size="sm"
  onPageChange={(page) => console.log(page)}
/>
```

## Accessibility & Keyboard Navigation
- The component uses semantic `<nav>` and appropriate `aria-label="Pagination"`.
- Uses `aria-current="page"` for the currently active page.
- Keyboard readable ellipsis indicators uses `aria-hidden="true"` so screen readers bypass non-active elements.
- Meaningful hidden labels for navigation buttons (`Go to next page`, `Go to previous page`).
- Jump to page supports `inputMode="numeric"` for mobile keypad convenience.
- Focus rings conform to the design system relying on Tailwind's `focus-visible:ring-indigo-500`.

## Handling Edge Cases
- Disables interaction cleanly for Next on the Last Page and Previous on the First Page.
- Rejects non-numeric characters for the Jump-To-Page input natively with valid bounding conditions on submission form.
- The control automatically renders responsively to a simplified label ("Page 1 of 10") on small screens while retaining key action buttons (Previous, Next).
