import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    let backendTarget = 'http://127.0.0.1:8000';
    if (process.env.NEXT_PUBLIC_API_URL) {
      let url = process.env.NEXT_PUBLIC_API_URL.trim();
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      backendTarget = url.replace(/\/$/, '');
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
