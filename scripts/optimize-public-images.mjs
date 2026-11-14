import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push({ file: fullPath, size: stat.size });
    }
  }
  return results;
}

const MAX_BYTES = 190 * 1024; // 190 KB limit (well below 200 KB)

async function optimizeImages() {
  const images = getFiles("public").filter(
    (f) => /\.(png|jpe?g)$/i.test(f.file) && f.size > MAX_BYTES
  );

  console.log(`Found ${images.length} images exceeding 190 KB in public/:\n`);

  for (const img of images) {
    console.log(`Optimizing ${img.file} (${(img.size / 1024).toFixed(1)} KB)...`);
    const ext = path.extname(img.file).toLowerCase();
    const inputBuffer = fs.readFileSync(img.file);

    const imageInstance = sharp(inputBuffer);
    const metadata = await imageInstance.metadata();

    let transform = sharp(inputBuffer);

    // Limit oversized dimensions
    if (metadata.width && metadata.width > 1600) {
      transform = transform.resize({ width: 1600, withoutEnlargement: true });
    }

    let outputBuffer;
    if (ext === ".png") {
      outputBuffer = await transform
        .png({ quality: 80, compressionLevel: 9, effort: 7 })
        .toBuffer();
    } else {
      outputBuffer = await transform
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
    }

    // If still over MAX_BYTES, resize further or reduce quality
    if (outputBuffer.length > MAX_BYTES) {
      let secondPass = sharp(inputBuffer);
      if (metadata.width && metadata.width > 1200) {
        secondPass = secondPass.resize({ width: 1200, withoutEnlargement: true });
      }
      if (ext === ".png") {
        outputBuffer = await secondPass
          .png({ quality: 70, compressionLevel: 9, palette: true })
          .toBuffer();
      } else {
        outputBuffer = await secondPass
          .jpeg({ quality: 72, mozjpeg: true })
          .toBuffer();
      }
    }

    // If still slightly over, third pass aggressive
    if (outputBuffer.length > MAX_BYTES) {
      let thirdPass = sharp(inputBuffer);
      if (metadata.width && metadata.width > 960) {
        thirdPass = thirdPass.resize({ width: 960, withoutEnlargement: true });
      }
      if (ext === ".png") {
        outputBuffer = await thirdPass
          .png({ quality: 60, compressionLevel: 9, palette: true })
          .toBuffer();
      } else {
        outputBuffer = await thirdPass
          .jpeg({ quality: 65, mozjpeg: true })
          .toBuffer();
      }
    }

    fs.writeFileSync(img.file, outputBuffer);
    console.log(`  -> New size: ${(outputBuffer.length / 1024).toFixed(1)} KB (reduction: ${(((img.size - outputBuffer.length) / img.size) * 100).toFixed(1)}%)`);
  }

  console.log("\nFinished optimizing public images.");
}

optimizeImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
