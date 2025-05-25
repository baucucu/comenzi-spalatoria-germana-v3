import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spalatoria-germana.ro",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
