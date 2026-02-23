'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  title: string
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // If no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400">
        No images available
      </div>
    )
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  return (
    <div className="relative group w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-200 shadow-sm">
        <Image
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          className="object-cover transition-all duration-500"
          priority={currentIndex === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        
        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          onClick={prevSlide}
          className="hidden group-hover:block absolute top-[50%] -translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={30} />
        </button>
      )}

      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          onClick={nextSlide}
          className="hidden group-hover:block absolute top-[50%] -translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={30} />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="flex justify-center py-2 gap-2 mt-2">
          {images.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`text-2xl cursor-pointer transition-all duration-300 rounded-full h-2 w-2 ${
                currentIndex === slideIndex ? 'bg-gray-800 w-4' : 'bg-gray-400'
              }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}
