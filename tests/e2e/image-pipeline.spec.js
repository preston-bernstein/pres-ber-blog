// @ts-check
const { test, expect } = require("@playwright/test");

// Task 8 (docs/image-pipeline-2026/): the site-level render-image.html hook
// (layouts/_default/_markup/render-image.html) converts every local raster
// Markdown image to WebP at two responsive widths, embeds a base64 LQIP
// blur-up placeholder as an inline background-image, wires up mediumZoom via
// data-zoom-src, and still wraps the image in <figure>/<figcaption> the same
// way Blowfish's own upstream hook does. This spec exercises that pipeline
// against its own demo post, which intentionally reuses an older post's PNG
// (dockerComposeWithVPNDiagram.png) specifically to prove it now renders
// through the new hook.
const POST = "/blog/native-hugo-image-pipeline-webp-lqip-and-mermaid/";

test.describe("Image pipeline (WebP, srcset, LQIP, zoom)", () => {
  test("demo image's src and srcset are WebP, not the original PNG", async ({ page }) => {
    await page.goto(POST);
    const img = page.locator(".article-content img").first();
    await img.scrollIntoViewIfNeeded();

    const src = await img.getAttribute("src");
    const srcset = await img.getAttribute("srcset");

    expect(src).toContain(".webp");
    expect(src).not.toContain(".png");
    expect(srcset).toBeTruthy();
    expect(srcset).toContain(".webp");
    expect(srcset).not.toContain(".png");
  });

  test("srcset carries both an 800w and a 1280w WebP candidate", async ({ page }) => {
    await page.goto(POST);
    const img = page.locator(".article-content img").first();
    const srcset = await img.getAttribute("srcset");

    // RenderImageResponsive (render-image.html) builds this as
    // "<800px-webp> 800w, <1280px-webp> 1280w" -- confirmed against the
    // actual built HTML, not assumed.
    expect(srcset).toMatch(/\.webp 800w/);
    expect(srcset).toMatch(/\.webp 1280w/);
  });

  test("LQIP data URI is present in the markup, and the real image loads and clears it", async ({
    page,
  }) => {
    // The LQIP blur-up placeholder is a base64 WebP data URI set as an inline
    // background-image in the raw server-rendered markup (see render-image.html's
    // RenderImageResponsive style attr). Check the raw response body for it rather
    // than a live DOM attribute: this fixture image is small/local enough that its
    // onload handler (which clears the placeholder, asserted below) can fire before
    // a getAttribute() call lands, making the DOM read racy for this specific check.
    const html = await (await page.request.get(POST)).text();
    expect(html).toContain("data:image/webp;base64,");

    await page.goto(POST);
    const img = page.locator(".article-content img").first();
    await img.scrollIntoViewIfNeeded();

    // Same naturalWidth-polling pattern as blog-post-content.spec.js: 0 means
    // the browser failed to decode/load the real (non-placeholder) image.
    await expect
      .poll(() => img.evaluate((el) => /** @type {HTMLImageElement} */ (el).naturalWidth))
      .toBeGreaterThan(0);

    // render-image.html wires onload="this.style.backgroundImage='none'" so the
    // blur-up placeholder is cleared once the real image has actually finished
    // loading. Poll the live inline style rather than the attribute snapshot
    // above (that's the pre-load markup) -- onload mutates the element's style
    // property directly, which reads back through style.backgroundImage.
    await expect
      .poll(() => img.evaluate((el) => /** @type {HTMLImageElement} */ (el).style.backgroundImage))
      .toBe("none");
  });

  test("demo image is wrapped in a figure with a figcaption", async ({ page }) => {
    await page.goto(POST);
    const figure = page.locator(".article-content figure").first();
    await expect(figure).toBeAttached();
    await expect(figure.locator("img")).toHaveCount(1);
    await expect(figure.locator("figcaption")).toBeAttached();
    await expect(figure.locator("figcaption")).not.toBeEmpty();
  });

  test("demo image carries data-zoom-src (mediumZoom click-to-zoom target)", async ({ page }) => {
    await page.goto(POST);
    const img = page.locator(".article-content img").first();
    const zoomSrc = await img.getAttribute("data-zoom-src");
    expect(zoomSrc).toBeTruthy();
  });

  // The "nozoom" class exists on this site (e.g. the header signature logo,
  // layouts/partials/header/basic.html) to opt an <img> out of mediumZoom.
  // RenderImageResponsive's class list is hard-coded to "my-0 rounded-md" and
  // never adds it, so a pipeline-rendered post image must stay zoomable.
  test("demo image does not carry the nozoom class", async ({ page }) => {
    await page.goto(POST);
    const img = page.locator(".article-content img").first();
    await expect(img).not.toHaveClass(/nozoom/);
  });
});
