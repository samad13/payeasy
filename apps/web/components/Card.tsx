'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CardVariant = 'elevated' | 'outlined' | 'filled'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hoverable?: boolean
  icon?: LucideIcon
  badge?: React.ReactNode
  actions?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md border-0',
  outlined: 'bg-transparent border-2 border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600',
  filled: 'bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700',
}

export function Card({
  variant = 'elevated',
  hoverable = true,
  icon: Icon,
  badge,
  actions,
  header,
  footer,
  children,
  className,
  role = 'article',
  ...props
}: CardProps) {
  return (
    <article
      role={role}
      className={cn(
        'rounded-xl transition-all duration-300',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        variantStyles[variant],
        hoverable && 'hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {(Icon || badge || header || actions) && (
        <div className="flex items-start justify-between p-4 sm:p-6 pb-0">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {Icon && (
              <div className={cn(
                'flex-shrink-0 p-2.5 rounded-lg transition-colors',
                variant === 'filled' 
                  ? 'bg-white dark:bg-neutral-900 text-primary' 
                  : 'bg-primary/10 text-primary'
              )}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            {header && (
              <div className="flex-1 min-w-0">
                {header}
              </div>
            )}
          </div>
          <div className="flex items-start gap-2 flex-shrink-0 ml-2">
            {badge && (
              <div className="flex-shrink-0">
                {badge}
              </div>
            )}
            {actions && (
              <div className="flex items-center gap-1">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={cn(
        'p-4 sm:p-6',
        (Icon || badge || header || actions) && 'pt-4',
        footer && 'pb-4'
      )}>
        {children}
      </div>

      {footer && (
        <footer className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-neutral-700">
          {footer}
        </footer>
      )}
    </article>
  )
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
}

export function CardHeader({ title, subtitle, className, ...props }: CardHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-1', className)} {...props}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </header>
  )
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('text-gray-700 dark:text-gray-300', className)} {...props}>
      {children}
    </div>
  )
}

export type CardBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: CardBadgeVariant
  children: React.ReactNode
}

const badgeVariants: Record<CardBadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

export function CardBadge({ variant = 'default', children, className, ...props }: CardBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export interface CardActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  children?: React.ReactNode
}

export function CardAction({ icon: Icon, children, className, ...props }: CardActionProps) {
  return (
    <button
      className={cn(
        'p-2 rounded-lg transition-colors',
        'text-gray-500 dark:text-gray-400',
        'hover:bg-gray-100 dark:hover:bg-neutral-700',
        'hover:text-gray-900 dark:hover:text-white',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}
