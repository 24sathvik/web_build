import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "The Discourse | ZYXEN Insights & Architecture",
    category: "THOUGHT LEADERSHIP",
    description: "Technical articles on web performance, batch tracking systems, software architecture, and modern engineering.",
  });
}

