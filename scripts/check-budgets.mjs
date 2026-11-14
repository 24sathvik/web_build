import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

console.log("=== RUNNING PERFORMANCE & ASSET BUDGET CHECKS ===\n");
let failure = false;

// 1. Static-tier JS transferred per route <= 250 KB
console.log("1. Checking JS transferred per route (Budget: <= 250 KB)...");
const appDir = path.join(".next", "server", "app");
if (!fs.existsSync(appDir)) {
  console.error("❌ Error: .next/server/app directory not found. Please run 'npm run build' first.");
  process.exit(1);
}

const routes = [];
function findHtml(dir, base = "") {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory()) {
      findHtml(path.join(dir, f.name), base + "/" + f.name);
    } else if (f.name.endsWith(".html") && !f.name.includes("opengraph") && !f.name.endsWith(".meta")) {
      let r = base + "/" + f.name.replace(/\.html$/, "");
      if (r === "/index") r = "/";
      else if (r.endsWith("/index")) r = r.slice(0, -6);
      routes.push({ route: r, file: path.join(dir, f.name) });
    }
  }
}
findHtml(appDir);

let maxKB = 0;
let maxRoute = "";

for (const { route, file } of routes) {
  const html = fs.readFileSync(file, "utf8");
  const scripts = [...new Set([...html.matchAll(/src=["'](\/_next\/static\/[^"']+\.js)["']/g)].map((m) => m[1]))];
  let totalBytes = 0;
  for (const s of scripts) {
    const disk = path.join(".next", s.replace(/^\/_next\//, ""));
    if (fs.existsSync(disk)) {
      const gz = zlib.gzipSync(fs.readFileSync(disk));
      totalBytes += gz.length;
    }
  }
  const kb = totalBytes / 1024;
  if (kb > maxKB) {
    maxKB = kb;
    maxRoute = route;
  }
  if (kb > 250) {
    console.error(`  ❌ BREACH: Route ${route} transferred ${kb.toFixed(2)} KB (budget: 250 KB)`);
    failure = true;
  } else {
    console.log(`  ✓ ${route.padEnd(50)} ${kb.toFixed(2)} KB`);
  }
}
console.log(`\nMax JS transferred: ${maxRoute} (${maxKB.toFixed(2)} KB). Status: ${maxKB <= 250 ? "PASS" : "FAIL"}\n`);

// 2. Images in public/ <= 200 KB
console.log("2. Checking public/ image asset sizes (Budget: <= 200 KB)...");
function findImages(dir) {
  let images = [];
  if (!fs.existsSync(dir)) return images;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      images.push(...findImages(full));
    } else if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(f.name)) {
      const stat = fs.statSync(full);
      images.push({ file: full, size: stat.size });
    }
  }
  return images;
}

const images = findImages("public");
let imageBreaches = 0;
for (const img of images) {
  const kb = img.size / 1024;
  if (img.size > 200 * 1024) {
    console.error(`  ❌ BREACH: Image ${img.file} is ${kb.toFixed(1)} KB (budget: <= 200 KB)`);
    imageBreaches++;
    failure = true;
  }
}

if (imageBreaches === 0) {
  console.log(`  ✓ All ${images.length} images in public/ are <= 200 KB\n`);
} else {
  console.error(`  ❌ ${imageBreaches} image(s) exceeded the 200 KB budget!\n`);
}

// 3. Unused large dependencies
console.log("3. Verifying installed dependencies are actively used...");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const deps = Object.keys(pkg.dependencies || {});

// Verify known essential / installed deps
const srcAndTinaFiles = [];
function collectSourceFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== "node_modules" && f.name !== ".next" && f.name !== ".git") {
        collectSourceFiles(full);
      }
    } else if (/\.(tsx?|jsx?|mjs|cjs|json)$/.test(f.name)) {
      srcAndTinaFiles.push(full);
    }
  }
}
collectSourceFiles("src");
collectSourceFiles("scripts");
collectSourceFiles("tina");

const allCode = srcAndTinaFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

// Packages that might be invoked CLI-only, peer/framework core, or configured via scripts
const coreOrConfigOnly = new Set(["@tinacms/cli", "react-dom"]);

for (const dep of deps) {
  const regex = new RegExp(`['"]${dep}(?:/[^'"]*)?['"]`);
  if (!regex.test(allCode) && !coreOrConfigOnly.has(dep)) {
    console.error(`  ❌ BREACH: Dependency '${dep}' declared in package.json appears unused!`);
    failure = true;
  } else {
    console.log(`  ✓ Dependency '${dep}' is verified in use`);
  }
}

if (failure) {
  console.error("\n❌ BUDGET CHECK FAILED. One or more budgets breached.");
  process.exit(1);
} else {
  console.log("\n✅ ALL BUDGET CHECKS PASSED!");
  process.exit(0);
}
