'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Lightbox } from './Lightbox'

export interface GalleryImage {
  src: string
  alt: string
  thumbnail?: string
}

export interface GalleryProps {
  images: GalleryImage[]
  initialIndex?: number
  showThumbnails?: boolean
  showLightbox?: boolean
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide'
  className?: string
}

export function Gallery({
  images,
  initialIndex = 0,
  showThumbnails = true,
  showLightbox = true,
  aspectRatio = 'auto',
  className,
}: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const currentImage = images[currentIndex]

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext, isLightboxOpen])

  if (!images || images.length === 0) {
    return null
  }

  const aspectRatioClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  }

  return (
    <>
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800',
            aspectRatioClasses[aspectRatio]
          )}
        >
          {currentImage && (
            <>
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                priority={currentIndex === 0}
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className={cn(
                      'absolute left-4 top-1/2 -translate-y-1/2',
                      'p-2 rounded-full bg-white/90 dark:bg-gray-900/90',
                      'backdrop-blur-sm shadow-lg',
                      'hover:bg-white dark:hover:bg-gray-800',
                      'transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'z-10'
                    )}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-900 dark:text-white" />
                  </button>

                  <button
                    onClick={goToNext}
                    className={cn(
                      'absolute right-4 top-1/2 -translate-y-1/2',
                      'p-2 rounded-full bg-white/90 dark:bg-gray-900/90',
                      'backdrop-blur-sm shadow-lg',
                      'hover:bg-white dark:hover:bg-gray-800',
                      'transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'z-10'
                    )}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-900 dark:text-white" />
                  </button>
                </>
              )}

              {showLightbox && (
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className={cn(
                    'absolute top-4 right-4',
                    'p-2 rounded-full bg-white/90 dark:bg-gray-900/90',
                    'backdrop-blur-sm shadow-lg',
                    'hover:bg-white dark:hover:bg-gray-800',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    'z-10'
                  )}
                  aria-label="Open lightbox"
                >
                  <Maximize2 className="h-5 w-5 text-gray-900 dark:text-white" />
                </button>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                    {currentIndex + 1} / {images.length}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showThumbnails && images.length > 1 && (
          <GalleryThumbnails
            images={images}
            currentIndex={currentIndex}
            onSelect={goToImage}
            className="mt-4"
          />
        )}
      </div>

      {showLightbox && (
        <Lightbox
          images={images}
          initialIndex={currentIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={setCurrentIndex}
        />
      )}
    </>
  )
}

export interface GalleryThumbnailsProps {
  images: GalleryImage[]
  currentIndex: number
  onSelect: (index: number) => void
  className?: string
}

export function GalleryThumbnails({
  images,
  currentIndex,
  onSelect,
  className,
}: GalleryThumbnailsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const thumbnail = container.children[currentIndex] as HTMLElement
      if (thumbnail) {
        const containerWidth = container.offsetWidth
        const thumbnailLeft = thumbnail.offsetLeft
        const thumbnailWidth = thumbnail.offsetWidth
        const scrollPosition = thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2

        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        })
      }
    }
  }, [currentIndex])

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'flex gap-2 overflow-x-auto',
        'pb-2 -mb-2',
        'scroll-smooth',
        '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        className
      )}
      role="tablist"
      aria-label="Image thumbnails"
    >
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={cn(
            'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden',
            'border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            index === currentIndex
              ? 'border-primary shadow-lg scale-105'
              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100'
          )}
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={`View image ${index + 1}: ${image.alt}`}
        >
          <Image
            src={image.thumbnail || image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="80px"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  )
}
