import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendTarget = process.env.NODE_ENV === 'production'
      ? 'http://ai-resume-analyzer-backend:10000'
      : 'http://127.0.0.1:8000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
