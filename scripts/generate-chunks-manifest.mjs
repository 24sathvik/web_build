import fs from "node:fs";
import path from "node:path";

const ROUTE_MAP = {
  "/": "page",
  "/about": "about/page",
  "/aviation-academy-software": "aviation-academy-software/page",
  "/blogs": "blogs/page",
  "/contact": "contact/page",
  "/projects": "projects/page",
  "/services": "services/page",
  "/technology": "technology/page",
};

const result = {};

for (const [route, subfolder] of Object.entries(ROUTE_MAP)) {
  const manifestPath = path.join(process.cwd(), ".next/server/app", subfolder, "react-loadable-manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const files = [];
      Object.values(data).forEach((entry) => {
        if (Array.isArray(entry.files)) files.push(...entry.files);
      });
      result[route] = Array.from(new Set(files));
    } catch {
      result[route] = [];
    }
  } else {
    result[route] = [];
  }
}

const outDir = path.join(process.cwd(), "public");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, "chunks-manifest.json"), JSON.stringify(result, null, 2));
console.log("Successfully generated public/chunks-manifest.json");

