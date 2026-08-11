# Requirements: 2026 Image Pipeline (WebP/srcset/LQIP + Mermaid)

## Problem statement
pres-ber-blog's images ship at original resolution and format, with no low-quality placeholder while they load, which wastes bandwidth and causes layout jank for readers. The blog's Blowfish theme (github.com/nunocoracao/blowfish) already renders responsive images through a working `render-image.html` hook (figure, caption, alt text, lazy loading, a two-breakpoint srcset, and click-to-zoom), but that hook does not convert images to WebP or generate a blur-up placeholder — this leaves free performance gains on the table. Separately, Blowfish ships a working Mermaid diagram renderer, but only through a theme-specific `{{< mermaid >}}` shortcode; there is no support for the portable Markdown convention of a fenced ` ```mermaid ` code block, which limits how diagram content can be authored and makes posts less portable to other Markdown tooling. Preston Bernstein, the site owner and sole author, needs both gaps closed without adding a CDN dependency or duplicating Blowfish's existing, working JavaScript.

## Users / stakeholders
- Preston Bernstein — site owner, sole content author, the only person who writes posts and runs the build.
- Blog readers — experience the site through a standard web browser; benefit from faster image loads and working diagrams, in both light and dark mode.
- CI pipeline (`.github/workflows/main.yml`) — builds the site with Hugo 0.164.0 extended and deploys straight to production FTP on every push to `main`; must keep passing.

## Functional requirements
1. The system shall render Markdown images through a site-level `layouts/_default/_markup/render-image.html` override that converts raster images to WebP format, so that image payloads are smaller than the original format.
2. The system shall generate a responsive `srcset` for WebP output using the existing breakpoint scheme (800w/1280w, capped by original image width), matching the resize behavior already present in Blowfish's theme-level hook.
3. The system shall generate a low-quality image placeholder (LQIP) — resized to 24px wide at WebP quality 40, producing a short, clearly non-representational preview — inlined as a base64 `data:` URI, and shall swap it for the full-resolution WebP image once that image finishes loading.
4. The system shall preserve every existing `render-image.html` output attribute and behavior when adding WebP/LQIP support: the `<figure>` wrapper, the caption sourced from `.Title` via markdownify, alt text sourced from `.Text`, lazy loading, the `data-zoom-src` attribute used by the mediumZoom click-to-zoom lightbox, and images remaining zoomable by default (any image that must opt out of zoom keeps the `nozoom` class working).
5. The system shall leave SVG image sources unmodified — no WebP conversion, no LQIP, no resizing — matching the existing `$isSVG` special case in the theme-level hook.
6. The system shall render remote (`http://`/`https://`) image URLs as a plain `<img>` tag without attempting WebP conversion, LQIP generation, or resizing, matching the existing `$isRemote` special case, because Hugo cannot process images it does not control locally.
7. The system shall skip all WebP/LQIP/responsive-srcset processing site-wide when `.Page.Site.Params.disableImageOptimizationMD` is `true`, falling back to the pre-2026-pipeline image rendering.
8. The system shall render a fenced ` ```mermaid ` code block in Markdown as a Mermaid diagram, via a `layouts/_default/_markup/render-codeblock-mermaid.html` override, using Hugo's per-language codeblock render-hook convention.
9. The system shall render a Mermaid diagram from a ` ```mermaid ` code block using Blowfish's existing vendored `mermaid.min.js` library and existing theme-aware `mermaid.js` color configuration — the system shall not introduce a second Mermaid JavaScript bundle or a CDN-hosted copy.
10. The system shall load the Mermaid JavaScript bundle on any page that contains a ` ```mermaid ` fenced code block, a `{{< mermaid >}}` shortcode, or both, and shall not load it on pages that contain neither, so pages without diagrams pay no extra JavaScript cost.
11. The system shall detect the presence of a ` ```mermaid ` fenced code block by checking `.RawContent` (the raw, unrendered Markdown) rather than a `.Page.Store` flag set during content rendering, because the site's `head.html` partial runs before `.Content` is rendered and a Store-based flag would not yet be populated at that point (confirmed hazard: `themes/blowfish/layouts/_default/baseof.html` calls `partial "head.html" .` before `<body>`, while `single.html` renders `.Content` later in the body).
12. The system shall add the Mermaid-loading gate via a new `layouts/partials/extend-head-uncached.html` file (an existing, currently-unused Blowfish extension point evaluated per page) rather than by editing or overriding `themes/blowfish/layouts/partials/vendor.html` in full, so the change stays isolated from vendor.html's ~9 other unrelated shortcode-loading blocks.
13. The system shall continue to render the existing `{{< mermaid >}}` shortcode exactly as it does today, unchanged, alongside the new fenced-code-block path.
14. The system shall include one new blog post under `content/english/blog/` that documents this pipeline build, containing one real image reference that exercises the WebP/srcset/LQIP path and one real Mermaid diagram (depicting the pipeline's own render-hook or JS-load-gate flow) that exercises the fenced-code-block path.
15. The system shall reuse an existing image asset already committed under `assets/images/blog/secure-services-docker-compose-and-nordvpn/` for the demo post's image, rather than adding a new synthetic image asset.
16. The system shall not modify the source Markdown files of any of the 25 existing published posts under `content/english/blog/` as part of delivering this feature. Their rendered image *output* will still change, since the new `render-image.html` override applies site-wide (see the out-of-scope note and acceptance criterion 18).

## Non-functional requirements
- Build output: `npm run project-setup && npm run build` shall complete with zero errors, using Hugo 0.164.0 extended. Total page count shall increase by exactly one (the new demo post) relative to the pre-feature baseline of 173 pages. Processed-image count shall increase only by whatever the demo post itself contributes.
- No new CDN dependency shall be introduced for either image processing or Mermaid rendering — both must run through Hugo's native asset pipeline and Blowfish's already-vendored JavaScript.
- No new Hugo Module or Go module dependency shall be introduced (the repo currently has zero `[[imports]]` in `config/_default/module.toml` and no `go.mod`; this must remain true).
- Mermaid diagrams shall render correctly (as an SVG, not raw text or broken syntax highlighting) in both light and dark mode, matching the existing theme-aware color config in `themes/blowfish/assets/js/mermaid.js`.
- Accessibility: every non-decorative image in the demo post shall have specific, hand-written alt text (not empty, not a filename); a purely decorative image would use `alt=""`, though none is planned for this feature.

## Constraints
- Must integrate with the existing theme-level `render-image.html` at `themes/blowfish/layouts/_default/_markup/render-image.html` by overriding it at the site level (`layouts/_default/_markup/render-image.html`), the standard Hugo mechanism where site layouts take priority over theme layouts at the same relative path — the theme file itself must not be edited (it lives in a git submodule).
- Must integrate with the existing mediumZoom lightbox wiring in `themes/blowfish/layouts/partials/footer.html`, which zooms any `<img>` not carrying the `nozoom` class — new image output must not silently break or bypass this.
- Must integrate with Blowfish's existing Mermaid shortcode (`themes/blowfish/layouts/shortcodes/mermaid.html`), vendored library (`themes/blowfish/assets/lib/mermaid/`), and theme-aware config (`themes/blowfish/assets/js/mermaid.js`) — these are reused, not replaced.
- Must integrate with the existing per-page JS-loading pattern in `themes/blowfish/layouts/partials/vendor.html`, which conditionally loads Mermaid via `{{ if .Page.HasShortcode "mermaid" }}`, without duplicating that partial's resource-loading calls.
- Must respect the existing `disableImageOptimizationMD` site param as a global escape hatch.
- Must keep the CI build pinned to Hugo 0.164.0 extended (`.github/workflows/main.yml`); no change to the pinned version is in scope.
- No staging environment exists — a push to `main` is the live deploy. Any change merged to `main` is immediately public.
- The Blowfish theme is a git submodule; changes belong at the site level (`layouts/`, `assets/`, `config/`), not inside `themes/blowfish/`.

## Out of scope
- Rewriting, re-optimizing, or otherwise touching any of the 25 existing published posts under `content/english/blog/`.
- Any external image CDN or third-party image-optimization service — all processing runs through Hugo's built-in image pipeline.
- Any new CDN dependency for Mermaid rendering — no CDN-hosted Mermaid script tag, no swap of the vendored library for a hosted one.
- Removing or changing the existing `{{< mermaid >}}` shortcode path.
- Removing the unused `[mermaid].js_url` CDN param in `config/_default/params.toml` (noted as dead config, not blocking this feature; a candidate cleanup for separate follow-on work).
- Adding a third responsive-image breakpoint or changing the existing 800w/1280w breakpoint scheme.
- Any change to the pinned Hugo version, Hugo Modules setup, or `go.mod`/`config/_default/module.toml` imports.
- Video, GIF, or non-image/non-Mermaid embeds of any kind.

## Acceptance criteria
1. `npm run project-setup && npm run build` completes with zero errors using Hugo 0.164.0 extended.
2. The demo post's raster image renders as WebP in the built HTML output (verified via the rendered `<img>`/`<source>` `src`/`srcset` file extensions).
3. The demo post's raster image has a working responsive `srcset` at the 800w and 1280w breakpoints (or fewer, if capped by original image width), matching the existing breakpoint scheme.
4. The demo post's raster image shows a low-quality placeholder on initial load, resized to 24px wide at WebP quality 40, which is replaced by the full-resolution WebP image once loaded (verified via inline base64 `data:` URI present in the placeholder markup and a load-triggered swap).
5. The demo post's raster image is wrapped in a `<figure>` with a caption and specific alt text, is lazy-loaded, carries a `data-zoom-src` attribute, and is not excluded from mediumZoom (no unintended `nozoom` class) — matching pre-existing hook behavior.
6. The `$isSVG` branch in the new `render-image.html` is verified unmodified via direct template comparison against the theme's original `render-image.html`, plus a clean Hugo build with no errors (site-wide content search confirms zero SVG image references exist anywhere in `content/english/`, so there is no live page to render this branch against).
7. The `$isRemote` branch in the new `render-image.html` is verified unmodified via direct template comparison against the theme's original `render-image.html`, plus a clean Hugo build with no errors (site-wide content search confirms zero remote `http://`/`https://` image references exist anywhere in `content/english/`, so there is no live page to render this branch against).
8. Setting `disableImageOptimizationMD = true` in site params disables WebP conversion, LQIP, and srcset generation for all images, without breaking the build.
9. The demo post's ` ```mermaid ` fenced code block renders as an SVG diagram in the built HTML output, not as raw text or an unstyled code block.
10. The rendered Mermaid diagram uses theme-aware colors that visibly differ between light mode and dark mode, matching the existing `mermaid.js` config.
11. A page containing only a ` ```mermaid ` fenced code block (no `{{< mermaid >}}` shortcode) loads the Mermaid JavaScript bundle.
12. A page containing neither a ` ```mermaid ` fenced code block nor a `{{< mermaid >}}` shortcode does not load the Mermaid JavaScript bundle.
13. A page containing the existing `{{< mermaid >}}` shortcode still renders correctly and still loads the Mermaid JavaScript bundle, unchanged from current behavior.
14. A page containing both a ` ```mermaid ` fenced code block and a `{{< mermaid >}}` shortcode loads the Mermaid JavaScript bundle exactly once, not twice.
15. All existing specs in `tests/e2e/*.spec.js` (blog-post-content, toc-scrollspy, dark-mode, reading-progress-bar) pass against the built site.
16. New Playwright specs exist and pass for: the demo post's image showing WebP source + working srcset + LQIP-to-real-image swap, and the demo post's Mermaid diagram rendering as an SVG in both light and dark mode.
17. A diff of `content/english/blog/` against the pre-feature baseline shows only one new post added — no modifications to any of the 25 existing posts' source Markdown files.
18. The rendered HTML output of the 25 existing posts changes as an expected, intended effect of this feature — their images now render as WebP with LQIP markup — even though their source Markdown files are untouched.
19. No new entries appear in `config/_default/module.toml` `[[imports]]` and no `go.mod` file is added anywhere in the repo.
