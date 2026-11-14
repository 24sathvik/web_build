import { generateOgImage, ogContentType, ogSize } from "@/lib/og";
import { solutions } from "@/content/site";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

const solution = solutions.find((s) => s.slug === "admission-management-software")!;

export default function Image() {
  return generateOgImage({
    title: solution.title,
    category: solution.badge.toUpperCase(),
    description: solution.metaDescription,
  });
}
