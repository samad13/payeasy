const vi = jest;
import { DELETE } from './route';

jest.mock('@/lib/supabase/admin', () => ({
    createAdminClient: jest.fn(),
}));

jest.mock('@/lib/api-utils', () => ({
    ...jest.requireActual('@/lib/api-utils'),
    getUserId: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
    sendEmail: jest.fn(),
    getAccountDeletionEmailTemplate: jest.fn(() => 'test_template'),
}));

import { createAdminClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/api-utils';
import { sendEmail } from '@/lib/email';

describe('DELETE /api/users/delete', () => {
    let mockSupabase: any;
    let mockRequest: any;

    beforeEach(() => {
        jest.clearAllMocks();
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
        const orMock = jest.fn().mockResolvedValue({ error: null });
        const deleteEqMock = jest.fn().mockResolvedValue({ error: null });

        const deleteMock = jest.fn().mockReturnValue({
            eq: deleteEqMock,
            or: orMock,
        });

        // Mocks for select chaining
        const singleMock = jest.fn().mockResolvedValue({ data: { id: 'user-123', email: 'test@test.com' }, error: null });
        const selectEqMock = jest.fn().mockReturnValue({ single: singleMock });
        const selectMock = jest.fn().mockReturnValue({ eq: selectEqMock });

        const insertMock = jest.fn().mockResolvedValue({ error: null });

        mockSupabase = {
            from: jest.fn((table: string) => ({
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
