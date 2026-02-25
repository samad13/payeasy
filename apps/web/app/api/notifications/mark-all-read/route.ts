/**
 * POST /api/notifications/mark-all-read – mark all notifications as read
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: now })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
