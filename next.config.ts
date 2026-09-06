import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/contracts/c/*/accept": ["./node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff"],
    "/api/admin/contracts/templates/*": ["./assets/contracts/templates/*.docx"],
    "/api/admin/contracts/templates/*/generate": ["./assets/contracts/templates/*.docx"],
  },
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/services",
        permanent: true,
      },
    ];
  },
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
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "d-mise.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
