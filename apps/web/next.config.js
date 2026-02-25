const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize package imports to enable tree-shaking for barrel files
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-slider",
      "react-select",
      "@supabase/supabase-js",
    ],
  },

  // ── Image optimisation ──────────────────────────────────────────────────────
  images: {
    // Serve AVIF first (smallest), fall back to WebP, then original format.
    formats: ["image/avif", "image/webp"],

    // Device widths used to generate the responsive srcset.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image widths used for layout="fixed" or explicit width props.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Serve optimised images for up to 60 days before revalidating.
    minimumCacheTTL: 60 * 60 * 24 * 60, // 60 days in seconds

    // Dangerous SVGs are blocked by default — keep that on.
    dangerouslyAllowSVG: false,

    // Allowed remote image sources
    remotePatterns: [
      // Supabase Storage (user-uploaded listing images, avatars, etc.)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Cloudflare CDN origin (set CF_CDN_HOSTNAME in your environment)
      ...(process.env.CF_CDN_HOSTNAME
        ? [
            {
              protocol: "https",
              hostname: process.env.CF_CDN_HOSTNAME,
            },
          ]
        : []),
      // Development / seeded placeholder images
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // ── HTTP headers ────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply aggressive caching to Next.js static assets (hashed filenames)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache optimised image responses for 7 days, allow stale for 1 day
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
          // Tell Cloudflare to cache at the edge for 7 days
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=604800",
          },
        ],
      },
      {
        // Public folder assets (icons, og images, etc.)
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },

  // Minimize output by excluding source maps in production
  productionBrowserSourceMaps: false,

  // Allow more time for static page generation (default 60s)
  staticPageGenerationTimeout: 120,

  webpack(config, { isServer }) {
    // Tree-shake mapbox-gl CSS import on the server
    if (isServer) {
      config.resolve.alias["mapbox-gl/dist/mapbox-gl.css"] = false;
    }
    // bidi-js: @react-pdf/textkit expects default export; ESM resolution breaks
    config.resolve.alias["bidi-js"] = require.resolve("bidi-js/dist/bidi.js");
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
