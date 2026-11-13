#!/usr/bin/env node

/**
 * ZYXEN Automated SEO, Metadata & Structured Data Audit
 * Verifies sitemap URLs, HTTP 200, title/desc constraints, single h1,
 * canonicals, Open Graph, Twitter cards, html lang, valid JSON-LD schemas,
 * image alts, internal link resolution, llms.txt, and RSS feed.
 */

const BASE_URL = process.env.AUDIT_BASE_URL || "http://localhost:3000";
const SITE_DOMAIN = "zyxen.in";

let totalErrors = 0;
function logPass(msg) {
  console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
}
function logFail(msg) {
  console.error(`  \x1b[31m✖ [FAIL]\x1b[0m ${msg}`);
  totalErrors++;
}
function logSection(title) {
  console.log(`\n\x1b[1m\x1b[36m▶ ${title}\x1b[0m`);
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  return await res.text();
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function parseSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1].trim());
}

function extractAttr(html, tagRegex, attr) {
  const tagMatch = html.match(tagRegex);
  if (!tagMatch) return null;
  const attrMatch = tagMatch[0].match(new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, "i"));
  return attrMatch ? attrMatch[1] : null;
}

function extractAllJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemas = [];
  for (const s of scripts) {
    try {
      const data = JSON.parse(s[1]);
      schemas.push(data);
    } catch (e) {
      logFail(`JSON-LD syntax parse error: ${e.message}`);
    }
  }
  return schemas;
}

function collectTypes(obj, types = new Set()) {
  if (!obj || typeof obj !== "object") return types;
  if (Array.isArray(obj)) {
    obj.forEach((item) => collectTypes(item, types));
    return types;
  }
  if (obj["@type"]) {
    if (Array.isArray(obj["@type"])) {
      obj["@type"].forEach((t) => types.add(t));
    } else {
      types.add(obj["@type"]);
    }
  }
  if (obj["@graph"] && Array.isArray(obj["@graph"])) {
    obj["@graph"].forEach((item) => collectTypes(item, types));
  }
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object") {
      collectTypes(obj[key], types);
    }
  }
  return types;
}

async function runAudit() {
  console.log(`Starting SEO Audit against ${BASE_URL}...`);

  // 1. Audit /sitemap.xml
  logSection("1. Sitemap Discovery & Validation");
  let sitemapXml;
  try {
    sitemapXml = await fetchText(`${BASE_URL}/sitemap.xml`);
    logPass("Fetched /sitemap.xml with 200 OK");
  } catch (err) {
    logFail(`Failed to fetch /sitemap.xml: ${err.message}`);
    process.exit(1);
  }

  const sitemapUrls = parseSitemapUrls(sitemapXml);
  if (sitemapUrls.length === 0) {
    logFail("Sitemap is empty or failed to parse <loc> tags");
    process.exit(1);
  }
  logPass(`Discovered ${sitemapUrls.length} URLs in sitemap`);

  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const internalLinksToCheck = new Set();

  // 2. Audit Each URL in Sitemap
  logSection("2. Auditing Pages for Metadata, Schema & HTML Hygiene");
  for (const rawUrl of sitemapUrls) {
    const parsed = new URL(rawUrl);
    const localUrl = `${BASE_URL}${parsed.pathname}`;
    console.log(`\nTesting: \x1b[33m${parsed.pathname}\x1b[0m`);

    let html;
    try {
      const res = await fetch(localUrl);
      if (res.status !== 200) {
        logFail(`${parsed.pathname} returned status ${res.status}`);
        continue;
      }
      logPass(`Status 200 OK`);
      html = await res.text();
    } catch (err) {
      logFail(`Fetch error for ${parsed.pathname}: ${err.message}`);
      continue;
    }

    // 2a. HTML Lang
    const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
    if (langMatch && langMatch[1] === "en-IN") {
      logPass(`HTML lang="en-IN"`);
    } else {
      logFail(`HTML lang missing or invalid: found "${langMatch ? langMatch[1] : "none"}", expected "en-IN"`);
    }

    // 2b. Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    if (!title) {
      logFail(`Missing <title> tag`);
    } else {
      const decodedTitle = decodeHtmlEntities(title);
      if (decodedTitle.length > 60 || title.length > 60) {
        logFail(`Title length > 60 chars (decoded ${decodedTitle.length}, raw ${title.length}): "${decodedTitle}"`);
      } else {
        logPass(`Title (length ${decodedTitle.length}): "${decodedTitle}"`);
      }
      if (seenTitles.has(decodedTitle)) {
        logFail(`Duplicate title found on ${parsed.pathname} (matches ${seenTitles.get(decodedTitle)})`);
      } else {
        seenTitles.set(decodedTitle, parsed.pathname);
      }
    }

    // 2c. Meta Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i) ||
      html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']/i);
    const desc = descMatch ? descMatch[1].trim() : "";
    if (!desc) {
      logFail(`Missing <meta name="description"> tag`);
    } else {
      const decodedDesc = decodeHtmlEntities(desc);
      if (decodedDesc.length < 70 || decodedDesc.length > 160) {
        logFail(`Description outside 70-160 range (${decodedDesc.length} chars): "${decodedDesc}"`);
      } else {
        logPass(`Description (length ${decodedDesc.length} chars)`);
      }
      if (seenDescriptions.has(decodedDesc)) {
        logFail(`Duplicate description found on ${parsed.pathname} (matches ${seenDescriptions.get(decodedDesc)})`);
      } else {
        seenDescriptions.set(decodedDesc, parsed.pathname);
      }
    }

    // 2d. Heading Hierarchy & Single <h1>
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1Matches.length === 1) {
      const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, "").trim();
      if (h1Text.length > 0) {
        logPass(`Single <h1> verified: "${h1Text.slice(0, 50)}..."`);
      } else {
        logFail(`<h1> is empty`);
      }
    } else {
      logFail(`Expected exactly 1 <h1> tag, found ${h1Matches.length}`);
    }

    // 2e. Canonical Link
    const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i) ||
      html.match(/<link\s+href=["']([^"']*)["']\s+rel=["']canonical["']/i);
    const canonical = canonMatch ? canonMatch[1].trim() : "";
    if (!canonical) {
      logFail(`Missing canonical tag`);
    } else {
      const normalizedCanon = canonical.replace(/^https?:\/\/[^\/]+/, "");
      const normalizedPath = parsed.pathname.replace(/\/$/, "");
      const targetCanon = normalizedCanon.replace(/\/$/, "");
      if (targetCanon === normalizedPath || (targetCanon === "" && normalizedPath === "")) {
        logPass(`Self-referencing canonical verified: ${canonical}`);
      } else {
        logFail(`Canonical mismatch: page=${parsed.pathname}, canonical=${canonical}`);
      }
    }

    // 2f. Open Graph & Twitter Tags
    const ogTitle = extractAttr(html, /<meta[^>]*property=["']og:title["'][^>]*>/i, "content");
    const ogDesc = extractAttr(html, /<meta[^>]*property=["']og:description["'][^>]*>/i, "content");
    const ogImage = extractAttr(html, /<meta[^>]*property=["']og:image["'][^>]*>/i, "content");
    const ogUrl = extractAttr(html, /<meta[^>]*property=["']og:url["'][^>]*>/i, "content");

    if (ogTitle && ogDesc && ogImage && ogUrl) {
      logPass(`Open Graph tags verified (og:title, og:description, og:image, og:url)`);
    } else {
      logFail(`Missing Open Graph tags: ${JSON.stringify({ ogTitle: !!ogTitle, ogDesc: !!ogDesc, ogImage: !!ogImage, ogUrl: !!ogUrl })}`);
    }

    const twitterCard = extractAttr(html, /<meta[^>]*name=["']twitter:card["'][^>]*>/i, "content");
    const twitterTitle = extractAttr(html, /<meta[^>]*name=["']twitter:title["'][^>]*>/i, "content");
    const twitterImage = extractAttr(html, /<meta[^>]*name=["']twitter:image["'][^>]*>/i, "content");

    if (twitterCard && (twitterTitle || ogTitle) && (twitterImage || ogImage)) {
      logPass(`Twitter card tags verified`);
    } else {
      logFail(`Missing Twitter card tags`);
    }

    // 2g. JSON-LD Schemas
    const schemas = extractAllJsonLd(html);
    const types = new Set();
    schemas.forEach((s) => collectTypes(s, types));

    if (!types.has("Organization") || (!types.has("ProfessionalService") && !types.has("LocalBusiness"))) {
      logFail(`Missing root layout schema (Organization + ProfessionalService/LocalBusiness)`);
    } else {
      logPass(`Layout schema verified: Organization, ProfessionalService/LocalBusiness`);
    }

    // Inner pages require BreadcrumbList
    if (parsed.pathname !== "/") {
      if (types.has("BreadcrumbList")) {
        logPass(`BreadcrumbList schema verified`);
      } else {
        logFail(`Missing BreadcrumbList schema on inner page ${parsed.pathname}`);
      }
    }

    // Specific route schema checks
    if (parsed.pathname === "/services") {
      if (types.has("Service")) {
        logPass(`Service schema verified on /services`);
      } else {
        logFail(`Missing Service schema on /services`);
      }
    } else if (parsed.pathname === "/aviation-academy-software") {
      if (types.has("Service") && types.has("FAQPage") && types.has("SoftwareApplication")) {
        logPass(`Service, FAQPage, and SoftwareApplication schemas verified on /aviation-academy-software`);
      } else {
        logFail(`Missing schemas on /aviation-academy-software: Service=${types.has("Service")}, FAQPage=${types.has("FAQPage")}, SoftwareApplication=${types.has("SoftwareApplication")}`);
      }
    } else if (parsed.pathname === "/technology") {
      if (types.has("Service") && types.has("SoftwareApplication")) {
        logPass(`Service and SoftwareApplication schemas verified on /technology`);
      } else {
        logFail(`Missing schemas on /technology: Service=${types.has("Service")}, SoftwareApplication=${types.has("SoftwareApplication")}`);
      }
    } else if (parsed.pathname.startsWith("/blogs/")) {
      if (types.has("BlogPosting")) {
        logPass(`BlogPosting schema verified on ${parsed.pathname}`);
      } else {
        logFail(`Missing BlogPosting schema on ${parsed.pathname}`);
      }
    }

    // 2h. Images with alt
    const imgTags = [...html.matchAll(/<img[^>]*>/gi)];
    let imgAltFailures = 0;
    for (const tag of imgTags) {
      const altMatch = tag[0].match(/alt=["']([^"']*)["']/i);
      if (!altMatch || altMatch[1].trim() === "") {
        logFail(`Image missing alt in ${parsed.pathname}: ${tag[0].slice(0, 80)}`);
        imgAltFailures++;
      }
    }
    if (imgAltFailures === 0 && imgTags.length > 0) {
      logPass(`All ${imgTags.length} images have non-empty alt attributes`);
    }

    // 2i. Collect internal links
    const linkMatches = [...html.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi)];
    for (const lm of linkMatches) {
      const href = lm[1].trim();
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        continue;
      }
      if (href.startsWith("/")) {
        internalLinksToCheck.add(href.split("#")[0]);
      } else if (href.startsWith("http://") || href.startsWith("https://")) {
        try {
          const u = new URL(href);
          if (u.hostname === SITE_DOMAIN || u.hostname === `www.${SITE_DOMAIN}` || u.hostname === "localhost") {
            internalLinksToCheck.add(u.pathname);
          }
        } catch {}
      }
    }
  }

  // 3. Verify All Internal Links Resolve with 200 OK
  logSection(`3. Verifying All Discovered Internal Links (${internalLinksToCheck.size} unique URLs)`);
  for (const path of internalLinksToCheck) {
    if (!path) continue;
    const testUrl = `${BASE_URL}${path}`;
    try {
      const res = await fetch(testUrl);
      if (res.status === 200) {
        logPass(`Link ${path} -> 200 OK`);
      } else {
        logFail(`Internal link ${path} returned HTTP ${res.status}`);
      }
    } catch (err) {
      logFail(`Internal link ${path} failed: ${err.message}`);
    }
  }

  // 4. Verify /llms.txt
  logSection("4. Verifying /llms.txt");
  try {
    const text = await fetchText(`${BASE_URL}/llms.txt`);
    if (text.includes("ZYXEN") && text.includes("https://zyxen.in")) {
      logPass(`/llms.txt returned valid text (${text.length} bytes)`);
    } else {
      logFail(`/llms.txt missing expected content`);
    }
  } catch (err) {
    logFail(`Failed to fetch /llms.txt: ${err.message}`);
  }

  // 5. Verify /blogs/feed.xml
  logSection("5. Verifying /blogs/feed.xml (RSS)");
  try {
    const xml = await fetchText(`${BASE_URL}/blogs/feed.xml`);
    if (xml.includes("<rss") && xml.includes("<channel>") && xml.includes("<item>")) {
      logPass(`/blogs/feed.xml returned valid RSS feed (${xml.length} bytes)`);
    } else {
      logFail(`/blogs/feed.xml missing expected RSS elements`);
    }
  } catch (err) {
    logFail(`Failed to fetch /blogs/feed.xml: ${err.message}`);
  }

  // Final Summary
  console.log("\n==============================================");
  if (totalErrors === 0) {
    console.log(`\x1b[32m✔ ALL SEO AUDIT CHECKS PASSED PERFECTLY!\x1b[0m`);
    console.log("==============================================\n");
    process.exit(0);
  } else {
    console.error(`\x1b[31m✖ SEO AUDIT FAILED WITH ${totalErrors} ERROR(S)!\x1b[0m`);
    console.log("==============================================\n");
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error("Fatal audit script crash:", err);
  process.exit(1);
});

