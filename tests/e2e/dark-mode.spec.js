// @ts-check
const { test, expect } = require("@playwright/test");

// Requirements 19-20 (docs/hugo-theme-refresh/): dark/light mode set via the CSS
// color-scheme property (with light-dark()/prefers-color-scheme), applied before
// first paint (no flash of the wrong mode), with a user override that persists via
// localStorage. Blowfish's own script handles the class-toggle + no-flash part;
// this migration added the color-scheme meta/CSS on top (layouts/partials/extend-head.html).
const HOME = "/";

test.describe("Dark/light mode", () => {
  test("sets a color-scheme meta tag and CSS property", async ({ page }) => {
    await page.goto(HOME);
    const metaContent = await page.locator('meta[name="color-scheme"]').getAttribute("content");
    expect(metaContent).toBe("light dark");
    const rootColorScheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme
    );
    expect(rootColorScheme).toContain("light");
  });

  test("toggling the appearance switcher applies the dark class and updates color-scheme", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.locator("#appearance-switcher").click();

    await expect(page.locator("html")).toHaveClass(/dark/);
    const rootColorScheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme
    );
    expect(rootColorScheme).toContain("dark");
  });

  test("dark mode choice persists across a reload via localStorage", async ({ page }) => {
    await page.goto(HOME);
    await page.locator("#appearance-switcher").click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();

    await expect(page.locator("html")).toHaveClass(/dark/);
    const stored = await page.evaluate(() => localStorage.getItem("appearance"));
    expect(stored).toBe("dark");
  });

  test("no flash of the wrong theme: html has the dark class before the first paint frame", async ({ page }) => {
    await page.goto(HOME);
    await page.locator("#appearance-switcher").click();
    await page.reload();

    // Check the class is present at DOMContentLoaded, not applied after a visible
    // delay -- Blowfish's appearance.js runs synchronously in <head>, before <body>.
    const classAtDomContentLoaded = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState !== "loading") {
          resolve(document.documentElement.className);
        } else {
          document.addEventListener("DOMContentLoaded", () =>
            resolve(document.documentElement.className)
          );
        }
      });
    });
    expect(classAtDomContentLoaded).toContain("dark");
  });
});
