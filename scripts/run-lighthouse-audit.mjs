import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";

const CANVAS_ROUTES = new Set([
  "/",
  "/about",
  "/services",
  "/technology",
  "/projects",
  "/aviation-academy-software",
  "/blogs",
  "/contact",
]);

const ROUTES = [
  { path: "/", isDraft: false },
  { path: "/about", isDraft: false },
  { path: "/services", isDraft: false },
  { path: "/technology", isDraft: false },
  { path: "/projects", isDraft: false },
  { path: "/aviation-academy-software", isDraft: false },
  { path: "/blogs", isDraft: false },
  { path: "/blogs/signs-website-losing-customers", isDraft: false },
  { path: "/contact", isDraft: false },
  { path: "/privacy-policy", isDraft: false },
  { path: "/aviation-exam-portal-software", isDraft: true },
  { path: "/fee-and-finance-software-for-academies", isDraft: true },
  { path: "/admission-management-software", isDraft: true },
  { path: "/erp-for-educational-institutes", isDraft: true },
  { path: "/web-development-hyderabad", isDraft: true },
  { path: "/production-management-software-pharma", isDraft: true },
];

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function worst(arr, higherIsBetter = true) {
  if (arr.length === 0) return 0;
  return higherIsBetter ? Math.min(...arr) : Math.max(...arr);
}

const RUNS_PER_ROUTE = parseInt(process.env.LH_RUNS || "3", 10);

console.log("=== RUNNING AUTOMATED LIGHTHOUSE AUDIT MATRIX ===");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Runs per route: ${RUNS_PER_ROUTE}`);
console.log(`Modes: mobile and desktop`);
console.log(`Routes: ${ROUTES.length} routes\n`);

const results = [];

async function auditRoute(routeObj, mode, tierOverride) {
  const isDesktop = mode === "desktop";
  const hasCanvas = CANVAS_ROUTES.has(routeObj.path);

  let query = "";
  if (hasCanvas && tierOverride) {
    query = `?tier=${tierOverride}`;
  }
  const url = `${BASE_URL}${routeObj.path}${query}`;
  const label = tierOverride ? `${mode} (${tierOverride})` : mode;
  console.log(`Auditing [${label.toUpperCase()}] ${routeObj.path} (${RUNS_PER_ROUTE} runs)...`);

  const runScores = {
    perf: [],
    a11y: [],
    bp: [],
    seo: [],
    lcp: [],
    tbt: [],
    cls: [],
  };

  for (let r = 1; r <= RUNS_PER_ROUTE; r++) {
    process.stdout.write(`  Run ${r}/${RUNS_PER_ROUTE}... `);
    const uniqueTemp = path.resolve(`lh-temp-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    try {
      const desktopFlags = isDesktop ? "--preset=desktop" : "";
      const cmd = `npx lighthouse "${url}" --output=json --output-path="${uniqueTemp}" --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox" --quiet ${desktopFlags}`;
      execSync(cmd, { stdio: "pipe", maxBuffer: 10 * 1024 * 1024 });

      if (fs.existsSync(uniqueTemp)) {
        const data = JSON.parse(fs.readFileSync(uniqueTemp, "utf8"));
        const perf = Math.round((data.categories.performance?.score || 0) * 100);
        const a11y = Math.round((data.categories.accessibility?.score || 0) * 100);
        const bp = Math.round((data.categories["best-practices"]?.score || 0) * 100);
        const seo = Math.round((data.categories.seo?.score || 0) * 100);
        const lcp = (data.audits["largest-contentful-paint"]?.numericValue || 0) / 1000;
        const tbt = data.audits["total-blocking-time"]?.numericValue || 0;
        const cls = data.audits["cumulative-layout-shift"]?.numericValue || 0;

        runScores.perf.push(perf);
        runScores.a11y.push(a11y);
        runScores.bp.push(bp);
        runScores.seo.push(seo);
        runScores.lcp.push(lcp);
        runScores.tbt.push(tbt);
        runScores.cls.push(cls);

        console.log(`Perf: ${perf} | A11y: ${a11y} | BP: ${bp} | SEO: ${seo} | LCP: ${lcp.toFixed(2)}s | TBT: ${tbt.toFixed(0)}ms | CLS: ${cls.toFixed(3)}`);
      } else {
        console.log("Failed to produce report");
      }
    } catch (err) {
      console.log(`Error: ${err.message.slice(0, 100)}`);
    } finally {
      if (fs.existsSync(uniqueTemp)) {
        try { fs.unlinkSync(uniqueTemp); } catch {}
      }
    }
  }

  const summary = {
    route: routeObj.path,
    isDraft: routeObj.isDraft,
    mode: label,
    perfMedian: median(runScores.perf),
    perfWorst: worst(runScores.perf, true),
    a11yMedian: median(runScores.a11y),
    a11yWorst: worst(runScores.a11y, true),
    bpMedian: median(runScores.bp),
    bpWorst: worst(runScores.bp, true),
    seoMedian: median(runScores.seo),
    seoWorst: worst(runScores.seo, true),
    lcpMedian: median(runScores.lcp),
    lcpWorst: worst(runScores.lcp, false),
    tbtMedian: median(runScores.tbt),
    tbtWorst: worst(runScores.tbt, false),
    clsMedian: median(runScores.cls),
    clsWorst: worst(runScores.cls, false),
  };

  results.push(summary);
}

async function run() {
  // Mobile (Lite tier for canvas routes, standard for static routes)
  console.log(`\n=======================================================`);
  console.log(`STARTING LIGHTHOUSE AUDIT FOR: MOBILE (LITE / DEFAULT)`);
  console.log(`=======================================================\n`);
  for (const route of ROUTES) {
    await auditRoute(route, "mobile", "lite");
  }

  // Mobile (Static tier for canvas routes to verify Performance >= 90)
  console.log(`\n=======================================================`);
  console.log(`STARTING LIGHTHOUSE AUDIT FOR: MOBILE (STATIC TIER)`);
  console.log(`=======================================================\n`);
  for (const route of ROUTES.filter(r => CANVAS_ROUTES.has(r.path))) {
    await auditRoute(route, "mobile", "static");
  }

  // Desktop (Lite tier for canvas routes, standard for static routes)
  console.log(`\n=======================================================`);
  console.log(`STARTING LIGHTHOUSE AUDIT FOR: DESKTOP (LITE / DEFAULT)`);
  console.log(`=======================================================\n`);
  for (const route of ROUTES) {
    await auditRoute(route, "desktop", "lite");
  }

  console.log("\n=======================================================");
  console.log("FINAL LIGHTHOUSE AUDIT REPORT (MEDIAN & WORST)");
  console.log("=======================================================\n");

  console.log("ROUTE".padEnd(42) + "MODE".padEnd(16) + "PERF (Med/Wst)".padEnd(16) + "A11Y (Med/Wst)".padEnd(16) + "BP (Med/Wst)".padEnd(14) + "SEO (Med/Wst)".padEnd(15) + "LCP (s)".padEnd(14) + "TBT (ms)".padEnd(14) + "CLS");
  console.log("-".repeat(140));

  for (const r of results) {
    const perfStr = `${r.perfMedian}/${r.perfWorst}`;
    const a11yStr = `${r.a11yMedian}/${r.a11yWorst}`;
    const bpStr = `${r.bpMedian}/${r.bpWorst}`;
    const seoStr = `${r.seoMedian}/${r.seoWorst}` + (r.isDraft ? " [draft]" : "");
    const lcpStr = `${r.lcpMedian.toFixed(2)}s/${r.lcpWorst.toFixed(2)}s`;
    const tbtStr = `${r.tbtMedian.toFixed(0)}/${r.tbtWorst.toFixed(0)}`;
    const clsStr = `${r.clsMedian.toFixed(3)}/${r.clsWorst.toFixed(3)}`;

    console.log(
      r.route.padEnd(42) +
      r.mode.padEnd(16) +
      perfStr.padEnd(16) +
      a11yStr.padEnd(16) +
      bpStr.padEnd(14) +
      seoStr.padEnd(15) +
      lcpStr.padEnd(14) +
      tbtStr.padEnd(14) +
      clsStr
    );
  }

  // Save report to JSON file
  fs.writeFileSync("lighthouse-audit-summary.json", JSON.stringify(results, null, 2), "utf8");
  console.log("\nReport saved to lighthouse-audit-summary.json");
}

run();
