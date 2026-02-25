import { z } from "zod";

// Server env: optional so the app can run without them (e.g. clone + npm run dev).
// Code that needs these should check at runtime (e.g. stellar-auth throws if JWT_SECRET missing when signing).
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  STELLAR_HORIZON_URL: z.string().url("Stellar Horizon URL must be valid").optional(),
  SOROBAN_RPC_URL: z.string().url("Soroban RPC URL must be valid").optional(),
  STELLAR_NETWORK_PASSPHRASE: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url("Upstash Redis URL must be valid").optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Client env: optional so the app can run without Supabase/keys configured.
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Supabase URL must be a valid URL").optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_STELLAR_NETWORK: z.string().default("testnet"),
  NEXT_PUBLIC_FREIGHTER_NETWORK: z.string().default("testnet"),
  NEXT_PUBLIC_STELLAR_HORIZON_URL: z
    .string()
    .url("Public Stellar Horizon URL must be valid")
    .optional(),
  NEXT_PUBLIC_SOROBAN_RPC_URL: z
    .string()
    .url("Public Soroban RPC URL must be valid")
    .optional(),
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: z.string().optional(),
});

const envSchema = serverSchema.merge(clientSchema);

const isServer = typeof window === "undefined";

const getEnvVars = () => {
  // Server-side includes all env vars
  if (isServer) {
    return {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      STELLAR_HORIZON_URL: process.env.STELLAR_HORIZON_URL,
      SOROBAN_RPC_URL: process.env.SOROBAN_RPC_URL,
      STELLAR_NETWORK_PASSPHRASE: process.env.STELLAR_NETWORK_PASSPHRASE,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
      NEXT_PUBLIC_FREIGHTER_NETWORK: process.env.NEXT_PUBLIC_FREIGHTER_NETWORK,
      NEXT_PUBLIC_STELLAR_HORIZON_URL: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL,
      NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
      NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    };
  }

  // Client-side only includes public env vars (prefixed with NEXT_PUBLIC_)
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_FREIGHTER_NETWORK: process.env.NEXT_PUBLIC_FREIGHTER_NETWORK,
    NEXT_PUBLIC_STELLAR_HORIZON_URL: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL,
    NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  };
};

// Parse env vars with appropriate schema based on environment
const parsedEnv = isServer
  ? envSchema.safeParse(getEnvVars())
  : clientSchema.safeParse(getEnvVars());

// Provide helpful error messages in development
if (!parsedEnv.success && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️  Environment variable validation failed. Using fallback values.\n",
    parsedEnv.error?.flatten().fieldErrors
  );
}

// Fallback values for when env vars are missing (helps with builds and development)
const fallback = {
  // Server-side fallbacks
  SUPABASE_SERVICE_ROLE_KEY: "",
  DATABASE_URL: "",
  JWT_SECRET: "",
  NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
  STELLAR_HORIZON_URL: "",
  SOROBAN_RPC_URL: "",
  STELLAR_NETWORK_PASSPHRASE: "",
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
  
  // Client-side fallbacks
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
  NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
  NEXT_PUBLIC_FREIGHTER_NETWORK: "testnet",
  NEXT_PUBLIC_STELLAR_HORIZON_URL: "",
  NEXT_PUBLIC_SOROBAN_RPC_URL: "",
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: "",
};

// Create a type-safe env object
export const env = (() => {
  if (parsedEnv.success) {
    return parsedEnv.data;
  }
  
  // On server, merge server fallbacks with whatever client vars we have
  if (isServer) {
    return {
      ...fallback,
      ...(getEnvVars() as any), // Override fallbacks with actual values if they exist
      NODE_ENV: fallback.NODE_ENV, // Preserve NODE_ENV
    };
  }
  
  // On client, only return client-side vars
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || fallback.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallback.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fallback.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || fallback.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_FREIGHTER_NETWORK: process.env.NEXT_PUBLIC_FREIGHTER_NETWORK || fallback.NEXT_PUBLIC_FREIGHTER_NETWORK,
    NEXT_PUBLIC_STELLAR_HORIZON_URL: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || fallback.NEXT_PUBLIC_STELLAR_HORIZON_URL,
    NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || fallback.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || fallback.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  };
})();

// Type helper for env object
export type Env = typeof env;

// Helper to check if a specific env var is available
export function hasEnvVar(key: keyof typeof env): boolean {
  const value = env[key];
  return value !== undefined && value !== null && value !== "";
}

// Helper to get required env var (throws if missing)
export function getRequiredEnvVar<T extends keyof typeof env>(
  key: T,
  message?: string
): NonNullable<typeof env[T]> {
  const value = env[key];
  if (!hasEnvVar(key)) {
    throw new Error(
      message || `Required environment variable ${String(key)} is missing or empty`
    );
  }
  return value as NonNullable<typeof env[T]>;
}