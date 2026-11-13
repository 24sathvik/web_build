import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Engineering & Web Development Services",
    category: "SERVICES",
    description: "Custom software, exam engines, fee systems, and high-performance websites built by ZYXEN.",
  });
}

