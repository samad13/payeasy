const vi = jest;
import { GET, POST, DELETE } from './route';

jest.mock('@/lib/supabase/admin', () => ({
    createAdminClient: jest.fn(),
}));

jest.mock('@/lib/api-utils', () => ({
    ...jest.requireActual('@/lib/api-utils'),
    getUserId: jest.fn(),
}));

import { createAdminClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/api-utils';

describe('/api/users/consent', () => {
    let mockSupabase: any;
    let mockRequest: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            headers: new Headers(),
            json: jest.fn(),
            ip: '127.0.0.1'
        };
        mockRequest.headers.set('x-forwarded-for', '127.0.0.1');
    });

    const setupMockSupabase = () => {
        const defaultData = { id: 'user-123' };
        const eqMock = jest.fn();
        const singleMock = jest.fn();
        const selectMock = jest.fn();
        const insertMock = jest.fn();
        const orderMock = jest.fn();

        const dbClient = {
            select: selectMock,
            insert: insertMock,
            eq: eqMock,
            order: orderMock,
            single: singleMock,
        };

        mockSupabase = {
            from: jest.fn(() => dbClient),
        };

        selectMock.mockReturnValue(dbClient);
        eqMock.mockReturnValue(dbClient);
        orderMock.mockReturnValue({ data: [{ id: 'consent-1' }], error: null });
        singleMock.mockResolvedValue({ data: defaultData, error: null });
        insertMock.mockReturnValue(dbClient);

        (createAdminClient as any).mockReturnValue(mockSupabase);

        return { insertMock };
    };

    it('GET should return consent history', async () => {
        (getUserId as any).mockReturnValue('pub_key_123');
        setupMockSupabase();

        const response = await GET(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.consents).toHaveLength(1);
    });

    it('POST should create consent and audit log', async () => {
        (getUserId as any).mockReturnValue('pub_key_123');
        const { insertMock } = setupMockSupabase();

        mockRequest.json.mockResolvedValue({
            consentType: 'marketing',
            version: 'v1.0'
        });

        const response = await POST(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);

        expect(mockSupabase.from).toHaveBeenCalledWith('consent_records');
        expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('DELETE should append a withdrawal record and audit log', async () => {
        (getUserId as any).mockReturnValue('pub_key_123');
        setupMockSupabase();

        mockRequest.json.mockResolvedValue({
            consentType: 'marketing'
        });

        const response = await DELETE(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);

        // Verify it inserts into consent_records instead of deleting
        expect(mockSupabase.from).toHaveBeenCalledWith('consent_records');
        expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
});
