'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, GitCompareArrows, Trash2 } from 'lucide-react'
import { useComparisonContext } from './ComparisonProvider'

/**
 * Floating comparison bar that shows selected listings
 * Displays at the bottom of the screen when items are in comparison
 */
export default function ComparisonBar() {
  const { listings, comparisonIds, removeFromComparison, clearComparison, isLoading } =
    useComparisonContext()

  // Don't show if empty or still loading
  if (isLoading || comparisonIds.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Thumbnails */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 flex-shrink-0">
                <GitCompareArrows size={18} className="text-violet-600" />
                <span className="hidden sm:inline">Compare</span>
                <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
                  {comparisonIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-2">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="relative group flex-shrink-0"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-violet-400 transition-colors">
                      <Image
                        src={listing.images?.[0] ?? '/images/airbnb1.jpg'}
                        alt={listing.title}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      onClick={() => removeFromComparison(listing.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full
                                 flex items-center justify-center opacity-0 group-hover:opacity-100
                                 transition-opacity hover:bg-red-600"
                      aria-label={`Remove ${listing.title} from comparison`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: 4 - comparisonIds.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 flex-shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clearComparison}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear all"
              >
                <Trash2 size={18} />
              </button>

              <Link
                href="/listings/comparison"
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${
                    comparisonIds.length >= 2
                      ? 'bg-violet-600 text-white hover:bg-violet-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  }
                `}
                aria-disabled={comparisonIds.length < 2}
              >
                Compare {comparisonIds.length >= 2 ? `(${comparisonIds.length})` : ''}
              </Link>
            </div>
          </div>

          {/* Hint text */}
          {comparisonIds.length < 2 && (
            <p className="text-xs text-gray-400 mt-1 text-center sm:text-left">
              Add at least 2 listings to compare
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
