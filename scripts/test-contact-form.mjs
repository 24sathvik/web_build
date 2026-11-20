import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import http from "node:http";

const PORT = 3000;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

const EXPECTED_SERVICE_ID = "service_p5gb8wg";
const EXPECTED_TEMPLATE_ID = "template_osddfod";
const EXPECTED_PUBLIC_KEY = "m1xChN43puPbSRCtJ";

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
    console.log(`Server already responding at ${BASE_URL}`);
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
      console.log(`Server successfully started at ${BASE_URL}`);
      return;
    }
  }
  throw new Error("Server failed to start within 30 seconds");
}

function stopServer() {
  if (!serverProcess) return;
  console.log("\nStopping test server...");
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: "ignore" });
    } else {
      serverProcess.kill("SIGTERM");
    }
  } catch {
    // Process may have already exited
  }
  serverProcess = null;
}

async function runTests() {
  console.log("=== Playwright Contact Form & EmailJS Integration Tests ===");
  await ensureServer();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Full name on /contact page
    // -------------------------------------------------------------------------
    console.log("\n▶ Test 1: Full Name ('Ravi Kumar') on /contact page");
    {
      const page = await context.newPage();
      let interceptedPayload = null;

      await page.route("**/api.emailjs.com/**", async (route) => {
        const postData = route.request().postData();
        if (postData) {
          try {
            interceptedPayload = JSON.parse(postData);
          } catch {
            interceptedPayload = postData;
          }
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, text: "OK" }),
        });
      });

      await page.goto(`${BASE_URL}/contact`, { waitUntil: "networkidle" });

      await page.fill('input[name="name"]', "Ravi Kumar");
      await page.fill('input[name="email"]', "ravi.kumar@example.com");
      await page.fill('input[name="phone"]', "+91 98765 43210");
      await page.fill('input[name="organisation"]', "Aviation Tech Academy");
      await page.selectOption('select[name="service"]', { index: 1 });
      await page.selectOption('select[name="budget"]', { index: 1 });
      await page.fill('textarea[name="message"]', "Need an exam management system.");

      await page.click('button[type="submit"]');

      // Wait for success screen
      await page.waitForSelector('text="Message Sent"', { timeout: 10000 });

      assert(interceptedPayload !== null, "Intercepted request to api.emailjs.com");
      if (interceptedPayload) {
        assert(interceptedPayload.service_id === EXPECTED_SERVICE_ID, `service_id matches expected (${EXPECTED_SERVICE_ID})`);
        assert(interceptedPayload.template_id === EXPECTED_TEMPLATE_ID, `template_id matches expected (${EXPECTED_TEMPLATE_ID})`);
        assert(interceptedPayload.user_id === EXPECTED_PUBLIC_KEY, `user_id matches expected public key (${EXPECTED_PUBLIC_KEY})`);

        const params = interceptedPayload.template_params || {};
        const paramKeys = Object.keys(params).sort();
        const expectedKeys = ["email", "first_name", "last_name", "message", "phone"];
        assert(
          JSON.stringify(paramKeys) === JSON.stringify(expectedKeys),
          `template_params has exact expected keys: ${JSON.stringify(expectedKeys)} (actual: ${JSON.stringify(paramKeys)})`
        );

        assert(params.first_name === "Ravi", `first_name is 'Ravi' (actual: '${params.first_name}')`);
        assert(params.last_name === "Kumar", `last_name is 'Kumar' (actual: '${params.last_name}')`);
        assert(params.email === "ravi.kumar@example.com", `email is 'ravi.kumar@example.com'`);
        assert(params.phone === "+91 98765 43210", `phone is '+91 98765 43210'`);
        assert(
          typeof params.message === "string" &&
          params.message.includes("Aviation Tech Academy") &&
          params.message.includes("Need an exam management system."),
          "message includes organisation details and user message"
        );
      }
      await page.close();
    }

    // -------------------------------------------------------------------------
    // TEST 2: Single-word name on /contact page
    // -------------------------------------------------------------------------
    console.log("\n▶ Test 2: Single-word Name ('Ravi') on /contact page");
    {
      const page = await context.newPage();
      let interceptedPayload = null;

      await page.route("**/api.emailjs.com/**", async (route) => {
        const postData = route.request().postData();
        if (postData) {
          try {
            interceptedPayload = JSON.parse(postData);
          } catch {
            interceptedPayload = postData;
          }
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, text: "OK" }),
        });
      });

      await page.goto(`${BASE_URL}/contact`, { waitUntil: "networkidle" });

      await page.fill('input[name="name"]', "Ravi");
      await page.fill('input[name="email"]', "ravi@example.com");
      await page.fill('textarea[name="message"]', "Single word name inquiry.");

      await page.click('button[type="submit"]');

      await page.waitForSelector('text="Message Sent"', { timeout: 10000 });

      assert(interceptedPayload !== null, "Intercepted request for single word name");
      if (interceptedPayload) {
        const params = interceptedPayload.template_params || {};
        assert(params.first_name === "Ravi", `first_name is 'Ravi' (actual: '${params.first_name}')`);
        assert(params.last_name === "", `last_name is empty string '' (actual: '${params.last_name}')`);
      }
      await page.close();
    }

    // -------------------------------------------------------------------------
    // TEST 3: Honeypot submission on /contact page (Must NOT send)
    // -------------------------------------------------------------------------
    console.log("\n▶ Test 3: Honeypot Spam Prevention on /contact page");
    {
      const page = await context.newPage();
      let callCount = 0;

      await page.route("**/api.emailjs.com/**", async (route) => {
        callCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, text: "OK" }),
        });
      });

      await page.goto(`${BASE_URL}/contact`, { waitUntil: "networkidle" });

      await page.fill('input[name="name"]', "Bot Spammer");
      await page.fill('input[name="email"]', "bot@spam.com");
      await page.fill('textarea[name="message"]', "Automated bot spam message.");

      // Fill hidden honeypot input using React native setter
      await page.$eval('input[name="honeypot"]', (el) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, "bot-trap-value");
        else el.value = "bot-trap-value";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });

      await page.click('button[type="submit"]');

      await page.waitForSelector('text="Message Sent"', { timeout: 10000 });

      assert(callCount === 0, `No request sent to api.emailjs.com when honeypot filled (calls: ${callCount})`);
      await page.close();
    }

    // -------------------------------------------------------------------------
    // TEST 4: Modal Form on Home Page ('Priya Sharma')
    // -------------------------------------------------------------------------
    console.log("\n▶ Test 4: Modal Contact Form on Home Page ('Priya Sharma')");
    {
      const page = await context.newPage();
      let interceptedPayload = null;

      await page.route("**/api.emailjs.com/**", async (route) => {
        const postData = route.request().postData();
        if (postData) {
          try {
            interceptedPayload = JSON.parse(postData);
          } catch {
            interceptedPayload = postData;
          }
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, text: "OK" }),
        });
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      // Click Hero Primary CTA to open Contact Modal
      const modalTrigger = page.locator('button:has-text("Start a project")').first();
      await modalTrigger.click();

      // Wait for modal form to appear
      const modalForm = page.locator('.fixed form');
      await modalForm.waitFor({ state: "visible", timeout: 10000 });

      await modalForm.locator('input[name="name"]').fill("Priya Sharma");
      await modalForm.locator('input[name="email"]').fill("priya@example.com");
      await modalForm.locator('input[name="phone"]').fill("+91 91234 56789");
      await modalForm.locator('textarea[name="message"]').fill("Testing modal submission.");

      await modalForm.locator('button[type="submit"]').click();

      await page.waitForSelector('.fixed:has-text("Message Sent")', { timeout: 10000 });

      assert(interceptedPayload !== null, "Intercepted modal request to api.emailjs.com");
      if (interceptedPayload) {
        assert(interceptedPayload.service_id === EXPECTED_SERVICE_ID, `Modal service_id matches expected`);
        assert(interceptedPayload.template_id === EXPECTED_TEMPLATE_ID, `Modal template_id matches expected`);
        assert(interceptedPayload.user_id === EXPECTED_PUBLIC_KEY, `Modal user_id matches expected`);

        const params = interceptedPayload.template_params || {};
        const paramKeys = Object.keys(params).sort();
        const expectedKeys = ["email", "first_name", "last_name", "message", "phone"];
        assert(
          JSON.stringify(paramKeys) === JSON.stringify(expectedKeys),
          `Modal template_params has exact expected keys: ${JSON.stringify(expectedKeys)}`
        );
        assert(params.first_name === "Priya", `Modal first_name is 'Priya'`);
        assert(params.last_name === "Sharma", `Modal last_name is 'Sharma'`);
        assert(params.email === "priya@example.com", `Modal email is 'priya@example.com'`);
        assert(params.phone === "+91 91234 56789", `Modal phone is '+91 91234 56789'`);
      }
      await page.close();
    }

    // -------------------------------------------------------------------------
    // TEST 5: Modal Honeypot (Must NOT send)
    // -------------------------------------------------------------------------
    console.log("\n▶ Test 5: Modal Honeypot Spam Prevention");
    {
      const page = await context.newPage();
      let callCount = 0;

      await page.route("**/api.emailjs.com/**", async (route) => {
        callCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, text: "OK" }),
        });
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      const modalTrigger = page.locator('button:has-text("Start a project")').first();
      await modalTrigger.click();

      const modalForm = page.locator('.fixed form');
      await modalForm.waitFor({ state: "visible", timeout: 10000 });

      await modalForm.locator('input[name="name"]').fill("Modal Bot");
      await modalForm.locator('input[name="email"]').fill("bot@modal.com");
      await modalForm.locator('textarea[name="message"]').fill("Modal spam message.");

      await modalForm.locator('input[name="honeypot"]').evaluate((el) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, "modal-bot-trap");
        else el.value = "modal-bot-trap";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });

      await modalForm.locator('button[type="submit"]').click();

      await page.waitForSelector('.fixed:has-text("Message Sent")', { timeout: 10000 });

      assert(callCount === 0, `No request sent when modal honeypot is filled (calls: ${callCount})`);
      await page.close();
    }

  } finally {
    await browser.close();
    stopServer();
  }

  console.log(`\n==============================================`);
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log(`==============================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  stopServer();
  process.exit(1);
});
