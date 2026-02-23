'use client'

import React from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md active:bg-primary/80 active:shadow-sm focus:ring-primary focus:ring-offset-2',
  secondary: 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm hover:bg-gray-300 dark:hover:bg-neutral-600 hover:shadow-md active:bg-gray-400 dark:active:bg-neutral-500 active:shadow-sm focus:ring-gray-500 focus:ring-offset-2',
  tertiary: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 active:bg-gray-200 dark:active:bg-neutral-700 focus:ring-gray-500 focus:ring-offset-2 border border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500',
}

const sizeStyles: Record<ButtonSize, string> = {
  small: 'px-3 py-1.5 text-sm min-h-[36px]',
  medium: 'px-4 py-2 text-base min-h-[44px]',
  large: 'px-6 py-3 text-lg min-h-[48px]',
}

const iconSizeStyles: Record<ButtonSize, string> = {
  small: 'h-4 w-4',
  medium: 'h-5 w-5',
  large: 'h-6 w-6',
}

export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn('animate-spin', iconSizeStyles[size])} />
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className={iconSizeStyles[size]} />}
          {children}
          {RightIcon && <RightIcon className={iconSizeStyles[size]} />}
        </>
      )}
    </button>
  )
}
