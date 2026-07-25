import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
      ? (process.env.NEXT_PUBLIC_API_URL.startsWith('http')
          ? process.env.NEXT_PUBLIC_API_URL
          : `https://${process.env.NEXT_PUBLIC_API_URL}`)
      : 'http://127.0.0.1:8000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
