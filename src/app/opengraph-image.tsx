import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Digital Solutions & Creative Agency",
    category: "ENGINEERING & DESIGN",
    description: "High-performance web platforms, aviation academy mock exam portals, and custom business automation systems.",
  });
}

