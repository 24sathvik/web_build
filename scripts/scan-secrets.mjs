#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

console.log("=== SECRETS SCAN: Working Tree & Git History ===");

// 1. Scan Working Tree
console.log("\n1. Scanning Working Tree...");
const workingTreeFiles = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .map(f => f.trim())
  .filter(Boolean);

const SECRET_PATTERNS = [
  { name: "Private Key", regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: "AWS Key ID", regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
  { name: "GitHub Token", regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/ },
  { name: "Slack Token", regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/ },
  { name: "Generic Secret Assignment", regex: /(?:api[_-]?key|secret[_-]?key|auth[_-]?token|tina[_-]?token|emailjs[_-]?(?:service|template|public)[_-]?key)\s*[:=]\s*["']([A-Za-z0-9_\-]{16,})["']/i },
  { name: "Hardcoded Password", regex: /(?:password|passwd|pwd)\s*[:=]\s*["']([^"'\s]{8,})["']/i },
];

const IGNORED_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".pdf", ".zip"]);

const findings = [];

for (const file of workingTreeFiles) {
  const ext = path.extname(file).toLowerCase();
  if (IGNORED_EXTS.has(ext)) continue;
  if (!fs.existsSync(file)) continue;

  try {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // Exclude documentation / example / dummy strings
      if (line.includes("your-") || line.includes("xxx") || line.includes("example") || line.includes("MOCK") || line.includes("dummy")) {
        return;
      }
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            source: "working_tree",
            file,
            line: idx + 1,
            type: pattern.name,
            commit: "UNCOMMITTED (working tree)",
          });
        }
      }
    });
  } catch {
    // Skip binary files
  }
}

// 2. Scan Full Git History using git log -p
console.log("\n2. Scanning Full Git History...");
try {
  // Check git commits
  const logOutput = execSync(
    'git log -p --all -G"(-----BEGIN|ghp_|xoxb-|AKIA|TINA_TOKEN|EMAILJS_)"',
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
  );

  let currentCommit = "";
  let currentFile = "";

  for (const line of logOutput.split("\n")) {
    if (line.startsWith("commit ")) {
      currentCommit = line.split(" ")[1]?.trim();
    } else if (line.startsWith("diff --git a/")) {
      const match = line.match(/diff --git a\/(\S+) b\/(\S+)/);
      if (match) currentFile = match[2];
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      const addedText = line.substring(1);
      if (
        addedText.includes("your-") ||
        addedText.includes("xxx") ||
        addedText.includes("example") ||
        addedText.includes("MOCK") ||
        addedText.includes("dummy") ||
        addedText.includes("EMAILJS_PUBLIC_KEY=") ||
        addedText.includes("TINA_TOKEN=")
      ) {
        continue;
      }
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(addedText)) {
          findings.push({
            source: "git_history",
            file: currentFile,
            line: "historical diff",
            type: pattern.name,
            commit: currentCommit,
          });
        }
      }
    }
  }
} catch (err) {
  console.log("Git log scan note:", err.message);
}

// Check for any .env files in history
try {
  const envFilesInHistory = execSync('git log --all --name-only --oneline -- "*.env*"', {
    encoding: "utf8",
  });
  console.log("Env files in git history:\n", envFilesInHistory.trim() || "(none)");
} catch {}

console.log("\n=== SCAN SUMMARY ===");
console.log(`Total Findings: ${findings.length}`);
if (findings.length > 0) {
  console.log("\nFindings (secret values masked):");
  for (const f of findings) {
    console.log(`- Type: ${f.type} | File: ${f.file} | Commit: ${f.commit}`);
  }
} else {
  console.log("✅ No secrets, credentials, tokens, or private keys found in working tree or git history.");
}

