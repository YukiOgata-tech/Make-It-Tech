import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "make-it-tech.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
