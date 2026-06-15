import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE = process.env.SCREENSHOT_BASE ?? "https://docmind-lite.vercel.app";
const OUT = path.resolve(__dirname, "../../public/images");

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "docmind-landing.png"), fullPage: false });

  const sampleBtn = page.getByRole("button", { name: /Explore with sample agreement/i });
  await sampleBtn.click();
  await page.waitForTimeout(8000);

  await page.screenshot({ path: path.join(OUT, "docmind-workspace.png"), fullPage: false });

  const suggestion = page.getByRole("button", { name: /Summarize the key terms/i });
  if (await suggestion.isVisible()) {
    await suggestion.click();
    await page.waitForTimeout(12000);
  }

  await page.screenshot({ path: path.join(OUT, "docmind-chat.png"), fullPage: false });

  const citation = page.locator("text=Page").first();
  if (await citation.isVisible()) {
    await page.screenshot({ path: path.join(OUT, "docmind-citations.png"), fullPage: false });
  } else {
    await page.screenshot({ path: path.join(OUT, "docmind-citations.png"), fullPage: false });
  }

  await browser.close();
  console.log("Screenshots saved to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
