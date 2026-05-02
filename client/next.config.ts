import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const defaultApiUrl = isProd ? 'http://server:8000' : 'http://localhost:8000';
    const destination = process.env.INTERNAL_API_URL || defaultApiUrl;

    return [
      {
        source: '/api/:path*',
        destination: `${destination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
