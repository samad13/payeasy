import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn("Missing Supabase environment variables. Using empty strings for build purposes.");
  }

  return createClient(supabaseUrl || "http://localhost:54321", serviceKey || "dummy_key", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
