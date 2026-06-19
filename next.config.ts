import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"], // don't include this with next.js bundle
  /* config options here */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "static.vecteezy.com" }],
  },
}

export default nextConfig
