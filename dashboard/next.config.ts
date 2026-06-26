import type { NextConfig } from "next";
import path from "path";

const apiProxy = process.env.API_PROXY_URL ?? "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxy}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/visa.svgz",
        headers: [
          { key: "Content-Type", value: "image/svg+xml" },
          { key: "Content-Encoding", value: "gzip" },
        ],
      },
    ];
  },
};

export default nextConfig;
