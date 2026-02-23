/**
 * API route handler for data retention and cleanup operations
 * POST /api/admin/cleanup - Trigger cleanup
 * GET /api/admin/cleanup/status - Get job execution history and stats
 * GET /api/admin/cleanup/policies - Get retention policies
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  runDailyCleanup,
  runWeeklyArchive,
  runMonthlyAnonymize,
  forceRunCleanup,
  getJobExecutionHistory,
  getCleanupStats,
} from '@/lib/jobs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify admin access
 */
async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return false;

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true || 
                   user.app_metadata?.role === 'super_admin';

    return isAdmin;
  } catch {
    return false;
  }
}

/**
 * POST /api/admin/cleanup
 * Trigger a cleanup operation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    if (!await verifyAdminAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type = 'all' } = body;

    let result;

    switch (type) {
      case 'daily':
        await runDailyCleanup();
        result = { message: 'Daily cleanup job triggered', type: 'daily' };
        break;
      case 'weekly':
        await runWeeklyArchive();
        result = { message: 'Weekly archive job triggered', type: 'weekly' };
        break;
      case 'monthly':
        await runMonthlyAnonymize();
        result = { message: 'Monthly anonymize job triggered', type: 'monthly' };
        break;
      case 'all':
      default:
        const cleanupResults = await forceRunCleanup();
        result = {
          message: 'All cleanup policies executed',
          type: 'all',
          results: cleanupResults,
        };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Cleanup endpoint error:', error);

    return NextResponse.json(
      { error: 'Failed to execute cleanup', details: error },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup/status
 * Get job execution history and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!await verifyAdminAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const jobName = searchParams.get('job');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);

    if (endpoint === 'history') {
      // Get job execution history
      const history = await getJobExecutionHistory(jobName || undefined, limit);
      return NextResponse.json({
        success: true,
        data: history,
        total: history.length,
      });
    }

    if (endpoint === 'stats') {
      // Get cleanup statistics
      const stats = await getCleanupStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (endpoint === 'policies') {
      // Get retention policies
      const { data: policies, error } = await supabase
        .from('retention_policies')
        .select('*');

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: policies || [],
      });
    }

    return NextResponse.json(
      { error: 'Invalid endpoint parameter' },
      { status: 400 }
    );
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Cleanup status endpoint error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch cleanup status', details: error },
      { status: 500 }
    );
  }
}
