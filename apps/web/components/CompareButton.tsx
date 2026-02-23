'use client'

import React from 'react'
import { GitCompareArrows, Check } from 'lucide-react'
import { useComparisonContext, type ComparisonListing } from './ComparisonProvider'

interface CompareButtonProps {
  listing: ComparisonListing
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'icon'
  className?: string
}

/**
 * Full button variant with text
 */
export default function CompareButton({
  listing,
  size = 'md',
  className = '',
}: CompareButtonProps) {
  const { isInComparison, toggleComparison, isFull } = useComparisonContext()
  const isSelected = isInComparison(listing.id)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleComparison(listing)
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  const isDisabled = !isSelected && isFull

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
      title={
        isDisabled
          ? 'Maximum 4 listings in comparison'
          : isSelected
            ? 'Remove from comparison'
            : 'Add to comparison'
      }
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200
        ${sizeClasses[size]}
        ${
          isSelected
            ? 'bg-violet-600 text-white hover:bg-violet-700'
            : isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-violet-400 hover:text-violet-600'
        }
        ${className}
      `}
    >
      {isSelected ? (
        <>
          <Check size={iconSizes[size]} />
          <span>Comparing</span>
        </>
      ) : (
        <>
          <GitCompareArrows size={iconSizes[size]} />
          <span>Compare</span>
        </>
      )}
    </button>
  )
}

/**
 * Icon-only variant for use in listing cards
 */
export function CompareButtonIcon({
  listing,
  className = '',
}: {
  listing: ComparisonListing
  className?: string
}) {
  const { isInComparison, toggleComparison, isFull } = useComparisonContext()
  const isSelected = isInComparison(listing.id)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleComparison(listing)
  }

  const isDisabled = !isSelected && isFull

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
      title={
        isDisabled
          ? 'Maximum 4 listings in comparison'
          : isSelected
            ? 'Remove from comparison'
            : 'Add to comparison'
      }
      className={`
        p-1.5 rounded-full transition-colors
        ${
          isSelected
            ? 'bg-violet-600 text-white'
            : isDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white/90 text-gray-600 hover:bg-violet-100 hover:text-violet-600'
        }
        ${className}
      `}
    >
      {isSelected ? <Check size={18} /> : <GitCompareArrows size={18} />}
    </button>
  )
}
