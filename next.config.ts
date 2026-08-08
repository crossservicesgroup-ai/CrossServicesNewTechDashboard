import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This dashboard is a reference document. Nothing here is indexed, and the
  // whole site sits behind a shared password (see middleware.ts).
  poweredByHeader: false,
};

export default nextConfig;
