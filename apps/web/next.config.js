const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = config.resolve.alias || {};
    // Create an alias for bidi-js to provide a default export wrapper
    config.resolve.alias['bidi-js'] = require.resolve('./node_modules/bidi-js/dist/bidi.js');
    
    // Also add to the externals to ensure proper resolution
    if (!config.externals) config.externals = [];
    config.externals.push({
      'bidi-js': 'bidi-js',
    });
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
