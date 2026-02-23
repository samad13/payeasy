'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SpinnerSize = 'small' | 'medium' | 'large' | 'xlarge'
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'gray'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string
}

const sizeStyles: Record<SpinnerSize, string> = {
  small: 'h-4 w-4',
  medium: 'h-5 w-5',
  large: 'h-8 w-8',
  xlarge: 'h-12 w-12',
}

const variantStyles: Record<SpinnerVariant, string> = {
  primary: 'text-primary',
  secondary: 'text-gray-600 dark:text-gray-400',
  white: 'text-white',
  gray: 'text-gray-400 dark:text-gray-500',
}

export function Spinner({
  size = 'medium',
  variant = 'primary',
  label,
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      aria-label={label || 'Loading'}
      {...props}
    >
      <Loader2
        className={cn(
          'animate-spin',
          sizeStyles[size],
          variantStyles[variant]
        )}
        aria-hidden="true"
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  )
}

export function SpinnerWithText({
  size = 'medium',
  variant = 'primary',
  text = 'Loading...',
  className,
  ...props
}: SpinnerProps & { text?: string }) {
  return (
    <div
      className={cn('inline-flex flex-col items-center justify-center gap-2', className)}
      role="status"
      aria-label={text}
      {...props}
    >
      <Spinner size={size} variant={variant} />
      <span className={cn(
        'text-sm font-medium',
        variant === 'white' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
      )}>
        {text}
      </span>
    </div>
  )
}

export function SpinnerInline({
  size = 'small',
  variant = 'primary',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span className={cn('inline-flex items-center', className)} {...props}>
      <Spinner size={size} variant={variant} />
    </span>
  )
}
