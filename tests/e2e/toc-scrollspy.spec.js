// @ts-check
const { test, expect } = require("@playwright/test");

// Requirement 16 (docs/hugo-theme-refresh/): sticky, scrollspy-enabled table of
// contents on blog post pages. This surface was completely broken until two fixes
// landed during browser-driven verification: article.showTableOfContents was never
// set, and hugo.toml's [markup.tableOfContents] ordered=true made Hugo emit <ol>
// while Blowfish's template hardcodes a check for "<ul" to decide whether to show
// the TOC at all -- see config/_default/params.toml and hugo.toml for the fixes.
const POST = "/blog/secure-services-docker-compose-and-nordvpn/";

test.describe("Table of contents (sticky + scrollspy)", () => {
  test("renders a TOC with links to real headings on a long post", async ({ page }) => {
    await page.goto(POST);
    const toc = page.locator(".toc");
    await expect(toc).toBeVisible();
    // Regex, not an exact string: Hugo's typography renders a straight apostrophe
    // as a curly one (U+2019) in the built heading text.
    const introLink = toc.getByRole("link", { name: /Docker Containers Inherit Your Connection.s Exposure by Default/ });
    await expect(introLink).toBeVisible();
    await expect(toc.getByRole("link", { name: "Docker Compose Handles Orchestration; a VPN Container Handles Privacy" })).toBeVisible();
  });

  test("stays visible (sticky) after scrolling deep into the article", async ({ page }) => {
    await page.goto(POST);
    const toc = page.locator(".toc");
    await expect(toc).toBeVisible();
    await page.mouse.wheel(0, 4000);
    await expect(toc).toBeVisible();
  });

  test("scrollspy updates the highlighted section as the reader scrolls", async ({ page }) => {
    await page.goto(POST);
    const toc = page.locator(".toc");
    // Regex, not an exact string: Hugo's typography renders a straight apostrophe
    // as a curly one (U+2019) in the built heading text.
    const introLink = toc.getByRole("link", { name: /Docker Containers Inherit Your Connection.s Exposure by Default/ });
    // Blowfish's smartTOC JS toggles a literal "active" class on the current
    // section's link (themes/blowfish/layouts/partials/toc.html) -- confirmed
    // directly against the rendered DOM, not assumed from the visual underline style.
    await expect(introLink).toHaveClass(/active/);

    // Scroll well past the first section into a later section.
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(300); // smartTOC's scroll listener needs a tick to fire

    await expect(introLink).not.toHaveClass(/active/);
    // At least one other TOC entry should now be the active one.
    const activeCount = await toc.locator("a.active").count();
    expect(activeCount).toBeGreaterThan(0);
  });

  test("TOC is absent on the homepage (not a blog post)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".toc")).toHaveCount(0);
  });
});
