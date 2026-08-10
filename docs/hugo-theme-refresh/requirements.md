# Requirements: Hugo Theme Refresh (pres-ber-blog)

## Problem statement
pres-ber-blog (prestonbernstein.com) runs on Hugo (a static site generator) with the Hugoplate theme, vendored directly into `themes/hugoplate/` and extended by a large graph of Hugo Modules (reusable theme/plugin packages pulled in via `go.mod`) for search, images, icons, and other features. The site needs a 2026 UI refresh — sticky/scrollspy table of contents (TOC), a reading-progress bar, fluid typography, and flash-free dark/light mode — and prior research identified Blowfish as the leading replacement theme, with Congo as a fallback if Blowfish proves incompatible with this repo's content. Because the site has no staging environment and deploys straight to production on every push to `main`, the theme swap must be validated locally before it ever reaches CI or the live site.

## Users / stakeholders
- Site owner/operator (Preston Bernstein) — evaluates and approves the theme choice, merges the change.
- Site visitors / readers of prestonbernstein.com — experience the new theme; must not see a broken or degraded site.
- CI pipeline (`.github/workflows/main.yml`) — builds the site with a pinned Hugo/Go/Node toolchain and FTP-deploys the output; must keep working after the theme swap.

## Functional requirements
1. The system shall select one theme (Blowfish, or Congo as fallback) as the replacement for Hugoplate, based on a documented compatibility check against this repo's content model (front matter fields and shortcodes in use).
2. The system shall install the selected theme in `pres-ber-blog` and remove the Hugoplate theme directory (`themes/hugoplate/`) and its associated Hugo Module graph from `config/_default/module.toml` and `go.mod`.
3. The system shall update `.github/workflows/main.yml` so `HUGO_VERSION` is a value >= 0.158.0 (the minimum required by both Congo and Blowfish), so CI can build the new theme.
4. The system shall migrate `hugo.toml` and related `config/_default/*` files to the parameter shape the selected theme expects, preserving existing site metadata (title, base URL, language settings) without loss.
5. The system shall correct the site-wide `[metadata]` block in `config/_default/params.toml` — the placeholder author value (`"digital.mast"`, not Preston) and the broken OpenGraph image path (the image shown when a page link is shared on social media; the current path has a literal space in the filename, with no matching file) — as part of migrating site metadata (requirement 4), since these are pre-existing errors that this migration touches anyway.
6. The system shall preserve all 25 posts in `content/english/blog/*.md` with their existing front matter fields (title, meta_title, description, date, categories, author, tags, draft) rendering correctly under the new theme, and the `image` field rendering correctly on the posts where it is present, without editing post body text.
7. The system shall make an explicit decision about the `meta_title` front-matter field, used by all 26 blog-content files: either route it into the new theme's `<title>` tag and related SEO metadata tags via a small template override, or confirm the theme's own title-generation (from the `title` field) is an acceptable replacement. `meta_title` shall not be left as an inert, unused field.
8. The system shall make an explicit, documented decision about Disqus (a third-party blog-comments service) on blog posts: either add a Blowfish-compatible comments partial or config, or explicitly accept and document that comments are removed. Comments shall not silently disappear with no build error.
9. The system shall replace or remove any Hugoplate-only shortcode usage (accordion, button, gallery, image, notice, slider, tab/tabs, toc, video, youtube) found in non-blog content, either by mapping to an equivalent shortcode the selected theme provides or by removing the shortcode call, so no page fails to build due to an undefined shortcode.
10. The system shall migrate `content/english/authors/preston-bernstein.md` so its author/social metadata renders under the selected theme's author-page parameter shape.
11. The system shall reconcile `data/social.json` with the `social:` list in `content/english/authors/preston-bernstein.md`. The two currently disagree on icon-class format and URL format (with or without `www`). The system shall resolve them into one correct, consistent set of links, rather than silently keeping whichever source the new theme happens to read.
12. The system shall make an explicit decision about the homepage layout: keep the current bio-forward homepage design (which requires a Blowfish template override), or accept Blowfish's stock homepage template (a recent-posts list plus an author bio). This is a visible design decision, not an incidental side effect of the theme swap.
13. The system shall remove `content/english/pages/elements.md` (the Hugoplate template-showcase demo page) from the published site, since it is demo content rather than real site content.
14. The system shall remove `content/english/sections/call-to-action.md` (Hugoplate promotional demo content, in the same category as `elements.md`, requirement 13) from the published site.
15. The system shall remove the Hugoplate-specific npm scripts (`theme-setup`, `update-theme` and their backing files `scripts/themeSetup.js`, `scripts/themeUpdate.js`) from `package.json` and the repo, since they only operate on Hugoplate.
16. The system shall render a sticky, scrollspy-enabled table of contents on blog post pages that have headings, so the reader can see their position in the page and jump to a section.
17. The system shall display a reading-progress bar on blog post pages that visually reflects scroll position through the post.
18. The system shall render body and heading typography using CSS `clamp()`-based fluid sizing, so font size scales smoothly between a 320px minimum viewport width and a 1440px maximum viewport width, without discrete breakpoint jumps.
19. The system shall set dark/light mode using the CSS `color-scheme` property (with `light-dark()` and/or `prefers-color-scheme`) such that the correct mode is applied before first paint, with no visible flash of the wrong mode on page load.
20. The system shall let a visitor override the OS-level `prefers-color-scheme` default and persist that choice across page loads via `localStorage`.
21. The system shall produce a local production build (`hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic`) using a locally installed Hugo binary whose version matches the exact `HUGO_VERSION` pin from requirement 3, with zero build errors, before the change is merged.

## Non-functional requirements
- Accessibility: body text shall meet WCAG 2.2 Success Criterion 1.4.3 (contrast ratio >= 4.5:1) against its background in both light mode and dark mode, verified by a contrast audit of the selected theme's actual configured color tokens for this site — not assumed from theme defaults.
- Deploy safety: because there is no staging environment, the full production build (requirement 21) shall pass locally before any push to `main`, since a broken build or bad deploy is immediately visible on the live site.
- Build performance: the local production build log shall show no new errors or warnings compared to a build log captured from the pre-migration Hugoplate build (the baseline).
- Browser support for dark/light mode: [TBD] — no minimum browser version list provided in current context; flash-free mode switching should degrade gracefully (fall back to `prefers-color-scheme` alone) in browsers without `light-dark()` support.

## Constraints
- Must integrate with the existing CI/CD pipeline in `.github/workflows/main.yml`, which builds with pinned `HUGO_VERSION`, `GO_VERSION` (1.22.2), and `NODE_VERSION` (20.0.0), then FTP-deploys `./public/` — the build and deploy commands and the FTP deploy step are not being changed by this work, only the `HUGO_VERSION` pin.
- Must not modify blog post prose or front matter content beyond what is needed for theme compatibility (see Out of scope).
- Must use Blowfish as the primary theme choice, with Congo as the only permitted fallback, per the prior research verdict.
- Both candidate themes require Hugo Extended >= 0.158.0; the CI pin bump to >= 0.158.0 is mandatory, in-scope work, not optional.
- Local validation must use a locally downloaded Hugo binary matching the exact bumped CI version pin — not the Homebrew-installed Hugo (currently 0.164.0+extended, darwin/arm64), which can drift out of sync with the CI pin over time.
- No staging environment exists; `main` is the deploy branch.

## Out of scope
- Rewriting blog post prose or front matter content (the current SEO-template-voice content is a known, separate problem, not addressed here).
- Redesigning site structure, navigation, or information architecture beyond what the theme swap requires.
- Deep homepage redesign — only the stock-vs-bio-forward decision (requirement 12) is required; further homepage visual or structural redesign is out of scope.
- Changing the CI/CD deploy mechanism (FTP deploy target, build command flags, Node/Go version pins) beyond the required `HUGO_VERSION` bump.
- Search, PWA, image processing, video, icons, ads, gzip caching, or other Hugoplate module features not explicitly listed as target features (sticky/scrollspy TOC, reading-progress bar, fluid typography, flash-free dark/light mode) — carry these over only if the selected theme provides an equivalent out of the box; do not build replacements.
- Adding new content, pages, or posts.
- Setting up a staging environment.

## Acceptance criteria
1. `hugo.toml` and `config/_default/module.toml` reference the selected theme (Blowfish or Congo) and no longer reference `themes/hugoplate/` or its Hugo Module graph.
2. `.github/workflows/main.yml` sets `HUGO_VERSION` to a value >= 0.158.0.
3. A local build using a Hugo binary matching that exact `HUGO_VERSION` pin, run with `hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic`, completes with exit code 0 and no errors.
4. All 25 posts under `content/english/blog/` appear in the built `public/` output with their title, date, categories, and tags rendering, and the `image` field rendering correctly on every post where that field is present. All 4 uses of the `{{< image >}}` shortcode (in the one post that has them) are checked individually — not sampled.
5. Every blog post either shows a working comments widget, or a written note in the spec or plan confirms comments were intentionally dropped and why.
6. The rendered `<title>` tag on a sample post matches the decision made in requirement 7: either it reflects the post's `meta_title` value, or the theme's own title-generation output is confirmed acceptable.
7. The build log contains no undefined-shortcode errors that cause a page to fail to build.
8. `content/english/pages/elements.md` does not appear in the built `public/` output.
9. `content/english/authors/preston-bernstein.md` renders an author page with name, bio, and social links populated from the migrated front matter, and the author page's list of posts by this author is non-empty.
10. A blog post page longer than one viewport shows a sticky TOC that highlights the current section as the reader scrolls (scrollspy behavior), verified in a current desktop browser via manual visual check, or an automated Playwright assertion during the harden/verify phase.
11. A blog post page shows a reading-progress bar that visibly advances as the reader scrolls from top to bottom, verified in a current desktop browser via manual visual check, or an automated Playwright assertion during the harden/verify phase.
12. Resizing the browser viewport between 320px and 1440px wide changes body and heading font size smoothly, with no discrete jump at a fixed breakpoint; checked at exactly 320px, at exactly 1440px, and at a midpoint width between them.
13. Loading any page with the OS/browser set to dark mode, and separately with it set to light mode, shows the correct theme colors on first paint with no visible flash of the opposite mode. Verified in a current desktop browser via manual visual check, or an automated Playwright assertion during the harden/verify phase. Measured as: no frame showing the wrong theme's background color appears in a screen recording of page load, checked in both a light-mode-OS and dark-mode-OS browser profile.
14. In a browser without `light-dark()` CSS function support, the site still sets the correct dark/light mode via `prefers-color-scheme` alone, with no unstyled or broken-color state.
15. Toggling the site's dark/light mode control, then reloading the page, preserves the manually chosen mode (not the OS default) via `localStorage`, verified in a current desktop browser via manual visual check, or an automated Playwright assertion during the harden/verify phase.
16. A contrast audit of the selected theme's configured body-text color against its background color returns >= 4.5:1 in both light mode and dark mode.
17. `package.json` no longer contains `theme-setup` or `update-theme` scripts, and `scripts/themeSetup.js` / `scripts/themeUpdate.js` are removed from the repo.
