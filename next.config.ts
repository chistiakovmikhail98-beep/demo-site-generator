import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Images from Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.userapi.com',
      },
    ],
  },
};

export default nextConfig;
