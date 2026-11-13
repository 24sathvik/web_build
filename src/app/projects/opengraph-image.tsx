import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Selected Systems & Engineering Work",
    category: "PROJECTS",
    description: "Pilot mock exam portals, pharmaceutical quotation systems, laboratory software, and custom business platforms.",
  });
}

