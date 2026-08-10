# Plan: Hugo Theme Refresh (pres-ber-blog)

## Approach

Replace Hugoplate with Blowfish, installed as a git submodule at `themes/blowfish/` (not Hugo Modules), and bump the CI `HUGO_VERSION` pin to an Extended build >= 0.158.0. Git submodule keeps a `themes/` directory present on disk, which matters here: `scripts/projectSetup.js` (still run by CI as `npm run project-setup`) only acts when `themes/` is *missing* — with Hugoplate's directory removed but a submodule directory in its place, that script stays a safe no-op and CI's existing steps do not need to change beyond the version pin and one checkout flag. Blowfish ships sticky/scrollspy table of contents (TOC), a reading-progress bar, fluid Tailwind typography, and flash-free `color-scheme` dark mode natively, so requirements 10–14 are satisfied by theme defaults and config, not new code. The remaining work is mostly subtraction — stripping Hugoplate's Hugo Modules graph, plugin-loader config, and demo content — plus mechanical front-matter remapping across 25 posts, validated against a pinned local Hugo binary before merge, since a broken build on `main` is a live incident with no staging to catch it first.

## Design decisions

Blowfish is the chosen replacement theme over Congo (its parent project) for five concrete reasons, not just prior research: a built-in zen reading mode, a sticky table of contents (TOC) that tracks scroll position, native KaTeX (math) and Mermaid (diagram) rendering, built-in Fuse.js search, and an active 2026 release history. Congo itself is still active — Congo v2.14.0 released 2026-05-23 — and both themes meet this project's Hugo >=0.158.0 floor, so either would build. Blowfish is a fork of Congo that adds the features above on top of Congo's base, which is why it's the primary pick. Congo remains the documented fallback: switch to it only if a concrete Blowfish blocker turns up against this repo's content model during implementation, not as a default hedge.

## Prerequisites

Complete these checks before any mechanical rewrite script or theme-swap commit runs — each one guards against a change that fails silently (no build error) rather than loudly:

1. **Research Blowfish's real author front-matter and content-model convention.** The exact front-matter key (`authors:` vs `author:`), the value's shape (does it match the author file's *filename* or a *front-matter field*?), and whether Blowfish expects author pages as a single flat file (this repo's current layout) or a page-bundle directory are all unconfirmed. Record the answer and cite the doc source and version used. This is the single highest-risk item in the plan: a wrong guess produces no build error, it just silently breaks author attribution across all 25 posts. The mechanical rewrite script (see Technology choices) may not run until this is recorded, and its output requires a full manual diff review against the recorded convention as its own required gate — not implied by "a single diff is more reviewable," a separate checked step.
2. **Validate the Hugo core version bump alone, before starting the theme swap.** The plan bumps Hugo from 0.125.7 to 0.164.0 (about 39 minor versions) in the same change as the full theme replacement. Build the *current* Hugoplate site successfully against the new pinned Hugo binary first, as its own separately-verifiable step. This is a validation-order change, not a new commit or PR requirement — if something breaks live later, this step is what lets you tell whether the Hugo upgrade or the theme swap caused it.
3. **Grep the whole repo for hardcoded Font Awesome classes.** The Font Awesome icon module is being removed wholesale (see API / interface contract), but only two files (the author page) have been checked for hardcoded `fa-*` classes so far. Run `grep -rE "fa-brands|fa-solid|fab fa-|fas fa-"` across all content and layout files as part of this pre-implementation audit, not just the files already inspected.
4. **Confirm the Blowfish submodule URL is the canonical upstream repo** (e.g. `github.com/nunocoracao/blowfish` — verify this exact URL at implementation time, since it wasn't confirmed live in this research session) before it's pinned in `.gitmodules`, to avoid a typo or an unofficial fork being registered by mistake.

## Architecture

```
content/english/*.md (front matter)
        |
        v
Hugo build (Goldmark markup + themes/blowfish templates)
        |
        v
public/  (static HTML/CSS/JS; Blowfish bundles its own dark-mode/TOC/progress-bar JS)
        |
        v
git push main --> GitHub Actions
        |   checkout (submodules: true)
        |   install Hugo Extended <pinned>
        |   npm run project-setup (no-op: themes/ exists)
        |   npm install && npm run build
        v
FTP deploy --> ./public/ --> prestonbernstein.com  (live, no staging)

Local validation gate (required before merge):
  pinned Hugo binary (matches CI's exact HUGO_VERSION, not brew) + same repo state
        |
        v
  hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic
        |
        v
  exit code 0, no shortcode/template errors
        |
        v
  Manual visual pass (required, second merge gate — a CLI build succeeding
  cannot catch these): `hugo server`, then walk the homepage, one post, the
  dark/light toggle, and TOC scroll behavior  --> only then push to main
```

Rollback procedure for a live incident (documented here, not just implied): `git revert <merge-commit-sha> && git push origin main` triggers a redeploy of the prior working state.

Before: `themes/hugoplate/` (vendored) + 24 `[[imports]]` entries in `go.mod`/Hugo Modules (23 `github.com/gethugothemes/hugo-modules/*` + 1 `hugomods/mermaid`) resolved at build time.
After: `themes/blowfish/` (git submodule, pinned to a tagged release commit), no Hugo Modules theme graph. `go.mod` and `[module.mounts]` in `hugo.toml` (which mount `assets/` and `hugo_stats.json` for the Tailwind pipeline — unrelated to theme imports) are kept only if local build testing shows they're still needed without any `[[imports]]`.

## Data model

- `content/english/blog/*.md` (25 posts): `author: "Preston Bernstein"` (a plain string) needs to become Blowfish's author-list front-matter key (commonly `authors: ["preston-bernstein"]`, a list of author-page slugs matching `content/english/authors/preston-bernstein.md` — confirm the exact key name against Blowfish's current docs before running the rewrite, since it wasn't verified live in this session). `title`, `description`, `date`, `categories`, `tags`, `draft`, `image` are standard Hugo fields and need no change. `meta_title` is a Hugoplate/basic-seo-module field with no guaranteed Blowfish equivalent — it will sit unused as an inert front-matter key unless a small template override routes it into the `<title>` tag; either outcome is a "no build error" state, but silent SEO-title regression is worth a deliberate decision, not an accident.
- `content/english/authors/preston-bernstein.md`: the `social:` list (`name`, `icon: "fa-brands fa-github"`, `link`) needs mapping to Blowfish's author-social schema. Confirm the exact shape during implementation; Blowfish-family themes typically key social entries by network name rather than a raw Font Awesome CSS class (e.g. `icon: fa-brands fa-github` collapsing to `network: github`), so this is a field-shape change, not just a rename.
- `content/english/pages/elements.md`: deleted outright (requirement 8) — it is Hugoplate's template-demo page, not site content, and it is the only file besides one blog post using the ten Hugoplate-only shortcodes.
- `content/english/blog/secure-services-docker-compose-and-nordvpn.md`: the only blog post using a Hugoplate shortcode — 4x `{{< image src=... caption=... position=... command=... webp=... >}}`. Primary approach: hand-edit this one file to plain Markdown image syntax or inline HTML `<figure>`/`<figcaption>`. A custom shortcode is more machinery than one file needs — reserve it only if plain Markdown/HTML proves visually inadequate.
- `data/social.json`: Hugoplate's site-wide footer social-icon data file. It is not simply redundant with the author page's `social:` list — the two already disagree today (`data/social.json` uses the `fab fa-github` Font Awesome class prefix and a GitHub URL with `www.`; the author page uses `fa-brands fa-github` with no `www.`). Before deleting this file: reconcile which values are correct, and confirm Blowfish's `params.author` (or equivalent) actually renders site-wide footer icons on every page, not just on the author bio — don't assume "redundant" without verifying Blowfish covers the same visual surface.
- `data/theme.json`: Hugoplate's custom hex color palette (light/dark body, text, border colors) **and** a custom font pairing (`Heebo` primary, `Signika` secondary, both with explicit weights). The font choice needs the same explicit decision treatment as the colors — stock Blowfish fonts vs. porting this pairing — and feeds the same WCAG audit gate below. Blowfish uses its own named/overridable color-scheme mechanism, not a raw data-JSON palette — either port these hex values into Blowfish's scheme-override file or accept a stock Blowfish scheme. Whichever is chosen, it is the input to the mandatory WCAG contrast audit below.
- `content/english/_index.md` (homepage) and `content/english/sections/call-to-action.md`: both are consumed by Hugoplate's homepage-builder pattern (the `_build: render: "never"` front matter on `call-to-action.md` is the tell — it's injected into the homepage template, not rendered as its own page). `_index.md` is not flat bio prose — its front matter is a `features:` array with one entry, and that entry's `content:` field is a block of inline HTML, including a `class="natural-link"` attribute (a Hugoplate-defined CSS class, not portable to Blowfish — it will render unstyled under Blowfish unless carried over or replaced). Blowfish's homepage is a fixed template (recent posts + author bio), so this builder pattern has no equivalent home. The homepage bio text is real content (Preston's own bio) and needs a landing spot in Blowfish's homepage/author config, with the `natural-link` styling either carried over or replaced; `call-to-action.md`'s content is itself Hugoplate promotional copy ("Build lightning-fast static sites with... Hugoplate", linking to `zeon-studio/hugoplate`) — treat it the same as `elements.md`: demo debris to drop, not site content to preserve.
- `content/english/pages/privacy-policy.md`, `content/english/sections/call-to-action.md` (structurally), `content/english/contact/_index.md`, `content/english/blog/_index.md`: no shortcodes and no theme-specific front-matter fields found in these — front matter carries over unchanged, but their rendering depends entirely on Blowfish having (or not having) an equivalent page/section template, which is a template question, not a data-model one.

## API / interface contract

- `hugo.toml`: `theme = "hugoplate"` → `theme = "blowfish"`. Remove `[[params.plugins.css]]` / `[[params.plugins.js]]` (Hugoplate's manual asset-loader convention — no equivalent needed, Blowfish manages its own JS/CSS). Map `[markup.tableOfContents]` (`startLevel = 2`, `endLevel = 5`, `ordered = true`) to Blowfish's own TOC params (its article-level `showTableOfContents`/depth settings). Keep `[module.mounts]`, `[imaging]`, `[caches]`, `[permalinks.page]`, `[services.googleAnalytics]` as-is (theme-agnostic). `[outputs]` (`home = ["HTML", "RSS", "WebAppManifest", "SearchIndex"]`) is **not** simply theme-agnostic: `WebAppManifest` and `SearchIndex` are generated by the `pwa` and `search` Hugo Modules being deleted, so without an equivalent under Blowfish this either errors or silently ships broken/empty files — confirm and adjust the `[outputs]` list to match what Blowfish actually supports. Per the plan's own scope rule (carry a feature over only if the theme provides it natively), Blowfish's native Fuse.js search should be wired up to replace the deleted `[search]` config block, not just have that block stripped with nothing put in its place. `[services.disqus]` needs a decision: confirm whether Blowfish ships a Disqus comments partial; if not, either add a small template override or accept comments silently disappearing from all 25 posts (not a named requirement, but a visible regression).
- `config/_default/module.toml`: remove all 24 `[[imports]]` entries (23 `gethugothemes/hugo-modules/*` + `hugomods/mermaid`); bump `[hugoVersion] min` to match the new CI pin.
- `config/_default/params.toml`: strip Hugoplate/module-specific keys with no in-scope replacement (`favicon`/`logo`/`logo_darkmode` module-specific handling, `theme_switcher`/`theme_default` dark-mode-toggle keys, `[search]` block, `google_adsense`, `[preloader]`, `[navigation_button]`) and re-set the ones that map to real target features (dark-mode default, favicon/logo path) in Blowfish's own param names. `google_tag_manager` belongs on this same strip-or-remap list, next to `google_adsense`: it looks theme-agnostic, but the actual `<script>` injection that reads it lives in the `seo-tools/google-tag-manager` Hugoplate module being deleted. Give it the same caution already given to Disqus above — confirm Blowfish reads this key, or GTM silently stops firing with no build error.
- `config/_default/languages.toml`, `config/_default/menus.en.toml`, `config/development/server.toml`: verify against Blowfish's expected shape (menu entries and language block are core Hugo and likely carry over unchanged; confirm no extra keys Blowfish's partials expect, e.g. per-menu icon/weight params).
- `.github/workflows/main.yml`: `HUGO_VERSION: 0.125.7` → `0.164.0` (latest verified stable Hugo Extended as of this session; re-verify at execution time since releases move fast — the hard floor is >= 0.158.0). `actions/checkout`'s `submodules: false` → `submodules: true` — this is a mandatory companion change, not optional: without it the git submodule directory is empty in CI and every page fails to build. Build/deploy steps, FTP target, and Node/Go pins are otherwise unchanged per constraints.
- `go.mod`: remove all `github.com/gethugothemes/hugo-modules/*` and `github.com/zeon-studio/hugoplate` require lines. Keep the bare `module`/`go` directive only if local build validation shows `[module.mounts]` in `hugo.toml` still needs a `go.mod` present with zero imports — verify, don't assume. Tracked follow-on: if `go.mod` ends up deleted, also remove the "Install Go" step and the `GO_VERSION` env var from `.github/workflows/main.yml` — otherwise they become dead weight with nothing tracking their removal.
- `.gitmodules` (new file): registers `themes/blowfish` pointing at Blowfish's upstream repo, pinned to a tagged release commit (not a floating branch), for build reproducibility.
- `package.json`: remove `theme-setup` and `update-theme` scripts (requirement 9). Keep `project-setup` — it becomes a verified no-op once `themes/blowfish/` exists on disk. `update-modules` (Hugo-Modules-oriented) becomes dead but isn't named in any requirement, so leave it rather than gold-plate cleanup.
- Shortcode surface: no new shortcode library. Primary approach is a hand-edit of the one file with `{{< image >}}` calls to plain Markdown/HTML — a custom shortcode is a fallback only, sized for the 4 calls in that one blog post, and built only if the hand-edit proves visually inadequate.

## Integration points

- `hugo.toml` — theme name, plugin-loader blocks removed, TOC config mapped, Disqus decision.
- `config/_default/module.toml` — all 24 `[[imports]]` removed, `hugoVersion.min` bumped.
- `config/_default/params.toml` — Hugoplate/module-specific params stripped or remapped (search, adsense, preloader, navigation_button, theme_switcher, `google_tag_manager`).
- `config/_default/languages.toml` — verify shape against Blowfish's expectations.
- `config/_default/menus.en.toml` — verify `[[main]]` entries render under Blowfish's menu partial.
- `config/development/server.toml` — check for Hugoplate-specific dev-server keys.
- `hugo.toml` `[outputs]` — confirm/adjust the `home` list (`WebAppManifest`, `SearchIndex` depend on the deleted `pwa`/`search` modules); wire up Blowfish's native Fuse.js search as the replacement for the deleted `[search]` config block.
- `tailwind.config.js` (repo root) — Hugoplate-specific: its `content` glob and `hugo_stats.json`-based JIT scanning target Hugoplate's template paths. Blowfish ships its own Tailwind-based templates and asset pipeline under `themes/blowfish/`. Determine whether this file needs to be replaced by Blowfish's own asset-pipeline convention — Blowfish's templates likely aren't scanned by the old config's content globs, and the two Tailwind setups may conflict (see Risk areas).
- `.github/workflows/main.yml` — `HUGO_VERSION` bumped to >= 0.158.0; `actions/checkout` `submodules: false` → `true`.
- `go.mod` — Hugoplate/gethugothemes requires removed; file kept or deleted pending local verification. If deleted, also remove the "Install Go" step and `GO_VERSION` from `.github/workflows/main.yml` as a tracked follow-on.
- `.gitmodules` — new, registers the `themes/blowfish` submodule pinned to a release tag (URL confirmed against the canonical upstream repo per Prerequisites, not guessed).
- Repo onboarding docs (e.g. the README's setup section) — add `git clone --recurse-submodules` (or `git submodule update --init`) as a required setup step. A plain `git clone` leaves `themes/blowfish/` present but empty, and `scripts/projectSetup.js`'s guard only checks that the directory *exists*, not that it's populated — this produces a silent no-op setup and a confusing build failure for any future contributor, including Preston on a new machine. This is a known trade-off of the submodule approach: Hugo Modules has no analogous "empty directory" failure mode.
- `themes/hugoplate/` — deleted entirely.
- `themes/blowfish/` — added as a git submodule.
- `package.json` — `theme-setup`/`update-theme` scripts removed.
- `scripts/themeSetup.js`, `scripts/themeUpdate.js` — deleted from the repo.
- `data/social.json` — reconcile against the author page's `social:` list first (the two disagree today on Font Awesome class prefix and on `www.` in the GitHub URL), and confirm Blowfish's `params.author` (or equivalent) actually renders site-wide footer icons, before removing.
- `data/theme.json` — custom palette **and font pairing** ported into Blowfish's scheme mechanism, or dropped for stock Blowfish defaults (decision feeds the WCAG audit).
- `layouts/shortcodes/image.html` — fallback only, created only if a plain Markdown/HTML hand-edit of `secure-services...` proves visually inadequate.
- `content/english/blog/*.md` (all 26 files, glob `content/english/blog/*.md` excluding `_index.md`, i.e. 25 real posts) — `author:` string rewritten to the theme's author-list key via a scripted, mechanical transform (not 25 manual edits).
- `content/english/blog/secure-services-docker-compose-and-nordvpn.md` — the 4 `{{< image >}}` shortcode calls replaced with the theme-native equivalent.
- `content/english/authors/preston-bernstein.md` — `social:` list remapped to the theme's author-social schema.
- `content/english/pages/elements.md` — deleted (requirement 8).
- `content/english/sections/call-to-action.md` — dropped as Hugoplate demo debris (no Blowfish homepage-builder equivalent exists for it to plug into).
- `content/english/_index.md` — a `features:` array whose `content:` block (real bio content, unlike `call-to-action.md`) needs a new landing spot in Blowfish's homepage/author config; its inline HTML `class="natural-link"` will render unstyled under Blowfish unless carried over or replaced.
- `content/english/pages/privacy-policy.md`, `content/english/contact/_index.md`, `content/english/blog/_index.md` — no shortcodes or theme-specific fields; verify rendering under Blowfish's page/section templates as part of the build-validation pass.

## Technology choices

- **Blowfish** (Tailwind CSS 3 fork of Congo) as the replacement theme — ships zen reading mode, sticky TOC, KaTeX/Mermaid, Fuse.js search, and active 2026 releases; chosen per prior research as the primary candidate, with Congo as the only permitted fallback if a concrete Blowfish blocker surfaces against this repo's content model during implementation.
- **Git submodule** (not Hugo Modules) as the install method — keeps `themes/` present on disk so `scripts/projectSetup.js`'s existing `themes/`-existence guard stays a safe no-op, avoids adding a Go-module-proxy network dependency to every CI build, and requires only one CI flag change (`submodules: true`) instead of Go-toolchain/`hugo mod` bookkeeping. Trade-off #1: a plain `git clone` (without `--recurse-submodules`) leaves `themes/blowfish/` present but empty, which the projectSetup.js guard doesn't catch — see the onboarding note in Integration points. Trade-off #2: theme updates are manual and must pin to a tag, not a branch. `git submodule update --remote` tracks whatever branch `.gitmodules` points at (normally the theme's default branch), which contradicts this plan's own goal of staying pinned to a tagged release commit — do not use it. The actual update procedure: `git fetch --tags` inside `themes/blowfish`, then `git checkout <new-tag>`, then commit the updated submodule reference in the parent repo. This replaces the single-command `hugo mod get -u` that Hugo Modules would have given.
- **No new JS/CSS libraries** for TOC, scrollspy, progress bar, or dark mode — Blowfish provides all four natively; building replacements would violate the "carry over only if the theme provides it, don't build it" scope rule.
- **Pinned local Hugo binary**, downloaded to a repo-local tools path (not Homebrew, which currently drifts at 0.164.0+extended and isn't guaranteed to match whatever exact version CI ends up pinned to) — the only way requirement 15's pre-merge gate actually proves what CI will do.
- **One-off migration script** (Node or shell, run once, not committed as a permanent npm script) to mechanically rewrite the `author:` front-matter key across all 25 blog posts — safer and more reviewable as a single diff than 25 manual edits. Use a proper YAML/TOML front-matter parsing library, not shell regex, to avoid quoting/escaping bugs on values with special characters, and make the script idempotent — safe to re-run, skipping files that already have the new key rather than double-processing them.

## Risk areas

1. **Unverified theme param names.** The author-social schema, TOC config keys, and Disqus-comment support are described from general theme-migration patterns, not confirmed against Blowfish's current documentation in this session. Config/front-matter edits should be checked against Blowfish's actual docs before the rewrite runs, or the local build gate will only catch the mismatch after the work is done.
2. **Comments may silently disappear.** If Blowfish has no Disqus partial, all 25 posts lose comments with no build error to flag it — a real regression not covered by any acceptance criterion, easy to miss in review.
3. **Color/contrast is a late-breaking gate.** Whichever color scheme is finally configured (stock Blowfish vs. a ported `data/theme.json` palette) must independently clear the 4.5:1 WCAG audit in both light and dark mode; if it doesn't, palette tuning becomes unplanned work sitting on the critical path to merge.
4. **One-shot production deploy, no staging.** The theme swap, the 25-file front-matter rewrite, and the CI version/checkout changes all land together on a branch that merges straight to `main` → live FTP deploy. The local build gate proves the build succeeds; it can't catch things that only show up in a real browser — scrollspy behavior, dark/light flash timing, or a pinned submodule commit that becomes unreachable upstream later. The manual visual pass and rollback procedure in Architecture exist to cover this gap.
5. **`go.mod` fate is uncertain.** Whether `[module.mounts]` in `hugo.toml` (used for the Tailwind asset pipeline, unrelated to theme imports) still requires a `go.mod` present with zero `[[imports]]` isn't confirmed. Test this from a clean checkout, not a working directory with cached Hugo Modules state, since stale caches can hide the failure locally and let it surface only in CI.
6. **Cookie-consent removal vs. tracking that stays.** The `components/cookie-consent` module is being removed wholesale (it's one of the 24 deleted imports) while GA/GTM tracking stays. This is a compliance consideration to document — the cookie-consent banner goes away, but tracking that sets cookies remains — not new consent-banner infrastructure to build; building one would be scope creep beyond a theme/UI migration.
7. **Tailwind config conflict.** `tailwind.config.js` at the repo root targets Hugoplate's template paths (see Integration points). If it isn't replaced by Blowfish's own asset-pipeline convention, the likely failure mode is a silently unstyled site that still builds and deploys with exit code 0 — no error, just broken styling live.
8. **`npm test` is never run in this migration.** `package.json`'s `"test": "jasmine --config=jasmine.json"` suite should be run once to check whether any specs assert against Hugoplate-specific markup or behavior that the migration invalidates, and those specs updated or removed.
9. **Verification gaps beyond the CLI build gate.** The CLI build gate cannot verify Disqus rendering, GA/GTM firing, TOC/scrollspy/progress-bar/dark-mode-flash behavior, or WCAG contrast. These require the manual visual pass in Architecture or, better, real Playwright coverage — that coverage belongs to the harden/verify phases of the pipeline this plan feeds into, not something this document needs to build itself.
10. **Confirm `google_adsense` isn't a live revenue source before removing it.** A cheap check that avoids silently killing monetization that happens to be active.
11. **Confirm the Blowfish submodule URL before pinning it** (see Prerequisites) — a typo or an unofficial fork pinned by mistake is otherwise a silent, hard-to-notice mistake baked into `.gitmodules`.
