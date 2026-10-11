import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/neepank-toolbox",
        destination: "/Neepank-toolbox",
      },
      {
        source: "/toolbox",
        destination: "/Neepank-toolbox",
      },
    ];
  },
};

export default nextConfig;
