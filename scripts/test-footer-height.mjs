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

const VIEWPORTS = [
  { name: "phone_360x800", width: 360, height: 800, maxAllowedHeight: 800 * 0.7 },
  { name: "phone_390x844", width: 390, height: 844, maxAllowedHeight: 844 * 0.7 },
  { name: "tablet_768x1024", width: 768, height: 1024, maxAllowedHeight: 1024 * 0.7 },
  { name: "desktop_1440x900", width: 1440, height: 900, maxAllowedHeight: 480 },
  { name: "large_2560x1440", width: 2560, height: 1440, maxAllowedHeight: 480 },
];

async function run() {
  console.log("=== COMPACT FOOTER HEIGHT PLAYWRIGHT TEST ===");
  await ensureServer();

  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/privacy-policy`, { waitUntil: "networkidle" });

      const footer = page.locator("#site-footer");
      await footer.waitFor({ state: "attached", timeout: 5000 });
      const box = await footer.boundingBox();

      if (!box) {
        assert(false, `Footer bounding box not found on viewport ${vp.name}`);
        await context.close();
        continue;
      }

      console.log(`  Measured footer dimensions: ${box.width.toFixed(1)}px x ${box.height.toFixed(1)}px (max allowed: ${vp.maxAllowedHeight}px)`);

      assert(
        box.height <= vp.maxAllowedHeight,
        `Footer height ${box.height.toFixed(1)}px <= ${vp.maxAllowedHeight}px on ${vp.name}`
      );

      // Check content inner max width
      const innerContainer = footer.locator(".max-w-\\[1200px\\]");
      const innerBox = await innerContainer.boundingBox();
      if (innerBox) {
        assert(
          innerBox.width <= 1200 + 1,
          `Footer inner content width ${innerBox.width.toFixed(1)}px <= 1200px on ${vp.name}`
        );
      }

      // Check that content-visibility:auto is NOT present
      const hasContentVis = await footer.evaluate((el) => {
        return window.getComputedStyle(el).contentVisibility === "auto";
      });
      assert(!hasContentVis, `Footer does not use [content-visibility:auto] on ${vp.name}`);

      await context.close();
    }
  } finally {
    await browser.close();
    stopServer();
  }

  console.log("\n=============================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  stopServer();
  process.exit(1);
});
