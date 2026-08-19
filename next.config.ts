import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"], // don't include this with next.js bundle
  /* config options here */
  images: {
    // UserAvatar renders at quality 100; unlisted qualities are rejected.
    qualities: [75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "static.vecteezy.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" }, // seeded demo avatars
    ],
  },
}

export default nextConfig
