import type { NextConfig } from "next";

const allowIndexing = process.env.ALLOW_INDEXING === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      { source: "/admin", destination: "/admin/index.html" },
    ];
  },
  async redirects() {
    return [
      // Alternate / older URLs seen in SEO notes -> live canonical slugs
      {
        source: "/blogs/website-development-cost-in-india-2026-guide",
        destination: "/blogs/website-development-cost-india-2026",
        permanent: true,
      },
      {
        source: "/blogs/5-signs-your-business-website-is-losing-you-customers",
        destination: "/blogs/signs-website-losing-customers",
        permanent: true,
      },
    ];
  },
  async headers() {
    const headersList: {
      source: string;
      headers: { key: string; value: string }[];
    }[] = [
      // Global security headers for all routes
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Non-admin pages get X-Frame-Options: SAMEORIGIN
      {
        source: "/((?!admin(?:/|$)).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      // Long immutable cache for hashed static assets
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];

    if (!allowIndexing) {
      // When ALLOW_INDEXING !== "true", send noindex on all routes
      headersList.push({
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      });
    } else {
      // When ALLOW_INDEXING === "true", always send noindex on /admin and /admin/*
      headersList.push({
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      });
      headersList.push({
        source: "/admin",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      });
    }

    return headersList;
  },
};

export default nextConfig;
