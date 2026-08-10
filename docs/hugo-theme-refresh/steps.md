# Steps: Hugo Theme Refresh (pres-ber-blog)

## Prerequisites
Download or build the latest verified Hugo Extended binary matching the pinned CI version (>= 0.158.0; recommend 0.164.0 from https://github.com/gohugoio/hugo/releases). Verify it runs with `hugo version`. Keep this binary available and use it for every build/server command throughout these steps, not just the final validation.

## Implementation steps

### Step 1: Add Blowfish Theme as Git Submodule
**What**: Register the Blowfish theme repository as a git submodule pinned to a stable release tag, creating `themes/blowfish/` on disk.
**Files**: `.gitmodules` (new).
**Test**: `git config --file=.gitmodules --get-regexp '^submodule\.blowfish'` returns entries; `ls themes/blowfish/` lists theme files.
**Depends on**: none.
**Parallelizable**: Yes.

### Step 2: Remove Hugoplate Theme Directory
**What**: Delete the vendored `themes/hugoplate/` directory since Blowfish replaces it.
**Files**: `themes/hugoplate/` (deleted).
**Test**: `test ! -d themes/hugoplate` exits successfully.
**Depends on**: Step 1.
**Parallelizable**: No.

### Step 3: Research and Record Blowfish Conventions
**What**: Read Blowfish's official documentation and record its expected schemas for author front-matter (field name, list vs. flat, slug source), author-social configuration (network key vs. icon class), TOC parameter names, and whether it includes a Disqus-compatible comments partial. Save findings with documentation URL and version to a short text file (e.g., `docs/blowfish-schema.txt`) for reference in later steps.
**Files**: `docs/blowfish-schema.txt` (new, reference only; not committed if not needed).
**Test**: Schema file exists with at least 4 sections (author front-matter, author-social, TOC, comments); each section cites the source documentation URL.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 4: Migrate hugo.toml — Core and Build Config
**What**: Change theme name from `hugoplate` to `blowfish`; remove Hugoplate's manual `params.plugins` asset-loader blocks; verify remaining config (outputs, imaging, caches, markup, permalinks) are theme-agnostic and kept as-is.
**Files**: `hugo.toml`.
**Test**: Grep finds `theme = "blowfish"` and no `[[params.plugins` entries; build output shows no config-parse errors.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 5: Migrate config/_default/module.toml — Remove Hugo Modules Imports
**What**: Delete all 24 `[[imports]]` entries. Bump `[hugoVersion] min` from 0.124.1 to 0.158.0.
**Files**: `config/_default/module.toml`.
**Test**: `grep -c '^\[\[imports\]\]' config/_default/module.toml` returns 0; grep finds `min = "0.158.0"`.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 6: Strip Hugoplate-Specific params.toml Keys
**What**: Remove only Hugoplate-specific top-level keys and blocks: `favicon`, `logo`, `logo_darkmode`, `logo_width`, `logo_height`, `logo_webp`, `logo_text`, `theme_switcher`, `theme_default`, `[preloader]`, `[navigation_button]`, `[search]`, `google_adsense`, and `custom_script`. Keep theme-agnostic keys: `mainSections`, `contact_form_action`, `google_tag_manager`, `copyright`, and the `[metadata]`, `[site_verification]`, `[cookies]`, `[mermaid]`, `[widgets]`, `[google_map]` blocks.
**Files**: `config/_default/params.toml`.
**Test**: Grep finds no `logo` or `theme_switcher` entries; `grep -E '^(favicon|google_adsense|custom_script)' config/_default/params.toml` returns no matches.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 7: Add Blowfish-Native params.toml Keys
**What**: Re-add Blowfish's expected dark-mode and UI configuration parameters (favicon path, logo path, color scheme keys) using the exact key names confirmed in Step 3's schema document. Do not guess key names—use the documented Blowfish schema as reference.
**Files**: `config/_default/params.toml`.
**Test**: Config parses without errors in a local build; Blowfish build does not error on missing keys it expects.
**Depends on**: Step 3 and Step 6.
**Parallelizable**: No.

### Step 8: Verify Remaining Config Files
**What**: Check that `config/_default/languages.toml`, `config/_default/menus.en.toml`, and `config/development/server.toml` contain only standard Hugo fields (language, contentDir, languageName, weight for languages; menu entry name, identifier, URL, weight; port, bind for server) with no Hugoplate-specific extensions or params Blowfish partials might not expect.
**Files**: `config/_default/languages.toml`, `config/_default/menus.en.toml`, `config/development/server.toml`.
**Test**: No config parse errors during local build; menu entries render in browser; `hugo server --environment development` runs without config errors.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 9: Grep for Font Awesome Icon Classes Across All Files
**What**: Run a repo-wide grep for hardcoded Font Awesome icon class patterns (`fa-brands`, `fa-solid`, `fab fa-`, `fas fa-`) across all content markdown files, layout templates, and shortcodes. Identify any uses outside the author page template that will silently break once the Font Awesome module is removed. Record findings in a checklist with disposition (remove, replace with Blowfish icon equivalent, or narrow custom shortcode).
**Files**: All `.md`, `.html`, `.yml` files in `content/` and `layouts/`.
**Test**: Grep results saved or logged; each result has a noted disposition.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 10: Audit All Hugoplate-Only Shortcodes Across Content
**What**: Grep all content files for each Hugoplate shortcode named in requirements.md (`accordion`, `button`, `gallery`, `image`, `notice`, `slider`, `tab`, `tabs`, `toc`, `video`, `youtube`). For each hit, record its location and decide disposition: remove entirely, replace with Blowfish's native handling (e.g., Markdown image syntax, callout syntax), or create a small custom shortcode.
**Files**: All `.md` files in `content/`.
**Test**: Spreadsheet or checklist exists with shortcode name, count of occurrences, file paths, and disposition for each; all dispositions are assigned.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 11: Define and Confirm Color Scheme
**What**: Decide whether to use Blowfish's stock color scheme or port a custom palette from `data/theme.json`. Extract and confirm the hex values for text color, background, and key UI elements. Document which option is chosen and which specific values will be used for contrast auditing.
**Files**: `config/_default/params.toml` (if custom palette) or confirmation of stock scheme.
**Test**: Color values (at least 3: body text, background light, background dark) are documented with hex codes.
**Depends on**: Step 7.
**Parallelizable**: Yes.

### Step 12: Rewrite Author Field in Blog Posts (Dry Run)
**What**: Write a one-off Node or shell script to mechanically transform `author: "Preston Bernstein"` (a plain string) to Blowfish's author-list key format (confirmed in Step 3's schema, e.g., `authors: ["preston-bernstein"]`, a list). Run the script against 2–3 sample blog posts from `content/english/blog/` and review the output before applying to all posts.
**Files**: Sample posts only (e.g., 2–3 `.md` files from `content/english/blog/`).
**Test**: Script output shows the transformed front-matter for sample posts; diffs are reviewed and verified correct before proceeding to Step 13.
**Depends on**: Step 3.
**Parallelizable**: Yes.

### Step 13: Rewrite Author Field in All 25 Blog Posts (Apply)
**What**: Apply the tested script from Step 12 to all 25 blog posts in `content/english/blog/` (excluding `_index.md`). Emit a summary of all edits.
**Files**: `content/english/blog/*.md` (all 25 blog posts, modified).
**Test**: One randomly selected blog post shows the transformed author key in its front matter; no parse errors in build.
**Depends on**: Step 12.
**Parallelizable**: No.

### Step 14: Replace Hugoplate Image Shortcode in secure-services Post
**What**: The file `content/english/blog/secure-services-docker-compose-and-nordvpn.md` contains 4 `{{< image >}}` Hugoplate shortcode calls. Replace each with Blowfish's native image handling: either inline Markdown image syntax (if captions are not critical) or a narrowly-scoped custom shortcode in `layouts/shortcodes/image.html` that accepts caption/position and wraps a standard Hugo image resource. Verify image file paths resolve under the new theme.
**Files**: `content/english/blog/secure-services-docker-compose-and-nordvpn.md`; optionally `layouts/shortcodes/image.html` (new, if custom shortcode chosen).
**Test**: Build completes with no shortcode-undefined errors; browser displays the post with images and captions (if used) rendered correctly.
**Depends on**: Step 13.
**Parallelizable**: No.

### Step 15: Migrate Author Page Social Fields
**What**: Transform `content/english/authors/preston-bernstein.md`'s `social:` list from Hugoplate's schema (name, icon: "fa-brands fa-github", link) to Blowfish's expected schema (confirmed in Step 3's schema; typical: network: "github" instead of icon class, or social: [{network: "github", url: "..."}]). Update the author bio and name fields to match Blowfish's expected keys.
**Files**: `content/english/authors/preston-bernstein.md`.
**Test**: Author page renders in browser with name, bio, and social links populated; no template errors in build log.
**Depends on**: Step 3.
**Parallelizable**: Yes.

### Step 16: Delete Demo Content Files
**What**: Delete `content/english/pages/elements.md` (Hugoplate's template-showcase demo) and `content/english/sections/call-to-action.md` (Hugoplate-specific homepage-builder promo copy, not real site content).
**Files**: `content/english/pages/elements.md` (deleted), `content/english/sections/call-to-action.md` (deleted).
**Test**: `test ! -f content/english/pages/elements.md && test ! -f content/english/sections/call-to-action.md`; build succeeds.
**Depends on**: Step 2.
**Parallelizable**: Yes.

### Step 17: Migrate Homepage Bio Placement
**What**: For `content/english/_index.md`, extract the real author bio text and decide whether to keep it in _index.md as a homepage intro section or move it entirely to Blowfish's author page or config. Apply that decision.
**Files**: `content/english/_index.md` (potentially modified).
**Test**: Homepage renders with author bio visible in the configured location (either _index.md section or Blowfish author config); build succeeds.
**Depends on**: Step 15.
**Parallelizable**: No.

### Step 18: Remove Hugoplate Npm Scripts and Script Files
**What**: Delete `package.json` entries for `theme-setup` and `update-theme` scripts. Delete the backing script files `scripts/themeSetup.js` and `scripts/themeUpdate.js`. Keep all other scripts (dev, build, preview, project-setup, update-modules, etc.) and verify `project-setup` remains a safe no-op (it checks for `themes/` existence; since `themes/blowfish/` exists, the guard passes).
**Files**: `package.json` (modified), `scripts/themeSetup.js` (deleted), `scripts/themeUpdate.js` (deleted).
**Test**: `npm run theme-setup` or `npm run update-theme` fail with "npm ERR! unknown script"; `npm run project-setup` runs without error.
**Depends on**: none.
**Parallelizable**: Yes.

### Step 19: Run Jasmine Test Suite
**What**: Run the existing Jasmine test suite with `npm test` to check whether any spec asserts depend on Hugoplate-specific markup or behavior that needs updating or removal.
**Files**: `tests/` (test files, read-only).
**Test**: `npm test` exits with zero failures; any test marked as skipped is reviewed and either re-enabled or formally deprecated.
**Depends on**: Step 18.
**Parallelizable**: No.

### Step 20: Full Diff Review of All Blog Post Front-Matter
**What**: Review a complete diff of all 25 migrated blog post front-matter changes against the Blowfish schema recorded in Step 3. Check that every transformed author key matches Blowfish's expected field name, that no stray Hugoplate fields remain, and that any custom fields needed by the site are correctly preserved.
**Files**: `content/english/blog/*.md` (all 25 posts, diff only; not modified in this step).
**Test**: Diff report generated; all 25 posts verified to have correct front-matter structure; no mismatched keys found.
**Depends on**: Step 13.
**Parallelizable**: No.

### Step 21: Update CI Workflow — Hugo Version and Submodules Checkout
**What**: In `.github/workflows/main.yml`, change `HUGO_VERSION: 0.125.7` to `HUGO_VERSION: 0.164.0` (or the exact latest stable version pinned locally per Prerequisites). Change the checkout step's `submodules: false` to `submodules: true` so the `themes/blowfish/` submodule is cloned in CI.
**Files**: `.github/workflows/main.yml`.
**Test**: Inspect the file and verify both changes are present.
**Depends on**: Step 1 and Step 23.
**Parallelizable**: No.

### Step 22: Verify and Clean up go.mod
**What**: Examine `go.mod` to confirm all Hugoplate and gethugothemes requires are removed. Determine whether `[module.mounts]` in `hugo.toml` (for Tailwind asset pipeline) still requires a minimal `go.mod` with zero `[[imports]]`. Test from a fresh clone or clean working directory to avoid stale Hugo Module cache interference. If mounts work without any `go.mod`, delete the file; otherwise, keep it with only bare `module` and `go` directives and no imports.
**Files**: `go.mod` (deleted or minimized).
**Test**: Run a build directly after this step's own change, using the pinned binary from Prerequisites, before moving to Step 23. Verify no "missing module" or "go.mod required" errors occur.
**Depends on**: Steps 4–5.
**Parallelizable**: No.

### Step 23: Full Local Production Build Validation
**What**: Run a complete local production Hugo build using the pinned Hugo binary from Prerequisites, with the exact flags specified in requirements: `hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic`. This gate proves the build succeeds locally before any push to main, since main is the deploy branch and CI failure is a live incident.
**Files**: All repo files; output to `public/` (generated, not committed).
**Test**: Exit code is 0; build log shows zero shortcode-undefined or template errors; `public/` exists with 25 blog posts rendered (spot-check 2–3 posts by opening their HTML files in `public/blog/` to verify title, date, categories, tags, image src render). Verify no build warnings about missing or broken imports.
**Depends on**: Steps 3–22.
**Parallelizable**: No.

### Step 24: Spot-Check Acceptance Criteria
**What**: Verify acceptance criteria not already covered by Step 23's build check: confirm deleted demo files (elements.md, call-to-action.md) do not appear in `public/pages/` or `public/sections/`; confirm author page (`public/authors/preston-bernstein/`) has a non-empty post list; confirm no undefined-shortcode errors appear in build log; confirm 25 blog posts are present in `public/blog/`.
**Files**: `public/` (generated).
**Test**: Manual file-system checks: `test ! -d public/pages/elements && test ! -d public/sections/call-to-action && test -d public/authors/preston-bernstein && find public/blog -name index.html | wc -l` returns 25.
**Depends on**: Step 23.
**Parallelizable**: No.

### Step 25: Browser-Driven Verification
**What**: Open the built site in a browser and verify dynamic features: sticky/scrollspy TOC behavior on a post with multiple sections; reading-progress bar advancing on scroll; dark/light mode first-paint (no flash; toggle between OS light and dark, clear browser cache between tests); mode-toggle persistence via localStorage (set mode, refresh page, confirm it persists); Disqus comments rendering (or documented absence if not configured); GA/GTM script tag present in rendered page `<head>`.
**Files**: `public/` (generated; browser interaction only).
**Test**: Manual browser checklist: 5–6 features confirmed working; any missing or broken feature is documented.
**Depends on**: Step 24.
**Parallelizable**: No.

### Step 26: Contrast Audit (WCAG 2.2 Success Criterion 1.4.3)
**What**: Audit the configured Blowfish color scheme (stock or custom, confirmed in Step 11) to verify body-text color contrast against background is >= 4.5:1 in both light mode and dark mode. Use a contrast-checking tool (e.g., WebAIM Contrast Checker, axe DevTools, or similar) on a live or local build page. Extract hex values from configuration and audit them directly.
**Files**: None (audit only).
**Test**: Contrast checker reports >= 4.5:1 for body text in both modes; audit document saved or results noted.
**Depends on**: Step 11 and Step 25.
**Parallelizable**: No.

### Step 27: Commit and Prepare for Merge
**What**: Stage all modified and deleted files (config changes, content rewrites, package.json, CI workflow, submodule registration). Write a clear commit message summarizing the theme swap (Hugoplate → Blowfish), version pin bump, and key changes. Do not commit `public/` (it is generated). Push to the current branch (theme-refresh-blowfish-v2) and prepare a pull request or direct merge to main per project workflow.
**Files**: All changed files from steps 1–22.
**Test**: `git status` shows no untracked files except `public/`; `git log -1` displays the commit message; branch is pushed to remote.
**Depends on**: Steps 23–26.
**Parallelizable**: No.

## Rollback plan

**Steps 1–2 (theme installation):** If Blowfish proves incompatible with repo content during initial config/build phases, use full submodule cleanup: `git submodule deinit -f themes/blowfish`, remove the `.gitmodules` file entry for `submodule.blowfish.*`, remove the now-stale `.git/modules/blowfish` directory, then `git rm -f themes/blowfish`. Restore `themes/hugoplate/` from git history (`git checkout HEAD -- themes/hugoplate/`). Revert config and workflow changes. This is reversible via git.

**Steps 3–22 (config, content, and testing):** All file edits are tracked by git. Revert any step(s) with `git checkout HEAD -- <files>` if a config or content change introduces a build failure not resolved in that step. The front-matter rewrite (Step 13) is the highest-risk mechanical change; if the script produces incorrect output, undo with `git checkout HEAD -- content/english/blog/` and re-run the script with fixes.

**Steps 23–26 (validation only):** Non-destructive; no rollback needed.

**Step 27 (commit/push):** If the commit is made but not yet pushed to remote, amend with `git commit --amend` or reset with `git reset HEAD~1` and re-stage files. If already pushed to main (the production branch), revert with a new commit: `git revert <merge-commit-sha> && git push origin main` to redeploy the last known-good state.

**Overall:** All steps reversible via `git checkout` or `git revert` until the change is merged to main and deployed. Since main is the production deploy branch, test thoroughly in Step 23 before allowing any push.
