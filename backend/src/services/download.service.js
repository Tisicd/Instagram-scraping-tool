import fs from "fs";
import path from "path";

export async function downloadImages(page, urls, outputDir = "downloads") {
  if (!Array.isArray(urls) || urls.length === 0) {
    return [];
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const files = [];

  for (let i = 0; i < urls.length; i += 1) {
    const imageUrl = urls[i];
    if (!imageUrl) continue;

    const response = await page.request.get(imageUrl);
    if (!response.ok()) continue;

    const buffer = await response.body();
    const filePath = path.join(outputDir, `post_${i + 1}.jpg`);
    fs.writeFileSync(filePath, buffer);
    files.push(filePath);
  }

  return files;
}