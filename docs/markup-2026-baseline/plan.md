# Plan: Markup 2026 Baseline

## Approach
This is a content-editing pass, not a code change. Blowfish already renders every feature this baseline needs — language-tagged code blocks, Chroma line-highlighting via fence attributes, a copy button, and GFM blockquote-alert admonitions — so the work is editing the 25 markdown posts in `content/english/blog/` directly, never `themes/blowfish/**`. Each post gets one pass against a fixed checklist (code-fence tags, link text, bold/italic/code-font use), and two posts each get one real demonstration edit (a highlighted code line, an admonition) chosen because the surrounding prose already supports it. Because there is no staging environment, every edit is verified against a local Hugo build and the full Playwright suite before the single push to `main` that puts it live.

## Architecture
No new components. The existing render pipeline is unchanged; only the markdown content flowing through it changes.

```
content/english/blog/*.md (edited)
        |
        v
Hugo 0.164.0+extended (local build == CI build)
        |
        v
Blowfish render hooks (unmodified, submodule)
  - render-codeblock.html   -> Chroma highlight + copy button
  - render-blockquote.html  -> GFM alert -> icon+label+colored border
        |
        v
Local build output (visual check: hl_lines, admonition)
        |
        v
npm run test:e2e (19 Playwright tests: 17 existing + 2 new, must pass)
        |
        v
git push main -> GitHub Actions -> FTP -> prestonbernstein.com (live, no staging)
```

## Data model
No data model changes.

## API / interface contract
None.

## Integration points

**Files needing a concrete, already-identified edit:**
- `content/english/blog/deciding-whats-worth-a-saturday-estate-sale-scanner.md` — add a `text` language tag to the fenced block at lines 37-41 (a model-output sample, three lines of plain description text plus `NOTHING`, not executable code).
- `content/english/blog/scrape-score-alert-resale-hunting-pipelines-local-vision-models.md` — add a `text` language tag to the fenced block at lines 31-44 (an ASCII pipeline diagram: scrape → prefilter → LLM/vision score → alert).
- `content/english/blog/secure-services-docker-compose-and-nordvpn.md` — receives the line-highlighted code block demonstration (requirement 11). The `docker-compose.yml` fence opens at absolute file line 296 and closes at line 343. The two lines the surrounding prose calls out by name (absolute file lines 345-349): `network_mode: service:vpn` on the `web` service (absolute line 318) and on the `database` service (absolute line 330). `hl_lines` values are fence-relative — counted from the first line inside the fence, not from the top of the file — so line 318 becomes `318 - 296 = 22` and line 330 becomes `330 - 296 = 34`. Add the attribute wrapped in curly braces immediately after the language token: `` ```yaml {hl_lines=[22,34]} ``. Omitting the braces makes Chroma treat the whole string as an unrecognized language token and silently fall back to no highlighting, with zero build error. When implementing, recount from the fence open, not the file top — recounting from the top would highlight the wrong lines with no build error to catch it.
- `content/english/blog/nine-fixes-lightrag-embedding-crash-one-afternoon.md` — receives the admonition demonstration (requirement 12). The post already contains a self-contained gotcha in its "fix was moving the workload" section: pointing a migrated container at a loopback address fails because the container has its own network namespace, not the host's. Extract that aside into a `> [!WARNING]` blockquote — it is a specific, reusable pitfall for anyone replicating the migration, not generic filler.
- `content/english/blog/tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md` — full audit pass. Already uses inline code correctly for env-var names (`MAX_ASYNC_LLM`, `EMBEDDING_BATCH_NUM`) and has a clean secondary admonition candidate (the multi-worker/Redis caveat) if the primary demo above needs a fallback; confirm during audit whether any bold/italic in this post is decorative.
- `content/english/blog/performance-optimizations-using-top-level-await.md` — full audit pass. Code fences are already tagged `javascript`; confirm inline code spans (`await`, backticked keywords) are all semantic and check prose bold/italic for decorative use.

**Remaining posts — audit pass only (language tags, link text, bold/italic/code-font), no edit assumed until reviewed:**
- Home-lab infrastructure & networking: `adversarial-verification-home-lab-alerts.md`, `debugging-false-positive-gpu-contention-detection.md`, `enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md`, `gaming-desktop-vs-dedicated-compute-box-idle-power.md`, `mini-itx-is-the-wrong-form-factor-for-a-quiet-ai-homelab-pc.md`, `not-every-docker-container-belongs-on-the-nas.md`, `proxmox-for-the-xps-17-offload-box.md`, `rebuilding-home-network-from-the-modem-up.md`, `runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md`, `surviving-a-gpu-yield-window-embedding-servers.md`
- AI/agent tooling & observability: `auditing-what-an-agent-pipeline-shipped-in-an-afternoon.md`, `dueling-agent-orchestration-suites.md`, `github-agents-tab-vs-claude-code.md`, `one-observability-stack-not-one-per-repo.md`, `self-throttling-claude-max-without-a-published-ceiling.md`, `three-failure-modes-one-name-concurrent-claude-code-agents.md`, `what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md`
- Resale/estate-sale pipelines: `deciding-what-fits-resale-clothing-monitor.md`
- Security & hardening: `clamav-clean-scan-doesnt-mean-safe.md`

That covers all 25 posts under `content/english/blog/` (per the requirements doc's own count). `content/english/blog/_index.md` is out of scope per the requirements doc.

**Two posts above are drafts and need `--buildDrafts` for local verification.** `enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md` and `performance-optimizations-using-top-level-await.md` both have `draft: true` in front matter (confirmed by grep). Hugo's default production build skips drafts, so the local `hugo` build used to verify edits to these two files must add `--buildDrafts` (or `-D`). This is a local-verification-only flag — the actual deploy build command in `.github/workflows/main.yml` stays as-is.

## Verification artifacts

This plan adds two new Playwright assertions, matching requirements.md reqs 15 and 16:
- In `tests/e2e/blog-post-content.spec.js` (which already targets `secure-services-docker-compose-and-nordvpn`): assert Chroma's line-highlight marker/class is present on both `hl_lines` target lines.
- A new assertion — a new spec file, or added to the same file — checking for `data-type="warning"` on the rendered admonition in `nine-fixes-lightrag-embedding-crash-one-afternoon.md`. `data-type="{{ $normalizedType }}"` is the real attribute Blowfish's `themes/blowfish/layouts/_default/_markup/render-blockquote.html` emits, confirmed from the theme source — not a guessed class name.

These two assertions bring the suite from 17 to 19 tests. Both must pass before the single push described in Risk areas.

## Technology choices
None — uses only Blowfish's existing, already-shipped Chroma/GFM-admonition rendering; no new libraries or shortcodes.

- **Fence attribute syntax** (Chroma line-highlighting), from `themes/blowfish/exampleSite/content/samples/markdown/index.md` line 85:
  ````
  ```html {title="example.html" lineNos=inline hl_lines=[4,"7-9"]}
  ````
  For this feature, the working syntax is the same attribute block without `title`/`lineNos` unless a post already needs those: `` ```yaml {hl_lines=[22,34]} ``.

- **Blockquote-alert syntax**, from `themes/blowfish/exampleSite/content/docs/shortcodes/index.md` lines 74-75:
  ```
  > [!TIP]
  > A Tip type admonition.
  ```
  This plan's demonstration uses `[!WARNING]` in place of `[!TIP]`, same syntax, since the content is a pitfall to avoid rather than a suggestion.

  One rendered `[!WARNING]` instance is sufficient evidence the admonition render path works for all five alert types: `themes/blowfish/layouts/_default/_markup/render-blockquote.html` reads `.AlertType` and looks up icon, label, and color from a shared map in `admonition-maps.html`, with no per-type template branching. The mechanism is generic and type-driven, not type-specific.

## Risk areas
- **Subjective bold/italic/decorative judgment calls.** Requirements 7-9 ask for every bold, italic, and inline-code span in 25 posts to be classified semantic vs. decorative — a judgment call that can drift across a long editing session. Apply one fixed rule of thumb throughout: bold only for a UI element or a genuinely strong claim, italics only for a term-being-defined or a word-as-word reference, code font only for a literal command/filename/identifier/config value; anything else is decorative and becomes plain text. Do the audit in one continuous pass per category (all bold spans, then all italics, then all code spans) rather than one pass per file, so the same rule gets applied the same way each time instead of re-deriving it 25 times.
- **No staging — a bad edit goes straight to production.** `main` has no branch protection and push-to-main is the live deploy via FTP. All content edits — the full pass across 25 posts — stay uncommitted in the working tree until the entire verification sequence passes cleanly: local build (`hugo --gc --minify` with zero errors, plus `--buildDrafts` for the two draft posts), both new Playwright assertions (see Verification artifacts), the full 19-test suite, and the front-matter diff check below. Only then is a single commit made and pushed. Before that one commit, `git checkout -- content/english/blog/` or `git stash` is a valid full rollback at any point.
- **A malformed fence attribute can break the build or silently disable highlighting.** `hl_lines=[22,34]` has to match Hugo/Chroma's exact syntax (bracketed list, quoted ranges as strings, wrapped in curly braces right after the language token) — a typo like a missing bracket, an unquoted range, or missing braces can either fail the build outright or just render as an unhighlighted plain block with no error, so it looks fine locally until someone checks the highlighted line by eye. Build and visually inspect immediately after adding this specific attribute, not just at the end of the whole pass.
- **The admonition edit has the same silent-failure class as hl_lines.** A malformed `> [!WARNING]` blockquote — wrong indentation, or a missing blank line before or after it — renders as an ordinary blockquote with the literal text "[!WARNING]" visible, with zero build error. Apply the same discipline as `hl_lines`: build and visually inspect the rendered post immediately after adding this specific edit, not just at the end of the whole pass.
- **Hugo version drift across dormant CI configs.** `.gitlab-ci.yml`, `amplify.yml`, and `netlify.toml` all pin Hugo `0.124.1`, which predates Hugo's native GFM Alerts extension (shipped in Hugo `0.132.0`) that the admonition demo depends on. If any of those three pipelines were actually live, the admonition would render as a broken plain blockquote in production even though every local check in this plan would show it working. Evidence they are inactive: `.github/workflows/main.yml` — the confirmed live deploy path — pins Hugo `0.164.0`, sets `SITE_FOLDER: prestonbernstein.com`, and deploys via FTP; DNS for `prestonbernstein.com` resolves to a bare A record (`66.29.148.81`), which matches traditional FTP/shared hosting and does not match Netlify's or Amplify's typical CNAME-to-edge-network pattern. This is strong evidence, not certainty, that the other three CI configs are inactive legacy leftovers rather than live parallel deploys. Fixing or removing those three configs is out of scope for this feature — the requirements doc rules out CI workflow changes — so this stays a documented, accepted risk, not a blocking item.
- **Front matter drift from broad content edits.** Requirement 3 (front matter dates/slugs/tags unchanged) is easy to violate by accident if any edit is done with a broad find-and-replace across files rather than a per-file, per-span review. Check `git diff` before committing to confirm every diff hunk is inside the post body, none inside the `---`-delimited front matter block.
- **Review auditability.** The bold/italic/code-font audit (25 posts × 3 span categories) produces a per-span review log at `docs/markup-2026-baseline/audit-log.md` — one line per span found, recording file:line, span type, and semantic/decorative verdict. This makes the review reconstructable and lets its completeness be checked mechanically (count of spans found via a scan matches count of log entries) instead of relying on a one-time spot-check.
