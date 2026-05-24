import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "screenshots");
const baseUrl = process.env.GAME_URL || "http://localhost:8080";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: join(outDir, "01-menu.png") });

await page.click("#start-btn");
await page.waitForTimeout(1500);
await page.screenshot({ path: join(outDir, "02-gameplay.png") });

await page.keyboard.press("Space");
await page.waitForTimeout(200);
await page.keyboard.press("Space");
await page.waitForTimeout(400);
await page.screenshot({ path: join(outDir, "03-shooting.png") });

await browser.close();
console.log("Screenshots saved to", outDir);
