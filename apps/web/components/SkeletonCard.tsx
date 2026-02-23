'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonText, SkeletonCircle } from './Skeleton'

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'detailed'
  showImage?: boolean
  showAvatar?: boolean
  lines?: number
}

export function SkeletonCard({
  variant = 'default',
  showImage = true,
  showAvatar = true,
  lines = 3,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-900',
        'overflow-hidden',
        'transition-opacity duration-300',
        className
      )}
      {...props}
    >
      {showImage && (
        <Skeleton
          variant="rectangular"
          height={variant === 'compact' ? 120 : 200}
          className="w-full"
        />
      )}

      <div className={cn('p-4', variant === 'compact' && 'p-3')}>
        <div className="flex items-start gap-3 mb-3">
          {showAvatar && (
            <SkeletonCircle size="small" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
        </div>

        <SkeletonText lines={lines} />

        {variant === 'detailed' && (
          <div className="mt-4 flex items-center gap-4">
            <Skeleton variant="rectangular" width={80} height={20} />
            <Skeleton variant="rectangular" width={80} height={20} />
            <Skeleton variant="rectangular" width={80} height={20} />
          </div>
        )}

        {variant === 'default' && (
          <div className="mt-4 flex items-center justify-between">
            <Skeleton variant="rectangular" width={100} height={24} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </div>
        )}
      </div>
    </div>
  )
}

export function SkeletonListingCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-900 overflow-hidden',
        className
      )}
      {...props}
    >
      <Skeleton variant="rectangular" height={224} className="w-full" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Skeleton variant="text" width="70%" height={24} className="mb-2" />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
          <SkeletonCircle size="small" />
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="85%" />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangular" width={60} height={20} />
            <Skeleton variant="rectangular" width={60} height={20} />
          </div>
          <Skeleton variant="rectangular" width={100} height={24} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number
  columns?: number
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-900 overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" width="20%" height={20} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-neutral-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  width="20%"
                  height={16}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({
  items = 5,
  showAvatar = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  items?: number
  showAvatar?: boolean
}) {
  return (
    <div
      className={cn('space-y-4', className)}
      {...props}
    >
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
        >
          {showAvatar && <SkeletonCircle size="small" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="80%" height={16} />
          </div>
        </div>
      ))}
    </div>
  )
}
