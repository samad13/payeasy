import jwt from 'jsonwebtoken';

export function verifyToken(token: string) {
    try {
        // Note: Assuming JWT secret is configured. In development, fallback to Supabase Anon Key or a test secret.
        const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'development-secret';
        const decoded = jwt.verify(token, secret);
        return decoded as jwt.JwtPayload;
    } catch (error) {
        return null;
    }
}
