import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.etsystatic.com',
      },
      {
        protocol: 'https',
        hostname: 'genzprints.in',
      },
      {
        protocol: 'https',
        hostname: 'blvck.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      // IMPORTANT: Add your custom R2 domain here if you have one linked (e.g. assets.fly-store.com)
    ],
  },
};

export default nextConfig;
