import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

vi.mock('@/lib/api-utils', () => ({
    getUserId: vi.fn(),
    errorResponse: (message: string, status?: number) => ({
        json: async () => ({ success: false, error: { message } }),
        status: status || 400,
    }),
}));

import { createAdminClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/api-utils';

describe('GET /api/users/export', () => {
    let mockSupabase: any;
    let mockRequest: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            from: vi.fn(),
        };

        mockRequest = {
            url: 'http://localhost/api/users/export?format=json',
            headers: new Headers(),
        };
    });

    it('should return 401 if unauthorized', async () => {
        (getUserId as any).mockReturnValue(null);
        const response = await GET(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.success).toBe(false);
    });

    it('should generate a JSON export successfully', async () => {
        (getUserId as any).mockReturnValue('pub_key_123');

        // Mocks for supabase chaining
        const eqMock = vi.fn();
        const singleMock = vi.fn();
        const selectMock = vi.fn();
        const orMock = vi.fn();
        const insertMock = vi.fn();

        mockSupabase.from.mockReturnValue({
            select: selectMock,
            insert: insertMock,
        });

        selectMock.mockReturnValue({
            eq: eqMock,
            or: orMock,
        });

        eqMock.mockImplementation((field: string) => {
            // If fetching user
            if (field === 'public_key') return { single: singleMock };
            // Otherwise list queries
            return Promise.resolve({ data: [] });
        });

        orMock.mockResolvedValue({ data: [] });
        singleMock.mockResolvedValue({ data: { id: 'user-123', username: 'testuser' }, error: null });
        insertMock.mockResolvedValue({ error: null });

        (createAdminClient as any).mockReturnValue(mockSupabase);

        const response = await GET(mockRequest);
        expect(response.headers.get('Content-Type')).toBe('application/json');
        expect(response.headers.get('Content-Disposition')).toContain('userdata-user-123.json');

        // Check if audit log was inserted
        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
            action_type: 'EXPORT_DATA',
            user_id: 'user-123'
        }));
    });

    it('should generate a CSV export successfully', async () => {
        (getUserId as any).mockReturnValue('pub_key_123');
        mockRequest.url = 'http://localhost/api/users/export?format=csv';

        const eqMock = vi.fn();
        const singleMock = vi.fn();
        const selectMock = vi.fn();
        const orMock = vi.fn();
        const insertMock = vi.fn();

        mockSupabase.from.mockReturnValue({ select: selectMock, insert: insertMock });
        selectMock.mockReturnValue({ eq: eqMock, or: orMock });

        eqMock.mockImplementation((field: string) => {
            if (field === 'public_key') return { single: singleMock };
            return Promise.resolve({ data: [] });
        });

        orMock.mockResolvedValue({ data: [] });
        singleMock.mockResolvedValue({ data: { id: 'user-123', username: 'testuser' }, error: null });
        insertMock.mockResolvedValue({ error: null });

        (createAdminClient as any).mockReturnValue(mockSupabase);

        const response = await GET(mockRequest);
        const text = await response.text();

        expect(response.headers.get('Content-Type')).toBe('text/csv');
        expect(text).toContain('--- User Profile ---');
        expect(text).toContain('testuser');
    });
});
