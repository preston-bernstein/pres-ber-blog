// @ts-check
const { test, expect } = require("@playwright/test");

// Requirements 6, 8, 9 (docs/hugo-theme-refresh/): the migrated Hugoplate
// {{< image >}} shortcode calls render correctly under Blowfish, comments are
// wired up (not silently dropped), and analytics (GTM) fires.
const POST = "/blog/secure-services-docker-compose-and-nordvpn/";

test.describe("Blog post content surfaces", () => {
  test("all 4 migrated images render with real src and non-zero size", async ({ page }) => {
    await page.goto(POST);
    const images = page.locator(".article-content img");
    await expect(images).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const img = images.nth(i);
      // Blowfish's render-image hook sets loading="lazy" on every image (confirmed
      // in themes/blowfish/layouts/_default/_markup/render-image.html) -- images
      // off-screen have naturalWidth 0 until scrolled into view, so scroll first.
      await img.scrollIntoViewIfNeeded();
      await expect(img).toBeVisible();
      const box = await img.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
      await expect
        .poll(() => img.evaluate((el) => /** @type {HTMLImageElement} */ (el).naturalWidth))
        .toBeGreaterThan(0); // 0 means the browser failed to decode/load it
    }
  });

  test("all 3 originally-captioned images render inside a figure/figcaption", async ({ page }) => {
    // The 4 original Hugoplate {{< image >}} calls had captions on 3 of the 4
    // (dockerComposeWithVPNDiagram, secureNetworkCommunication, openVPN) and no
    // caption on the 4th (choosingAVPN) -- confirmed against the actual pre-migration
    // shortcode calls, not assumed. Blowfish's render-image hook always wraps every
    // image in <figure>, and only adds <figcaption> when the Markdown image has a
    // title (`![alt](src "title")`), which is exactly how the 3 captions were preserved.
    await page.goto(POST);
    const figuresWithCaption = page.locator(".article-content figure figcaption");
    await expect(figuresWithCaption).toHaveCount(3);
    const allFigures = page.locator(".article-content figure");
    await expect(allFigures).toHaveCount(4);
  });

  test("comments widget is wired up (Disqus container present)", async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator("#disqus_thread")).toBeAttached();
  });

  test("Google Tag Manager fires with the site's real container ID", async ({ page }) => {
    await page.goto(POST);
    const html = await page.content();
    expect(html).toContain("GTM-5DSQPKJJ");
  });

  test("author byline links to a non-empty author archive page", async ({ page }) => {
    await page.goto(POST);
    // Scope to the AUTHOR byline section specifically -- the site header/logo also
    // links to "/" with the text "Preston Bernstein" and would otherwise match first.
    await page
      .locator("header:has-text('AUTHOR')")
      .getByRole("link", { name: "Preston Bernstein" })
      .click();
    await expect(page).toHaveURL(/\/authors\/preston-bernstein\/?$/);
    const postLinks = page.locator('a[href^="/blog/"]');
    expect(await postLinks.count()).toBeGreaterThan(0);
  });
});
