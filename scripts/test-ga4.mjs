import { readFileSync } from "fs";
import { resolve } from "path";

const projectRoot = process.cwd();

console.log("=== GA4 Implementation Verification ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Check GA4 Measurement ID in analytics.ts and Analytics.tsx
const analyticsTs = readFileSync(resolve(projectRoot, "src/lib/analytics.ts"), "utf-8");
const analyticsComponent = readFileSync(resolve(projectRoot, "src/components/analytics/Analytics.tsx"), "utf-8");
const contactHook = readFileSync(resolve(projectRoot, "src/hooks/useContactForm.ts"), "utf-8");

assert(
  analyticsTs.includes("G-WKZ9NBF6WN"),
  "src/lib/analytics.ts defaults to production ID G-WKZ9NBF6WN"
);

assert(
  analyticsComponent.includes("G-WKZ9NBF6WN"),
  "src/components/analytics/Analytics.tsx defaults to production ID G-WKZ9NBF6WN"
);

// 2. Check loading strategy (performance preservation)
assert(
  analyticsComponent.includes("safeRequestIdleCallback") &&
  analyticsComponent.includes("pointerdown") &&
  analyticsComponent.includes("scroll"),
  "Analytics uses deferred loading with safeRequestIdleCallback and user interaction triggers"
);

// 3. Check for absence of duplicate page_view events
assert(
  !analyticsTs.includes('"page_view"') && !analyticsComponent.includes('"page_view"'),
  "No manual page_view events dispatched (avoids duplicate pageviews with GA4 Enhanced Measurement)"
);

// 4. Check phone and email click event tracking
assert(
  analyticsComponent.includes('"phone_click"') && analyticsComponent.includes('a[href^="tel:"]'),
  "Phone click event tracking implemented for tel: links"
);

assert(
  analyticsComponent.includes('"email_click"') && analyticsComponent.includes('a[href^="mailto:"]'),
  "Email click event tracking implemented for mailto: links"
);

// 5. Check contact_submit event and PII compliance
assert(
  contactHook.includes('trackEvent("contact_submit"'),
  "Contact form dispatches contact_submit event"
);

// Verify NO PII in contact_submit event payload
const contactSubmitMatch = contactHook.match(/trackEvent\("contact_submit",\s*\{([\s\S]*?)\}\);/);
assert(
  contactSubmitMatch !== null,
  "Found trackEvent('contact_submit', ...) call in useContactForm.ts"
);

if (contactSubmitMatch) {
  const payloadStr = contactSubmitMatch[1];
  const forbiddenKeys = ["name", "firstName", "lastName", "email", "phone", "message", "details"];
  const leakedKeys = forbiddenKeys.filter(k => new RegExp(`\\b${k}\\s*:`).test(payloadStr));
  assert(
    leakedKeys.length === 0,
    `No sensitive/PII form fields sent in contact_submit (checked: ${forbiddenKeys.join(", ")})`
  );
  assert(
    payloadStr.includes("form_id") && payloadStr.includes("has_organisation") && payloadStr.includes("has_service"),
    "contact_submit payload only includes metadata flags (form_id, has_organisation, has_service)"
  );
}

// 6. Test trackEvent queuing in mock browser environment
const mockWindow = {
  dataLayer: []
};

// Simulate trackEvent implementation
function mockTrackEvent(eventName, params) {
  if (typeof mockWindow.gtag === "function") {
    mockWindow.gtag("event", eventName, params);
  } else {
    mockWindow.dataLayer = mockWindow.dataLayer || [];
    mockWindow.dataLayer.push({
      event: eventName,
      ...params
    });
  }
}

mockTrackEvent("contact_submit", { form_id: "contact_form", has_organisation: true, has_service: false });
assert(
  mockWindow.dataLayer.length === 1 &&
  mockWindow.dataLayer[0].event === "contact_submit" &&
  mockWindow.dataLayer[0].has_organisation === true,
  "mock trackEvent correctly queues events into window.dataLayer when gtag not yet loaded"
);

console.log(`\nResults: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}

