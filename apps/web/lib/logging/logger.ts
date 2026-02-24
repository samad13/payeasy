import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    redact: {
        paths: [
            'password',
            '*.password',
            'email',
            '*.email',
            'token',
            '*.token',
            'authorization',
            'headers.authorization',
            'cookie',
            'headers.cookie',
        ],
        remove: true,
    },
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard',
            },
        }
        : undefined,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});
