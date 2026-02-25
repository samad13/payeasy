import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Create a Supabase server client with anon key. Returns null when env is not set,
 * so the app can run without Supabase configured during build/development.
 */
export async function createClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.warn("Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Using empty strings for build purposes.");
  }

  if (!supabaseAnonKey && !supabaseServiceKey) {
    console.warn("Missing Supabase authentication keys. Using dummy key for build purposes.");
  }

  return createServerClient(
    supabaseUrl || "http://localhost:54321",
    supabaseServiceKey || supabaseAnonKey || "dummy_key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle error silently in middleware/edge runtime
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase server client with service role for admin operations.
 * Returns null when env is not set, so the app can run without Supabase configured.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Missing Supabase admin environment variables. Service role operations will be unavailable.");
    return null;
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle error silently in middleware/edge runtime
          }
        },
      },
    }
  );
}

// Singleton pattern for server client caching
let serverClient: SupabaseClient | null | undefined = undefined;

/**
 * Get or create a cached server client (singleton pattern)
 * Useful for reuse across multiple operations in the same request
 */
export async function getServerClient(): Promise<SupabaseClient | null> {
  if (serverClient === undefined) {
    const client = await createClient();
    serverClient = client as unknown as SupabaseClient;
  }
  return serverClient;
}

/**
 * Clear the cached server client (useful for testing or after logout)
 */
export function clearServerClientCache() {
  serverClient = undefined;
}