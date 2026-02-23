import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client to bypass RLS for security logging
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export enum AuthEventType {
    LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILURE = "LOGIN_FAILURE",
    LOGOUT = "LOGOUT",
    CHALLENGE_GENERATED = "CHALLENGE_GENERATED",
}

export interface AuthEventPayload {
    publicKey?: string;
    eventType: AuthEventType;
    status: "SUCCESS" | "FAILURE";
    failureReason?: string;
    metadata?: Record<string, any>;
}

/**
 * Centrally log authentication events and perform real-time threat detection.
 */
export async function logAuthEvent(payload: AuthEventPayload, request?: Request): Promise<void> {
    try {
        let ipAddress = "unknown";
        let userAgent = "unknown";

        if (request) {
            ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                request.headers.get("x-real-ip") ||
                "unknown";
            userAgent = request.headers.get("user-agent") || "unknown";
        } else {
            // Fallback for Next.js Server Components/Actions if request is not passed
            try {
                const headerList = await headers();
                ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] ||
                    headerList.get("x-real-ip") ||
                    "unknown";
                userAgent = headerList.get("user-agent") || "unknown";
            } catch (e) {
                // headers() might not be available in all contexts
            }
        }

        // 1. Insert the event
        const { error: insertError } = await supabaseAdmin.from("auth_events").insert({
            public_key: payload.publicKey,
            event_type: payload.eventType,
            status: payload.status,
            failure_reason: payload.failureReason,
            ip_address: ipAddress,
            user_agent: userAgent,
            metadata: payload.metadata || {},
        });

        if (insertError) {
            console.error("Failed to log auth event:", insertError);
            return;
        }

        // 2. Perform Threat Detection
        if (payload.status === "FAILURE") {
            await detectBruteForce(payload.publicKey, ipAddress);
        }

        if (payload.eventType === AuthEventType.LOGIN_SUCCESS && payload.publicKey) {
            await detectUnusualPatterns(payload.publicKey, ipAddress, userAgent);
        }

    } catch (err) {
        console.error("Unexpected error in logAuthEvent:", err);
    }
}

/**
 * Detects brute force attempts by checking failure rates.
 */
async function detectBruteForce(publicKey?: string, ipAddress?: string): Promise<void> {
    const windowMinutes = 10;
    const threshold = 5;
    const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    // Check by Public Key
    if (publicKey) {
        const { count, error } = await supabaseAdmin
            .from("auth_events")
            .select("*", { count: "exact", head: true })
            .eq("public_key", publicKey)
            .eq("status", "FAILURE")
            .gte("created_at", since);

        if (!error && count && count >= threshold) {
            await createAlert({
                publicKey,
                alertType: "BRUTE_FORCE",
                severity: "HIGH",
                description: `Multiple failed login attempts (${count}) for public key in ${windowMinutes} mins.`,
                metadata: { count, windowMinutes, ipAddress },
            });
        }
    }

    // Check by IP Address
    if (ipAddress && ipAddress !== "unknown") {
        const { count, error } = await supabaseAdmin
            .from("auth_events")
            .select("*", { count: "exact", head: true })
            .eq("ip_address", ipAddress)
            .eq("status", "FAILURE")
            .gte("created_at", since);

        if (!error && count && count >= threshold) {
            await createAlert({
                alertType: "BRUTE_FORCE",
                severity: "HIGH",
                description: `Multiple failed login attempts (${count}) from IP ${ipAddress} in ${windowMinutes} mins.`,
                metadata: { count, windowMinutes, publicKey },
            });
        }
    }
}

/**
 * Detects unusual login patterns like new devices or IPs.
 */
async function detectUnusualPatterns(publicKey: string, ipAddress: string, userAgent: string): Promise<void> {
    // Check if this is a new device (User Agent)
    const { data: previousDevices, error: deviceError } = await supabaseAdmin
        .from("auth_events")
        .select("user_agent")
        .eq("public_key", publicKey)
        .eq("event_type", AuthEventType.LOGIN_SUCCESS)
        .neq("user_agent", userAgent)
        .limit(1);

    if (!deviceError && previousDevices && previousDevices.length > 0) {
        // This means the user has logged in before, let's see if they've used THIS device before
        const { count: seenThisDevice, error: seenError } = await supabaseAdmin
            .from("auth_events")
            .select("*", { count: "exact", head: true })
            .eq("public_key", publicKey)
            .eq("event_type", AuthEventType.LOGIN_SUCCESS)
            .eq("user_agent", userAgent)
            .lt("created_at", new Date().toISOString()); // exclude current event? actually it's already inserted. 
        // So we check for count > 1

        if (!seenError && seenThisDevice && seenThisDevice === 1) {
            await createAlert({
                publicKey,
                alertType: "NEW_DEVICE",
                severity: "LOW",
                description: `Login from a new device/browser for user ${publicKey.slice(0, 8)}...`,
                metadata: { userAgent, ipAddress },
            });
        }
    }

    // Check for "Impossible Travel" (simplified: just check for new IP from different subnet or just new IP)
    const { data: lastLogin, error: lastLoginError } = await supabaseAdmin
        .from("auth_events")
        .select("ip_address, created_at")
        .eq("public_key", publicKey)
        .eq("event_type", AuthEventType.LOGIN_SUCCESS)
        .neq("ip_address", ipAddress)
        .order("created_at", { ascending: false })
        .limit(1);

    if (!lastLoginError && lastLogin && lastLogin.length > 0) {
        const prevIp = lastLogin[0].ip_address;
        const prevTime = new Date(lastLogin[0].created_at).getTime();
        const currTime = Date.now();

        // If IP changed and it's within a very short time (e.g. 1 hour)
        if (prevIp !== ipAddress && (currTime - prevTime) < 3600000) {
            await createAlert({
                publicKey,
                alertType: "SUSPICIOUS_IP",
                severity: "MEDIUM",
                description: `Login from new IP ${ipAddress} shortly after login from ${prevIp}.`,
                metadata: { prevIp, currentIp: ipAddress, timeDifferenceMs: currTime - prevTime },
            });
        }
    }
}

interface AlertPayload {
    publicKey?: string;
    alertType: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    metadata?: Record<string, any>;
}

async function createAlert(payload: AlertPayload): Promise<void> {
    const { error } = await supabaseAdmin.from("security_alerts").insert({
        public_key: payload.publicKey,
        alert_type: payload.alertType,
        severity: payload.severity,
        description: payload.description,
        metadata: payload.metadata || {},
    });

    if (error) {
        console.error("Failed to create security alert:", error);
    }
}
