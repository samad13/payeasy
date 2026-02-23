'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useComparison, type UseComparisonReturn, type ComparisonListing } from '@/lib/hooks/useComparison'

type ComparisonContextValue = UseComparisonReturn

const ComparisonContext = createContext<ComparisonContextValue | null>(null)

export function useComparisonContext(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext)
  if (!ctx) {
    throw new Error('useComparisonContext must be used within a ComparisonProvider')
  }
  return ctx
}

interface ComparisonProviderProps {
  children: ReactNode
}

export default function ComparisonProvider({ children }: ComparisonProviderProps) {
  const comparison = useComparison()

  return (
    <ComparisonContext.Provider value={comparison}>
      {children}
    </ComparisonContext.Provider>
  )
}

// Re-export types for convenience
export type { ComparisonListing }
