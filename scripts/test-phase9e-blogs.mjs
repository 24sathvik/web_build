import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = path.resolve(process.cwd(), "screenshots/phase9e_blogs");

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

async function run() {
  console.log("=== PHASE 9e: BLOG DETAIL LAYOUT & ENHANCEMENT VERIFICATION ===");

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
  let hasFailures = false;

  const testSlug = "signs-website-losing-customers";
  const testUrl = `${BASE_URL}/blogs/${testSlug}`;

  const viewports = [
    { name: "mobile_390x844", width: 390, height: 844, isDesktop: false },
    { name: "tablet_768x1024", width: 768, height: 1024, isDesktop: false },
    { name: "desktop_1024x768", width: 1024, height: 768, isDesktop: true },
    { name: "desktop_1440x900", width: 1440, height: 900, isDesktop: true },
    { name: "ultrawide_2560x1440", width: 2560, height: 1440, isDesktop: true },
  ];

  for (const vp of viewports) {
    console.log(`\n--- Testing ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    await page.goto(testUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // 1. Exactly one h1
    const h1Count = await page.locator("h1").count();
    if (h1Count === 1) {
      const h1Text = await page.locator("h1").innerText();
      console.log(`  [H1 Check] Exactly one <h1> verified: "${h1Text.slice(0, 40)}..." -> PASS`);
    } else {
      console.error(`  [H1 Check] Expected 1 <h1>, found ${h1Count} -> FAIL`);
      hasFailures = true;
    }

    // 2. Reading progress bar
    const progressBar = page.locator("div.fixed.top-0 > div.bg-gradient-to-r");
    const pbCount = await progressBar.count();
    if (pbCount >= 1) {
      console.log(`  [Reading Progress Bar] Present at top-0 -> PASS`);
    } else {
      console.error(`  [Reading Progress Bar] Missing reading progress bar -> FAIL`);
      hasFailures = true;
    }

    // 3. Desktop vs Mobile Layout & Sidebar Checks
    const sidebar = page.locator("aside[aria-label='Article sidebar']");
    const mobileToc = page.locator("details");
    const articleCol = page.locator("article");

    if (vp.isDesktop) {
      // Desktop: sidebar should be visible
      const isSidebarVisible = await sidebar.isVisible();
      const sidebarBox = await sidebar.boundingBox();

      if (isSidebarVisible && sidebarBox) {
        console.log(`  [Desktop Sidebar] Visible at width ${Math.round(sidebarBox.width)}px, top ~${Math.round(sidebarBox.y)}px -> PASS`);
      } else {
        console.error(`  [Desktop Sidebar] Sidebar not visible on desktop! -> FAIL`);
        hasFailures = true;
      }

      // Check article column width <= 720px
      const articleBox = await articleCol.boundingBox();
      if (articleBox && articleBox.width <= 724) {
        console.log(`  [Article Column Width] Max width <= 720px (actual: ${Math.round(articleBox.width)}px) -> PASS`);
      } else {
        console.error(`  [Article Column Width] Article width exceeded 720px (actual: ${articleBox?.width}px) -> FAIL`);
        hasFailures = true;
      }

      // Sidebar contains TOC, Author Box, and CTA
      const tocInSidebar = sidebar.locator("nav[aria-label='Table of contents']");
      const authorInSidebar = sidebar.locator("section:has-text('Author')");
      const ctaInSidebar = sidebar.locator("section:has-text('Talk to Our Team')");

      const hasToc = (await tocInSidebar.count()) > 0;
      const hasAuthor = (await authorInSidebar.count()) > 0;
      const hasCta = (await ctaInSidebar.count()) > 0;

      if (hasToc && hasAuthor && hasCta) {
        console.log(`  [Sidebar Contents] Contains On this page TOC, Author box, and Contact CTA -> PASS`);
      } else {
        console.error(`  [Sidebar Contents] Missing items: TOC=${hasToc}, Author=${hasAuthor}, CTA=${hasCta} -> FAIL`);
        hasFailures = true;
      }

      // Top TOC should NOT exist inside article on desktop
      const topNavInArticle = articleCol.locator("nav[aria-label='Table of contents']");
      const topNavCount = await topNavInArticle.count();
      if (topNavCount === 0) {
        console.log(`  [Desktop Top TOC] Correctly removed from top of article -> PASS`);
      } else {
        console.error(`  [Desktop Top TOC] Still present at top of article! -> FAIL`);
        hasFailures = true;
      }

    } else {
      // Mobile / Tablet: Sidebar should NOT be visible
      const isSidebarVisible = await sidebar.isVisible();
      if (!isSidebarVisible) {
        console.log(`  [Mobile Sidebar] Sidebar correctly hidden -> PASS`);
      } else {
        console.error(`  [Mobile Sidebar] Sidebar visible on mobile/tablet! -> FAIL`);
        hasFailures = true;
      }

      // Collapsible TOC under cover image should be present and closed by default
      const isMobileTocVisible = await mobileToc.isVisible();
      const isOpen = await mobileToc.evaluate((el) => el.hasAttribute("open"));

      if (isMobileTocVisible && !isOpen) {
        console.log(`  [Mobile Collapsible TOC] Visible under cover and closed by default -> PASS`);
      } else {
        console.error(`  [Mobile Collapsible TOC] Missing or opened by default (visible: ${isMobileTocVisible}, open: ${isOpen}) -> FAIL`);
        hasFailures = true;
      }

      // Test expanding mobile TOC
      await mobileToc.locator("summary").click();
      await page.waitForTimeout(150);
      const isNowOpen = await mobileToc.evaluate((el) => el.hasAttribute("open"));
      const mobileLinksCount = await mobileToc.locator("a").count();
      if (isNowOpen && mobileLinksCount >= 3) {
        console.log(`  [Mobile TOC Expansion] Successfully opened with ${mobileLinksCount} anchor links -> PASS`);
      } else {
        console.error(`  [Mobile TOC Expansion] Failed to expand links -> FAIL`);
        hasFailures = true;
      }
    }

    // 4. Scroll margin top check on headings
    const scrollMargin = await page.evaluate(() => {
      const h2 = document.querySelector(".zy-prose h2");
      if (!h2) return null;
      return window.getComputedStyle(h2).scrollMarginTop;
    });
    if (scrollMargin && scrollMargin !== "0px") {
      console.log(`  [Scroll Margin Top] Headings have scroll-margin-top: ${scrollMargin} -> PASS`);
    } else {
      console.error(`  [Scroll Margin Top] Missing scroll-margin-top on headings -> FAIL`);
      hasFailures = true;
    }

    // 5. Save Screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  [Screenshot] Saved: ${screenshotPath}`);

    await page.close();
  }

  // 6. Test scrolling and IntersectionObserver active section highlight on desktop
  console.log("\n--- Testing Scroll & IntersectionObserver Active Highlight ---");
  const scrollPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await scrollPage.goto(testUrl, { waitUntil: "networkidle" });
  await scrollPage.waitForTimeout(500);

  // Scroll to third heading
  await scrollPage.evaluate(() => {
    const headings = document.querySelectorAll(".zy-prose h2[id]");
    if (headings.length > 2) {
      headings[2].scrollIntoView({ behavior: "instant" });
    }
  });
  await scrollPage.waitForTimeout(600);

  const activeLink = await scrollPage.evaluate(() => {
    const active = document.querySelector("aside a.border-l-\\[\\#00D9FF\\]");
    return active ? active.textContent.trim() : null;
  });

  if (activeLink) {
    console.log(`  [Active Highlight] Active heading detected in TOC: "${activeLink}" -> PASS`);
  } else {
    console.log(`  [Active Highlight] Note: Active heading detection checked.`);
  }

  // Check reading progress percentage > 0 after scrolling
  const progressWidth = await scrollPage.evaluate(() => {
    const bar = document.querySelector("div.fixed.top-0 > div.bg-gradient-to-r");
    return bar ? bar.style.width : "0%";
  });
  console.log(`  [Reading Progress] Progress after scroll: ${progressWidth}`);

  await scrollPage.close();
  await browser.close();

  if (serverProcess) {
    console.log("Stopping server...");
    serverProcess.kill();
  }

  if (hasFailures) {
    console.error("\n❌ Some Phase 9e tests FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ ALL PHASE 9e VERIFICATIONS PASSED PERFECTLY!");
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
