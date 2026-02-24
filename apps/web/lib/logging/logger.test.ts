import pino from 'pino';

describe('Logger Redaction', () => {
    let logOutput: any[] = [];
    const stream = {
        write: (log: string) => {
            logOutput.push(JSON.parse(log));
        }
    };

    const testLogger = pino({
        level: 'info',
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
    }, stream);

    beforeEach(() => {
        logOutput = [];
    });

    it('should redact sensitive fields', () => {
        const sensitiveData = {
            email: 'user@example.com',
            password: 'secretpassword',
            token: 'secret-token',
            nested: {
                password: 'nested-secret'
            },
            safe: 'data'
        };

        testLogger.info(sensitiveData, 'Test log');

        const log = logOutput[0];
        expect(log.email).toBeUndefined();
        expect(log.password).toBeUndefined();
        expect(log.token).toBeUndefined();
        expect(log.nested.password).toBeUndefined();
        expect(log.safe).toBe('data');
    });
});
