'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, MapPin, Bed, Bath, Check, Minus, ExternalLink } from 'lucide-react'
import type { ComparisonListing } from './ComparisonProvider'

interface ComparisonViewProps {
  listings: ComparisonListing[]
  onRemove?: (id: string) => void
  highlightBest?: boolean
}

/**
 * Side-by-side comparison view for listings
 */
export default function ComparisonView({
  listings,
  onRemove,
  highlightBest = true,
}: ComparisonViewProps) {
  // Find min/max values for highlighting
  const stats = useMemo(() => {
    if (listings.length === 0) return null

    const prices = listings.map((l) => l.rent_xlm)
    const bedrooms = listings.map((l) => l.bedrooms)
    const bathrooms = listings.map((l) => l.bathrooms)

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      maxBedrooms: Math.max(...bedrooms),
      maxBathrooms: Math.max(...bathrooms),
    }
  }, [listings])

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Minus size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No listings to compare
        </h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Add listings to your comparison by clicking the compare button on any listing card.
        </p>
        <Link
          href="/browse"
          className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
        >
          Browse Listings
        </Link>
      </div>
    )
  }

  if (listings.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 mb-4">
          Add at least one more listing to compare
        </p>
        <Link
          href="/browse"
          className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
        >
          Add More Listings
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-4 min-w-max"
        style={{
          gridTemplateColumns: `repeat(${listings.length}, minmax(280px, 1fr))`,
        }}
      >
        {listings.map((listing) => (
          <ComparisonCard
            key={listing.id}
            listing={listing}
            onRemove={onRemove}
            stats={stats}
            highlightBest={highlightBest}
          />
        ))}
      </div>
    </div>
  )
}

interface ComparisonCardProps {
  listing: ComparisonListing
  onRemove?: (id: string) => void
  stats: {
    minPrice: number
    maxPrice: number
    maxBedrooms: number
    maxBathrooms: number
  } | null
  highlightBest: boolean
}

function ComparisonCard({
  listing,
  onRemove,
  stats,
  highlightBest,
}: ComparisonCardProps) {
  const isLowestPrice = highlightBest && stats && listing.rent_xlm === stats.minPrice
  const isHighestPrice = highlightBest && stats && listing.rent_xlm === stats.maxPrice
  const hasMostBedrooms = highlightBest && stats && listing.bedrooms === stats.maxBedrooms
  const hasMostBathrooms = highlightBest && stats && listing.bathrooms === stats.maxBathrooms

  const imageUrl = listing.images?.[0] ?? '/images/airbnb1.jpg'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          className="object-cover"
        />

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={() => onRemove(listing.id)}
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 
                       rounded-full shadow-sm transition-colors group"
            aria-label="Remove from comparison"
          >
            <X size={16} className="text-gray-500 group-hover:text-red-500" />
          </button>
        )}

        {/* Lowest price badge */}
        {isLowestPrice && stats && stats.minPrice !== stats.maxPrice && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Check size={12} />
            Best Price
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
          {listing.title}
        </h3>

        {/* Address */}
        <div className="flex items-center text-gray-500 text-sm gap-1 mb-3">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="line-clamp-1">{listing.address}</span>
        </div>

        {/* Details grid */}
        <div className="space-y-3 flex-1">
          {/* Price */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Monthly Rent</span>
            <span
              className={`font-bold ${
                isLowestPrice && stats && stats.minPrice !== stats.maxPrice
                  ? 'text-green-600'
                  : isHighestPrice && stats && stats.minPrice !== stats.maxPrice
                    ? 'text-red-500'
                    : 'text-gray-900'
              }`}
            >
              {listing.rent_xlm} XLM
            </span>
          </div>

          {/* Bedrooms */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm flex items-center gap-1.5">
              <Bed size={14} />
              Bedrooms
            </span>
            <span
              className={`font-medium ${
                hasMostBedrooms && stats && stats.maxBedrooms > 0
                  ? 'text-violet-600'
                  : 'text-gray-900'
              }`}
            >
              {listing.bedrooms}
            </span>
          </div>

          {/* Bathrooms */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm flex items-center gap-1.5">
              <Bath size={14} />
              Bathrooms
            </span>
            <span
              className={`font-medium ${
                hasMostBathrooms && stats && stats.maxBathrooms > 0
                  ? 'text-violet-600'
                  : 'text-gray-900'
              }`}
            >
              {listing.bathrooms}
            </span>
          </div>

          {/* Furnished */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Furnished</span>
            <span className="text-gray-900">
              {listing.furnished ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Minus size={16} className="text-gray-300" />
              )}
            </span>
          </div>

          {/* Pet Friendly */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Pet Friendly</span>
            <span className="text-gray-900">
              {listing.pet_friendly ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Minus size={16} className="text-gray-300" />
              )}
            </span>
          </div>
        </div>

        {/* View listing button */}
        <Link
          href={`/listings/${listing.id}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 
                     bg-gray-100 hover:bg-violet-100 text-gray-700 hover:text-violet-700
                     rounded-lg font-medium text-sm transition-colors"
        >
          View Listing
          <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  )
}
