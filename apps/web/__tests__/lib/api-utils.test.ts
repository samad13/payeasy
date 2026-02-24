import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getUserId } from '@/lib/api-utils';
import { verifyJwt } from '@/lib/auth/stellar-auth';

global.Request = class Request { } as any;

jest.mock('@/lib/auth/stellar-auth', () => ({
    verifyJwt: jest.fn(),
}));

describe('api-utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('successResponse', () => {
        it('returns a successful JSON response with default 200 status', async () => {
            const data = { foo: 'bar' };
            const response = successResponse(data);

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Type')).toBe('application/json');

            const json = await response.json();
            expect(json).toEqual({ success: true, data });
        });

        it('returns a successful JSON response with custom status', async () => {
            const data = { created: true };
            const response = successResponse(data, 201);

            expect(response.status).toBe(201);
            const json = await response.json();
            expect(json).toEqual({ success: true, data });
        });
    });

    describe('errorResponse', () => {
        it('returns an error JSON response with default 400 status', async () => {
            const response = errorResponse('Bad Request');

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json).toEqual({ success: false, error: { message: 'Bad Request' } });
        });

        it('includes a custom code if provided', async () => {
            const response = errorResponse('Not Found', 404, 'ERR_NOT_FOUND');

            expect(response.status).toBe(404);
            const json = await response.json();
            expect(json).toEqual({ success: false, error: { message: 'Not Found', code: 'ERR_NOT_FOUND' } });
        });
    });

    describe('getUserId', () => {
        it('extracts user ID from auth-token cookie', () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'mock-jwt-token' }),
                },
            } as unknown as NextRequest;

            (verifyJwt as jest.Mock).mockReturnValue({ sub: 'user-123' });

            const userId = getUserId(mockRequest);
            expect(userId).toBe('user-123');
            expect(mockRequest.cookies.get).toHaveBeenCalledWith('auth-token');
            expect(verifyJwt).toHaveBeenCalledWith('mock-jwt-token');
        });

        it('extracts user ID from Authorization header', () => {
            const mockRequest = {
                headers: {
                    get: jest.fn().mockReturnValue('Bearer mock-header-token'),
                },
            } as unknown as Request;

            (verifyJwt as jest.Mock).mockReturnValue({ sub: 'user-456' });

            const userId = getUserId(mockRequest);
            expect(userId).toBe('user-456');
            expect(mockRequest.headers.get).toHaveBeenCalledWith('authorization');
            expect(verifyJwt).toHaveBeenCalledWith('mock-header-token');
        });

        it('returns null if no token is found', () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue(undefined),
                },
                headers: {
                    get: jest.fn().mockReturnValue(null),
                },
            } as unknown as NextRequest;

            const userId = getUserId(mockRequest);
            expect(userId).toBeNull();
            expect(verifyJwt).not.toHaveBeenCalled();
        });

        it('returns null if token is invalid or missing sub', () => {
            const mockRequest = {
                headers: {
                    get: jest.fn().mockReturnValue('Bearer bad-token'),
                },
            } as unknown as Request;

            (verifyJwt as jest.Mock).mockReturnValue({ other_claim: true });

            const userId = getUserId(mockRequest);
            expect(userId).toBeNull();
        });
    });
});
