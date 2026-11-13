import type { MetadataRoute } from "next";
import { getAllPosts, safeImageSrc } from "@/lib/blog";
import { SITE_URL, STATIC_LAST_MODIFIED } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(STATIC_LAST_MODIFIED);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/aviation-academy-software`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/technology`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blogs`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/privacy-policy`, lastModified, changeFrequency: "monthly", priority: 0.4 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => {
    const rawDate = post.updatedDate || post.date;
    const parsedDate = new Date(rawDate);
    const postModified = isNaN(parsedDate.getTime()) ? lastModified : parsedDate;
    const coverUrl = post.image.startsWith("http")
      ? post.image
      : `${SITE_URL}${safeImageSrc(post.image)}`;

    return {
      url: `${SITE_URL}/blogs/${post.slug}`,
      lastModified: postModified,
      changeFrequency: "monthly",
      priority: 0.6,
      images: [coverUrl],
    };
  });

  return [...staticRoutes, ...blogRoutes];
}
