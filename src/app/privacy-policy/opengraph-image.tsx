import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Privacy Policy | ZYXEN",
    category: "LEGAL & PRIVACY",
    description: "How ZYXEN collects, delivers, stores, and handles inquiry data submitted through our website.",
  });
}

