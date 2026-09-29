import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Self contained server for the VPS (node .next/standalone/server.js), see README.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // No Next badge in dev, so dev screenshots match the reference.
  devIndicators: false,
  // Do not generate AGENTS.md / CLAUDE.md files into the repo.
  agentRules: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // The carried over sass-app.html links back to index.html.
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
