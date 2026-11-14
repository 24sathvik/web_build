#!/usr/bin/env node
import { execSync } from "node:child_process";
import path from "node:path";

// Ensure local node_modules/.bin is prepended to PATH for cross-platform resolution
const rootDir = process.cwd();
const binDir = path.join(rootDir, "node_modules", ".bin");
if (!process.env.PATH.split(path.delimiter).includes(binDir)) {
  process.env.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
}

function run(command, description) {
  if (description) {
    console.log(`\n==> ${description}...`);
  }
  execSync(command, { stdio: "inherit", env: process.env });
}

// 1. Always run validate-content.mjs first
run("node scripts/validate-content.mjs", "Validating content");

// 2. TinaCMS credentials and production indexing checks
const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID?.trim();
const token = process.env.TINA_TOKEN?.trim();
const hasCredentials = Boolean(clientId && token);
const allowIndexing = process.env.ALLOW_INDEXING === "true";

if (!hasCredentials) {
  if (allowIndexing) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ BUILD FAILED: ALLOW_INDEXING is 'true' but TinaCMS credentials");
    console.error("   (NEXT_PUBLIC_TINA_CLIENT_ID and/or TINA_TOKEN) are missing!");
    console.error("   A live production site must never ship without a working CMS login.");
    console.error("=".repeat(70) + "\n");
    process.exit(1);
  }

  console.warn("\n" + "=".repeat(70));
  console.warn("⚠️  WARNING: NEXT_PUBLIC_TINA_CLIENT_ID and/or TINA_TOKEN are missing!");
  console.warn("⚠️  Building TinaCMS in local offline mode (--local --skip-cloud-checks).");
  console.warn("⚠️  The /admin CMS will NOT be usable in this deployment.");
  console.warn("=".repeat(70) + "\n");

  run("tinacms build --local --skip-cloud-checks", "Building TinaCMS (offline fallback)");
} else {
  try {
    run("tinacms build", "Building TinaCMS (cloud production)");
  } catch (err) {
    console.warn("\n" + "=".repeat(70));
    console.warn("⚠️  TinaCMS cloud check failed (offline or test credentials).");
    console.warn("⚠️  Retrying TinaCMS build with --skip-cloud-checks...");
    console.warn("=".repeat(70) + "\n");
    run("tinacms build --skip-cloud-checks", "Building TinaCMS (cloud production with skip-cloud-checks)");
  }
}

// 3. Next.js build
run("next build", "Building Next.js application");

// 4. Generate chunks manifest
run("node scripts/generate-chunks-manifest.mjs", "Generating chunks manifest");

console.log("\n✅ Build completed successfully.\n");
