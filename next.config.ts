import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Plain static files in out/, served by Cloudflare Workers static assets (see wrangler.jsonc).
  output: 'export',
  trailingSlash: true,
  // Static export has no image server; photos are pre-sized JPEGs (max 1800 px) served as they are.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
