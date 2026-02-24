import { NextResponse } from 'next/server';
import { logger } from '../../../lib/logging/logger';

export async function GET() {
    try {
        // You could also add database checks here using Supabase if desired.
        // For now, this is a basic application health check.
        logger.debug('Health check pinged.');

        return NextResponse.json(
            { status: 'healthy', timestamp: new Date().toISOString() },
            { status: 200 }
        );
    } catch (error) {
        logger.error({ error }, 'Health check failed');
        return NextResponse.json(
            { status: 'unhealthy', error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
