import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Aviation Academy Software & Mock Exam Portals",
    category: "AVIATION SYSTEMS",
    description: "Pilot mock exam engine configured for DGCA, FAA and EASA syllabi, fee management, and aviation academy ERP.",
  });
}

