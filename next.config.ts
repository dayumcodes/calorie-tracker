import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  distDir: 'out',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Matches any domain over HTTPS
        pathname: '/**', // Matches all paths
      },
    ],
  },
  // Handle special routes
  async rewrites() {
    return [];
  },
  // Set strict mode to false to avoid double rendering in development
  reactStrictMode: false,
};

export default nextConfig;
