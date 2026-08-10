// @ts-check
const { test, expect } = require("@playwright/test");

// Requirement 17 (docs/hugo-theme-refresh/): a reading-progress bar on blog post
// pages. Blowfish ships no such feature natively -- this is a real, hand-built
// addition (layouts/partials/extend-footer.html), so it needs real coverage, not
// an assumption that "the theme handles it."
const POST = "/blog/secure-services-docker-compose-and-nordvpn/";

test.describe("Reading-progress bar", () => {
  test("starts at 0% width at the top of a blog post", async ({ page }) => {
    await page.goto(POST);
    // The track (parent) is the visible container -- check that. The bar itself
    // genuinely has zero rendered area at 0% width, so toBeVisible() on it here
    // would fail correctly-but-uninformatively; check its width numerically instead.
    const track = page.locator("#reading-progress-track");
    await expect(track).toBeVisible();
    const bar = page.locator("#reading-progress-bar");
    await expect
      .poll(async () => parseFloat(await bar.evaluate((el) => el.style.width)) || 0)
      .toBeLessThan(2); // allow tiny rounding, should read ~0%
  });

  test("advances as the reader scrolls through the article", async ({ page }) => {
    await page.goto(POST);
    const bar = page.locator("#reading-progress-bar");
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(200);
    const widthAfterScroll = parseFloat(await bar.evaluate((el) => el.style.width));
    expect(widthAfterScroll).toBeGreaterThan(5);
    expect(widthAfterScroll).toBeLessThan(100);
  });

  test("reaches (or nears) 100% at the bottom of the article", async ({ page }) => {
    await page.goto(POST);
    const bar = page.locator("#reading-progress-bar");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(200);
    const widthAtBottom = parseFloat(await bar.evaluate((el) => el.style.width));
    expect(widthAtBottom).toBeGreaterThanOrEqual(95);
  });

  test("stays hidden and inert on the homepage (no .article-content there)", async ({ page }) => {
    await page.goto("/");
    const track = page.locator("#reading-progress-track");
    await expect(track).toHaveClass(/rp-hidden/);
    await expect(track).toBeHidden();
  });
});
