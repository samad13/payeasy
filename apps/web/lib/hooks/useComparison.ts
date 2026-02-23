'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Listing } from '@/lib/types/database'

const STORAGE_KEY = 'payeasy_comparison_ids'
const MAX_COMPARISON_ITEMS = 4

export interface ComparisonListing extends Listing {
  images?: string[]
  landlord?: {
    username?: string | null
    avatar_url?: string | null
  }
}

export interface UseComparisonReturn {
  comparisonIds: string[]
  listings: ComparisonListing[]
  isInComparison: (id: string) => boolean
  addToComparison: (listing: ComparisonListing) => boolean
  removeFromComparison: (id: string) => void
  clearComparison: () => void
  toggleComparison: (listing: ComparisonListing) => boolean
  getShareUrl: () => string
  isLoading: boolean
  isFull: boolean
}

/**
 * Fetch listings by IDs from the compare API endpoint
 */
export async function fetchListingsByIds(ids: string[]): Promise<ComparisonListing[]> {
  if (ids.length === 0) return []
  
  try {
    const params = new URLSearchParams()
    ids.forEach(id => params.append('ids', id))
    
    const res = await fetch(`/api/listings/compare?${params.toString()}`)
    if (!res.ok) {
      console.error('Failed to fetch listings for comparison')
      return []
    }
    
    const data = await res.json()
    return data.listings ?? []
  } catch (error) {
    console.error('Error fetching comparison listings:', error)
    return []
  }
}

/**
 * Hook for managing listing comparison state with localStorage persistence
 */
export function useComparison(): UseComparisonReturn {
  const [comparisonIds, setComparisonIds] = useState<string[]>([])
  const [listings, setListings] = useState<ComparisonListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const ids = JSON.parse(stored) as string[]
        setComparisonIds(ids.slice(0, MAX_COMPARISON_ITEMS))
      }
    } catch {
      // Invalid data, reset
      localStorage.removeItem(STORAGE_KEY)
    }
    setIsLoading(false)
  }, [])

  // Persist to localStorage when IDs change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonIds))
    }
  }, [comparisonIds, isLoading])

  // Fetch full listing data when IDs change
  useEffect(() => {
    if (isLoading) return
    
    async function loadListings() {
      if (comparisonIds.length === 0) {
        setListings([])
        return
      }
      
      const fetched = await fetchListingsByIds(comparisonIds)
      setListings(fetched)
    }
    
    loadListings()
  }, [comparisonIds, isLoading])

  const isInComparison = useCallback(
    (id: string) => comparisonIds.includes(id),
    [comparisonIds]
  )

  const addToComparison = useCallback(
    (listing: ComparisonListing): boolean => {
      if (comparisonIds.length >= MAX_COMPARISON_ITEMS) {
        return false
      }
      if (comparisonIds.includes(listing.id)) {
        return false
      }
      
      setComparisonIds(prev => [...prev, listing.id])
      setListings(prev => [...prev, listing])
      return true
    },
    [comparisonIds]
  )

  const removeFromComparison = useCallback((id: string) => {
    setComparisonIds(prev => prev.filter(i => i !== id))
    setListings(prev => prev.filter(l => l.id !== id))
  }, [])

  const clearComparison = useCallback(() => {
    setComparisonIds([])
    setListings([])
  }, [])

  const toggleComparison = useCallback(
    (listing: ComparisonListing): boolean => {
      if (isInComparison(listing.id)) {
        removeFromComparison(listing.id)
        return false
      } else {
        return addToComparison(listing)
      }
    },
    [isInComparison, addToComparison, removeFromComparison]
  )

  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    
    const params = new URLSearchParams()
    comparisonIds.forEach(id => params.append('ids', id))
    return `${window.location.origin}/listings/comparison?${params.toString()}`
  }, [comparisonIds])

  return {
    comparisonIds,
    listings,
    isInComparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparison,
    getShareUrl,
    isLoading,
    isFull: comparisonIds.length >= MAX_COMPARISON_ITEMS,
  }
}
