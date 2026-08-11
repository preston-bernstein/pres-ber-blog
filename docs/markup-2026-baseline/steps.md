# Steps: Markup 2026 Baseline

## Prerequisites
None. Hugo 0.164.0+extended and npm dependencies verified in Step 1.

## Implementation steps

### Step 1: Verify Hugo and npm setup
**What**: Confirm Hugo 0.164.0+extended is installed locally, Playwright browser binaries are present, and npm dependencies are ready.
**Files**: None (verification only).
**Test**: Run `hugo version` (expect `Hugo v0.164.0` or later with `extended` tag), then `npm list` (expect all dependencies present, no errors), then `npx playwright --version` to confirm Playwright's browser binaries are installed and runnable.
**Depends on**: None.
**Parallelizable**: No.

### Step 2: Add language tags to two known missing-tag blocks
**What**: Add `text` language tag to two specific fenced code blocks identified in requirements.
**Files**: `content/english/blog/deciding-whats-worth-a-saturday-estate-sale-scanner.md`, `content/english/blog/scrape-score-alert-resale-hunting-pipelines-local-vision-models.md`.
**Test**: Open each file and verify the fence opening line (e.g. ` ```text ` not ` ``` `). Run `hugo --gc --minify` locally to confirm no build errors.
**Depends on**: Step 1.
**Parallelizable**: No (verify immediately after).

### Step 3: Scan all 25 posts and verify no code blocks lack language tags
**What**: Grep or manually scan all posts in `content/english/blog/` to confirm every fenced code block has a language tag; document or note any remaining missing tags for fixing.
**Files**: `content/english/blog/*.md` (read-only scan).
**Test**: Run `grep -r '^\`\`\`$' content/english/blog/` to find opening fences without a tag (expect zero results). If any found, note them for immediate fix before proceeding.
**Depends on**: Step 2.
**Parallelizable**: No.

### Step 4a: Audit bare URLs in prose
**What**: Scan all 25 posts for bare URLs in prose (outside code blocks and inline code spans) and replace with descriptive markdown links. Track fenced-code-block state line by line so URLs inside code fences or inline backticks are never treated as prose — do not use a blind whole-file grep. Example: `performance-optimizations-using-top-level-await.md` contains URLs like `https://api.example.com/config` legitimately inside ```javascript fences; these must NOT be converted.
**Files**: All `content/english/blog/*.md` files.
**Test**: Enumerate every bare `https?://` match repo-wide (excluding fenced code spans and inline-code spans) and confirm each one has been triaged (either already fine, or fixed) — zero untriaged matches remaining. Use a completeness audit, not a spot-check.
**Depends on**: Step 3.
**Parallelizable**: No.

### Step 4b: Audit non-descriptive link text
**What**: Scan all 25 posts for non-descriptive link text (e.g. "click here," "read more," "here," "this link") and replace markdown link text with descriptions of the destination.
**Files**: All `content/english/blog/*.md` files.
**Test**: Enumerate every `[text](url)` markdown link repo-wide and confirm each link text is descriptive (not generic patterns like "click here," "read more," etc.) — zero non-descriptive links remaining. Use a completeness audit, not a spot-check.
**Depends on**: Step 4a.
**Parallelizable**: No.

### Step 5a: Audit bold spans
**What**: Review every bold (`**...**`) span across all 25 posts. Apply semantic rule: bold only for UI elements or genuinely strong claims; convert decorative uses to plain text. Create or append to `docs/markup-2026-baseline/audit-log.md` one line per bold span reviewed, recording file:line, span type ("bold"), and verdict ("kept" or "removed").
**Files**: All `content/english/blog/*.md` files; new or updated `docs/markup-2026-baseline/audit-log.md`.
**Test**: Count of bold spans found by a repo-wide scan for `**...**` equals count of log entries for type "bold" — zero unaccounted spans.
**Depends on**: Step 4b.
**Parallelizable**: No.

### Step 5b: Audit italic spans
**What**: Review every italic (`*...*` or `_..._`) span across all 25 posts. Apply semantic rule: italics only for terms-being-defined or word-as-word references; convert decorative uses to plain text. Append to `docs/markup-2026-baseline/audit-log.md` one line per italic span reviewed, recording file:line, span type ("italic"), and verdict ("kept" or "removed").
**Files**: All `content/english/blog/*.md` files; updated `docs/markup-2026-baseline/audit-log.md`.
**Test**: Count of italic spans found by a repo-wide scan for `\*[^*]+\*|_[^_]+_` equals count of log entries for type "italic" — zero unaccounted spans.
**Depends on**: Step 5a.
**Parallelizable**: No.

### Step 5c: Audit inline-code spans
**What**: Review every inline-code (`` `...` ``) span across all 25 posts. Apply semantic rule: code font only for literal commands/filenames/identifiers/config values; convert decorative uses to plain text. Append to `docs/markup-2026-baseline/audit-log.md` one line per code span reviewed, recording file:line, span type ("code"), and verdict ("kept" or "removed").
**Files**: All `content/english/blog/*.md` files; updated `docs/markup-2026-baseline/audit-log.md`.
**Test**: Count of inline-code spans found by a repo-wide scan for `` `[^`]+` `` equals count of log entries for type "code" — zero unaccounted spans.
**Depends on**: Step 5b.
**Parallelizable**: No.

### Step 5d: Interim front-matter safety check
**What**: Run a partial front-matter git-diff check scoped to files touched by Steps 2 through 5c, to catch regression from broad prose edits before lower-risk demo edits (Steps 6, 7) are added. Verify no accidental changes to front matter (dates, slugs, tags) in the files edited so far.
**Files**: All edited `content/english/blog/*.md` files from Steps 2–5c (diff inspection only).
**Test**: Run `git diff --no-color HEAD content/english/blog/` and review output for the files touched so far. Confirm: no lines added/removed between first `---` and second `---` of any file (or only body-section additions/removals below the second `---`). If any front-matter changes detected, revert and re-apply the edits carefully.
**Depends on**: Step 5c.
**Parallelizable**: No.

### Step 6: Add line highlighting to secure-services docker-compose example
**What**: Modify the fence attributes for the docker-compose.yml example in `secure-services-docker-compose-and-nordvpn.md` (lines 296-343) to add `hl_lines=[22,34]`, highlighting the two lines the prose names: `network_mode: service:vpn` on `web` and `database` services. Change opening line from ` ```yaml ` to ` ```yaml {hl_lines=[22,34]} ` (exact syntax required — attribute block wrapped in curly braces immediately after the language token, with line numbers as fence-relative, not absolute file line numbers).
**Files**: `content/english/blog/secure-services-docker-compose-and-nordvpn.md`.
**Test**: Build locally (`hugo --gc --minify`). After build, grep the rendered HTML output file `public/blog/secure-services-docker-compose-and-nordvpn/index.html` for Chroma's line-highlight class/marker (e.g., `class="hl"` or similar) to confirm highlight is actually present in the rendered HTML — a malformed attribute fails silently with zero build error, so visual-only inspection can miss it.
**Depends on**: Step 5d (but could run parallel with Step 7).
**Parallelizable**: Yes.

### Step 7: Add admonition to lightrag-embedding-crash post
**What**: In `nine-fixes-lightrag-embedding-crash-one-afternoon.md`, add a GFM blockquote-alert admonition (format: `> [!WARNING]` on first line, body text follows on indented lines) capturing the loopback-to-container-namespace pitfall from the "fix was moving the workload" section. Content: container has its own network namespace; pointing it at localhost/127.0.0.1 fails, use explicit host IP or service discovery instead. This is a real gotcha for replicating the migration, not generic filler.
**Files**: `content/english/blog/nine-fixes-lightrag-embedding-crash-one-afternoon.md`.
**Test**: Build locally (`hugo --gc --minify`). After build, grep the rendered HTML output file `public/blog/nine-fixes-lightrag-embedding-crash-one-afternoon/index.html` for `data-type="warning"` (the attribute Blowfish's render-blockquote.html emits) to confirm the admonition is actually present in rendered output — a malformed `[!WARNING]` blockquote also fails silently and renders as plain text with literal "[!WARNING]" visible, zero build error.
**Depends on**: Step 5d (but could run parallel with Step 6).
**Parallelizable**: Yes.

### Step 7a: Add Playwright assertions for the two demo features
**What**: Add two new test assertions to `tests/e2e/blog-post-content.spec.js` (or create a new spec file if needed) to permanently codify the checks from Steps 6 and 7: one assertion confirms Chroma's line-highlight marker is present in the hl_lines demo on `secure-services-docker-compose-and-nordvpn.md`; the other confirms `data-type="warning"` is present in the admonition demo on `nine-fixes-lightrag-embedding-crash-one-afternoon.md`. These make Steps 6/7's manual HTML checks automatic and persistent, rather than one-time manual verification.
**Files**: `tests/e2e/blog-post-content.spec.js` (or new `tests/e2e/blog-post-features.spec.js`).
**Test**: Run `npm run test:e2e` or the specific test file to confirm both assertions pass against the local build.
**Depends on**: Steps 6 and 7 (demo features must exist to test).
**Parallelizable**: No (writes a shared test file both demos need).

### Step 8: Build locally with Hugo
**What**: Run full clean Hugo builds locally to verify zero errors and all content renders correctly after all edits, including draft posts.
**Files**: None written; reads all of `content/english/blog/*.md` and `themes/blowfish/**`.
**Test**: Run `hugo --gc --minify` from repo root (expect "Total in [time]" message with zero errors or warnings about missing language tags, broken links, or render issues). Verify build output exists (default `public/` directory populated). Also run `hugo --gc --minify -D` to specifically confirm both draft posts (`enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md` and `performance-optimizations-using-top-level-await.md`) render without error — note that the `-D` flag is local-verification-only and does not change the real deploy build command (which stays as `hugo --gc --minify`, no `-D`, in `.github/workflows/main.yml`, unchanged).
**Depends on**: Steps 2, 3, 4a, 4b, 5a, 5b, 5c, 5d, 6, 7, 7a (all content edits must be complete).
**Parallelizable**: No.

### Step 9: Run Playwright E2E suite
**What**: Execute the full Playwright end-to-end test suite (including the new assertions from Step 7a) to confirm no regressions from content changes.
**Files**: None written; reads tests from `tests/e2e/*.spec.js` and tests against local build output or live server.
**Test**: Run `npm run test:e2e` from repo root (expect all tests to pass, zero failures). If any fail, investigate whether the failure is due to content edits (e.g. a broken internal link) or a pre-existing issue; fix and re-run until passing.
**Depends on**: Step 8 (build must complete successfully).
**Parallelizable**: No (depends on Step 8's output).

### Step 10: Manually verify demonstration blocks render correctly
**What**: Inspect the local build output (live server or `public/` directory) to visually confirm the two demonstration blocks render with their new features: the docker-compose example in `secure-services-docker-compose-and-nordvpn.md` shows highlighted lines 22 and 34 with language tag and copy button, and the admonition in `nine-fixes-lightrag-embedding-crash-one-afternoon.md` shows an icon, label, and colored border.
**Files**: None (read-only visual check).
**Test**: Open rendered `secure-services-docker-compose-and-nordvpn.html` in browser and confirm: line numbers 22 and 34 have a visual highlight (background or marker); block shows `yaml` language badge or tag; copy-to-clipboard button visible and clickable. Open rendered `nine-fixes-lightrag-embedding-crash-one-afternoon.html` and confirm: admonition has a colored left border (not just a text label), an icon (warning symbol or equivalent), and text "WARNING" in rendered output (not ` [!WARNING]` source syntax visible).
**Depends on**: Step 8.
**Parallelizable**: No.

### Step 11: Verify front-matter unchanged via git diff (full final check)
**What**: Run a comprehensive `git diff` to confirm all changes across every edited file are in post body content, not in front matter (date, slug, tags). This is the full-scope re-check across all edited files, distinct from the interim Step 5d partial check. Verify that no `---` delimited front-matter blocks were modified and all diffs are inside post bodies.
**Files**: All edited `content/english/blog/*.md` files (diff inspection only).
**Test**: Run `git diff --no-color HEAD content/english/blog/` and review complete output. Confirm: no lines added/removed between first `---` and second `---` of any file, or only additions/removals inside the body section below the second `---`. If any front-matter changes detected, revert and re-apply the edits carefully (likely a copy-paste error).
**Depends on**: Steps 2–7a (all edits and tests complete).
**Parallelizable**: No.

### Step 12: Commit and push to main
**What**: After every other step's Test passes, stage all reviewed content changes and the new Playwright spec file, commit with a descriptive message, and push once to `main` (no staging environment exists — this is the live deploy trigger).
**Files**: All edited `content/english/blog/*.md` files; new or edited Playwright spec file(s) from Step 7a; audit log from Steps 5a–5c if present.
**Test**: `git log -1` shows the new commit reachable from `main` with a descriptive message. GitHub Actions workflow for that commit completes successfully (verify via `gh run list` or GitHub web UI).
**Depends on**: Steps 1–11 (all prior steps must be complete and passing).
**Parallelizable**: No.

## Rollback plan

**Steps 2–7a (content edits and Playwright assertions):** All content edits stay uncommitted in the working tree until the final Step 12 commit. This keeps rollback safe and reversible: `git stash` or `git checkout -- content/english/blog/` erases all content changes. Similarly, `git checkout -- tests/e2e/` rolls back any Playwright spec additions. Valid full-rollback at any point before Step 12.

**Steps 5a–5c (audit log):** If audit-log.md is created but contains errors, delete it with `rm docs/markup-2026-baseline/audit-log.md` and re-run the affected step.

**Steps 8–10 (local build and tests):** No files modified; no rollback needed. Delete `public/` directory if build artifacts should be cleaned up.

**Steps 11 (verification):** Read-only; no rollback.

**Step 12 (commit and push):** If the commit pushes but tests fail on GitHub Actions, the error must be investigated and fixed with a new commit and push — git history cannot be rewritten after push to `main` (no force-push to main).

**Front-matter safety:** If `git diff` (Step 11) reveals front-matter changes, run `git checkout HEAD -- content/english/blog/` to reset, then carefully re-apply only the body edits using a per-file review (not bulk find-replace) to avoid repeating the mistake.
