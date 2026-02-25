/**
 * @file NotificationCenter.tsx
 * @description Full notification center slide-over drawer.
 *
 * Features:
 *  - List of all notifications (newest first)
 *  - Unread indicator per item
 *  - Per-notification action button & dismiss
 *  - Mark all as read / clear read
 *  - Tabbed filter (All | Unread)
 *  - Inline notification preferences
 *  - Mobile responsive (full-screen on xs, slide-over on sm+)
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  X,
  BellOff,
  CheckCheck,
  Trash2,
  ExternalLink,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationPreferencesPanel } from '@/components/NotificationPreferencesPanel'
import type { Notification, NotificationType } from '@/lib/types/database'

// ──────────────────────────────────────────────────────────────
// Config maps
// ──────────────────────────────────────────────────────────────

const TYPE_ICON: Record<NotificationType, string> = {
  message: '💬',
  payment: '💸',
  listing: '🏠',
  system: '🔔',
  favorite: '❤️',
  agreement: '📋',
}

const TYPE_COLOR: Record<NotificationType, string> = {
  message: 'bg-blue-500/15 text-blue-400',
  payment: 'bg-green-500/15 text-green-400',
  listing: 'bg-purple-500/15 text-purple-400',
  system: 'bg-yellow-500/15 text-yellow-400',
  favorite: 'bg-rose-500/15 text-rose-400',
  agreement: 'bg-indigo-500/15 text-indigo-400',
}

type Tab = 'all' | 'unread'

// ──────────────────────────────────────────────────────────────
// Relative time helper
// ──────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ──────────────────────────────────────────────────────────────
// Notification item
// ──────────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const icon = TYPE_ICON[notification.type] ?? '🔔'
  const colorClass = TYPE_COLOR[notification.type] ?? TYPE_COLOR.system

  return (
    <article
      className={cn(
        'group relative flex gap-3 px-4 py-3 transition-colors',
        !notification.is_read
          ? 'bg-primary-500/5 hover:bg-primary-500/10'
          : 'hover:bg-slate-800/50 dark:hover:bg-slate-800/50',
      )}
      aria-label={`${notification.is_read ? 'Read' : 'Unread'}: ${notification.title}`}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <span
          className="absolute left-1.5 top-4 h-2 w-2 rounded-full bg-primary-500"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base',
          colorClass,
        )}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug',
              notification.is_read
                ? 'font-normal text-slate-300'
                : 'font-semibold text-white',
            )}
          >
            {notification.title}
          </p>
          <span className="flex-shrink-0 text-[10px] text-slate-500 mt-0.5">
            {relativeTime(notification.created_at)}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-snug line-clamp-2">
          {notification.message}
        </p>

        {notification.action_url && notification.action_label && (
          <Link
            href={notification.action_url}
            onClick={() => !notification.is_read && onRead(notification.id)}
            className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300 hover:underline underline-offset-2"
          >
            {notification.action_label}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {!notification.is_read && (
          <button
            onClick={() => onRead(notification.id)}
            className="rounded p-1 text-slate-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="rounded p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Delete notification"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  )
}

// ──────────────────────────────────────────────────────────────
// Notification Center Drawer
// ──────────────────────────────────────────────────────────────

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
  } = useNotifications()

  const [tab, setTab] = useState<Tab>('all')
  const [showPrefs, setShowPrefs] = useState(false)

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, setIsOpen])

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const filtered = tab === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications

  const readCount = notifications.filter((n) => n.is_read).length

  const handleMarkAsRead = useCallback((id: string) => markAsRead(id), [markAsRead])
  const handleDelete = useCallback((id: string) => deleteNotification(id), [deleteNotification])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notification center"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full flex-col',
          'sm:max-w-md',
          'bg-slate-950 dark:bg-slate-900 text-white',
          'shadow-2xl border-l border-slate-800',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Preferences toggle */}
            <button
              onClick={() => setShowPrefs((v) => !v)}
              className={cn(
                'rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
                showPrefs && 'bg-slate-800 text-white',
              )}
              aria-label="Notification preferences"
              title="Preferences"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Preferences panel (inline) ──────────────────────── */}
        {showPrefs && (
          <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-4">
            <NotificationPreferencesPanel onClose={() => setShowPrefs(false)} />
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-slate-800 px-5 py-2">
          {(['all', 'unread'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                tab === t
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              )}
            >
              {t}
              {t === 'unread' && unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-primary-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}

          {/* Bulk actions */}
          <div className="ml-auto flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            {readCount > 0 && (
              <button
                onClick={clearRead}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Clear read"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear read</span>
              </button>
            )}
          </div>
        </div>

        {/* ── List ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="space-y-1 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 px-2 py-3 animate-pulse">
                  <div className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-slate-800" />
                    <div className="h-2.5 w-full rounded bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                <BellOff className="h-7 w-7 text-slate-500" />
              </div>
              <div>
                <p className="font-medium text-slate-300">
                  {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {tab === 'unread'
                    ? "You're all caught up!"
                    : "We'll let you know when something happens."}
                </p>
              </div>
              {tab === 'unread' && notifications.length > 0 && (
                <button
                  onClick={() => setTab('all')}
                  className="flex items-center gap-1 text-sm text-primary-400 hover:underline"
                >
                  View all notifications
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        {notifications.length > 0 && (
          <footer className="border-t border-slate-800 px-5 py-3">
            <p className="text-center text-xs text-slate-500">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
              {unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </footer>
        )}
      </aside>
    </>
  )
}
