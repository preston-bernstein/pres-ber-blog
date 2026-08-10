// @ts-check
const { test, expect } = require("@playwright/test");

// docs/2026-content-refresh/: the content-refresh pass added a Mermaid
// diagram to 20 posts (a 21st fenced diagram already existed on the image-
// pipeline demo post, covered separately by mermaid.spec.js). `hugo --gc
// --minify` does not validate Mermaid syntax -- Mermaid parses its diagram
// text client-side, in the browser, at runtime. A malformed diagram (a
// missing bracket, an unescaped special character) builds clean and 200s,
// then renders as broken/unparsed text or throws in the browser console.
// mermaid.spec.js already proves the render MECHANISM works generically,
// on the demo post; this file proves each of the 20 new diagrams' own
// CONTENT actually parses, since that's specific to what each diagram says,
// not the shared mechanism.
const POSTS_WITH_NEW_DIAGRAMS = [
  "adversarial-verification-home-lab-alerts",
  "auditing-what-an-agent-pipeline-shipped-in-an-afternoon",
  "clamav-clean-scan-doesnt-mean-safe",
  "debugging-false-positive-gpu-contention-detection",
  "deciding-what-fits-resale-clothing-monitor",
  "deciding-whats-worth-a-saturday-estate-sale-scanner",
  "dueling-agent-orchestration-suites",
  "gaming-desktop-vs-dedicated-compute-box-idle-power",
  "nine-fixes-lightrag-embedding-crash-one-afternoon",
  "not-every-docker-container-belongs-on-the-nas",
  "one-observability-stack-not-one-per-repo",
  "proxmox-for-the-xps-17-offload-box",
  "rebuilding-home-network-from-the-modem-up",
  "runpod-vs-gemini-vlm-inference-idle-auto-stop-gap",
  "scrape-score-alert-resale-hunting-pipelines-local-vision-models",
  "self-throttling-claude-max-without-a-published-ceiling",
  "surviving-a-gpu-yield-window-embedding-servers",
  "three-failure-modes-one-name-concurrent-claude-code-agents",
  "tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits",
  "what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene",
];

test.describe("2026 content-refresh: new Mermaid diagrams parse and render", () => {
  for (const slug of POSTS_WITH_NEW_DIAGRAMS) {
    test(`${slug}: diagram renders as a real svg, not raw/unrendered text`, async ({ page }) => {
      const consoleErrors = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto(`/blog/${slug}/`);

      const diagram = page.locator("pre.mermaid").first();
      await expect(diagram).toHaveCount(1);

      const svg = diagram.locator("svg");
      await expect(svg).toBeVisible();
      // A real Mermaid render produces graph structure (nodes), not an
      // empty or error-placeholder svg shell.
      await expect(diagram.locator("svg .node")).not.toHaveCount(0);

      // The raw, un-rendered Mermaid source ("flowchart TD" / "flowchart LR")
      // must not still be sitting there as visible text -- that's what an
      // unparsed diagram falls back to.
      const preText = await diagram.innerText();
      expect(preText).not.toMatch(/^flowchart (TD|LR)/m);

      // A parse error surfaces as an uncaught page error in this Mermaid
      // integration -- confirm none fired for this specific diagram.
      expect(consoleErrors).toEqual([]);
    });
  }
});
