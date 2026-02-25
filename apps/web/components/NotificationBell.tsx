/**
 * @file NotificationBell.tsx
 * @description Bell icon button with unread badge. Toggles the
 *   NotificationCenter drawer. Designed to sit in the app's nav bar.
 */

'use client'

import React from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'

interface NotificationBellProps {
  /** Additional classes on the trigger button. */
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount, isOpen, setIsOpen } = useNotifications()

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full',
        'text-slate-400 hover:text-white',
        'bg-transparent hover:bg-slate-800 dark:hover:bg-slate-700',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        isOpen && 'text-white bg-slate-800 dark:bg-slate-700',
        className,
      )}
      aria-label={
        unreadCount > 0
          ? `Notifications — ${unreadCount} unread`
          : 'Notifications'
      }
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center',
            'rounded-full bg-primary-500 text-[10px] font-bold text-white',
            'ring-2 ring-slate-950 dark:ring-slate-950',
            'animate-in zoom-in-50 duration-200',
          )}
          aria-hidden="true"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
