/**
 * @file NotificationCenter.test.tsx
 * @description Tests for NotificationCenter, NotificationBell, and NotificationPreferencesPanel.
 */

import '@testing-library/jest-dom'
import React from 'react'
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import {
  NotificationContext,
  type NotificationContextValue,
} from '@/contexts/NotificationContext'
import { NotificationCenter } from '@/components/NotificationCenter'
import { NotificationBell } from '@/components/NotificationBell'
import { NotificationPreferencesPanel } from '@/components/NotificationPreferencesPanel'
import type { Notification, NotificationPreferences } from '@/lib/types/database'

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'notif-1',
  user_id: 'user-1',
  type: 'system',
  title: 'Test notification',
  message: 'This is a test message',
  is_read: false,
  metadata: {},
  created_at: new Date().toISOString() as any,
  ...overrides,
})

const defaultPrefs: NotificationPreferences = {
  id: 'pref-1',
  user_id: 'user-1',
  message_enabled: true,
  payment_enabled: true,
  listing_enabled: true,
  system_enabled: true,
  favorite_enabled: true,
  agreement_enabled: true,
  sound_enabled: false,
  email_enabled: false,
}

function makeContextValue(
  overrides: Partial<NotificationContextValue> = {},
): NotificationContextValue {
  return {
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    isLoading: false,
    preferences: defaultPrefs,
    setIsOpen: jest.fn(),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    markAllAsRead: jest.fn().mockResolvedValue(undefined),
    deleteNotification: jest.fn().mockResolvedValue(undefined),
    clearRead: jest.fn().mockResolvedValue(undefined),
    updatePreferences: jest.fn().mockResolvedValue(undefined),
    addToast: jest.fn(),
    ...overrides,
  }
}

function renderWithCtx(ui: React.ReactElement, ctxValue: NotificationContextValue) {
  return render(
    <NotificationContext.Provider value={ctxValue}>
      {ui}
    </NotificationContext.Provider>,
  )
}

// ──────────────────────────────────────────────────────────────
// NotificationBell
// ──────────────────────────────────────────────────────────────

describe('NotificationBell', () => {
  it('renders with no badge when unreadCount is 0', () => {
    renderWithCtx(<NotificationBell />, makeContextValue({ unreadCount: 0 }))
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument()
  })

  it('shows unread count badge', () => {
    renderWithCtx(<NotificationBell />, makeContextValue({ unreadCount: 5 }))
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows 99+ when count exceeds 99', () => {
    renderWithCtx(<NotificationBell />, makeContextValue({ unreadCount: 100 }))
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('calls setIsOpen when clicked', () => {
    const setIsOpen = jest.fn()
    renderWithCtx(<NotificationBell />, makeContextValue({ setIsOpen }))
    fireEvent.click(screen.getByRole('button'))
    expect(setIsOpen).toHaveBeenCalledWith(true)
  })

  it('has correct aria-expanded when closed', () => {
    renderWithCtx(<NotificationBell />, makeContextValue({ isOpen: false }))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has correct aria-expanded when open', () => {
    renderWithCtx(<NotificationBell />, makeContextValue({ isOpen: true, setIsOpen: jest.fn() }))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })
})

// ──────────────────────────────────────────────────────────────
// NotificationCenter
// ──────────────────────────────────────────────────────────────

describe('NotificationCenter', () => {
  it('is hidden when isOpen is false', () => {
    renderWithCtx(<NotificationCenter />, makeContextValue({ isOpen: false }))
    const drawer = screen.getByRole('dialog')
    expect(drawer).toHaveClass('translate-x-full')
  })

  it('is visible when isOpen is true', () => {
    renderWithCtx(<NotificationCenter />, makeContextValue({ isOpen: true }))
    const drawer = screen.getByRole('dialog')
    expect(drawer).toHaveClass('translate-x-0')
  })

  it('shows empty state when no notifications', () => {
    renderWithCtx(<NotificationCenter />, makeContextValue({ isOpen: true, notifications: [] }))
    expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument()
  })

  it('renders notification items', () => {
    const notifications = [
      makeNotification({ id: 'n1', title: 'Message arrived' }),
      makeNotification({ id: 'n2', title: 'Payment confirmed', type: 'payment', is_read: true }),
    ]
    renderWithCtx(
      <NotificationCenter />,
      makeContextValue({ isOpen: true, notifications, unreadCount: 1 }),
    )
    expect(screen.getByText('Message arrived')).toBeInTheDocument()
    expect(screen.getByText('Payment confirmed')).toBeInTheDocument()
  })

  it('shows loading skeletons when isLoading', () => {
    renderWithCtx(
      <NotificationCenter />,
      makeContextValue({ isOpen: true, isLoading: true }),
    )
    // Skeletons are rendered as animated divs
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows unread count badge in header', () => {
    renderWithCtx(
      <NotificationCenter />,
      makeContextValue({ isOpen: true, unreadCount: 3 }),
    )
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls markAllAsRead when "Mark all read" is clicked', async () => {
    const markAllAsRead = jest.fn().mockResolvedValue(undefined)
    const notifications = [makeNotification()]
    renderWithCtx(
      <NotificationCenter />,
      makeContextValue({ isOpen: true, notifications, unreadCount: 1, markAllAsRead }),
    )
    fireEvent.click(screen.getByTitle('Mark all as read'))
    expect(markAllAsRead).toHaveBeenCalledTimes(1)
  })

  it('closes when Escape key is pressed', () => {
    const setIsOpen = jest.fn()
    renderWithCtx(
      <NotificationCenter />,
      makeContextValue({ isOpen: true, setIsOpen }),
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(setIsOpen).toHaveBeenCalledWith(false)
  })

  it('switches to Unread tab and shows empty state', () => {
    const notifications = [makeNotification({ is_read: true })]
    renderWithCtx(
      <NotificationCenter />,
      makeContextValue({ isOpen: true, notifications, unreadCount: 0 }),
    )
    fireEvent.click(screen.getByRole('button', { name: /unread/i }))
    expect(screen.getByText(/no unread notifications/i)).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────────────────────
// NotificationPreferencesPanel
// ──────────────────────────────────────────────────────────────

describe('NotificationPreferencesPanel', () => {
  it('renders all category toggles', () => {
    renderWithCtx(<NotificationPreferencesPanel />, makeContextValue())
    expect(screen.getByRole('switch', { name: /messages/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /payments/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /listings/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /agreements/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /favorites/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /system/i })).toBeInTheDocument()
  })

  it('shows loading spinner when preferences is null', () => {
    renderWithCtx(
      <NotificationPreferencesPanel />,
      makeContextValue({ preferences: null }),
    )
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('calls updatePreferences when a toggle is clicked', () => {
    const updatePreferences = jest.fn().mockResolvedValue(undefined)
    renderWithCtx(
      <NotificationPreferencesPanel />,
      makeContextValue({ updatePreferences }),
    )
    fireEvent.click(screen.getByRole('switch', { name: /sound/i }))
    expect(updatePreferences).toHaveBeenCalledWith({ sound_enabled: true })
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    renderWithCtx(
      <NotificationPreferencesPanel onClose={onClose} />,
      makeContextValue(),
    )
    fireEvent.click(screen.getByRole('button', { name: /close preferences/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
