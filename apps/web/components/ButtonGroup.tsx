'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './Button'

export interface ButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  attached?: boolean
  className?: string
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  attached = false,
  className,
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        attached && orientation === 'horizontal' && '[&>*:not(:first-child)]:ml-[-1px] [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none',
        attached && orientation === 'vertical' && '[&>*:not(:first-child)]:mt-[-1px] [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none',
        !attached && orientation === 'horizontal' && 'gap-2',
        !attached && orientation === 'vertical' && 'gap-2',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface ButtonGroupItemProps extends ButtonProps {
  isFirst?: boolean
  isLast?: boolean
}

export function ButtonGroupItem({
  isFirst,
  isLast,
  className,
  ...props
}: ButtonGroupItemProps) {
  return (
    <Button
      className={cn(
        isFirst && 'rounded-r-none',
        isLast && 'rounded-l-none',
        !isFirst && !isLast && 'rounded-none',
        className
      )}
      {...props}
    />
  )
}
