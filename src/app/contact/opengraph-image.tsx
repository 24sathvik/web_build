import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Start a Project with ZYXEN",
    category: "DIRECT INQUIRY",
    description: "Talk to ZYXEN about your website, software or automation project. Speak directly with our engineering team in Hyderabad.",
  });
}

