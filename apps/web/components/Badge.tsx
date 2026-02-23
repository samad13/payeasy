'use client'

import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'solid' | 'outline' | 'soft'
export type BadgeColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  color?: BadgeColor
  size?: BadgeSize
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  rounded?: 'default' | 'full'
  children: React.ReactNode
}

const badgeSizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
}

const badgeIconSizeStyles: Record<BadgeSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

const badgeColorStyles: Record<BadgeVariant, Record<BadgeColor, string>> = {
  solid: {
    neutral: 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
    primary: 'bg-primary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-500 text-amber-950',
    danger: 'bg-red-600 text-white',
    info: 'bg-sky-600 text-white',
  },
  outline: {
    neutral: 'border border-gray-300 text-gray-700 dark:border-neutral-600 dark:text-neutral-200',
    primary: 'border border-primary/40 text-primary bg-primary/5',
    success: 'border border-green-300 text-green-700 dark:border-green-700 dark:text-green-300',
    warning: 'border border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300',
    danger: 'border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
    info: 'border border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-300',
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

export function Badge({
  variant = 'soft',
  color = 'neutral',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  rounded = 'full',
  className,
  children,
  ...props
}: BadgeProps) {
  const iconNode = Icon ? <Icon className={cn('shrink-0', badgeIconSizeStyles[size])} aria-hidden="true" /> : null

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium leading-none',
        rounded === 'full' ? 'rounded-full' : 'rounded-md',
        badgeSizeStyles[size],
        badgeColorStyles[variant][color],
        className
      )}
      {...props}
    >
      {iconPosition === 'left' && iconNode}
      <span>{children}</span>
      {iconPosition === 'right' && iconNode}
    </span>
  )
}

