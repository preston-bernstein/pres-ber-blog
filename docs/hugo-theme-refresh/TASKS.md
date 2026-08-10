# Tasks: Hugo Theme Refresh (pres-ber-blog)

Generated from: docs/hugo-theme-refresh/ on 2026-08-10

Note: corrected a circular dependency from steps.md during load — Step 21 (edit
`.github/workflows/main.yml`) originally depended on Step 23 (build validation),
while Step 23 depends on "Steps 3-22" which includes Step 21. The workflow file
is CI-only and does not affect the local build, so: Step 21 now depends on Step 1
only; Step 23 does not depend on Step 21; Step 27 (commit) depends on both.

## Status legend
- [ ] pending
- [>] in progress
- [x] done
- [!] blocked

## Tasks

### Task 1 (Step 1): Add Blowfish Theme as Git Submodule
**Status**: [x] done
**Files**: `.gitmodules` (new), `themes/blowfish/` (new)
**Test**: `git config --file=.gitmodules --get-regexp '^submodule\.blowfish'` returns entries; `ls themes/blowfish/` lists theme files.
**Depends on**: none
**Parallelizable**: Yes
**Notes**: Submodule name is `themes/blowfish` (git's default path-based naming), not bare `blowfish` — steps.md's literal test regex assumed the latter; verified with the correct pattern instead. Pinned to v2.105.0 (2026-07-26, commit 4afcd32b), canonical repo github.com/nunocoracao/blowfish confirmed via `gh api`.

### Task 2 (Step 18): Remove Hugoplate Npm Scripts and Script Files
**Status**: [x] done
**Files**: `package.json`, `scripts/themeSetup.js` (deleted), `scripts/themeUpdate.js` (deleted)
**Test**: `npm run theme-setup` fails with unknown script; `npm run project-setup` runs without error.
**Depends on**: none
**Parallelizable**: Yes
**Notes**:

### Task 3 (Step 2): Remove Hugoplate Theme Directory
**Status**: [x] done
**Files**: `themes/hugoplate/` (deleted)
**Test**: `test ! -d themes/hugoplate` exits successfully.
**Depends on**: Task 1
**Parallelizable**: No
**Notes**:

### Task 4 (Step 3): Research and Record Blowfish Conventions
**Status**: [x] done
**Files**: `docs/hugo-theme-refresh/blowfish-schema.md` (new)
**Test**: Schema doc has 4 sections (author front-matter, author-social, TOC, comments) each citing a doc URL.
**Depends on**: Task 3
**Parallelizable**: Yes (within wave 3)
**Notes**:

### Task 5 (Step 4): Migrate hugo.toml — Core and Build Config
**Status**: [x] done
**Files**: `hugo.toml`
**Test**: Grep finds `theme = "blowfish"` and no `[[params.plugins` entries.
**Depends on**: Task 3
**Parallelizable**: Yes
**Notes**:

### Task 6 (Step 5): Migrate module.toml — Remove Hugo Modules Imports
**Status**: [x] done
**Files**: `config/_default/module.toml`
**Test**: `grep -c '^\[\[imports\]\]'` returns 0; `min = "0.158.0"` present.
**Depends on**: Task 3
**Parallelizable**: Yes
**Notes**:

### Task 7 (Step 6): Strip Hugoplate-Specific params.toml Keys
**Status**: [x] done
**Files**: `config/_default/params.toml`
**Test**: No `logo`/`theme_switcher`/`favicon`/`google_adsense`/`custom_script` entries remain.
**Depends on**: Task 3
**Parallelizable**: Yes
**Notes**:

### Task 8 (Step 8): Verify Remaining Config Files
**Status**: [x] done
**Files**: `config/_default/languages.toml`, `config/_default/menus.en.toml`, `config/development/server.toml`
**Test**: No Hugoplate-specific extensions found; standard Hugo fields only.
**Depends on**: Task 3
**Parallelizable**: Yes
**Notes**:

### Task 9 (Step 9): Grep Font Awesome Classes Across All Files
**Status**: [x] done
**Files**: audit output only (no files modified)
**Test**: Grep results logged with disposition per hit.
**Depends on**: Task 3
**Parallelizable**: Yes
**Notes**:

### Task 10 (Step 10): Audit All Hugoplate-Only Shortcodes Across Content
**Status**: [x] done
**Files**: audit output only (no files modified)
**Test**: Checklist with shortcode name, occurrence count, file paths, disposition per shortcode.
**Depends on**: Task 3
**Parallelizable**: Yes
**Notes**:

### Task 11 (Step 16): Delete Demo Content Files
**Status**: [x] done
**Files**: `content/english/pages/elements.md` (deleted), `content/english/sections/call-to-action.md` (deleted)
**Test**: Both files absent.
**Depends on**: Task 3
**Parallelizable**: Yes
**Notes**:

### Task 12 (Step 21, corrected deps): Update CI Workflow — Hugo Version and Submodules Checkout
**Status**: [x] done
**Files**: `.github/workflows/main.yml`
**Test**: `HUGO_VERSION` >= 0.158.0 and `submodules: true` both present.
**Depends on**: Task 1
**Parallelizable**: Yes
**Notes**: Dependency corrected from steps.md's "Step 1 and Step 23" (circular) to "Step 1" only — see note above.

### Task 13 (Step 19): Run Jasmine Test Suite
**Status**: [x] done
**Files**: none modified (read-only check; may touch test files if specs need updating)
**Test**: `npm test` exits zero, or failing Hugoplate-specific specs are identified and disposed of.
**Depends on**: Task 2
**Parallelizable**: Yes
**Notes**:

### Task 14 (Step 7): Add Blowfish-Native params.toml Keys
**Status**: [x] done
**Files**: `config/_default/params.toml`
**Test**: Config parses without error; Blowfish-expected keys present per Task 4's schema doc.
**Depends on**: Task 4, Task 7
**Parallelizable**: No
**Notes**:

### Task 15 (Step 12): Rewrite Author Field in Blog Posts (Dry Run)
**Status**: [x] done
**Files**: migration script (new, outside repo or in scratch); 2-3 sample posts reviewed only
**Test**: Script output shows correct transform on samples; reviewed before Task 17.
**Depends on**: Task 4
**Parallelizable**: Yes
**Notes**:

### Task 16 (Step 15): Migrate Author Page Social Fields
**Status**: [x] done
**Files**: `content/english/authors/preston-bernstein.md`
**Test**: Author page front matter matches Task 4's recorded schema; no template errors.
**Depends on**: Task 4
**Parallelizable**: Yes
**Notes**:

### Task 17 (Step 22): Verify and Clean up go.mod
**Status**: [x] done
**Files**: `go.mod` (deleted or minimized)
**Test**: Build succeeds with chosen state (verified in Task 20).
**Depends on**: Task 5, Task 6
**Parallelizable**: Yes
**Notes**:

### Task 18 (Step 11): Define and Confirm Color Scheme
**Status**: [x] done
**Files**: `config/_default/params.toml` (if custom palette)
**Test**: At least 3 hex values documented (body text, background light, background dark).
**Depends on**: Task 14
**Parallelizable**: Yes
**Notes**:

### Task 19 (Step 13): Rewrite Author Field in All 25 Blog Posts (Apply)
**Status**: [x] done
**Files**: `content/english/blog/*.md` (25 posts)
**Test**: Random post shows transformed key; no parse errors.
**Depends on**: Task 15
**Parallelizable**: No
**Notes**:

### Task 20 (Step 17): Migrate Homepage Bio Placement
**Status**: [x] done
**Files**: `content/english/_index.md`
**Test**: Homepage renders with bio visible in the configured location; build succeeds.
**Depends on**: Task 16
**Parallelizable**: Yes
**Notes**:

### Task 21 (Step 14): Replace Hugoplate Image Shortcode in secure-services Post
**Status**: [x] done
**Files**: `content/english/blog/secure-services-docker-compose-and-nordvpn.md`
**Test**: Build has no shortcode-undefined errors; images render.
**Depends on**: Task 19
**Parallelizable**: No
**Notes**: Used Blowfish's render-image.html Goldmark hook (resolves plain Markdown images via the assets/ mount) rather than a page-bundle conversion or custom shortcode. Also found and fixed 3 pre-existing image files that were WebP data mislabeled as .png. Sequenced strictly after Task 19 (both touch the same file — accepted DEP ERROR fix from spec-challenge).

### Task 22 (Step 20): Full Diff Review of All Blog Post Front-Matter
**Status**: [x] done
**Files**: `content/english/blog/*.md` (diff review only)
**Test**: All 25 posts verified against Task 4's schema; no mismatched keys.
**Depends on**: Task 19
**Parallelizable**: Yes
**Notes**:

### Task 23 (Step 23, corrected deps): Full Local Production Build Validation
**Status**: [x] done
**Files**: none (build output to `public/`, generated)
**Test**: Exit code 0; zero shortcode/template errors; 25 posts rendered.
**Depends on**: Tasks 1,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22
**Parallelizable**: No
**Notes**: Ran directly by orchestrator using the exact pinned Hugo v0.164.0+extended binary (downloaded from the official macOS .pkg release, verified same commit hash/build date as CI would install, not brew). Also fixed two more build-blocking/warning issues found during this gate: outputs.home listed WebAppManifest (undefined layout, PWA module removed) and SearchIndex (Hugoplate-specific format Blowfish doesn't use) -- corrected to ["HTML", "RSS", "JSON"] matching Blowfish's own documented config, which wires up its native Fuse.js search (confirmed populated 202KB public/index.json). Also fixed two deprecated language-config keys (languageCode/languageName -> locale/label). Final build: exit 0, zero warnings, zero errors, 173 pages, 575ms. Does NOT depend on Task 12 (CI workflow file is CI-only, doesn't affect local build) — corrected per note above.

### Task 24 (Step 24): Spot-Check Acceptance Criteria
**Status**: [x] done
**Files**: `public/` (generated, read-only check)
**Test**: Deleted files absent from public/, author page post-list non-empty, 25 posts present.
**Depends on**: Task 23
**Parallelizable**: No
**Notes**: Verified: demo files absent from public/; author page renders with 10 post links on page 1 of 3 (23 total non-draft posts, pagination confirms non-empty list -- AC9 PASS); 23 of 25 blog post files appear in public/blog/ (2 correctly excluded as pre-existing draft:true, unrelated to this migration, matches expected Hugo behavior); all 4 image shortcode replacements render with correct responsive srcset in secure-services post. (Two early false alarms in my own spot-check were grep-quoting artifacts against Hugo's minified/unquoted-attribute HTML output, not real defects -- confirmed by direct inspection.)

### Task 25 (Step 25): Browser-Driven Verification
**Status**: [x] done
**Files**: none (browser interaction only)
**Test**: TOC scrollspy, progress bar, dark/light flash, mode persistence, comments, GA/GTM tag — each confirmed or documented missing.
**Depends on**: Task 24
**Parallelizable**: No
**Notes**: Real browser verification (Chrome, via claude-in-chrome) surfaced and fixed several genuine gaps a build-success gate cannot catch:
  1. TOC/scrollspy (req 16) was completely absent -- `article.showTableOfContents` was never set (default false), and separately `[markup.tableOfContents] ordered=true` made Hugo emit `<ol>` while Blowfish's own template hardcodes a check for `<ul` to decide whether to show the TOC at all. Fixed both; scrollspy highlight confirmed moving between sections on real scroll.
  2. Reading-progress bar (req 17) -- Blowfish ships no such feature at all (confirmed via theme source search). Built one (`layouts/partials/extend-footer.html`, Blowfish's own documented extension point), ~30 lines, scoped to blog posts only via client-side DOM check (not a Go-template Section/IsPage gate -- see note below). Verified via direct DOM inspection: 0% at top, 18.47% partway through, hidden/inert on non-article pages.
  3. Found a `partialCached` footgun in Blowfish's own `footer.html`: it caches `extend-footer.html`'s output by partial name only (no variant key), so whichever page renders first gets cached and reused for every other page's footer -- a real theme quirk, not a mistake in this migration's code, but something the progress-bar implementation had to route around (client-side runtime check instead of server-side Page-context gating).
  4. `logo = "images/logo.png"` pointed at an old asset with Hugoplate's own name baked into the image pixels -- swapped to `images/avatar.png` (the personal photo already used elsewhere).
  5. `color-scheme` CSS property / `<meta name="color-scheme">` (req 19's literal wording) was never set -- Blowfish's own flash-prevention mechanism (an early-executing script + `dark` class, confirmed working, no visible flash across reload) doesn't use it, so native browser UI (scrollbars, form controls) wasn't theme-aware. Added via `extend-head.html`, riding on the same `dark` class so it stays flash-free too.
  6. Google Tag Manager (`google_tag_manager` param, a real configured ID, not a placeholder) never fired -- Blowfish's layouts don't read this key at all (the Hugoplate module that used to inject it was removed). Wired up Google's standard embed snippet via `extend-head.html`; confirmed present on both homepage and a post.
  7. Requirement 8's Disqus decision resolved as CARRY OVER, not drop -- `[services.disqus]` already had a real shortname (not a placeholder), and Hugo ships a built-in Disqus template Blowfish's docs explicitly endorse using via a one-line `layouts/partials/comments.html`. Wired up + `article.showComments = true`; confirmed rendering (shows Hugo's own expected local-preview placeholder text, will render live on the real domain).
  Also verified: dark/light mode toggle works, persists across reload via localStorage (`appearance` key), author page post-list is non-empty (10 links + pagination, 23 posts total). Final rebuild after all fixes: exit 0, zero warnings/errors, 173 pages, 599ms.

### Task 26 (Step 26): Contrast Audit (WCAG 2.2 SC 1.4.3)
**Status**: [x] done
**Files**: none (audit only)
**Test**: >= 4.5:1 contrast for body text in both modes.
**Depends on**: Task 18, Task 25
**Parallelizable**: No
**Notes**: Computed in Task 18 (colorScheme="blowfish" unchanged by any later fix): light-mode body text #0F172A on #FFFFFF = 17.86:1; dark-mode #FFFFFF on #1E293B = 14.63:1. Both clear the 4.5:1 WCAG 2.2 SC 1.4.3 floor by a wide margin. Re-confirmed still applicable since no later task touched colorScheme or the neutral palette.

### Task 27 (Step 27, scope adjusted): Stage Changes for ship-it Phase 6
**Status**: [x] done
**Files**: all changed files from Tasks 1-22
**Test**: `git status` shows the expected set of changed/deleted files; nothing committed yet.
**Depends on**: Task 12, Task 23, Task 24, Task 25, Task 26
**Parallelizable**: No
**Notes**: Diff is complete and build-validated (see Task 23 + the post-Task-25 rebuild, both exit 0 clean). Actual `git add`/`git commit`/merge/push happens in ship-it's own Phase 6, next. Actual `git commit` + merge + push is owned by ship-it's own Phase 6 (runs after harden/code-review/verify gates on this diff) — this task only confirms the diff is complete and staged-ready, it does not commit.

## Blocked / open
(populated during implementation)
## Unplanned fix (not in original 27 steps): hugo.toml deprecated permalink token

Task 21's build check surfaced that `[permalinks.page] "pages" = "/:slugorfilename/"` in hugo.toml uses a token Hugo removed in v0.144.0 (this repo's CI pin is jumping from 0.125.7, before removal, to 0.164.0, long after). This blocked the full site build regardless of the theme swap — a real instance of the Hugo-core-version-bump risk the plan's Design decisions section warned about. Fixed directly: replaced with the documented successor token `:slugorcontentbasename` (confirmed via Hugo's own v0.144.0 release notes).
