/**
 * @file NotificationContext.tsx
 * @description React context shape for the notification system.
 */

'use client'

import { createContext } from 'react'
import type { Notification, NotificationPreferences } from '@/lib/types/database'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface NotificationContextValue {
  /** All loaded notifications (newest-first). */
  notifications: Notification[]
  /** Count of unread notifications. */
  unreadCount: number
  /** Whether the notification center drawer is open. */
  isOpen: boolean
  /** Whether notifications are loading. */
  isLoading: boolean
  /** Current user preferences (or undefined if not yet loaded). */
  preferences: NotificationPreferences | null

  /** Open / close the notification center. */
  setIsOpen: (open: boolean) => void
  /** Mark a single notification as read. */
  markAsRead: (id: string) => Promise<void>
  /** Mark all notifications as read. */
  markAllAsRead: () => Promise<void>
  /** Delete a single notification. */
  deleteNotification: (id: string) => Promise<void>
  /** Delete all read notifications. */
  clearRead: () => Promise<void>
  /** Update notification preferences. */
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
  /** Manually add a local (optimistic) toast notification. */
  addToast: (notification: Pick<Notification, 'type' | 'title' | 'message' | 'action_url' | 'action_label'>) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)
