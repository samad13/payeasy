import { NextRequest, NextResponse } from 'next/server';
import { EngagementService } from '@/lib/analytics/engagement';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * GET /api/analytics/engagement
 * Query params:
 *  - startDate: ISO date string
 *  - endDate: ISO date string
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            return errorResponse('Missing startDate or endDate parameters', 400);
        }

        const report = await EngagementService.getEngagementReport(startDate, endDate);

        return successResponse(report, 200);
    } catch (error: any) {
        console.error('Error fetching engagement metrics:', error);
        return errorResponse(error.message || 'Internal Server Error', 500);
    }
}
