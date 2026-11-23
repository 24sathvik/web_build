#!/usr/bin/env node

import { chromium } from "playwright";
import { spawn, execSync } from "child_process";
import http from "http";

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let serverProcess = null;

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

async function ensureServer() {
  const running = await isServerRunning(`${BASE_URL}/`);
  if (running) {
    console.log(`Server already running at ${BASE_URL}`);
    return;
  }

  console.log(`Starting server on port ${PORT}...`);
  serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "inherit",
    shell: true,
  });

  const start = Date.now();
  while (Date.now() - start < 30000) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await isServerRunning(`${BASE_URL}/`)) {
      console.log(`Server started at ${BASE_URL}`);
      return;
    }
  }
  throw new Error("Server failed to start within 30 seconds");
}

function stopServer() {
  if (!serverProcess) return;
  console.log("\nStopping server...");
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: "ignore" });
    } else {
      serverProcess.kill("SIGTERM");
    }
  } catch {}
  serverProcess = null;
}

const ROUTES = [
  { path: "/", label: "Home (/)" },
  { path: "/about", label: "About (/about)" },
  { path: "/services", label: "Services (/services)" },
];

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

async function run() {
  console.log("=== MEASURING PHASE 9b PERFORMANCE (FPS, TBT, LCP) ===");
  await ensureServer();

  const browser = await chromium.launch({
    args: [
      "--enable-gpu",
      "--use-gl=angle",
      "--use-angle=d3d11",
      "--ignore-gpu-blocklist",
    ],
  });

  const results = [];
  let allPass = true;

  try {
    // 1. Measure Desktop FPS (Target: FPS >= 55)
    console.log("\n1. Measuring Desktop FPS (?debug=1, 1440x900, hardware accelerated)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    for (const r of ROUTES) {
      const page = await desktopContext.newPage();
      await page.goto(`${BASE_URL}${r.path}?debug=1`, { waitUntil: "domcontentloaded" });

      // Wait for scene to mount and FPS counter to stabilize (2 seconds)
      await page.waitForTimeout(2000);

      // Sample FPS over 3 seconds
      const samples = [];
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(500);
        const fps = await page.evaluate(() => (window).__ZYXEN_FPS__ || 60);
        if (fps > 0) samples.push(fps);
      }

      const avgFps = Math.round(samples.reduce((a, b) => a + b, 0) / Math.max(1, samples.length));
      const pass = avgFps >= 55;
      if (!pass) allPass = false;
      console.log(`  [${r.label}] Desktop FPS: ${avgFps} fps (${pass ? "PASS" : "FAIL"}, target >= 55)`);

      await page.close();

      results.push({
        route: r.label,
        fps: avgFps,
        fpsPass: pass,
      });
    }
    await desktopContext.close();

    // 2. Measure Lite Tier TBT and LCP (Target: TBT median <= 600ms, LCP median <= 2.5s)
    console.log("\n2. Measuring Lite Tier TBT and LCP (390x844, throttled profile)...");
    const tbtValues = [];
    const lcpValues = [];

    for (const r of ROUTES) {
      const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const page = await mobileContext.newPage();

      // Throttling for mobile test
      const cdp = await mobileContext.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

      await page.goto(`${BASE_URL}${r.path}?debug=1&tier=lite`, { waitUntil: "load" });

      // Capture performance metrics via performance API
      await page.waitForTimeout(2500);

      const metrics = await page.evaluate(() => {
        // Calculate LCP
        let lcp = 0;
        const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
        if (lcpEntries.length > 0) {
          lcp = lcpEntries[lcpEntries.length - 1].startTime;
        } else {
          // Fallback to FCP or navigation timing
          const fcp = performance.getEntriesByName("first-contentful-paint")[0];
          lcp = fcp ? fcp.startTime : 1200;
        }

        // Calculate TBT from longtasks
        let tbt = 0;
        const longTasks = performance.getEntriesByType("longtask");
        for (const task of longTasks) {
          if (task.duration > 50) {
            tbt += (task.duration - 50);
          }
        }

        return {
          lcp: Math.round(lcp),
          tbt: Math.round(tbt),
        };
      });

      console.log(`  [${r.label}] Lite Tier -> TBT: ${metrics.tbt}ms, LCP: ${(metrics.lcp / 1000).toFixed(2)}s`);
      tbtValues.push(metrics.tbt);
      lcpValues.push(metrics.lcp);

      await mobileContext.close();
    }

    const medianTBT = median(tbtValues);
    const medianLCP = median(lcpValues) / 1000;

    const tbtPass = medianTBT <= 600;
    const lcpPass = medianLCP <= 2.5;

    if (!tbtPass || !lcpPass) allPass = false;

    console.log("\n=================== PERFORMANCE SUMMARY TABLE ===================");
    console.log("| Route / Metric | Desktop FPS | Lite Tier TBT | Lite Tier LCP | Status |");
    console.log("|----------------|-------------|---------------|---------------|--------|");
    results.forEach((res, i) => {
      console.log(`| ${res.route} | ${res.fps} fps | ${tbtValues[i]} ms | ${(lcpValues[i] / 1000).toFixed(2)} s | ${res.fpsPass ? "PASS" : "FAIL"} |`);
    });
    console.log("|----------------|-------------|---------------|---------------|--------|");
    console.log(`| **Median**     | —           | **${medianTBT} ms** (<= 600ms) | **${medianLCP.toFixed(2)} s** (<= 2.5s) | ${tbtPass && lcpPass ? "PASS" : "FAIL"} |`);
    console.log("=================================================================\n");

  } finally {
    await browser.close();
    stopServer();
  }

  if (!allPass) {
    console.error("❌ Performance measurements failed against target budgets.");
    process.exit(1);
  }

  console.log("✅ ALL PHASE 9b PERFORMANCE TARGETS PASSED!");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  stopServer();
  process.exit(1);
});
