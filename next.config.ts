import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"], // don't include this with next.js bundle
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.vecteezy.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
}

export default nextConfig
