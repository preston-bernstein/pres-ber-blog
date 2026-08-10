// @ts-check
const { defineConfig, devices } = require("@playwright/test");

// This is a Hugo static site, not a Node app -- there is no dev-server npm script
// Playwright can launch directly. The `hugo` binary is not on this repo's own
// dependency tree (it's a separately installed Go binary, pinned exactly by
// .github/workflows/main.yml's HUGO_VERSION and validated locally against that
// same pin during the theme-refresh migration, see docs/hugo-theme-refresh/).
// webServer here just serves the already-built ./public/ directory over HTTP,
// which is what these specs need -- they test the built output, not a live
// Hugo dev-server reload loop.
module.exports = defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:1414",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx http-server ./public -p 1414 -s",
    url: "http://127.0.0.1:1414",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
