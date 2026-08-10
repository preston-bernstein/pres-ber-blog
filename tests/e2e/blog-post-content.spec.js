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

  // Retired the old "author byline links to a non-empty author archive page" UI
  // test (docs/markup-2026-baseline/): a concurrent commit on main
  // ("Restore signature logo and social-icon footer lost in the theme migration")
  // deliberately set `showAuthor = false` in config/_default/params.toml, removing
  // the per-post author byline box -- confirmed intentional via that commit's own
  // params.toml comment (duplicate identity, single-author site, already shown in
  // nav/footer/home profile). The UI element this test located no longer exists on
  // any post page after that merge, so the test can't be repaired, only retired.
  // Author identity is still real and testable via the post's Article JSON-LD
  // (schema.html still reads front matter `authors:` for structured data, per that
  // same commit's reasoning) -- this replacement test covers that instead.
  test("post's Article JSON-LD still identifies the author (SEO structured data)", async ({
    page,
  }) => {
    await page.goto(POST);
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(/** @type {string} */ (jsonLd));
    // Blowfish's schema.html emits a top-level array (`[{ "@type": "Article", ... }]`),
    // not a bare object -- confirmed against the actual rendered output.
    const data = Array.isArray(parsed) ? parsed[0] : parsed;
    expect(data.author?.name).toBe("Preston Bernstein");
  });

  // docs/markup-2026-baseline/: the docker-compose example's fenced code block was
  // given a Chroma `hl_lines=[22,34]` attribute so the two `network_mode: service:vpn`
  // lines the surrounding prose calls out by name render highlighted. Confirmed by
  // reading the actual built HTML: Hugo/Chroma's line-highlight marker on this theme
  // is an inline `background-color` style on the line's flex span, not a CSS class --
  // so the assertion checks for that inline style, not a guessed class name.
  test("docker-compose code block renders exactly 2 highlighted lines (hl_lines)", async ({ page }) => {
    await page.goto(POST);
    const highlightedLines = page.locator(
      '.article-content .highlight-wrapper pre span[style*="background-color"]'
    );
    await expect(highlightedLines).toHaveCount(2);
    // Both highlighted lines should be the network_mode directive the prose discusses.
    for (let i = 0; i < 2; i++) {
      await expect(highlightedLines.nth(i)).toContainText("network_mode");
    }
  });

  test("docker-compose code block still shows a language tag and a copy button", async ({ page }) => {
    await page.goto(POST);
    // This post has several earlier ```bash blocks (Docker install steps) before the
    // hl_lines demo block -- .first() would grab one of those instead. Scope to the
    // specific highlight-wrapper containing the demo's own content.
    const wrapper = page
      .locator(".article-content .highlight-wrapper")
      .filter({ hasText: "network_mode" });
    await expect(wrapper).toHaveCount(1);
    await expect(wrapper.locator("code[data-lang='yaml']")).toBeAttached();
    // Blowfish's copy button is injected client-side by assets/js/code.js on
    // DOMContentLoaded, not present in the raw server-rendered HTML.
    await expect(wrapper.locator("button.copy-button")).toBeAttached();
  });
});

test.describe("Admonition rendering (nine-fixes-lightrag-embedding-crash-one-afternoon)", () => {
  const ADMONITION_POST = "/blog/nine-fixes-lightrag-embedding-crash-one-afternoon/";

  // docs/markup-2026-baseline/: a `> [!WARNING]` GFM blockquote-alert was added to
  // this post's container-loopback pitfall. Blowfish's render-blockquote.html emits
  // `data-type="{{ $normalizedType }}"` on the rendered admonition -- confirmed
  // against the actual built HTML, not assumed.
  test("loopback-address gotcha renders as a labeled warning admonition, not a plain blockquote", async ({
    page,
  }) => {
    await page.goto(ADMONITION_POST);
    const admonition = page.locator('.article-content [data-type="warning"]');
    await expect(admonition).toBeAttached();
    // Icon + label, never color alone.
    await expect(admonition).toContainText("Warning");
    await expect(admonition.locator("svg")).toBeAttached();
    await expect(admonition).toContainText("network namespace");
    // The literal "[!WARNING]" marker text must never leak into the rendered page --
    // that's exactly what a malformed/unparsed alert falls back to.
    await expect(page.locator(".article-content")).not.toContainText("[!WARNING]");
  });
});
