#!/usr/bin/env node

import { chromium } from "playwright";
import { spawn, execSync } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";

const CURRENT_PORT = 3000;
const C307FCF_PORT = 3001;

const CURRENT_URL = `http://127.0.0.1:${CURRENT_PORT}`;
const C307FCF_URL = `http://127.0.0.1:${C307FCF_PORT}`;

const OUTPUT_DIR = path.resolve(process.cwd(), "screenshots", "phase9b_comparison");

async function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, () => resolve(true));
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerRunning(url)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function killProcessTree(pid) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGKILL");
    }
  } catch {}
}

const PAGES_TO_CAPTURE = [
  {
    path: "/",
    scrollerId: "scroll-container",
    snapshots: [
      { name: "home_ch1", scrollPercent: 0.0, label: "Home — Chapter 1" },
      { name: "home_ch2", scrollPercent: 0.25, label: "Home — Chapter 2" },
      { name: "home_ch3", scrollPercent: 0.50, label: "Home — Chapter 3" },
      { name: "home_ch4", scrollPercent: 0.75, label: "Home — Chapter 4" },
      { name: "home_ch5", scrollPercent: 1.00, label: "Home — Chapter 5" },
    ],
  },
  {
    path: "/about",
    scrollerId: "scroll-container-about",
    snapshots: [
      { name: "about_top", scrollPercent: 0.0, label: "About — Top" },
      { name: "about_mid", scrollPercent: 0.50, label: "About — Mid Scroll" },
    ],
  },
  {
    path: "/services",
    scrollerId: "scroll-container-services",
    snapshots: [
      { name: "services_top", scrollPercent: 0.0, label: "Services — Top" },
      { name: "services_mid", scrollPercent: 0.50, label: "Services — Mid Scroll" },
    ],
  },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

async function captureSite(browser, baseUrl, siteKey) {
  console.log(`\n=== Capturing screenshots for: ${siteKey} (${baseUrl}) ===`);
  const capturedFiles = {};

  for (const vp of VIEWPORTS) {
    const dir = path.join(OUTPUT_DIR, vp.name);
    fs.mkdirSync(dir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    for (const pageConfig of PAGES_TO_CAPTURE) {
      const fullUrl = `${baseUrl}${pageConfig.path}`;
      console.log(`  Navigating to [${vp.name}] ${fullUrl}...`);
      await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

      // Wait 2.5s for 3D shaders, textures and WebGL frame loop to stabilize
      await page.waitForTimeout(2500);

      for (const snap of pageConfig.snapshots) {
        console.log(`    Capturing ${snap.label}...`);
        if (snap.scrollPercent > 0) {
          await page.evaluate(({ scrollerId, scrollPercent }) => {
            const el = document.getElementById(scrollerId) || document.documentElement || document.body;
            const maxScroll = el.scrollHeight - el.clientHeight;
            el.scrollTop = maxScroll * scrollPercent;
          }, { scrollerId: pageConfig.scrollerId, scrollPercent: snap.scrollPercent });

          // Wait for GSAP scrub to complete
          await page.waitForTimeout(1000);
        } else {
          // Ensure at top
          await page.evaluate(({ scrollerId }) => {
            const el = document.getElementById(scrollerId) || document.documentElement || document.body;
            el.scrollTop = 0;
          }, { scrollerId: pageConfig.scrollerId });
          await page.waitForTimeout(500);
        }

        const filename = `${snap.name}_${siteKey}.png`;
        const filePath = path.join(dir, filename);
        await page.screenshot({ path: filePath, fullPage: false });

        const key = `${vp.name}_${snap.name}`;
        capturedFiles[key] = filePath;
      }
    }

    await context.close();
  }

  return capturedFiles;
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("=== PHASE 9b: VISUAL REGRESSION & SIDE-BY-SIDE SCREENSHOTS ===");

  // 1. Start Current server on port 3000
  let currentProc = null;
  if (!(await isServerRunning(CURRENT_URL))) {
    console.log(`Starting Current server on port ${CURRENT_PORT}...`);
    currentProc = spawn("npx", ["next", "start", "-p", String(CURRENT_PORT)], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
    });
    const ok = await waitForServer(CURRENT_URL);
    if (!ok) throw new Error(`Current server failed to start on ${CURRENT_URL}`);
  } else {
    console.log(`Current server already running on ${CURRENT_URL}`);
  }

  // 2. Start c307fcf server on port 3001
  let c307fcfProc = null;
  const c307fcfDir = path.resolve(process.cwd(), "..", "c307fcf-build");
  if (!(await isServerRunning(C307FCF_URL))) {
    console.log(`Starting c307fcf server on port ${C307FCF_PORT}...`);
    c307fcfProc = spawn("npx", ["next", "start", "-p", String(C307FCF_PORT)], {
      cwd: c307fcfDir,
      stdio: "inherit",
      shell: true,
    });
    const ok = await waitForServer(C307FCF_URL);
    if (!ok) throw new Error(`c307fcf server failed to start on ${C307FCF_URL}`);
  } else {
    console.log(`c307fcf server already running on ${C307FCF_URL}`);
  }

  const browser = await chromium.launch({
    args: [
      "--enable-gpu",
      "--use-gl=angle",
      "--use-angle=d3d11",
      "--ignore-gpu-blocklist",
    ],
  });

  try {
    const c307fcfFiles = await captureSite(browser, C307FCF_URL, "c307fcf");
    const currentFiles = await captureSite(browser, CURRENT_URL, "current");

    // Generate Side-by-Side Comparison HTML Gallery
    console.log("\nGenerating HTML comparison viewer...");
    let galleryHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ZYXEN 3D Background Comparison: c307fcf vs Current</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0d14; color: #fff; margin: 0; padding: 24px; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #00D9FF; }
    p.sub { font-size: 14px; color: #8892b0; margin-bottom: 24px; }
    .section-title { font-size: 18px; margin: 32px 0 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; color: #6E5BFF; }
    .card { background: #161926; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08); }
    .card h3 { margin: 0 0 12px; font-size: 16px; }
    .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .pane { display: flex; flex-direction: column; }
    .pane-label { font-size: 12px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.1em; color: #00FFB2; }
    .pane img { width: 100%; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: #050505; }
  </style>
</head>
<body>
  <h1>ZYXEN Visual Regression: c307fcf vs Restored Current</h1>
  <p class="sub">Comparing 3D backgrounds of Home (Ch 1-5), About, and Services at 1440x900 and 390x844 viewports.</p>
`;

    const savedPaths = [];

    for (const vp of VIEWPORTS) {
      galleryHtml += `<div class="section-title">Viewport: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})</div>\n`;

      for (const pageConfig of PAGES_TO_CAPTURE) {
        for (const snap of pageConfig.snapshots) {
          const key = `${vp.name}_${snap.name}`;
          const c307Path = c307fcfFiles[key];
          const curPath = currentFiles[key];

          savedPaths.push({
            viewport: vp.name,
            scenario: snap.label,
            c307fcf: c307Path,
            current: curPath,
          });

          const relC307 = path.relative(OUTPUT_DIR, c307Path).replace(/\\/g, "/");
          const relCur = path.relative(OUTPUT_DIR, curPath).replace(/\\/g, "/");

          galleryHtml += `
  <div class="card">
    <h3>${snap.label} (${vp.name} — ${vp.width}x${vp.height})</h3>
    <div class="comparison-grid">
      <div class="pane">
        <div class="pane-label">Original c307fcf (Reference)</div>
        <img src="${relC307}" alt="${snap.label} c307fcf" />
      </div>
      <div class="pane">
        <div class="pane-label">Current (Restored)</div>
        <img src="${relCur}" alt="${snap.label} current" />
      </div>
    </div>
  </div>`;
        }
      }
    }

    galleryHtml += `</body></html>`;
    const galleryPath = path.join(OUTPUT_DIR, "index.html");
    fs.writeFileSync(galleryPath, galleryHtml, "utf8");
    console.log(`\nComparison gallery generated at: ${galleryPath}`);

    console.log("\n=== CAPTURED SCREENSHOT PAIRS ===");
    savedPaths.forEach((p) => {
      console.log(`- [${p.viewport}] ${p.scenario}:`);
      console.log(`    c307fcf: ${p.c307fcf}`);
      console.log(`    current: ${p.current}`);
    });

  } finally {
    await browser.close();
    if (currentProc) {
      console.log("Stopping Current server...");
      killProcessTree(currentProc.pid);
    }
    if (c307fcfProc) {
      console.log("Stopping c307fcf server...");
      killProcessTree(c307fcfProc.pid);
    }
  }

  console.log("\n✅ All screenshots captured and comparison viewer generated successfully.");
}

run().catch((err) => {
  console.error("Fatal error during screenshot comparison:", err);
  process.exit(1);
});
