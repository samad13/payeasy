'use client'

import React from 'react'
import { Spinner, SpinnerWithText, SpinnerInline } from './Spinner'
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonRectangle } from './Skeleton'
import { SkeletonCard, SkeletonListingCard, SkeletonTable, SkeletonList } from './SkeletonCard'
import { Button } from './Button'

/**
 * Spinner Examples
 */
export function SpinnerExamples() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Sizes
        </h3>
        <div className="flex items-center gap-4">
          <Spinner size="small" />
          <Spinner size="medium" />
          <Spinner size="large" />
          <Spinner size="xlarge" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Variants
        </h3>
        <div className="flex items-center gap-4">
          <Spinner variant="primary" />
          <Spinner variant="secondary" />
          <Spinner variant="white" />
          <div className="bg-gray-800 p-2 rounded">
            <Spinner variant="white" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          With Text
        </h3>
        <div className="flex items-center gap-4">
          <SpinnerWithText text="Loading..." />
          <SpinnerWithText size="large" text="Please wait..." />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Inline
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Loading content <SpinnerInline /> in the middle of text.
        </p>
      </div>
    </div>
  )
}

/**
 * Skeleton Examples
 */
export function SkeletonExamples() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Variants
        </h3>
        <div className="flex items-center gap-4">
          <Skeleton variant="text" width={200} />
          <Skeleton variant="circular" size="medium" />
          <Skeleton variant="rectangular" width={100} height={60} />
          <Skeleton variant="rounded" width={100} height={60} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Text Lines
        </h3>
        <SkeletonText lines={3} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Sizes
        </h3>
        <div className="flex items-center gap-4">
          <SkeletonCircle size="small" />
          <SkeletonCircle size="medium" />
          <SkeletonCircle size="large" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          With Shimmer (Default)
        </h3>
        <Skeleton variant="rectangular" width={300} height={100} shimmer />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Pulse Animation
        </h3>
        <Skeleton variant="rectangular" width={300} height={100} shimmer={false} />
      </div>
    </div>
  )
}

/**
 * Skeleton Card Examples
 */
export function SkeletonCardExamples() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Default Card
        </h3>
        <SkeletonCard />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Compact Card
        </h3>
        <SkeletonCard variant="compact" />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Detailed Card
        </h3>
        <SkeletonCard variant="detailed" />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Listing Card
        </h3>
        <SkeletonListingCard />
      </div>
    </div>
  )
}

/**
 * Skeleton Table Example
 */
export function SkeletonTableExample() {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        Table Skeleton
      </h3>
      <SkeletonTable rows={5} columns={4} />
    </div>
  )
}

/**
 * Skeleton List Example
 */
export function SkeletonListExample() {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        List Skeleton
      </h3>
      <SkeletonList items={3} />
    </div>
  )
}

/**
 * Button Loading States
 */
export function ButtonLoadingExamples() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" isLoading>Loading...</Button>
        <Button variant="secondary" isLoading>Processing</Button>
        <Button variant="tertiary" isLoading>Saving</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" size="small" isLoading>Small</Button>
        <Button variant="primary" size="medium" isLoading>Medium</Button>
        <Button variant="primary" size="large" isLoading>Large</Button>
      </div>
    </div>
  )
}

/**
 * Complete Loading Example
 */
export function CompleteLoadingExample() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-8">
        <SpinnerWithText size="large" text="Loading page..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="primary" isLoading>Save Changes</Button>
        <Button variant="secondary" disabled>Cancel</Button>
      </div>
    </div>
  )
}
