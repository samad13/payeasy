'use client'

import React from 'react'
import { Gallery, GalleryImage } from './Gallery'

const sampleImages: GalleryImage[] = [
  {
    src: '/images/airbnb1.jpg',
    alt: 'Living room with modern furniture',
    thumbnail: '/images/airbnb1.jpg',
  },
  {
    src: '/images/airbnb2.jpg',
    alt: 'Kitchen with island',
    thumbnail: '/images/airbnb2.jpg',
  },
  {
    src: '/images/airbnb3.jpg',
    alt: 'Bedroom with large windows',
    thumbnail: '/images/airbnb3.jpg',
  },
  {
    src: '/images/airbnb4.jpg',
    alt: 'Bathroom with modern fixtures',
    thumbnail: '/images/airbnb4.jpg',
  },
  {
    src: '/images/airbnb1.jpg',
    alt: 'Outdoor patio area',
    thumbnail: '/images/airbnb1.jpg',
  },
]

/**
 * Basic Gallery Example
 */
export function BasicGallery() {
  return (
    <div className="max-w-4xl mx-auto">
      <Gallery images={sampleImages} />
    </div>
  )
}

/**
 * Gallery without Thumbnails
 */
export function GalleryWithoutThumbnails() {
  return (
    <div className="max-w-4xl mx-auto">
      <Gallery images={sampleImages} showThumbnails={false} />
    </div>
  )
}

/**
 * Gallery without Lightbox
 */
export function GalleryWithoutLightbox() {
  return (
    <div className="max-w-4xl mx-auto">
      <Gallery images={sampleImages} showLightbox={false} />
    </div>
  )
}

/**
 * Gallery with Square Aspect Ratio
 */
export function SquareGallery() {
  return (
    <div className="max-w-2xl mx-auto">
      <Gallery images={sampleImages} aspectRatio="square" />
    </div>
  )
}

/**
 * Gallery with Video Aspect Ratio
 */
export function VideoAspectGallery() {
  return (
    <div className="max-w-4xl mx-auto">
      <Gallery images={sampleImages} aspectRatio="video" />
    </div>
  )
}

/**
 * Single Image Gallery
 */
export function SingleImageGallery() {
  return (
    <div className="max-w-4xl mx-auto">
      <Gallery images={[sampleImages[0]]} showThumbnails={false} />
    </div>
  )
}

/**
 * Responsive Grid Gallery
 */
export function ResponsiveGridGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sampleImages.map((image, index) => (
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
