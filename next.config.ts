import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@libsql/client",
    "@libsql/kysely-libsql",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@libsql/client$": "@libsql/client/web",
    };

    return config;
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) =>
  m.initOpenNextCloudflareForDev(),
);