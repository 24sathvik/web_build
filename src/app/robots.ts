import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const explicitlyDisabled = process.env.ALLOW_INDEXING === "false";

  if (explicitlyDisabled) {
    return {
      rules: {
        userAgent: "*",
        disallow: ["/"],
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
