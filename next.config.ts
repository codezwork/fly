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
    ],
  },
};

export default nextConfig;
