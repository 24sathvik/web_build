import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import http from "node:http";

const PORT = 3000;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

let serverProcess = null;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failed++;
  }
}

async function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(true);
    });
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
      // Warm up all routes so Next.js internal build/page cache is active
      console.log("Warming up routes...");
      for (const r of ROUTES) {
        try {
          await new Promise((resolve) => {
            http.get(`${BASE_URL}${r.path}`, (res) => {
              res.resume();
              resolve(true);
            }).on("error", () => resolve(false));
          });
        } catch {}
      }
      console.log("Routes warmed up.");
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
  { path: "/", hasCanvas: true },
  { path: "/about", hasCanvas: true },
  { path: "/services", hasCanvas: true },
  { path: "/projects", hasCanvas: true },
  { path: "/aviation-academy-software", hasCanvas: true },
  { path: "/blogs", hasCanvas: true },
  { path: "/contact", hasCanvas: true },
  { path: "/privacy-policy", hasCanvas: false },
];

async function run() {
  console.log("=== 3D TIMELINE & IMMEDIATE APPEARANCE TEST ===");
  await ensureServer();

  const browser = await chromium.launch({
    args: ["--enable-gpu", "--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"],
  });

  const timelineResults = [];

  try {
    // Warm up Chromium browser and JIT
    console.log("Warming up Chromium browser...");
    const warmupCtx = await browser.newContext();
    const warmupPage = await warmupCtx.newPage();
    await warmupPage.goto(`${BASE_URL}/?debug=1`, { waitUntil: "domcontentloaded" });
    try {
      await warmupPage.waitForFunction(() => {
        return Boolean(window.__ZYXEN_TIMELINE__ && window.__ZYXEN_TIMELINE__.firstFrame !== null);
      }, { timeout: 12000 });
    } catch {}
    await warmupCtx.close();
    console.log("Chromium browser warmed up.");

    for (const route of ROUTES) {
      console.log(`\nTesting Route: ${route.path} (hasCanvas: ${route.hasCanvas})`);

      // 1. Desktop Test (1920x1080)
      const desktopContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
      });
      const desktopPage = await desktopContext.newPage();
      desktopPage.on("pageerror", (err) => console.error("  [PAGE ERROR]", err.message));
      desktopPage.on("console", (msg) => {
        if (msg.type() === "error") console.error("  [CONSOLE ERROR]", msg.text());
      });

      await desktopPage.goto(`${BASE_URL}${route.path}?debug=1`, { waitUntil: "domcontentloaded" });

      // Wait for hydration
      await desktopPage.waitForFunction(() => {
        return Boolean(window.__ZYXEN_TIMELINE__ && window.__ZYXEN_TIMELINE__.hydrationEnd !== null);
      }, { timeout: 10000 });

      if (route.hasCanvas) {
        // Wait for first 3D frame
        await desktopPage.waitForFunction(() => {
          return Boolean(window.__ZYXEN_TIMELINE__ && window.__ZYXEN_TIMELINE__.firstFrame !== null);
        }, { timeout: 12000 });
      } else {
        await desktopPage.waitForTimeout(1000);
      }

      const desktopTimeline = await desktopPage.evaluate(() => window.__ZYXEN_TIMELINE__);
      const desktopFirstFrameDelta = desktopTimeline?.fromHydration?.firstFrame ?? null;
      const desktopChunkDelta = desktopTimeline?.fromHydration?.chunkLoaded ?? null;
      const desktopMountDelta = desktopTimeline?.fromHydration?.mountTrigger ?? null;

      if (route.hasCanvas) {
        assert(
          desktopFirstFrameDelta !== null && desktopFirstFrameDelta <= 1200,
          `Desktop First Frame delta ${desktopFirstFrameDelta}ms <= 1200ms on ${route.path}`
        );
      } else {
        assert(
          desktopTimeline?.firstFrame === null,
          `Static route ${route.path} correctly renders no 3D canvas`
        );
      }

      await desktopContext.close();

      // 2. Mobile Throttled Test (390x844, 4x CPU Throttling)
      const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const mobilePage = await mobileContext.newPage();

      const cdp = await mobileContext.newCDPSession(mobilePage);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

      await mobilePage.goto(`${BASE_URL}${route.path}?debug=1`, { waitUntil: "domcontentloaded" });

      await mobilePage.waitForFunction(() => {
        return Boolean(window.__ZYXEN_TIMELINE__ && window.__ZYXEN_TIMELINE__.hydrationEnd !== null);
      }, { timeout: 15000 });

      if (route.hasCanvas) {
        await mobilePage.waitForFunction(() => {
          return Boolean(window.__ZYXEN_TIMELINE__ && window.__ZYXEN_TIMELINE__.firstFrame !== null);
        }, { timeout: 15000 });
      } else {
        await mobilePage.waitForTimeout(1000);
      }

      const mobileTimeline = await mobilePage.evaluate(() => window.__ZYXEN_TIMELINE__);
      const mobileFirstFrameDelta = mobileTimeline?.fromHydration?.firstFrame ?? null;
      console.log(`  [DEBUG Mobile ${route.path}] Hydration: ${mobileTimeline?.hydrationEnd}ms, Mount: +${mobileTimeline?.fromHydration?.mountTrigger}ms, Chunk: +${mobileTimeline?.fromHydration?.chunkLoaded}ms, FirstFrame: +${mobileTimeline?.fromHydration?.firstFrame}ms`);

      if (route.hasCanvas) {
        assert(
          mobileFirstFrameDelta !== null && mobileFirstFrameDelta <= 5000,
          `Mobile (4x CPU throttled) First Frame delta ${mobileFirstFrameDelta}ms <= 5000ms on ${route.path}`
        );
      }

      await mobileContext.close();

      timelineResults.push({
        path: route.path,
        hasCanvas: route.hasCanvas,
        hydration: desktopTimeline?.hydrationEnd,
        mountDelta: desktopMountDelta,
        chunkDelta: desktopChunkDelta,
        desktopFirstFrameDelta,
        mobileFirstFrameDelta,
      });
    }

    console.log("\n=================== 3D TIMELINE RESULTS TABLE ===================");
    console.log("| Route | Canvas | Hydration | Mount (Δ) | Chunk (Δ) | Desktop Frame (Δ) | Mobile 4x Frame (Δ) | Status |");
    console.log("|-------|--------|-----------|-----------|-----------|--------------------|---------------------|--------|");
    for (const res of timelineResults) {
      const status = (!res.hasCanvas || (res.desktopFirstFrameDelta <= 1200 && res.mobileFirstFrameDelta <= 5000)) ? "PASS" : "FAIL";
      const mount = res.mountDelta !== null ? `+${res.mountDelta}ms` : "—";
      const chunk = res.chunkDelta !== null ? `+${res.chunkDelta}ms` : "—";
      const deskFrame = res.desktopFirstFrameDelta !== null ? `+${res.desktopFirstFrameDelta}ms` : "—";
      const mobFrame = res.mobileFirstFrameDelta !== null ? `+${res.mobileFirstFrameDelta}ms` : "—";
      console.log(`| ${res.path} | ${res.hasCanvas ? "Yes" : "No"} | ${res.hydration}ms | ${mount} | ${chunk} | ${deskFrame} | ${mobFrame} | ${status} |`);
    }
    console.log("=================================================================\n");

  } finally {
    await browser.close();
    stopServer();
  }

  console.log(`\nOverall: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  stopServer();
  process.exit(1);
});
