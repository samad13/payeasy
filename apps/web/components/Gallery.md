# Gallery Component Documentation

Beautiful image gallery component with thumbnail strip, full-size viewer, lightbox, and keyboard navigation.

## Features

✅ **Thumbnail Strip**: Horizontal scrollable thumbnail navigation  
✅ **Full-Size Viewer**: Main image display with navigation arrows  
✅ **Lightbox Mode**: Full-screen modal view  
✅ **Keyboard Navigation**: Arrow keys and Escape support  
✅ **Responsive Grid**: Mobile-friendly layout  
✅ **Lazy Loading**: Optimized image loading  
✅ **Next.js Image**: Built-in image optimization  
✅ **Accessible**: ARIA labels, keyboard navigation, focus management  
✅ **Dark Mode**: Full dark mode support  

## Basic Usage

```tsx
import { Gallery } from '@/components/Gallery'

const images = [
  { src: '/images/image1.jpg', alt: 'Description 1' },
  { src: '/images/image2.jpg', alt: 'Description 2' },
  { src: '/images/image3.jpg', alt: 'Description 3' },
]

<Gallery images={images} />
```

## Props

### Gallery Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `GalleryImage[]` | - | Array of image objects (required) |
| `initialIndex` | `number` | `0` | Starting image index |
| `showThumbnails` | `boolean` | `true` | Show thumbnail strip |
| `showLightbox` | `boolean` | `true` | Enable lightbox mode |
| `aspectRatio` | `'auto' \| 'square' \| 'video' \| 'wide'` | `'auto'` | Aspect ratio |
| `className` | `string` | - | Additional CSS classes |

### GalleryImage Interface

```tsx
interface GalleryImage {
  src: string        // Full-size image URL
  alt: string        // Alt text (required for accessibility)
  thumbnail?: string // Optional thumbnail URL (falls back to src)
}
```

## Examples

### Basic Gallery

```tsx
<Gallery images={images} />
```

### Without Thumbnails

```tsx
<Gallery images={images} showThumbnails={false} />
```

### Without Lightbox

```tsx
<Gallery images={images} showLightbox={false} />
```

### Square Aspect Ratio

```tsx
<Gallery images={images} aspectRatio="square" />
```

### Video Aspect Ratio

```tsx
<Gallery images={images} aspectRatio="video" />
```

### Custom Initial Image

```tsx
<Gallery images={images} initialIndex={2} />
```

### With Thumbnails

```tsx
const images = [
  {
    src: '/images/full1.jpg',
    alt: 'Full image',
    thumbnail: '/images/thumb1.jpg', // Smaller thumbnail
  },
  // ...
]

<Gallery images={images} />
```

## Keyboard Navigation

- **Arrow Left**: Previous image
- **Arrow Right**: Next image
- **Escape**: Close lightbox (when open)

## Lightbox

The lightbox opens when clicking the maximize button or clicking on the main image (if enabled). It provides:

- Full-screen image view
- Navigation arrows
- Thumbnail strip at bottom
- Keyboard navigation
- Click outside to close
- Image counter

```tsx
// Lightbox is automatically integrated
<Gallery images={images} showLightbox={true} />
```

## Responsive Behavior

- **Mobile**: Single column, touch-friendly controls
- **Tablet**: Optimized spacing and sizing
- **Desktop**: Full feature set with hover effects

## Lazy Loading

Images are lazy-loaded by default (except the first image which is prioritized):

```tsx
// First image loads immediately
<Gallery images={images} />

// Subsequent images load on demand
```

## Accessibility

- **ARIA Labels**: All buttons have descriptive labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling in lightbox
- **Screen Readers**: Alt text and role attributes
- **Touch Targets**: Minimum 44px for mobile

## Performance

- **Next.js Image**: Automatic optimization and responsive images
- **Lazy Loading**: Images load on demand
- **Smooth Scrolling**: CSS-based smooth scrolling for thumbnails
- **Optimized Rendering**: Efficient React rendering

## Usage in Listing Pages

```tsx
import { Gallery } from '@/components/Gallery'

export default function ListingPage({ listing }) {
  const images = listing.images?.map((url, index) => ({
    src: url,
    alt: `${listing.title} - Image ${index + 1}`,
  })) || []

  return (
    <div>
      <Gallery images={images} aspectRatio="video" />
      {/* Rest of listing content */}
    </div>
  )
}
```

## Responsive Grid Gallery

```tsx
import { Gallery } from '@/components/Gallery'

function GridGallery({ images }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
          <Gallery
            images={[image]}
            showThumbnails={false}
            showLightbox={true}
            aspectRatio="square"
          />
        </div>
      ))}
    </div>
  )
}
```

## Customization

### Custom Styling

```tsx
<Gallery 
  images={images} 
  className="my-custom-class"
/>
```

### Aspect Ratios

- `auto`: Natural image aspect ratio
- `square`: 1:1 aspect ratio
- `video`: 16:9 aspect ratio
- `wide`: 21:9 aspect ratio

## Best Practices

1. **Alt Text**: Always provide descriptive alt text
2. **Thumbnails**: Use smaller thumbnails for better performance
3. **Image Sizes**: Optimize images before uploading
4. **Loading States**: Show skeleton while images load
5. **Error Handling**: Handle broken image URLs gracefully

## Examples

See `GalleryExamples.tsx` for comprehensive examples of all features.
