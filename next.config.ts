import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright-core",
    "@solarisdk/browser",
    "@solarisdk/sandbox",
    "patchright-core",
    "electron",
    "chromium-bidi"
  ],
};

export default nextConfig;
