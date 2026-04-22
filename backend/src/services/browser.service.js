import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeCookies } from "../utils/cookieNormalizer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COOKIES_PATH = path.resolve(__dirname, "../config/cookies.json");

export async function createBrowser() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const cookieContent = fs.readFileSync(COOKIES_PATH, "utf-8");
  const cookies = normalizeCookies(JSON.parse(cookieContent));

  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  const page = await context.newPage();
  return { browser, context, page };
}