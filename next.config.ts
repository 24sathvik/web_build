import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      // Decap CMS (kept identical to the live site)
      { source: "/config.yml", destination: "/admin/config.yml" },
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
};

export default nextConfig;
