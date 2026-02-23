'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TagVariant = 'solid' | 'outline' | 'soft'
export type TagColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type TagSize = 'sm' | 'md' | 'lg'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant
  color?: TagColor
  size?: TagSize
  icon?: LucideIcon
  dismissible?: boolean
  onDismiss?: () => void
  dismissLabel?: string
  dismissAfterMs?: number
  animateDismiss?: boolean
  children: React.ReactNode
}

const tagSizeStyles: Record<TagSize, string> = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-2.5 py-1.5 text-sm gap-1.5',
  lg: 'px-3 py-2 text-sm gap-2',
}

const tagIconSizeStyles: Record<TagSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

const tagDismissButtonSizeStyles: Record<TagSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
}

const tagColorStyles: Record<TagVariant, Record<TagColor, string>> = {
  solid: {
    neutral: 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
    primary: 'bg-primary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-500 text-amber-950',
    danger: 'bg-red-600 text-white',
    info: 'bg-sky-600 text-white',
  },
  outline: {
    neutral: 'bg-white text-gray-700 border border-gray-300 dark:bg-transparent dark:text-neutral-200 dark:border-neutral-600',
    primary: 'bg-primary/5 text-primary border border-primary/30',
    success: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800',
    info: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-800',
  },
  soft: {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  },
}

export function Tag({
  variant = 'soft',
  color = 'neutral',
  size = 'md',
  icon: Icon,
  dismissible = false,
  onDismiss,
  dismissLabel = 'Remove tag',
  dismissAfterMs = 180,
  animateDismiss = true,
  className,
  children,
  ...props
}: TagProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isRemoving, setIsRemoving] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!isVisible) {
    return null
  }

  const handleDismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (isRemoving) {
      return
    }

    if (!animateDismiss) {
      setIsVisible(false)
      onDismiss?.()
      return
    }

    setIsRemoving(true)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, dismissAfterMs)
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full font-medium',
        'transition-all duration-200 motion-reduce:transition-none',
        tagSizeStyles[size],
        tagColorStyles[variant][color],
        isRemoving && 'pointer-events-none scale-95 opacity-0 -translate-y-1',
        className
      )}
      {...props}
    >
      {Icon ? <Icon className={cn('shrink-0', tagIconSizeStyles[size])} aria-hidden="true" /> : null}
      <span className="truncate">{children}</span>
      {dismissible ? (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={dismissLabel}
          className={cn(
            'ml-0.5 inline-flex shrink-0 items-center justify-center rounded-full',
            'transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current/40',
            'dark:hover:bg-white/10',
            tagDismissButtonSizeStyles[size]
          )}
        >
          <X className={tagIconSizeStyles[size]} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  )
}
