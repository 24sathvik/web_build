import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "About ZYXEN",
    category: "ABOUT US",
    description: "The Hyderabad engineering team building high-performance websites, software and automation for businesses and aviation academies.",
  });
}

