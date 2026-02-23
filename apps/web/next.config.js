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

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
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
