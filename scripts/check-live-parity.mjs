#!/usr/bin/env node
import fs from "node:fs";

const LIVE_SITEMAP_URL = "https://zyxen.in/sitemap.xml";
const LOCAL_BASE = process.env.LOCAL_BASE || "http://127.0.0.1:3000";

function extractTag(html, regex) {
  const match = html.match(regex);
  if (!match) return "";
  return match[1].replace(/\s+/g, " ").trim();
}

function extractMetaDesc(html) {
  const match1 = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (match1) return match1[1].replace(/\s+/g, " ").trim();
  const match2 = html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (match2) return match2[1].replace(/\s+/g, " ").trim();
  return "";
}

function extractTitle(html) {
  return extractTag(html, /<title[^>]*>([^<]*)<\/title>/i);
}

async function main() {
  console.log("Fetching live sitemap from:", LIVE_SITEMAP_URL);
  const sitemapXml = await fetch(LIVE_SITEMAP_URL, {
    headers: { "User-Agent": "Zyxen-Parity-Audit/1.0" },
  }).then((r) => r.text());

  const locMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  console.log(`Found ${locMatches.length} URLs in live sitemap.\n`);

  const results = [];

  for (const liveUrl of locMatches) {
    const parsed = new URL(liveUrl);
    const path = parsed.pathname;
    const localTargetUrl = `${LOCAL_BASE}${path}`;

    // 1. Fetch live page metadata
    let liveTitle = "";
    let liveDesc = "";
    let liveError = null;
    try {
      const liveRes = await fetch(liveUrl, {
        headers: { "User-Agent": "Zyxen-Parity-Audit/1.0" },
      });
      const liveHtml = await liveRes.text();
      liveTitle = extractTitle(liveHtml);
      liveDesc = extractMetaDesc(liveHtml);
    } catch (e) {
      liveError = e.message;
    }

    // 2. Fetch local target without auto-redirect to capture 308 if any
    let localStatus = 0;
    let finalUrl = localTargetUrl;
    let localTitle = "";
    let localDesc = "";
    let localError = null;

    try {
      const resInitial = await fetch(localTargetUrl, {
        redirect: "manual",
        headers: { "User-Agent": "Zyxen-Parity-Audit/1.0" },
      });
      localStatus = resInitial.status;

      if (resInitial.status === 301 || resInitial.status === 302 || resInitial.status === 307 || resInitial.status === 308) {
        const loc = resInitial.headers.get("location");
        finalUrl = loc ? (loc.startsWith("http") ? loc : `${LOCAL_BASE}${loc}`) : localTargetUrl;
        // Follow redirect to destination
        const resFinal = await fetch(finalUrl, {
          headers: { "User-Agent": "Zyxen-Parity-Audit/1.0" },
        });
        const finalHtml = await resFinal.text();
        localTitle = extractTitle(finalHtml);
        localDesc = extractMetaDesc(finalHtml);
      } else {
        const html = await resInitial.text();
        localTitle = extractTitle(html);
        localDesc = extractMetaDesc(html);
      }
    } catch (e) {
      localError = e.message;
    }

    results.push({
      liveUrl,
      path,
      liveTitle,
      liveDesc,
      liveError,
      localStatus,
      finalUrl,
      localTitle,
      localDesc,
      localError,
    });
  }

  // Print results
  console.log("=".repeat(80));
  console.log("URL PARITY RESULTS TABLE");
  console.log("=".repeat(80));
  console.log("| Old URL | New Status | Final URL | Parity Status |");
  console.log("| :--- | :--- | :--- | :--- |");
  for (const r of results) {
    const isOk = r.localStatus === 200 || r.localStatus === 308;
    console.log(`| ${r.liveUrl} | ${r.localStatus} | ${r.finalUrl} | ${isOk ? "✅ OK" : "❌ FAIL"} |`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("METADATA COMPARISON (Live vs New Build)");
  console.log("=".repeat(80));
  for (const r of results) {
    console.log(`\nRoute: ${r.path}`);
    console.log(`  Live Title:      ${r.liveTitle || "(none)"}`);
    console.log(`  New Title:       ${r.localTitle || "(none)"}`);
    console.log(`  Live Desc:       ${r.liveDesc || "(none)"}`);
    console.log(`  New Desc:        ${r.localDesc || "(none)"}`);
  }

  // Save report to JSON for clean embedding
  fs.writeFileSync(
    "url-parity-report.json",
    JSON.stringify(results, null, 2),
    "utf8"
  );
  console.log("\nSaved detailed report to url-parity-report.json");
}

main().catch(console.error);

