'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Share2,
  GitCompareArrows,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import ComparisonView from '@/components/ComparisonView'
import { useComparisonContext } from '@/components/ComparisonProvider'
import { fetchListingsByIds } from '@/lib/hooks/useComparison'
import type { Listing } from '@/lib/types/database'

export default function ComparePage() {
  const searchParams = useSearchParams()
  const {
    listings: contextListings,
    comparisonIds,
    removeFromComparison,
    clearComparison,
    getShareUrl,
    isLoading: contextLoading,
  } = useComparisonContext()

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  // Check for URL params (shared comparison)
  const urlIds = searchParams?.getAll('ids') || []
  const hasUrlIds = urlIds.length > 0

  // Load listings from URL params or context
  useEffect(() => {
    async function loadListings() {
      setIsLoading(true)

      if (hasUrlIds) {
        // Load from URL params (shared comparison)
        const fetched = await fetchListingsByIds(urlIds)
        setListings(fetched)
      } else if (!contextLoading) {
        // Use context listings
        if (contextListings.length > 0) {
          setListings(contextListings)
        } else if (comparisonIds.length > 0) {
          // Context has IDs but not full listings - fetch them
          const fetched = await fetchListingsByIds(comparisonIds)
          setListings(fetched)
        } else {
          setListings([])
        }
      }

      setIsLoading(false)
    }

    loadListings()
  }, [hasUrlIds, urlIds, contextListings, comparisonIds, contextLoading])

  const handleRemove = useCallback(
    (listingId: string) => {
      // Update local state
      setListings((prev) => prev.filter((l) => l.id !== listingId))
      // Update context (if using context)
      if (!hasUrlIds) {
        removeFromComparison(listingId)
      }
    },
    [hasUrlIds, removeFromComparison]
  )

  const handleClear = useCallback(() => {
    setListings([])
    if (!hasUrlIds) {
      clearComparison()
    }
  }, [hasUrlIds, clearComparison])

  const handleShare = useCallback(async () => {
    const shareUrl = hasUrlIds
      ? window.location.href
      : getShareUrl()

    try {
      // Try native share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'PayEasy Listing Comparison',
          text: `Compare ${listings.length} listings on PayEasy`,
          url: shareUrl,
        })
        return
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }, [hasUrlIds, getShareUrl, listings.length])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button */}
            <Link
              href="/browse"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Browse</span>
            </Link>

            {/* Title */}
            <div className="flex items-center gap-2">
              <GitCompareArrows className="text-violet-600" size={24} />
              <h1 className="text-xl font-bold text-gray-900">
                Compare Listings
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {listings.length >= 2 && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                             text-gray-600 hover:text-violet-600 hover:bg-violet-50
                             rounded-lg transition-colors"
                >
                  {shareStatus === 'copied' ? (
                    <>
                      <Check size={16} className="text-green-500" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={16} />
                      <span className="hidden sm:inline">Share</span>
                    </>
                  )}
                </button>
              )}

              {listings.length > 0 && (
                <button
                  onClick={handleClear}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50
                             rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4" />
            <p className="text-gray-500">Loading comparison...</p>
          </div>
        ) : (
          <ComparisonView
            listings={listings}
            onRemove={handleRemove}
            highlightBest={true}
          />
        )}

        {/* Shared comparison notice */}
        {hasUrlIds && listings.length > 0 && (
          <div className="mt-8 bg-violet-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="text-violet-600" size={20} />
              <div>
                <p className="font-medium text-violet-900">
                  Viewing a shared comparison
                </p>
                <p className="text-sm text-violet-700">
                  Want to modify it? Add these listings to your own comparison.
                </p>
              </div>
            </div>
            <Link
              href="/browse"
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white
                         rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              Browse Listings
              <ExternalLink size={16} />
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
