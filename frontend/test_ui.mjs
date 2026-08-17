import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/tmp/claude-1000/-home-apoorv-gupta-Documents-POC-Sentinel/3ebe83a5-7147-48f8-abce-cbbbfe9b192b/scratchpad/screenshots";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const consoleErrors = [];

async function shot(page, name) {
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`) });
  console.log(`screenshot: ${name}`);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  console.log("== navigating to localhost:5173 ==");
  await page.goto("http://localhost:5173");
  await page.waitForSelector("text=Sentinel — Requirement to Backlog");
  await shot(page, "01-loaded");

  console.log("== filling requirement text ==");
  await page.fill(
    "#requirement-text",
    "As a user, I want to sign in using my email address and password."
  );
  await shot(page, "02-filled");

  console.log("== submitting ==");
  await page.click('button[type="submit"]');

  console.log("== waiting for result (pending_review or completed) ==");
  await page.waitForSelector(
    "text=Review Required, text=Ready to Publish, text=Completed",
    { timeout: 60000 }
  ).catch(async () => {
    console.log("waitForSelector with commas failed, trying individual waits");
  });

  // Poll for one of the three possible next states
  let state = null;
  for (let i = 0; i < 60; i++) {
    const hasReview = await page.locator("text=Flagged Dependencies").count();
    const hasPublish = await page.locator("text=Ready to Publish").count();
    const hasCompleted = await page.locator("h2:has-text('Completed')").count();
    const hasError = await page.locator(".error").count();
    if (hasReview) { state = "dependency_review"; break; }
    if (hasPublish) { state = "publish_approval"; break; }
    if (hasCompleted) { state = "completed"; break; }
    if (hasError) { state = "error"; break; }
    await page.waitForTimeout(1000);
  }
  console.log("state after submit:", state);
  await shot(page, "03-after-submit");

  if (state === "error") {
    const errText = await page.locator(".error").textContent();
    console.log("ERROR TEXT:", errText);
  }

  if (state === "dependency_review") {
    console.log("== on dependency review, checking a box and submitting ==");
    const checkboxes = await page.locator('input[type="checkbox"]').count();
    console.log("checkbox count:", checkboxes);
    if (checkboxes > 0) {
      await page.locator('input[type="checkbox"]').first().check();
    }
    await page.click('button:has-text("Submit Review Decisions")');

    state = null;
    for (let i = 0; i < 60; i++) {
      const hasPublish = await page.locator("text=Ready to Publish").count();
      const hasCompleted = await page.locator("h2:has-text('Completed')").count();
      const hasError = await page.locator(".error").count();
      if (hasPublish) { state = "publish_approval"; break; }
      if (hasCompleted) { state = "completed"; break; }
      if (hasError) { state = "error"; break; }
      await page.waitForTimeout(1000);
    }
    console.log("state after dependency review:", state);
    await shot(page, "04-after-dependency-review");
  }

  if (state === "publish_approval") {
    console.log("== on publish approval, rejecting (avoid creating real Jira/Confluence items) ==");
    await page.click('button:has-text("Reject")');

    state = null;
    for (let i = 0; i < 30; i++) {
      const hasCompleted = await page.locator("h2:has-text('Completed')").count();
      if (hasCompleted) { state = "completed"; break; }
      await page.waitForTimeout(1000);
    }
    console.log("state after publish decision:", state);
    await shot(page, "05-after-publish-decision");
  }

  if (state === "completed") {
    const notPublished = await page.locator("text=Not published").count();
    console.log("shows not-published message:", notPublished > 0);
    await shot(page, "06-completed");
  }

  console.log("\n== console errors ==");
  console.log(consoleErrors.length ? consoleErrors : "none");

  await browser.close();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
