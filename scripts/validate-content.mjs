#!/usr/bin/env node
import fs from "fs";
import path from "path";

const blogDir = path.join(process.cwd(), "content", "blog");
const publicDir = path.join(process.cwd(), "public");

if (!fs.existsSync(blogDir)) {
  console.log("No content/blog directory found. Skipping content validation.");
  process.exit(0);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".json"));
const errors = [];
const publishedSlugs = new Map();

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let rawContent;
  try {
    rawContent = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    errors.push(`[${file}] Unable to read file: ${err.message}`);
    continue;
  }

  let post;
  try {
    post = JSON.parse(rawContent);
  } catch (err) {
    errors.push(`[${file}] Invalid JSON: ${err.message}`);
    continue;
  }

  // Check required fields: slug, title, date, excerpt, content
  const requiredFields = ["slug", "title", "date", "excerpt", "content"];
  const missing = requiredFields.filter(
    (field) => post[field] === undefined || post[field] === null || String(post[field]).trim() === ""
  );
  if (missing.length > 0) {
    errors.push(`[${file}] Missing or empty required field(s): ${missing.join(", ")}`);
  }

  // Validate date format YYYY-MM-DD
  if (post.date && !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
    errors.push(`[${file}] Invalid date format "${post.date}". Date must be in YYYY-MM-DD format.`);
  }

  const isPublished = post.published === true;
  const image = post.coverImage || post.image;

  // Published post image requirement
  if (isPublished && (!image || typeof image !== "string" || !image.trim())) {
    errors.push(`[${file}] Published post must have an image (coverImage or image field).`);
  }

  // Duplicate published slug check
  if (isPublished && post.slug) {
    if (publishedSlugs.has(post.slug)) {
      errors.push(
        `Duplicate published slug "${post.slug}" found in both "${file}" and "${publishedSlugs.get(post.slug)}".`
      );
    } else {
      publishedSlugs.set(post.slug, file);
    }
  }

  // Check coverImage exists on disk if it points to a local file
  const checkImagePath = (imgPath, fieldName) => {
    if (typeof imgPath === "string" && imgPath.trim()) {
      if (!imgPath.startsWith("http://") && !imgPath.startsWith("https://")) {
        const relativePath = imgPath.replace(/^\//, "");
        const diskPath = path.join(publicDir, relativePath);
        if (!fs.existsSync(diskPath)) {
          errors.push(
            `[${file}] ${fieldName} points to "${imgPath}" which does not exist on disk at public/${relativePath}.`
          );
        }
      }
    }
  };

  if (post.coverImage) {
    checkImagePath(post.coverImage, "coverImage");
  }
  if (post.image) {
    checkImagePath(post.image, "image");
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Content validation failed with ${errors.length} error(s):`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(`✅ Content validation passed: ${files.length} blog post(s) validated.`);
process.exit(0);
