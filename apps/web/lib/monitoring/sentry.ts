import * as Sentry from '@sentry/nextjs';
import { logger } from '../logging/logger';

/**
 * Capture an exception and log it to both Sentry and local logs.
 */
export function captureException(error: unknown, context?: Record<string, any>) {
    logger.error({ err: error, ...context }, 'Exception captured');

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(error, context ? { extra: context } : undefined);
    }
}

/**
 * Capture a message and log it to both Sentry and local logs.
 */
export function captureMessage(message: string, context?: Record<string, any>, level: Sentry.SeverityLevel = 'info') {
    logger.info({ message, ...context }, 'Message captured');

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureMessage(message, { level, extra: context });
    }
}

export const monitoring = {
    captureException,
    captureMessage,
};
