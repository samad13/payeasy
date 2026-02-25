/**
 * GET    /api/notifications/preferences – get user's notification preferences
 * PUT    /api/notifications/preferences – upsert preferences
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEFAULT_PREFERENCES = {
  message_enabled: true,
  payment_enabled: true,
  listing_enabled: true,
  system_enabled: true,
  favorite_enabled: true,
  agreement_enabled: true,
  sound_enabled: false,
  email_enabled: false,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return defaults if no preferences row yet
  if (!data) {
    return NextResponse.json({ data: { id: null, user_id: user.id, ...DEFAULT_PREFERENCES } })
  }

  return NextResponse.json({ data })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Only allow known preference keys
  const allowedKeys = Object.keys(DEFAULT_PREFERENCES)
  const safeUpdate: Record<string, boolean> = {}
  for (const key of allowedKeys) {
    if (key in body) safeUpdate[key] = Boolean(body[key])
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: user.id, ...safeUpdate }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
