/**
 * @file NotificationToast.tsx
 * @description Custom toast component used for in-app notifications.
 *   Renders a beautiful, accessible toast with action button support.
 *   Used as the `render` prop of react-hot-toast's `toast.custom()`.
 */

'use client'

import React from 'react'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/lib/types/database'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface NotificationToastProps {
  /** Toast unique ID (from react-hot-toast) */
  toastId: string
  /** Whether the toast is visible */
  visible: boolean
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  onDismiss: () => void
}

// ──────────────────────────────────────────────────────────────
// Config maps
// ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: string; accent: string; bg: string; border: string }
> = {
  message: {
    icon: '💬',
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  payment: {
    icon: '💸',
    accent: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  listing: {
    icon: '🏠',
    accent: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  system: {
    icon: '🔔',
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  favorite: {
    icon: '❤️',
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  agreement: {
    icon: '📋',
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export function NotificationToast({
  visible,
  type,
  title,
  message,
  actionUrl,
  actionLabel,
  onDismiss,
}: NotificationToastProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.system

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl',
        'bg-slate-900 dark:bg-slate-800 text-white',
        config.border,
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
    >
      {/* Icon bubble */}
      <div
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg',
          config.bg,
        )}
        aria-hidden="true"
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold leading-tight', config.accent)}>{title}</p>
        <p className="mt-0.5 text-xs text-slate-400 leading-snug line-clamp-2">{message}</p>

        {actionUrl && actionLabel && (
          <a
            href={actionUrl}
            onClick={onDismiss}
            className={cn(
              'mt-2 inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline',
              config.accent,
            )}
          >
            {actionLabel}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 rounded-md p-1 text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
