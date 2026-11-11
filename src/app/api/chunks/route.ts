import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Mapping of route path to manifest subfolder
const ROUTE_MAP: Record<string, string> = {
  "/": "page",
  "/about": "about/page",
  "/aviation-academy-software": "aviation-academy-software/page",
  "/blogs": "blogs/page",
  "/contact": "contact/page",
  "/projects": "projects/page",
  "/services": "services/page",
  "/technology": "technology/page",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const route = searchParams.get("route") || "/";
  const subfolder = ROUTE_MAP[route] || "page";

  try {
    const manifestPath = path.join(
      process.cwd(),
      ".next/server/app",
      subfolder,
      "react-loadable-manifest.json"
    );

    if (fs.existsSync(manifestPath)) {
      const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const files: string[] = [];
      Object.values(data).forEach((entry: any) => {
        if (Array.isArray(entry.files)) {
          files.push(...entry.files);
        }
      });
      return NextResponse.json(
        { files: Array.from(new Set(files)) },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    }
  } catch {}

  return NextResponse.json({ files: [] });
}
