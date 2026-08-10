# Steps: 2026 Image Pipeline (WebP/srcset/LQIP + Mermaid)

## Prerequisites
Obtain a Hugo 0.164.0 extended binary on PATH, matching the `.github/workflows/main.yml` pin. Use the official gohugoio/hugo v0.164.0 extended release, or any locally already-available binary confirmed via `hugo version` to report `v0.164.0` and `extended`. Verify with `hugo version` before proceeding to Step 2a.

**Note on concurrent file-writing and sequential builds:** Steps 2a, 2b, and 2c write different files, and their file-writing can happen in parallel across different work trees. However, within a single working tree, `hugo build` invocations on the same tree share a `resources/_gen` build cache and should run sequentially, not in true parallel. Similarly, Steps 6 and 7 run separate `npm test` specs; use a single `npx playwright test` invocation at the end (Step 8) rather than invoking each spec separately to avoid port collision on the shared static-file webServer.

## Implementation steps

### Step 2a: WebP conversion and responsive srcset generation
**What**: Write site-level `layouts/_default/_markup/render-image.html` with the core image optimization logic: convert local raster images to WebP format at 800w/1280w breakpoints, capping the target widths at the original image's actual width via `math.Min` (do NOT use a width-gated conditional that skips `.Resize` for images narrower than 800px). Every image must be converted via `.Resize "webp q75"`, regardless of source width. Include alt text preservation and loading="lazy".
**Files**: layouts/_default/_markup/render-image.html
**Test**: Run `hugo build` with pinned binary and verify build completes with zero errors. Create or identify a real image in the repo narrower than 800px (if none exists in existing posts, create a temporary small test image). Inspect the rendered HTML and confirm its `<src>` and `<srcset>` both contain `.webp` file extensions — this must NOT be tested only against the demo post's 1600x1454px image, since that image is wide enough to hide the bug.
**Depends on**: Prerequisites
**Parallelizable**: Yes (file-write parallel across trees; build-verification sequential within a tree)

### Step 2b: LQIP base64 placeholder and onload swap
**What**: Extend `layouts/_default/_markup/render-image.html` to include LQIP (24px wide, quality 40) generation with the same `math.Min` width-cap pattern as 2a. Wrap the real image in a `<div>` with a `background-image` CSS property containing the base64 LQIP data (`data:image/webp;base64,...`), set `background-size: cover; background-position: center`, and attach an `onload` event handler that swaps the placeholder for the real image once `naturalWidth > 0` is confirmed.
**Files**: layouts/_default/_markup/render-image.html (amended from 2a)
**Test**: Run `hugo build` with pinned binary and verify build completes with zero errors. Inspect rendered HTML for a `<div>` with a `data:image/webp;base64,...` background-image and confirm via browser dev tools that the background-image is cleared after the real image loads (polling `naturalWidth > 0`).
**Depends on**: Step 2a
**Parallelizable**: Yes (file-write parallel across trees; build-verification sequential within a tree)

### Step 2c: Escape-hatch verification and full site build
**What**: Implement the `disableImageOptimizationMD` escape hatch in `layouts/_default/_markup/render-image.html`. Run a complete Hugo build and verify all 25 existing blog posts render without error under the new render-hook. Perform a manual visual spot-check of q75 WebP quality against an existing text-heavy screenshot post (not the demo post's diagram-style image).
**Files**: layouts/_default/_markup/render-image.html (amended from 2b)
**Test**: Run `hugo build` with pinned binary and verify build completes with zero errors on all posts. Temporarily set `disableImageOptimizationMD = true` in `config/_default/params.toml`, rebuild, verify images revert to original format (non-WebP `src`, no `data:` placeholder), then remove the setting and rebuild to confirm WebP processing resumes. Inspect a text-heavy screenshot post visually and confirm q75 WebP quality is acceptable for diagrams and textual content.
**Depends on**: Step 2b
**Parallelizable**: Yes (file-write parallel across trees; build-verification sequential within a tree)

### Step 3: Create Mermaid codeblock render-hook
**What**: Write `layouts/_default/_markup/render-codeblock-mermaid.html` that renders fenced `mermaid` code blocks as `<pre class="not-prose mermaid">{{ .Inner | safeHTML }}</pre>`, matching Blowfish's existing shortcode output so mermaid.min.js and appearance.js pick it up without modification.
**Files**: layouts/_default/_markup/render-codeblock-mermaid.html
**Test**: Run `hugo build` with pinned binary and verify build completes with zero errors.
**Depends on**: Prerequisites
**Parallelizable**: Yes

### Step 4: Create Mermaid JS load-gate partial
**What**: Write `layouts/partials/extend-head-uncached.html` that checks `.RawContent` for fenced ` ```mermaid ` blocks and conditionally loads the Mermaid bundle (`lib/mermaid/mermaid.min.js` + `js/mermaid.js`) only once per page, avoiding double-loading when both the shortcode and fenced blocks are present.
**Files**: layouts/partials/extend-head-uncached.html
**Test**: Run `hugo build` with pinned binary and verify build completes with zero errors. Inspect the rendered HTML to verify Mermaid `<script>` tags appear only once on pages using both shortcode and fenced blocks.
**Depends on**: Prerequisites
**Parallelizable**: Yes

### Step 5a: Author demo blog post
**What**: Write `content/english/blog/native-hugo-image-pipeline-webp-lqip-and-mermaid.md` with front matter following existing post conventions. Include BOTH a fenced ` ```mermaid ` code block (describing the render-hook and JS-load-gate flow) AND a `{{< mermaid >}}` shortcode example (to verify shortcode regression). The post must reference the existing asset `images/blog/secure-services-docker-compose-and-nordvpn/dockerComposeWithVPNDiagram.png` (76KB, 1600x1454px, confirmed present) with hand-written alt text and caption. Important: the post's prose must NOT display the literal ` ```mermaid ` marker as inline example text (describe it in words instead); doing so would falsely trigger the JS-load-gate's raw-content substring match. The presence of both entry points (fenced and shortcode) on one page makes this post the regression fixture for the shortcode path and the "both on one page" fixture needed by Step 4's dedup test.
**Files**: content/english/blog/native-hugo-image-pipeline-webp-lqip-and-mermaid.md
**Test**: Run `hugo build` with pinned binary and verify build completes with zero errors. Confirm `assets/images/blog/secure-services-docker-compose-and-nordvpn/dockerComposeWithVPNDiagram.png` exists before referencing it.
**Depends on**: Steps 2c, 3, 4
**Parallelizable**: No

### Step 5b: Integration smoke-verify demo post
**What**: Verify the rendered demo post against the 7-point integration checklist: WebP extensions in `src`/`srcset`, responsive breakpoints (800w/1280w), base64 LQIP placeholder, onload swap, `<figure>` wrapper, `<figcaption>`, `data-zoom-src`, and `loading="lazy"` on the image. Confirm total page count increased by exactly 1 relative to the pre-feature baseline (173 pages, captured in docs/image-pipeline-2026/.pre-research.md) and image count increased only by the demo post's own contribution. Do NOT hardcode stale absolute totals like "173 pages, 7 processed images" as the expected post-feature state; let the assertion be relative to the baseline.
**Files**: None
**Test**: Run `hugo build` with pinned binary and verify build completes with zero errors. Inspect rendered demo post HTML: verify image `<src>` and `<srcset>` contain `.webp` extensions and a `data:image/webp;base64,...` placeholder; verify fenced Mermaid diagram renders as `<svg>` inside `<pre class="mermaid">`; verify shortcode diagram also renders without regression; verify Mermaid `<script>` is present in `<head>` exactly once; verify `<figure>` wrapper, `<figcaption>`, `data-zoom-src`, and `loading="lazy"` on the image. Verify page count increased by exactly 1 and image count increased by demo post's contribution only.
**Depends on**: Step 5a
**Parallelizable**: No

### Step 6: Create image-pipeline Playwright spec
**What**: Write `tests/e2e/image-pipeline.spec.js` that navigates to the demo post and asserts WebP rendering, responsive srcset at 800w/1280w, base64 LQIP placeholder presence and load-triggered swap (poll for `img.naturalWidth > 0`), and preservation of figure/caption/alt/zoom attributes.
**Files**: tests/e2e/image-pipeline.spec.js
**Test**: Run `npx playwright test tests/e2e/image-pipeline.spec.js` (within the context of Step 8); verify all assertions pass including WebP extensions, srcset breakpoints, LQIP swap verification, and attribute preservation.
**Depends on**: Step 5b
**Parallelizable**: Yes (run via single playwright invocation at Step 8)

### Step 7a: Bundle-load-gate assertions
**What**: Write assertions in `tests/e2e/mermaid.spec.js` to verify: fenced-block-only pages load the Mermaid bundle once (via demo post's fenced block), pages with both fenced and shortcode (demo post) load the bundle exactly once not twice, pages with neither (existing untouched posts) do not load the bundle at all.
**Files**: tests/e2e/mermaid.spec.js
**Test**: Run `npx playwright test tests/e2e/mermaid.spec.js` (within the context of Step 8); verify load-gate assertions pass on all three scenarios (fenced-only, both, neither).
**Depends on**: Step 5b
**Parallelizable**: Yes (run via single playwright invocation at Step 8)

### Step 7b: Visual rendering assertions
**What**: Write assertions in `tests/e2e/mermaid.spec.js` to verify the fenced diagram renders as `<svg>` inside `<pre class="mermaid">` (not raw text), and rendered colors visibly differ between light and dark mode. Reuse the exact `#appearance-switcher` click pattern already used in tests/e2e/dark-mode.spec.js (no page reload needed; the theme's appearance.js re-runs mermaid.run() synchronously on switcher click). Shortcode-only scenario (zero existing pages use it) is accepted as inspection-verified only (the guard condition in extend-head-uncached.html is simple enough to confirm by reading the template) rather than requiring a fabricated fixture page.
**Files**: tests/e2e/mermaid.spec.js (amended from 7a)
**Test**: Run `npx playwright test tests/e2e/mermaid.spec.js` (within the context of Step 8); verify fenced SVG rendering and dark-mode color difference via switcher click assertions pass.
**Depends on**: Step 7a
**Parallelizable**: Yes (run via single playwright invocation at Step 8)

### Step 8: Verify SVG/remote-image passthrough branches
**What**: Confirm SVG and remote-image branches in `layouts/_default/_markup/render-image.html` remain unmodified from the theme's original file. These branches are copied verbatim and do not require live-page testing. Verify by direct template comparison against the theme's original render-image.html (confirm byte-for-byte unchanged logic for SVG/remote branching) plus a clean Hugo build with zero errors.
**Files**: layouts/_default/_markup/render-image.html
**Test**: Compare SVG and remote-image branching logic in the site's render-image.html against the theme's original file; confirm byte-for-byte unchanged. Run `hugo build` with pinned binary and verify zero errors.
**Depends on**: Step 2c
**Parallelizable**: Yes

### Step 9: Run full test suite and verify no regressions
**What**: Execute all Playwright specs (existing blog-post-content, toc-scrollspy, dark-mode, reading-progress-bar, plus new image-pipeline and mermaid specs) to confirm no regressions in existing functionality and all acceptance criteria are met. Run all tests in a single invocation via `npx playwright test` (playwright.config.js already has `fullyParallel: true` and safely parallelizes multiple spec files within one process); do not run individual spec files as separate processes to avoid port collision on the shared static-file webServer.
**Files**: None
**Test**: Run `npx playwright test` once; verify all specs pass. Confirm no modifications appear in `git diff content/english/blog/` except the one new demo post file. Verify `config/_default/module.toml` has no new `[[imports]]` entries and no `go.mod` file exists in the repo.
**Depends on**: Steps 6, 7a, 7b, 8
**Parallelizable**: No

## Rollback plan
All steps reversible via git. Since this site has no staging environment (push to main is the live deploy), reverting the feature requires a new revert commit, push, and a fresh CI build and FTP redeploy cycle to take effect; there is no instant rollback. This is a pre-existing, accepted characteristic of this repository.
