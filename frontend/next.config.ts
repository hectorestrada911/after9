import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/demo-flow",
        destination: "/events/campus-lights-fest",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
