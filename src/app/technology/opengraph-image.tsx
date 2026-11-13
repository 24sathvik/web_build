import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Technology Stack & Architecture",
    category: "ARCHITECTURE",
    description: "The modern stack ZYXEN uses to build fast, secure and scalable web platforms and business software.",
  });
}

