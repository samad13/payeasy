'use client'

import React, { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GalleryImage } from './Gallery'

export interface LightboxProps {
  images: GalleryImage[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate?: (index: number) => void
}

export function Lightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, isOpen])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? images.length - 1 : prev - 1
      onNavigate?.(newIndex)
      return newIndex
    })
  }, [images.length, onNavigate])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === images.length - 1 ? 0 : prev + 1
      onNavigate?.(newIndex)
      return newIndex
    })
  }, [images.length, onNavigate])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, goToPrevious, goToNext, onClose])

  if (!isOpen || !images || images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/95 backdrop-blur-sm',
        'flex items-center justify-center',
        'animate-fade-in'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <button
        onClick={onClose}
        className={cn(
          'absolute top-4 right-4 z-10',
          'p-2 rounded-full bg-white/10 hover:bg-white/20',
          'text-white transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',
          'min-w-[44px] min-h-[44px] flex items-center justify-center'
        )}
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'p-3 rounded-full bg-white/10 hover:bg-white/20',
              'text-white transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',
              'min-w-[44px] min-h-[44px] flex items-center justify-center'
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 z-10',
              'p-3 rounded-full bg-white/10 hover:bg-white/20',
              'text-white transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',
              'min-w-[44px] min-h-[44px] flex items-center justify-center'
            )}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
          {currentImage && (
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-auto md:w-auto md:left-1/2 md:-translate-x-1/2 md:bottom-16">
          <div className="flex gap-2 overflow-x-auto max-w-full md:max-w-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  onNavigate?.(index)
                }}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
                  'border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',
                  index === currentIndex
                    ? 'border-white shadow-lg scale-110'
                    : 'border-transparent hover:border-white/50 opacity-70 hover:opacity-100'
                )}
                aria-label={`View image ${index + 1}: ${image.alt}`}
              >
                <Image
                  src={image.thumbnail || image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
