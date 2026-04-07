import type { NextConfig } from "next";

const apiUrl = process.env.API_INTERNAL_URL || "http://external-projects_dermahub-api:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: ".",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
