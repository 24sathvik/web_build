import fs from "node:fs";

function extractVerifyLines(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const results = [];
  lines.forEach((line, idx) => {
    if (line.includes("// VERIFY")) {
      const match = line.match(/\/\/\s*VERIFY(?::\s*(.*))?$/);
      const note = match && match[1] ? match[1].trim() : "";
      let content = line.replace(/\/\/\s*VERIFY.*$/, "").trim();
      content = content.replace(/^['"`]|['"`,]+$/g, "").trim();
      results.push({ lineNum: idx + 1, content, note, file: filePath });
    }
  });
  return results;
}

const siteVerifies = extractVerifyLines("src/content/site.ts");
const solutionVerifies = extractVerifyLines("src/content/solutions.ts");
const blogVerifies = extractVerifyLines("src/app/blogs/[slug]/page.tsx");

// Grouping logic
const groups = {
  "Home Page (`/`)": [],
  "About Page (`/about`)": [],
  "Services Page (`/services`)": [],
  "Projects Page (`/projects`)": [],
  "Aviation Academy Software Page (`/aviation-academy-software`)": [],
  "Solution: Aviation Exam Portal Software (`/aviation-exam-portal-software`)": [],
  "Solution: Fee & Finance Software for Academies (`/fee-and-finance-software-for-academies`)": [],
  "Solution: Admission Management Software (`/admission-management-software`)": [],
  "Solution: ERP for Educational Institutes (`/erp-for-educational-institutes`)": [],
  "Solution: Pharma Production Management Software (`/production-management-software-pharma`)": [],
  "Blog Post Template CTA (`/blogs/[slug]`)": [],
};

for (const item of siteVerifies) {
  if (item.lineNum < 255) {
    groups["Home Page (`/`)"].push(item);
  } else if (item.lineNum < 287) {
    groups["About Page (`/about`)"].push(item);
  } else if (item.lineNum < 349) {
    groups["Services Page (`/services`)"].push(item);
  } else if (item.lineNum < 451) {
    groups["Projects Page (`/projects`)"].push(item);
  } else {
    groups["Aviation Academy Software Page (`/aviation-academy-software`)"].push(item);
  }
}

for (const item of solutionVerifies) {
  if (item.lineNum < 198) {
    groups["Solution: Aviation Exam Portal Software (`/aviation-exam-portal-software`)"].push(item);
  } else if (item.lineNum < 337) {
    groups["Solution: Fee & Finance Software for Academies (`/fee-and-finance-software-for-academies`)"].push(item);
  } else if (item.lineNum < 476) {
    groups["Solution: Admission Management Software (`/admission-management-software`)"].push(item);
  } else if (item.lineNum < 614) {
    groups["Solution: ERP for Educational Institutes (`/erp-for-educational-institutes`)"].push(item);
  } else if (item.lineNum < 754) {
    // web development if any
    if (!groups["Solution: Web Development Hyderabad (`/web-development-hyderabad`)"]) {
      groups["Solution: Web Development Hyderabad (`/web-development-hyderabad`)"] = [];
    }
    groups["Solution: Web Development Hyderabad (`/web-development-hyderabad`)"].push(item);
  } else {
    groups["Solution: Pharma Production Management Software (`/production-management-software-pharma`)"].push(item);
  }
}

for (const item of blogVerifies) {
  groups["Blog Post Template CTA (`/blogs/[slug]`)"].push(item);
}

let totalClaims = 0;
for (const list of Object.values(groups)) {
  totalClaims += list.length;
}

let markdown = `# ZYXEN Product & Capability Claims Review Checklist

> **Purpose:** Internal audit checklist of all capability claims, performance statements, and product feature assertions across the website. Each item corresponds to a \`// VERIFY\` tag in the codebase.
> **Total Claims Listed:** ${totalClaims}
> **Instructions for Reviewer:** Check (\`- [x]\`) each claim once verified with the engineering/delivery team or customer contracts. If a claim cannot be verified, delete or hedge it in the source file.

`;

for (const [groupName, items] of Object.entries(groups)) {
  if (items.length === 0) continue;
  markdown += `## ${groupName} (${items.length} claims)\n\n`;
  for (const item of items) {
    const noteText = item.note ? ` — *Verification Target:* ${item.note}` : "";
    // Clean up content preview
    let preview = item.content;
    if (preview.length > 140) {
      preview = preview.slice(0, 137) + "...";
    }
    markdown += `- [ ] \`${item.file}:${item.lineNum}\` ${preview}${noteText}\n`;
  }
  markdown += "\n";
}

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/claims-review.md", markdown);
console.log(`Successfully generated docs/claims-review.md with ${totalClaims} claims across ${Object.keys(groups).length} sections.`);
