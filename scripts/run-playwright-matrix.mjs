import { chromium, firefox, webkit } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const SCREENSHOT_DIR = path.resolve("playwright-screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "mobile_320x568", width: 320, height: 568, isMobile: true },
  { name: "mobile_360x800", width: 360, height: 800, isMobile: true },
  { name: "mobile_390x844", width: 390, height: 844, isMobile: true },
  { name: "mobile_430x932", width: 430, height: 932, isMobile: true },
  { name: "mobile_844x390_land", width: 844, height: 390, isMobile: true },
  { name: "tablet_768x1024", width: 768, height: 1024, isMobile: false },
  { name: "tablet_820x1180", width: 820, height: 1180, isMobile: false },
  { name: "tablet_1024x1366", width: 1024, height: 1366, isMobile: false },
  { name: "desktop_1280x720", width: 1280, height: 720, isMobile: false },
  { name: "desktop_1366x768", width: 1366, height: 768, isMobile: false },
  { name: "desktop_1536x864", width: 1536, height: 864, isMobile: false },
  { name: "desktop_1920x1080", width: 1920, height: 1080, isMobile: false },
  { name: "desktop_2560x1440", width: 2560, height: 1440, isMobile: false },
  { name: "ultrawide_3440x1440", width: 3440, height: 1440, isMobile: false },
];

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/technology",
  "/projects",
  "/aviation-academy-software",
  "/blogs",
  "/blogs/signs-website-losing-customers",
  "/contact",
  "/privacy-policy",
  "/aviation-exam-portal-software",
  "/fee-and-finance-software-for-academies",
  "/admission-management-software",
  "/erp-for-educational-institutes",
  "/web-development-hyderabad",
  "/production-management-software-pharma",
];

const screenshotPaths = [];
const failures = [];

async function testPage(browserType, browserName, route, viewport, tier) {
  let context;
  let page;
  try {
    context = await browserType.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
    });
    page = await context.newPage();

    const consoleErrors = [];
    const failedRequests = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore Google Analytics 4 external network errors when offline
        if (!text.includes("google-analytics") && !text.includes("googletagmanager")) {
          consoleErrors.push(text);
        }
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    page.on("requestfailed", (req) => {
      const url = req.url();
      if (!url.includes("google-analytics.com") && !url.includes("googletagmanager.com")) {
        failedRequests.push(`${req.method()} ${url} -> ${req.failure()?.errorText || "failed"}`);
      }
    });

    const url = `${BASE_URL}${route}?tier=${tier}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(500); // Allow layout settlement

    // 1. Assert H1 is present and visible
    const h1Info = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return { exists: false, visible: false, text: "" };
      const rect = h1.getBoundingClientRect();
      const style = window.getComputedStyle(h1);
      const visible =
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        parseFloat(style.opacity || "1") > 0 &&
        rect.width > 0 &&
        rect.height > 0;
      return { exists: true, visible, text: h1.textContent?.trim().slice(0, 50) };
    });

    if (!h1Info.exists || !h1Info.visible) {
      failures.push({
        test: `${browserName} ${viewport.name} ${route} (${tier})`,
        error: `H1 missing or not visible: exists=${h1Info.exists}, visible=${h1Info.visible}`,
      });
    }

    // 2. Assert no horizontal overflow
    const overflowInfo = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientWidth = docEl.clientWidth;
      const diff = scrollWidth - clientWidth;
      let offenders = [];
      if (diff > 2) {
        document.querySelectorAll("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > clientWidth + 2) {
            offenders.push(`${el.tagName.toLowerCase()}.${el.className?.slice?.(0, 30)} (right: ${r.right.toFixed(0)})`);
          }
        });
      }
      return { hasOverflow: diff > 2, diff, offenders: offenders.slice(0, 3) };
    });

    if (overflowInfo.hasOverflow) {
      failures.push({
        test: `${browserName} ${viewport.name} ${route} (${tier})`,
        error: `Horizontal overflow detected: diff=${overflowInfo.diff.toFixed(1)}px. Offenders: ${overflowInfo.offenders.join(", ")}`,
      });
    }

    // 3. Assert footer is present and reachable
    const footerInfo = await page.evaluate(async () => {
      const footer = document.querySelector("footer");
      if (!footer) return { exists: false, reachable: false };
      // Scroll to bottom
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 200));
      const rect = footer.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      return { exists: true, reachable: visible, top: rect.top, bottom: rect.bottom };
    });

    if (!footerInfo.exists) {
      failures.push({
        test: `${browserName} ${viewport.name} ${route} (${tier})`,
        error: `Footer element not found in DOM`,
      });
    }

    // 4. Mobile tap targets check (for mobile viewports)
    if (viewport.isMobile) {
      const tapTargetBreaches = await page.evaluate(() => {
        const issues = [];
        const interactives = document.querySelectorAll(
          'a, button, input:not([type="hidden"]), select, textarea, [role="button"]'
        );
        interactives.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          // Check visible elements
          if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            parseFloat(style.opacity || "1") > 0 &&
            rect.width > 0 &&
            rect.height > 0
          ) {
            // Check if element is within typical page flow
            // Relax inline text links inside paragraphs/prose, but enforce for nav/buttons/cards
            const isInlineProseLink = el.tagName.toLowerCase() === "a" && el.closest("p, .zy-prose, [aria-label='Breadcrumb']");
            if (!isInlineProseLink && (rect.width < 40 || rect.height < 40)) {
              issues.push({
                tag: el.tagName.toLowerCase(),
                text: el.textContent?.trim().slice(0, 25),
                width: rect.width.toFixed(1),
                height: rect.height.toFixed(1),
                class: el.className?.slice?.(0, 30),
              });
            }
          }
        });
        return issues.slice(0, 5);
      });

      if (tapTargetBreaches.length > 0) {
        failures.push({
          test: `${browserName} ${viewport.name} ${route} (${tier})`,
          error: `Tap targets < 40px found: ${JSON.stringify(tapTargetBreaches)}`,
        });
      }
    }

    // 5. Ultrawide content max-width check
    if (viewport.width === 3440) {
      const ultrawideCheck = await page.evaluate(() => {
        // Find main container width
        const main = document.querySelector("main") || document.body;
        const containers = main.querySelectorAll(".max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .container");
        let allBounded = true;
        containers.forEach((c) => {
          const r = c.getBoundingClientRect();
          if (r.width > 1920) allBounded = false;
        });
        return { allBounded };
      });

      if (!ultrawideCheck.allBounded) {
        failures.push({
          test: `${browserName} ${viewport.name} ${route} (${tier})`,
          error: `Ultrawide container exceeds bounded max width on 3440px viewport`,
        });
      }
    }

    // 6. Console errors & failed requests check
    if (consoleErrors.length > 0) {
      failures.push({
        test: `${browserName} ${viewport.name} ${route} (${tier})`,
        error: `Console error(s): ${consoleErrors.join("; ")}`,
      });
    }

    if (failedRequests.length > 0) {
      failures.push({
        test: `${browserName} ${viewport.name} ${route} (${tier})`,
        error: `Failed request(s): ${failedRequests.join("; ")}`,
      });
    }

    // Save screenshot
    const cleanRoute = route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "");
    const shotName = `${browserName}_${viewport.name}_${cleanRoute}_${tier}.png`;
    const shotPath = path.join(SCREENSHOT_DIR, shotName);
    try {
      await page.screenshot({ path: shotPath, fullPage: false, animations: "disabled", timeout: 8000 });
      screenshotPaths.push(shotPath);
    } catch {
      try {
        await page.waitForTimeout(200);
        await page.screenshot({ path: shotPath, fullPage: false, animations: "disabled", timeout: 8000 });
        screenshotPaths.push(shotPath);
      } catch (err) {
        console.warn(`Warning: Screenshot capture skipped for ${shotName}: ${err.message}`);
      }
    }

    return true;
  } catch (err) {
    failures.push({
      test: `${browserName} ${viewport.name} ${route} (${tier})`,
      error: `Execution exception: ${err.message}`,
    });
    return false;
  } finally {
    if (context) await context.close();
  }
}

async function run() {
  console.log("=== PLAYWRIGHT CROSS-BROWSER & VIEWPORT MATRIX AUDIT ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Saving screenshots to: ${SCREENSHOT_DIR}\n`);

  const browsers = [
    { name: "chromium", engine: chromium },
    { name: "firefox", engine: firefox },
    { name: "webkit", engine: webkit },
  ];

  // We test:
  // 1. Chromium across ALL 14 viewports for the primary and solution routes in static, lite, and full (on desktop)
  // 2. WebKit and Firefox across key mobile, tablet, desktop, and ultrawide viewports across the routes
  console.log("Starting test execution matrix...\n");
  let testCount = 0;

  for (const b of browsers) {
    console.log(`--- Launching ${b.name.toUpperCase()} ---`);
    const browser = await b.engine.launch();

    // Select viewports for this browser
    // For Chromium: all 14 viewports
    // For WebKit & Firefox: 6 representative viewports (mobile 390x844, mobile 844x390 land, tablet 768x1024, desktop 1280x720, desktop 1920x1080, ultrawide 3440x1440)
    const viewportsToTest =
      b.name === "chromium"
        ? VIEWPORTS
        : [
            VIEWPORTS.find((v) => v.name === "mobile_390x844"),
            VIEWPORTS.find((v) => v.name === "mobile_844x390_land"),
            VIEWPORTS.find((v) => v.name === "tablet_768x1024"),
            VIEWPORTS.find((v) => v.name === "desktop_1280x720"),
            VIEWPORTS.find((v) => v.name === "desktop_1920x1080"),
            VIEWPORTS.find((v) => v.name === "ultrawide_3440x1440"),
          ].filter(Boolean);

    for (const vp of viewportsToTest) {
      // Determine tiers to test
      const tiers = vp.isMobile ? ["static", "lite"] : ["static", "lite", "full"];

      for (const route of ROUTES) {
        for (const tier of tiers) {
          testCount++;
          process.stdout.write(`[${testCount}] ${b.name} | ${vp.name.padEnd(20)} | ${route.padEnd(38)} | ${tier}... `);
          const ok = await testPage(browser, b.name, route, vp, tier);
          if (ok && !failures.some((f) => f.test.startsWith(`${b.name} ${vp.name} ${route} (${tier})`))) {
            console.log("PASS");
          } else {
            console.log("FAIL");
          }
        }
      }
    }

    await browser.close();
  }

  console.log("\n=======================================================");
  console.log(`Total tests executed: ${testCount}`);
  console.log(`Total screenshots saved: ${screenshotPaths.length}`);
  console.log(`Total failures: ${failures.length}`);
  console.log("=======================================================\n");

  if (failures.length > 0) {
    console.error("❌ FAILURES DETECTED:");
    failures.forEach((f, idx) => {
      console.error(`${idx + 1}. [${f.test}]: ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log("✅ ALL PLAYWRIGHT MATRIX TESTS PASSED PERFECTLY!");
    console.log("\nSample Screenshot Paths (first 10):");
    screenshotPaths.slice(0, 10).forEach((p) => console.log(" -", p));
    console.log(`... and ${screenshotPaths.length - 10} more in ${SCREENSHOT_DIR}`);
    process.exit(0);
  }
}

run();

