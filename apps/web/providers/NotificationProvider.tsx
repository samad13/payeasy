/**
 * @file NotificationProvider.tsx
 * @description Context provider that manages notification state, real-time
 *   subscriptions, and persists preferences. Integrates with react-hot-toast
 *   for in-app toasts and Supabase Realtime for live delivery.
 */

'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import {
  NotificationContext,
  type NotificationContextValue,
} from '@/contexts/NotificationContext'
import type { Notification, NotificationPreferences } from '@/lib/types/database'

// ──────────────────────────────────────────────────────────────
// Sound helper
// ──────────────────────────────────────────────────────────────

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch {
    // AudioContext not available (e.g. SSR / restricted environments)
  }
}

// ──────────────────────────────────────────────────────────────
// Type-to-icon mapping (emoji, no external dep)
// ──────────────────────────────────────────────────────────────
const TYPE_ICON: Record<string, string> = {
  message: '💬',
  payment: '💸',
  listing: '🏠',
  system: '🔔',
  favorite: '❤️',
  agreement: '📋',
}

// ──────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const userIdRef = useRef<string | null>(null)

  // ── Initial load ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      userIdRef.current = user.id

      // Fetch notifications
      const [notifRes, prefRes] = await Promise.all([
        fetch('/api/notifications?limit=30'),
        fetch('/api/notifications/preferences'),
      ])

      if (cancelled) return

      if (notifRes.ok) {
        const json = await notifRes.json()
        setNotifications(json.data ?? [])
      }

      if (prefRes.ok) {
        const json = await prefRes.json()
        setPreferences(json.data ?? null)
      }

      setIsLoading(false)

      // Subscribe to realtime inserts
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification
            setNotifications((prev) => [newNotif, ...prev])

            // Check preferences before showing toast / sound
            setPreferences((currentPrefs) => {
              const typeKey = `${newNotif.type}_enabled` as keyof NotificationPreferences
              const enabled = currentPrefs ? (currentPrefs[typeKey] as boolean ?? true) : true

              if (enabled) {
                const icon = TYPE_ICON[newNotif.type] ?? '🔔'
                toast(newNotif.title, {
                  icon,
                  duration: 5000,
                })

                if (currentPrefs?.sound_enabled) {
                  playNotificationSound()
                }
              }

              return currentPrefs
            })
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as Notification
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n)),
            )
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const deleted = payload.old as { id: string }
            setNotifications((prev) => prev.filter((n) => n.id !== deleted.id))
          },
        )
        .subscribe()

      channelRef.current = channel
    }

    setIsLoading(true)
    init()

    return () => {
      cancelled = true
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [])

  // ── Actions ─────────────────────────────────────────────────

  const markAsRead = useCallback(async (id: string) => {
    let previousNotifications: Notification[] = []

    setNotifications((prev) => {
      previousNotifications = prev
      return prev.map((n) =>
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() as any } : n,
      )
    })

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      })

      if (!res.ok) {
        throw new Error(`Failed to mark notification ${id} as read: ${res.status} ${res.statusText}`)
      }
    } catch (error) {
      console.error('Error marking notification as read; reverting optimistic update.', error)
      setNotifications(previousNotifications)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    const now = new Date().toISOString()
    let previousNotifications: Notification[] | null = null

    setNotifications((prev) => {
      previousNotifications = prev
      return prev.map((n) => ({ ...n, is_read: true, read_at: now as any }))
    })

    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      if (!res.ok) {
        throw new Error(`Failed to mark all notifications as read: ${res.status}`)
      }
    } catch (error) {
      console.error('Error marking all notifications as read', error)
      if (previousNotifications) {
        setNotifications(previousNotifications)
      }
      toast.error('Failed to mark all notifications as read. Please try again.')
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    let previousNotifications: Notification[] | null = null

    // Optimistically remove the notification from local state
    setNotifications((prev) => {
      previousNotifications = prev
      return prev.filter((n) => n.id !== id)
    })

    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        throw new Error(`Failed to delete notification. Status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to delete notification. Reverting optimistic update.', error)
      if (previousNotifications) {
        setNotifications(previousNotifications)
      }
    }
  }, [])

  const clearRead = useCallback(async () => {
    let previousNotifications: Notification[] | null = null
    setNotifications((prev) => {
      previousNotifications = prev
      return prev.filter((n) => !n.is_read)
    })
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' })
      if (!res.ok) {
        if (previousNotifications) {
          setNotifications(previousNotifications)
        }
        console.error(
          'Failed to clear read notifications. Server responded with status:',
          res.status,
        )
        toast.error('Failed to clear read notifications. Please try again.')
      }
    } catch (error) {
      if (previousNotifications) {
        setNotifications(previousNotifications)
      }
      console.error('Failed to clear read notifications:', error)
      toast.error('Failed to clear read notifications. Please try again.')
    }
  }, [])

  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      setPreferences((prev) => (prev ? { ...prev, ...prefs } : null))
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (res.ok) {
        const json = await res.json()
        setPreferences(json.data)
      }
    },
    [],
  )

  const addToast = useCallback(
    (
      notification: Pick<
        Notification,
        'type' | 'title' | 'message' | 'action_url' | 'action_label'
      >,
    ) => {
      const icon = TYPE_ICON[notification.type] ?? '🔔'
      toast(
        (t) => (
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm">{notification.title}</p>
            <p className="text-xs opacity-80">{notification.message}</p>
            {notification.action_url && notification.action_label && (
              <a
                href={notification.action_url}
                className="text-xs text-primary-400 hover:underline mt-1"
                onClick={() => toast.dismiss(t.id)}
              >
                {notification.action_label}
              </a>
            )}
          </div>
        ),
        { icon, duration: 6000 },
      )
    },
    [],
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  )

  const value: NotificationContextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      isOpen,
      isLoading,
      preferences,
      setIsOpen,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearRead,
      updatePreferences,
      addToast,
    }),
    [
      notifications,
      unreadCount,
      isOpen,
      isLoading,
      preferences,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearRead,
      updatePreferences,
      addToast,
    ],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
