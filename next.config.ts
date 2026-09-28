import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Performance ────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },

  // ── Experimental optimisations ─────────────────────────────────
  experimental: {
    optimizePackageImports: ["lucide-react", "@google/generative-ai"],
  },

  async headers() {
    return [
      // Security on all routes
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
        ],
      },
      // Long-term cache for Next.js static chunks
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Short cache for API responses (30 s stale-while-revalidate)
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
