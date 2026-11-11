// @ts-check
const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

// The 2026-09-28 scale-back set 15 posts to draft. Those posts must not be
// built, and no page that is still built may link to one of them. A draft
// link builds clean in Hugo and only shows up as a 404 for a reader.
const UNPUBLISHED = [
  "auditing-what-an-agent-pipeline-shipped-in-an-afternoon",
  "deciding-what-fits-resale-clothing-monitor",
  "deciding-whats-worth-a-saturday-estate-sale-scanner",
  "dueling-agent-orchestration-suites",
  "gaming-desktop-vs-dedicated-compute-box-idle-power",
  "github-agents-tab-vs-claude-code",
  "mini-itx-is-the-wrong-form-factor-for-a-quiet-ai-homelab-pc",
  "rebuilding-home-network-from-the-modem-up",
  "runpod-vs-gemini-vlm-inference-idle-auto-stop-gap",
  "scrape-score-alert-resale-hunting-pipelines-local-vision-models",
  "self-throttling-claude-max-without-a-published-ceiling",
  "surviving-a-gpu-yield-window-embedding-servers",
  "three-failure-modes-one-name-concurrent-claude-code-agents",
  "tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits",
  "what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene",
];

const PUBLIC = path.join(__dirname, "..", "..", "public");

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

test("unpublished posts are not built", () => {
  const built = UNPUBLISHED.filter((slug) =>
    fs.existsSync(path.join(PUBLIC, "blog", slug, "index.html")),
  );
  expect(built).toEqual([]);
});

test("no built page links to a blog post that is not built", () => {
  const dead = [];
  const re = /href="?(?:https:\/\/prestonbernstein\.com)?\/blog\/([a-z0-9-]+)\/?[#"\s>]/g;
  for (const file of htmlFiles(PUBLIC)) {
    const html = fs.readFileSync(file, "utf8");
    for (const m of html.matchAll(re)) {
      const slug = m[1];
      if (slug === "page") continue; // pagination: /blog/page/2/
      if (!fs.existsSync(path.join(PUBLIC, "blog", slug, "index.html"))) {
        dead.push(`${path.relative(PUBLIC, file)} -> /blog/${slug}/`);
      }
    }
  }
  expect([...new Set(dead)]).toEqual([]);
});
