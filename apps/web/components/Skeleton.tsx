'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'
export type SkeletonSize = 'small' | 'medium' | 'large'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  size?: SkeletonSize
  width?: string | number
  height?: string | number
  shimmer?: boolean
  lines?: number
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded',
  circular: 'rounded-full aspect-square',
  rectangular: 'rounded-md',
  rounded: 'rounded-lg',
}

const sizeStyles: Record<SkeletonSize, string> = {
  small: 'w-10 h-10',
  medium: 'w-16 h-16',
  large: 'w-24 h-24',
}

export function Skeleton({
  variant = 'rectangular',
  size = 'medium',
  width,
  height,
  shimmer = true,
  lines,
  className,
  style,
  ...props
}: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  if (variant === 'text' && lines && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            size={size}
            width={index === lines - 1 ? '75%' : '100%'}
            shimmer={shimmer}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gray-200 dark:bg-gray-800',
        !shimmer && 'animate-pulse',
        variant === 'circular' && sizeStyles[size],
        variant !== 'circular' && variantStyles[variant],
        className
      )}
      style={customStyle}
      aria-label="Loading content"
      role="status"
      {...props}
    >
      {shimmer && (
        <div
          className={cn(
            'absolute inset-0',
            'animate-shimmer',
            'bg-gradient-to-r',
            'from-transparent via-white/60 to-transparent',
            'dark:via-white/10',
            'bg-[length:200%_100%]'
          )}
        />
      )}
    </div>
  )
}

export function SkeletonText({
  lines = 1,
  className,
  ...props
}: Omit<SkeletonProps, 'variant'>) {
  return <Skeleton variant="text" lines={lines} className={className} {...props} />
}

export function SkeletonCircle({
  size = 'medium',
  className,
  ...props
}: Omit<SkeletonProps, 'variant'>) {
  return <Skeleton variant="circular" size={size} className={className} {...props} />
}

export function SkeletonRectangle({
  width,
  height,
  className,
  ...props
}: Omit<SkeletonProps, 'variant'>) {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      className={className}
      {...props}
    />
  )
}
