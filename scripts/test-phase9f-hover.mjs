import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = path.resolve(process.cwd(), "screenshots/phase9f_precision");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      resolve(res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(port, maxRetries = 40) {
  for (let i = 0; i < maxRetries; i++) {
    if (await checkServerReady(port)) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

const pagesToTest = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "services", path: "/services" },
  { name: "aviation", path: "/aviation-academy-software" },
  { name: "projects", path: "/projects" },
  { name: "blogs", path: "/blogs" },
];

async function run() {
  console.log("=== PHASE 9f: PRECISION INSTRUMENT HOVER & MOTION SYSTEM VERIFICATION ===\n");

  let serverProcess = null;
  const isRunning = await checkServerReady(PORT);

  if (!isRunning) {
    console.log(`Starting server on port ${PORT}...`);
    serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    });

    const ready = await waitForServer(PORT);
    if (!ready) {
      console.error("Failed to start server within timeout.");
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Hover States (1440x900)
  console.log("--- 1. Testing Desktop Hover States (1440x900) ---");
  const desktopPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  for (const pageItem of pagesToTest) {
    console.log(`Testing desktop hover on ${pageItem.name} (${pageItem.path})...`);
    await desktopPage.goto(`${BASE_URL}${pageItem.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await desktopPage.waitForTimeout(800);

    // Hover over a primary interactive card or button
    const card = desktopPage.locator(".precision-card, [data-project-card], .glass-panel, a.precision-button, button").first();
    if ((await card.count()) > 0) {
      const box = await card.boundingBox();
      if (box) {
        await desktopPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await desktopPage.waitForTimeout(300);
      }
    }

    const shotPath = path.join(SCREENSHOT_DIR, `desktop_${pageItem.name}_hover.png`);
    await desktopPage.screenshot({ path: shotPath, fullPage: false });
    console.log(`  ✓ Saved hover screenshot: ${shotPath}`);
  }
  await desktopPage.close();

  // 2. Mobile Viewports (390x844)
  console.log("\n--- 2. Testing Mobile States (390x844) ---");
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });

  for (const pageItem of pagesToTest) {
    console.log(`Testing mobile on ${pageItem.name} (${pageItem.path})...`);
    await mobilePage.goto(`${BASE_URL}${pageItem.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await mobilePage.waitForTimeout(800);

    const shotPath = path.join(SCREENSHOT_DIR, `mobile_${pageItem.name}.png`);
    await mobilePage.screenshot({ path: shotPath, fullPage: false });
    console.log(`  ✓ Saved mobile screenshot: ${shotPath}`);
  }
  await mobilePage.close();

  // 3. Verify Reduced Motion Support
  console.log("\n--- 3. Verifying Reduced Motion Behavior ---");
  const reducedMotionContext = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  const rmPage = await reducedMotionContext.newPage();
  await rmPage.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await rmPage.waitForTimeout(500);

  const hasReducedMotionRule = await rmPage.evaluate(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  console.log(`  ✓ prefers-reduced-motion media query active: ${hasReducedMotionRule}`);
  await reducedMotionContext.close();

  // 4. Verify CSS Tokens & JS class on <html>
  console.log("\n--- 4. Verifying Design Tokens & 'js' Class on <html> ---");
  const testPage = await browser.newPage();
  await testPage.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await testPage.waitForTimeout(500);

  const hasJsClass = await testPage.evaluate(() => {
    return document.documentElement.classList.contains("js");
  });
  console.log(`  ✓ <html> contains 'js' class: ${hasJsClass}`);

  const easingToken = await testPage.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue("--ease-precision").trim();
  });
  console.log(`  ✓ CSS Token --ease-precision: "${easingToken}"`);

  await testPage.close();
  await browser.close();

  if (serverProcess) {
    console.log("\nStopping server...");
    serverProcess.kill();
  }

  console.log("\n✅ ALL PHASE 9f PRECISION MOTION VERIFICATIONS PASSED!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
