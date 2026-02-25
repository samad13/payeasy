/**
 * lib/images/optimization.ts
 *
 * Centralised image optimisation utilities for PayEasy.
 *
 * Covers:
 *  - Responsive `sizes` strings for Next.js <Image>
 *  - CDN URL builder (Cloudflare Image Resizing)
 *  - Cache-Control header presets
 *  - Lazy-loading helper props
 *  - Delivery monitoring (Core Web Vitals – LCP tracking)
 *  - WebP / AVIF support detection (client-side)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ImageFormat = "webp" | "avif" | "jpeg" | "png";

export type ImageFit = "cover" | "contain" | "fill" | "crop" | "pad";

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 80
  format?: ImageFormat;
  fit?: ImageFit;
}

export interface ResponsiveImageProps {
  src: string;
  sizes: string;
  width: number;
  height: number;
  loading: "lazy" | "eager";
  decoding: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
}

export interface CachePreset {
  "Cache-Control": string;
  "CDN-Cache-Control"?: string;
  "Cloudflare-CDN-Cache-Control"?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Cloudflare CDN base URL — set CF_CDN_BASE_URL in your environment. */
const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_BASE_URL ??
  process.env.CF_CDN_BASE_URL ??
  "";

/** Default quality for compressed images. */
export const DEFAULT_QUALITY = 80;

/** Standard breakpoints used by the responsive image helpers. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// ── CDN URL builder ───────────────────────────────────────────────────────────

/**
 * Build a Cloudflare Image Resizing URL.
 *
 * If no CDN base URL is configured the original `src` is returned unchanged,
 * so this function is safe to call in all environments.
 *
 * @example
 * buildCdnUrl("https://cdn.example.com/img.jpg", { width: 800, format: "webp" })
 * // → "https://cdn.example.com/cdn-cgi/image/w=800,f=webp/img.jpg"
 */
export function buildCdnUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!CDN_BASE_URL || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  const {
    width,
    height,
    quality = DEFAULT_QUALITY,
    format = "webp",
    fit = "cover",
  } = options;

  const params: string[] = [`q=${quality}`, `f=${format}`, `fit=${fit}`];
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);

  // Cloudflare Image Resizing path format:
  // /cdn-cgi/image/<options>/<original-url-or-path>
  const paramStr = params.join(",");

  // If src is a full URL, strip origin for the CF path
  const imagePath = src.startsWith("http")
    ? src
    : `${CDN_BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;

  return `${CDN_BASE_URL}/cdn-cgi/image/${paramStr}/${imagePath}`;
}

// ── Responsive sizes strings ──────────────────────────────────────────────────

/**
 * Pre-built `sizes` attribute strings for common layout patterns.
 * Pass the result directly to Next.js <Image sizes={...}>.
 */
export const imageSizes = {
  /** Full-width hero images */
  hero: "100vw",

  /** Standard listing card thumbnail (3 cols on lg, 2 on md, 1 on sm) */
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",

  /** Avatar / profile picture */
  avatar: "(max-width: 640px) 48px, 64px",

  /** Gallery image (up to 4 per row on desktop) */
  gallery: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",

  /** Sidebar thumbnail */
  thumbnail: "120px",

  /** Full-width on mobile, 50% on tablet, 33% on desktop */
  responsive: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
} as const;

// ── Lazy-loading helpers ──────────────────────────────────────────────────────

/**
 * Returns the recommended Next.js <Image> props for a given usage context.
 *
 * - Above-the-fold images (hero, first card) should use `priority = true`
 *   which sets `loading="eager"` and adds a `<link rel="preload">`.
 * - All other images default to lazy loading.
 */
export function getImageProps(
  src: string,
  width: number,
  height: number,
  options: {
    priority?: boolean;
    sizesKey?: keyof typeof imageSizes;
    customSizes?: string;
  } = {}
): ResponsiveImageProps {
  const { priority = false, sizesKey = "responsive", customSizes } = options;

  return {
    src,
    width,
    height,
    sizes: customSizes ?? imageSizes[sizesKey],
    loading: priority ? "eager" : "lazy",
    decoding: "async",
    ...(priority && { fetchPriority: "high" }),
  };
}

// ── Cache-Control presets ─────────────────────────────────────────────────────

/**
 * Ready-made Cache-Control header objects.
 *
 * Use in Next.js Route Handlers or middleware:
 * @example
 * return new Response(imageBuffer, {
 *   headers: { ...cachePresets.immutable, "Content-Type": "image/webp" },
 * });
 */
export const cachePresets: Record<string, CachePreset> = {
  /**
   * Immutable assets — hashed filenames, cached for 1 year.
   * Best for build-time optimised images stored in the CDN.
   */
  immutable: {
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000, immutable",
    "Cloudflare-CDN-Cache-Control": "public, max-age=31536000, immutable",
  },

  /**
   * User-uploaded images — revalidate every 7 days, allow stale for 1 day.
   */
  userContent: {
    "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
    "CDN-Cache-Control": "public, max-age=604800",
    "Cloudflare-CDN-Cache-Control": "public, max-age=604800",
  },

  /**
   * Dynamic images — short cache, always revalidate.
   */
  dynamic: {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    "CDN-Cache-Control": "public, max-age=60",
  },

  /**
   * No caching — for sensitive or personalised images.
   */
  noCache: {
    "Cache-Control": "no-store",
  },
};

// ── Format detection (client-side only) ──────────────────────────────────────

/**
 * Detect whether the current browser supports a given image format.
 * Returns a Promise so it can be used in useEffect / server actions.
 *
 * @example
 * const supportsWebP = await supportsFormat("webp");
 */
export async function supportsFormat(format: "webp" | "avif"): Promise<boolean> {
  if (typeof window === "undefined") return true; // assume support on server

  return new Promise((resolve) => {
    const img = document.createElement("img");
    const testSrc: Record<string, string> = {
      webp: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
      avif: "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQ==",
    };
    img.onload = () => resolve(img.width > 0);
    img.onerror = () => resolve(false);
    img.src = testSrc[format];
  });
}

// ── Delivery monitoring ───────────────────────────────────────────────────────

export interface ImageDeliveryMetric {
  src: string;
  lcp: boolean; // was this the LCP element?
  loadTimeMs: number;
  fromCache: boolean;
  format: string;
  width: number;
  height: number;
}

/**
 * Observe the Largest Contentful Paint element and report whether it is an
 * image, along with its load time.  Call this once in your root layout or
 * analytics provider.
 *
 * Results are sent to `console.debug` by default — swap the `onReport`
 * callback for your analytics endpoint (e.g. Datadog, Vercel Analytics).
 */
export function observeImageDelivery(
  onReport: (metric: ImageDeliveryMetric) => void = (m) => console.debug("[img]", m)
): () => void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return () => {};
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const lcp = entry as PerformanceEntry & {
        element?: Element;
        loadTime?: number;
        url?: string;
        id?: string;
      };

      if (lcp.element instanceof HTMLImageElement) {
        const img = lcp.element;
        const navEntry = performance.getEntriesByType("resource").find(
          (r) => (r as PerformanceResourceTiming).name === img.currentSrc
        ) as PerformanceResourceTiming | undefined;

        onReport({
          src: img.currentSrc,
          lcp: true,
          loadTimeMs: navEntry ? navEntry.duration : 0,
          fromCache:
            navEntry
              ? navEntry.transferSize === 0
              : false,
          format: img.currentSrc.split(".").pop() ?? "unknown",
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      }
    }
  });

  try {
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // LCP not supported in this browser
  }

  return () => observer.disconnect();
}

// ── Utility: blur placeholder ─────────────────────────────────────────────────

/**
 * Generate a tiny base64 blur placeholder for use with Next.js
 * `placeholder="blur"` + `blurDataURL`.
 *
 * This is a 1×1 pixel transparent PNG — replace with a real low-res
 * placeholder generated at upload time via Sharp for best results.
 */
export const DEFAULT_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
