import { getSupabaseClient } from "./supabase/client";

export interface ErrorContext {
  userId?: string;
  url?: string;
  severity?: "error" | "warning" | "info" | "critical";
  extras?: Record<string, any>;
}

/**
 * Generates a fingerprint for an error to help with grouping.
 */
function generateFingerprint(error: Error): string {
  const name = error.name || "Error";
  const message = error.message || "Unknown error";
  const stack = error.stack || "";
  
  // Extract first few frames of stack trace for more stability in fingerprinting
  const stackLines = stack.split("\n").slice(0, 3).join("");
  
  // Simple hash function (djb2)
  let hash = 5381;
  const str = `${name}${message}${stackLines}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return hash.toString(16);
}

/**
 * Captures an error and sends it to Supabase for tracking and alerting.
 */
export async function captureError(error: unknown, context: ErrorContext = {}) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const fingerprint = generateFingerprint(errorObj);
  
  const payload = {
    message: errorObj.message,
    stack: errorObj.stack,
    severity: context.severity || "error",
    url: context.url || (typeof window !== "undefined" ? window.location.href : undefined),
    user_id: context.userId,
    context: {
      name: errorObj.name,
      fingerprint,
      ...context.extras,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    },
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Capture Error]", payload);
  }

  try {
    const supabase = getSupabaseClient();
    const { error: insertError } = await supabase.from("errors").insert(payload);
    
    if (insertError) {
      console.error("Failed to persist error to Supabase:", insertError);
    }
  } catch (e) {
    console.error("Critical failure in error capture utility:", e);
  }
}

/**
 * Global error handler for unhandled rejections and window errors.
 */
export function initGlobalErrorCapture() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    captureError(event.error || new Error(event.message), {
      severity: "error",
      extras: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureError(event.reason, {
      severity: "critical",
      extras: {
        type: "unhandledrejection",
      },
    });
  });
}
