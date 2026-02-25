/**
 * GET  /api/notifications        – list current user's notifications (paginated)
 * POST /api/notifications        – create a notification (server/service use)
 * DELETE /api/notifications      – bulk-delete all read notifications
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NotificationInsert } from '@/lib/types/database'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50)
  const offset = Number(searchParams.get('offset') ?? '0')
  const unreadOnly = searchParams.get('unread') === 'true'

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count, limit, offset })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: Partial<NotificationInsert> = await request.json()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type: body.type ?? 'system',
      title: body.title ?? '',
      message: body.message ?? '',
      action_url: body.action_url ?? null,
      action_label: body.action_label ?? null,
      metadata: body.metadata ?? {},
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .eq('is_read', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
