// @ts-check
const { test, expect } = require("@playwright/test");

// Task 9 (docs/image-pipeline-2026/): Mermaid bundle-load-gate assertions.
// layouts/_default/_markup/render-codeblock-mermaid.html (fenced ```mermaid blocks)
// and themes/blowfish/layouts/shortcodes/mermaid.html ({{< mermaid >}}) both emit
// a <pre class="not-prose mermaid"> block, and a page-level guard is responsible
// for loading the mermaid.bundle.<hash>.js script exactly once per page no matter
// how many mermaid entry points (fenced, shortcode, or both) appear on it. These
// tests prove the load gate holds at its two clearest live-page extremes: a page
// using both entry points at once (the double-load-prevention proof point) and a
// page using neither. A fenced-only / shortcode-only isolated case would need a
// synthetic fixture page that doesn't exist on this site today (see plan.md) --
// that gap is verified separately by direct render-hook/partial code inspection,
// not a live page, and is intentionally out of scope here.
const MERMAID_BUNDLE_SCRIPT = 'script[src*="mermaid.bundle"]';

// Has both a fenced ```mermaid code block and a {{< mermaid >}} shortcode.
const BOTH_ENTRY_POINTS_POST = "/blog/native-hugo-image-pipeline-webp-lqip-and-mermaid/";

// Pre-existing post using neither Mermaid syntax.
const NO_MERMAID_POST = "/blog/secure-services-docker-compose-and-nordvpn/";

test.describe("Mermaid bundle load gate", () => {
  test("a page with both a fenced block and a shortcode loads the bundle exactly once", async ({
    page,
  }) => {
    await page.goto(BOTH_ENTRY_POINTS_POST);

    // Sanity check: the page actually contains two mermaid diagram blocks
    // (one from the fenced render hook, one from the shortcode) -- otherwise
    // this test wouldn't be exercising the double-load guard at all.
    await expect(page.locator("pre.mermaid")).toHaveCount(2);

    await expect(page.locator(MERMAID_BUNDLE_SCRIPT)).toHaveCount(1);
  });

  test("a page with neither Mermaid syntax does not load the bundle", async ({ page }) => {
    await page.goto(NO_MERMAID_POST);

    await expect(page.locator("pre.mermaid")).toHaveCount(0);
    await expect(page.locator(MERMAID_BUNDLE_SCRIPT)).toHaveCount(0);
  });
});

// Task 10 (docs/image-pipeline-2026/): Mermaid visual rendering assertions.
// The bundle-load-gate tests above prove the script loads exactly once; they
// don't prove mermaid.run() actually turned the fenced block's raw diagram
// text into a rendered <svg>, or that the theme's updateMermaidTheme() (see
// themes/blowfish/assets/js/appearance.js) really re-colors that svg when the
// appearance switcher is clicked. These tests close that gap on the fenced
// entry point specifically, reusing dark-mode.spec.js's exact switcher-click
// pattern -- no reload, since updateMermaidTheme() re-runs mermaid.run()
// synchronously inside the click handler itself.
test.describe("Mermaid visual rendering", () => {
  test("the fenced-block diagram renders as a real svg, not raw/unrendered text", async ({
    page,
  }) => {
    await page.goto(BOTH_ENTRY_POINTS_POST);

    const diagram = page.locator("pre.mermaid").first();
    const svg = diagram.locator("svg");

    await expect(svg).toBeVisible();
    // A real Mermaid render produces graph structure (nodes/edges), not just
    // an empty or placeholder svg shell.
    await expect(diagram.locator("svg .node")).not.toHaveCount(0);

    // The pre element itself no longer contains the raw, un-rendered
    // "flowchart TD" source text as its visible text content.
    const preText = await diagram.innerText();
    expect(preText).not.toContain("flowchart TD");
  });

  test("the rendered diagram's colors differ between light and dark mode", async ({ page }) => {
    await page.goto(BOTH_ENTRY_POINTS_POST);

    const svg = page.locator("pre.mermaid").first().locator("svg");
    await expect(svg).toBeVisible();

    const nodeShape = page.locator("pre.mermaid").first().locator("svg .node rect, svg .node polygon, svg .node circle").first();
    await expect(nodeShape).toHaveCount(1);

    const lightFill = await nodeShape.evaluate((el) => getComputedStyle(el).fill);

    await page.locator("#appearance-switcher").click();

    // updateMermaidTheme() tears down and re-runs mermaid.run() on click, so
    // the svg is replaced -- re-query rather than reuse the old handle/locator.
    const darkSvg = page.locator("pre.mermaid").first().locator("svg");
    await expect(darkSvg).toBeVisible();
    const darkNodeShape = page
      .locator("pre.mermaid")
      .first()
      .locator("svg .node rect, svg .node polygon, svg .node circle")
      .first();
    await expect(darkNodeShape).toHaveCount(1);

    const darkFill = await darkNodeShape.evaluate((el) => getComputedStyle(el).fill);

    expect(darkFill).not.toBe(lightFill);
  });
});
