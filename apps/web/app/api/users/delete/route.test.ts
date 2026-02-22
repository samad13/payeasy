import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DELETE } from './route';

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

vi.mock('@/lib/api-utils', () => ({
    getUserId: vi.fn(),
    successResponse: (data: any) => ({ json: async () => ({ success: true, data }), status: 200 }),
    errorResponse: (message: string, status?: number) => ({
        json: async () => ({ success: false, error: { message } }),
        status: status || 400,
    }),
}));

vi.mock('@/lib/email', () => ({
    sendEmail: vi.fn(),
    getAccountDeletionEmailTemplate: vi.fn(() => 'test_template'),
}));

import { createAdminClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/api-utils';
import { sendEmail } from '@/lib/email';

describe('DELETE /api/users/delete', () => {
    let mockSupabase: any;
    let mockRequest: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequest = { headers: new Headers() };
    });

    it('should return 401 if unauthorized', async () => {
        (getUserId as any).mockReturnValue(null);
        const response = await DELETE(mockRequest);
        const json = await response.json();
        expect(response.status).toBe(401);
    });

    it('should perform exhaustive cascading delete, send email, and write audit logs', async () => {
        (getUserId as any).mockReturnValue('pub_key_123');

        // Mocks for delete chaining
        const orMock = vi.fn().mockResolvedValue({ error: null });
        const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

        const deleteMock = vi.fn().mockReturnValue({
            eq: deleteEqMock,
            or: orMock,
        });

        // Mocks for select chaining
        const singleMock = vi.fn().mockResolvedValue({ data: { id: 'user-123', email: 'test@test.com' }, error: null });
        const selectEqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: selectEqMock });

        const insertMock = vi.fn().mockResolvedValue({ error: null });

        mockSupabase = {
            from: vi.fn((table: string) => ({
                select: selectMock,
                insert: insertMock,
                delete: deleteMock,
            }))
        };

        (createAdminClient as any).mockReturnValue(mockSupabase);
        (sendEmail as any).mockResolvedValue(true);

        const response = await DELETE(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);

        // Verify cascading deletes
        expect(mockSupabase.from).toHaveBeenCalledWith('messages');
        expect(mockSupabase.from).toHaveBeenCalledWith('conversations');
        expect(mockSupabase.from).toHaveBeenCalledWith('payment_records');
        expect(mockSupabase.from).toHaveBeenCalledWith('listings');
        expect(mockSupabase.from).toHaveBeenCalledWith('users');

        // Verify audit logs are inserted
        expect(insertMock).toHaveBeenCalledTimes(2); // Start & Success

        // Verify email sent
        expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com'
        }));
    });
});
