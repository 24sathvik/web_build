import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "./site";

interface PageMetaInput {
  title: string;
  description: string;
  path: string; // e.g. "/about"
  /** Use the title exactly as given (no site-wide suffix). */
  absoluteTitle?: boolean;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
  robots?: Metadata["robots"];
}

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  publishedTime,
  noindex,
  robots,
}: PageMetaInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const robotsConfig = noindex ? { index: false, follow: false } : robots;
  return {
    title: { absolute: title },
    description,
    ...(robotsConfig ? { robots: robotsConfig } : {}),
    alternates: {
      canonical: url,
      languages: {
        "en-IN": url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
