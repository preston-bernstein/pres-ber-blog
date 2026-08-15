// @ts-check
const { test, expect } = require("@playwright/test");
const { execFileSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// docs/linkblog-integration/: content/english/links/*.md and static/links/atom.xml
// are fully generated from data/linkposts.json on every build and data/linkposts.json
// is deliberately [] on main (see readme.md's Linkblog section) -- there is no
// permanent link post to point a normal spec at. This spec seeds one real fixture
// entry, runs the actual pipeline (build-linkblog.py, then a real `hugo` build), and
// tears it back down to a clean [] state afterward.
//
// Builds into an isolated --destination (not ./public) and serves that with its own
// http-server instance on a separate port, rather than reusing the suite's shared
// webServer/./public -- other spec files in this directory run concurrently
// (fullyParallel: true) against the shared build, and rebuilding it mid-suite would
// race their assertions against a moment when public/ is being overwritten.
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DATA_FILE = path.join(REPO_ROOT, "data", "linkposts.json");
const CONTENT_DIR = path.join(REPO_ROOT, "content", "english", "links");
const DEST_DIR = path.join(REPO_ROOT, "public-linkblog-test");
const PORT = 1415;
const BASE = `http://127.0.0.1:${PORT}`;

const FIXTURE_URL = "https://example.com/linkblog-e2e-fixture";
const FIXTURE_PUBLISHED = "2026-01-01T00:00:00+00:00";
// No em/en-dash punctuation here: Hugo's Goldmark typographer extension rewrites
// "--" to an en-dash in rendered output, which would make a literal string match fail.
const FIXTURE_COMMENT = "Fixture entry for linkblog Playwright coverage, not real content.";

/** @type {import('child_process').ChildProcess | undefined} */
let serverProcess;
/** @type {string} */
let slug;

test.describe("Linkblog pipeline (real build, isolated destination)", () => {
  // fullyParallel shards individual tests across workers by default, which would run
  // beforeAll/afterAll more than once concurrently (racing writes to data/linkposts.json
  // and a port collision on the dedicated test server) -- force this describe block
  // onto a single worker so the fixture build happens exactly once.
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        [
          {
            url: FIXTURE_URL,
            published: FIXTURE_PUBLISHED,
            comment: FIXTURE_COMMENT,
            tags: ["e2e-fixture"],
          },
        ],
        null,
        2
      ) + "\n"
    );

    execFileSync("python3", ["scripts/build-linkblog.py"], { cwd: REPO_ROOT, stdio: "inherit" });

    const generated = fs.readdirSync(CONTENT_DIR).filter((f) => f !== "_index.md");
    if (generated.length !== 1) {
      throw new Error(`Expected exactly 1 generated link post, found ${generated.length}`);
    }
    slug = generated[0].replace(/\.md$/, "");

    execFileSync("hugo", ["--gc", "--minify", "--destination", DEST_DIR], {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });

    serverProcess = spawn("npx", ["http-server", DEST_DIR, "-p", String(PORT), "-s"], {
      cwd: REPO_ROOT,
      stdio: "ignore",
    });

    await expect
      .poll(
        async () => {
          try {
            const res = await fetch(BASE);
            return res.status;
          } catch {
            return null;
          }
        },
        { timeout: 15000 }
      )
      .toBe(200);
  });

  test.afterAll(async () => {
    serverProcess?.kill();
    // Restore the clean, empty-data state Task 14 established -- the same
    // regenerate-from-empty cycle used before merge.
    fs.writeFileSync(DATA_FILE, "[]\n");
    execFileSync("python3", ["scripts/build-linkblog.py"], { cwd: REPO_ROOT, stdio: "inherit" });
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
  });

  test("home feed does not leak the link post (Task 6 -- home-RSS scoping fix)", async () => {
    const res = await fetch(`${BASE}/index.xml`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).not.toContain(FIXTURE_URL);
  });

  test("links-only Atom feed contains the link post", async () => {
    const res = await fetch(`${BASE}/links/atom.xml`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain(FIXTURE_URL);
  });

  test("section-level RSS output is disabled", async () => {
    const res = await fetch(`${BASE}/links/index.xml`);
    expect(res.status).toBe(404);
  });

  test("rendered link post title is a real clickable anchor to the source URL (Task 7 fix)", async ({
    page,
  }) => {
    await page.goto(`${BASE}/links/${slug}/`);
    const anchor = page.locator("h1 a");
    await expect(anchor).toHaveAttribute("href", FIXTURE_URL);
    await expect(anchor).toHaveAttribute("target", "_blank");
    await expect(anchor).toHaveText(FIXTURE_URL);
    await expect(page.locator(".article-content")).toContainText(FIXTURE_COMMENT);
    // Real published date rendered, not Hugo's zero-date fallback -- proves the
    // date-front-matter-injection workaround (linkblog-commons omits `date`) works.
    await expect(page.locator("time").first()).toHaveAttribute("datetime", FIXTURE_PUBLISHED);
  });

  test("section index page lists the post", async ({ page }) => {
    await page.goto(`${BASE}/links/`);
    await expect(page.locator("body")).toContainText(FIXTURE_URL);
  });
});
