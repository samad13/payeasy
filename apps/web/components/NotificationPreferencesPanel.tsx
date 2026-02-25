/**
 * @file NotificationPreferencesPanel.tsx
 * @description Compact preferences panel for the notification center.
 *   Allows toggling each notification type and global sound / email options.
 */

'use client'

import React from 'react'
import { Volume2, VolumeX, Mail, MailOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationPreferences } from '@/lib/types/database'

interface NotificationPreferencesPanelProps {
  onClose?: () => void
}

// ──────────────────────────────────────────────────────────────
// Toggle switch
// ──────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900',
        checked ? 'bg-primary-500' : 'bg-slate-700',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md',
          'transition duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}

// ──────────────────────────────────────────────────────────────
// Panel
// ──────────────────────────────────────────────────────────────

const CATEGORIES: Array<{
  key: keyof NotificationPreferences
  label: string
  icon: string
  description: string
}> = [
  { key: 'message_enabled', label: 'Messages', icon: '💬', description: 'New message notifications' },
  { key: 'payment_enabled', label: 'Payments', icon: '💸', description: 'Payment updates' },
  { key: 'listing_enabled', label: 'Listings', icon: '🏠', description: 'Listing activity' },
  { key: 'agreement_enabled', label: 'Agreements', icon: '📋', description: 'Rent agreement updates' },
  { key: 'favorite_enabled', label: 'Favorites', icon: '❤️', description: 'Saved listing activity' },
  { key: 'system_enabled', label: 'System', icon: '🔔', description: 'App & account alerts' },
]

export function NotificationPreferencesPanel({ onClose }: NotificationPreferencesPanelProps) {
  const { preferences, updatePreferences } = useNotifications()

  if (!preferences) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-primary-500" />
      </div>
    )
  }

  const handleToggle = (key: keyof NotificationPreferences) => (value: boolean) => {
    updatePreferences({ [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close preferences"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category toggles */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Categories</p>
        {CATEGORIES.map(({ key, label, icon, description }) => (
          <div key={key} className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base" aria-hidden="true">{icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 truncate">{description}</p>
              </div>
            </div>
            <Toggle
              checked={Boolean(preferences[key])}
              onChange={handleToggle(key)}
              ariaLabel={`Toggle ${label} notifications`}
            />
          </div>
        ))}
      </div>

      {/* Global options */}
      <div className="space-y-2 pt-2 border-t border-slate-700/60">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Global options</p>

        {/* Sound */}
        <div className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center gap-2">
            {preferences.sound_enabled ? (
              <Volume2 className="h-4 w-4 text-slate-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-200">Sound alerts</p>
              <p className="text-xs text-slate-500">Play a sound on new notifications</p>
            </div>
          </div>
          <Toggle
            checked={preferences.sound_enabled}
            onChange={handleToggle('sound_enabled')}
            ariaLabel="Toggle notification sounds"
          />
        </div>

        {/* Email */}
        <div className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center gap-2">
            {preferences.email_enabled ? (
              <Mail className="h-4 w-4 text-slate-400" />
            ) : (
              <MailOff className="h-4 w-4 text-slate-500" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-200">Email digest</p>
              <p className="text-xs text-slate-500">Receive notifications by email</p>
            </div>
          </div>
          <Toggle
            checked={preferences.email_enabled}
            onChange={handleToggle('email_enabled')}
            ariaLabel="Toggle email notifications"
          />
        </div>
      </div>
    </div>
  )
}
