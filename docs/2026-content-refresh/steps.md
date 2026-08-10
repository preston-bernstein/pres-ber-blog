# Steps: 2026 Content Refresh Pass

## Prerequisites
- Worktree cloned fresh, on latest `origin/main`, submodules initialized
  (`git submodule update --init --recursive` — done; `themes/blowfish` must
  be checked out for the build and the article-meta template check).
- `writing-style.md`, `plain-writing.md`, both vault research docs
  (`Development/Research/blog-article-writing-2026.md` and
  `Development/Research/blog-images-visual-content.md`), and the reference
  post `native-hugo-image-pipeline-webp-lqip-and-mermaid.md` already read in
  full (done during spec-gather).
- Date mapping confirmed against git history and committed in-repo at
  `docs/2026-content-refresh/date-mapping.txt`, UTC-normalized (done during
  spec-challenge — see requirements.md's flagged-mismatch resolution for
  `github-agents-tab-vs-claude-code.md`).
- Local Hugo confirmed at v0.164.0 (matches CI pin — confirmed during
  spec-gather; re-check immediately before Step 7 in case of drift).

## Implementation steps

### Step 0: Pre-flight — mapping coverage + baseline build
**What**: Verify `date-mapping.txt` has an entry for all 25 real-post slugs
(every file in `content/english/blog/` except `_index.md`,
`github-agents-tab-vs-claude-code.md`, and
`native-hugo-image-pipeline-webp-lqip-and-mermaid.md` — the last two are
documented date-exclusions, not missing coverage). Capture a baseline
`hugo --gc --minify` run (output saved) to diff against post-batch runs. Add
`lastmod: 2026-08-10` to `native-hugo-image-pipeline-webp-lqip-and-mermaid.md`
if missing (trivial, folded in here rather than its own batch — this post
gets no voice/image work, see requirements.md req 6).
**Files**: `docs/2026-content-refresh/date-mapping.txt` (read-only check),
`content/english/blog/native-hugo-image-pipeline-webp-lqip-and-mermaid.md`
(lastmod only).
**Test**: every non-excluded slug has a mapping row (any gap is flagged, not
silently skipped, per requirement 13); baseline build output saved;
`lastmod` present on the demo post with `date:` unchanged.
**Depends on**: none.
**Parallelizable**: No (everything else depends on this baseline existing).

### Step 1: Batch 1 — posts 1-5 (alphabetical)
**What**: Revise voice, add image/diagram if warranted, correct date front
matter for: `adversarial-verification-home-lab-alerts.md`,
`auditing-what-an-agent-pipeline-shipped-in-an-afternoon.md`,
`clamav-clean-scan-doesnt-mean-safe.md`,
`debugging-false-positive-gpu-contention-detection.md`,
`deciding-what-fits-resale-clothing-monitor.md`.
**Files**: the 5 posts above,
`docs/2026-content-refresh/audit-log-batch1.md` (new, using plan.md's shared
entry format).
**Test**: `hugo --gc --minify` completes with zero errors and no new
warnings vs. the Step 0 baseline; every post in the batch has a logged
decision in `audit-log-batch1.md`; each post's `date:` diffed against its
`date-mapping.txt` row and confirmed to match exactly (not just "a date was
written"); any newly-added image reference confirmed to resolve to a real
file under `assets/images/...` (per requirement 17 — a passing build alone
does not prove this).
**Depends on**: Step 0.
**Parallelizable**: No — edits touch distinct files, but validation runs
against the shared worktree's `public/`/`resources/_gen` output, and batches
are deliberately ordered so a build break is attributable to one batch (see
plan.md's Approach and Risk area 4).

### Step 2: Batch 2 — posts 6-10
**What**: Same three-part revision for:
`deciding-whats-worth-a-saturday-estate-sale-scanner.md`,
`dueling-agent-orchestration-suites.md`,
`enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md`,
`gaming-desktop-vs-dedicated-compute-box-idle-power.md`,
`github-agents-tab-vs-claude-code.md` (date stays untouched per the
documented exclusion — voice/image evaluated normally, `lastmod` still
added).
**Files**: the 5 posts above,
`docs/2026-content-refresh/audit-log-batch2.md` (new).
**Test**: same as Step 1's Test, plus: `github-agents-tab-vs-claude-code.md`'s
`date:` field diffed against its pre-batch value and confirmed unchanged.
**Depends on**: Step 1 (its build must pass first).
**Parallelizable**: No, same reasoning as Step 1.

### Step 3: Batch 3 — posts 11-15
**What**: Same three-part revision for:
`mini-itx-is-the-wrong-form-factor-for-a-quiet-ai-homelab-pc.md`,
`nine-fixes-lightrag-embedding-crash-one-afternoon.md`,
`not-every-docker-container-belongs-on-the-nas.md`,
`one-observability-stack-not-one-per-repo.md`,
`performance-optimizations-using-top-level-await.md`.
**Files**: the 5 posts above,
`docs/2026-content-refresh/audit-log-batch3.md` (new).
**Test**: same as Step 1's Test.
**Depends on**: Step 2.
**Parallelizable**: No, same reasoning as Step 1.

### Step 4: Batch 4 — posts 16-20
**What**: Same three-part revision for:
`proxmox-for-the-xps-17-offload-box.md`,
`rebuilding-home-network-from-the-modem-up.md`,
`runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md`,
`scrape-score-alert-resale-hunting-pipelines-local-vision-models.md`,
`secure-services-docker-compose-and-nordvpn.md`.
**Files**: the 5 posts above,
`docs/2026-content-refresh/audit-log-batch4.md` (new).
**Test**: same as Step 1's Test.
**Depends on**: Step 3.
**Parallelizable**: No, same reasoning as Step 1.

### Step 5: Batch 5 — posts 21-25
**What**: Same three-part revision for:
`self-throttling-claude-max-without-a-published-ceiling.md`,
`surviving-a-gpu-yield-window-embedding-servers.md`,
`three-failure-modes-one-name-concurrent-claude-code-agents.md`,
`tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md`,
`what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md`.
**Files**: the 5 posts above,
`docs/2026-content-refresh/audit-log-batch5.md` (new).
**Test**: same as Step 1's Test.
**Depends on**: Step 4.
**Parallelizable**: No, same reasoning as Step 1.

### Step 6: Full-site build + Playwright verification
**What**: Run one final full `hugo --gc --minify` (Hugo 0.164.0, version
re-checked immediately before running) across all 26 touched files plus
`_index.md`, then run the existing Playwright suite
(`tests/e2e/*.spec.js`) against the built/served site.
**Files**: none (verification only).
**Test**: `hugo --gc --minify` exits 0 with no new errors/warnings vs. the
Step 0 baseline; `npx playwright test` (or `npm run test:e2e`) passes all
specs.
**Depends on**: Steps 0-5.
**Parallelizable**: No.

### Step 7: Acceptance-criteria audit
**What**: Cross-check the 10 acceptance criteria in requirements.md against
the 5 audit-log files and the actual front matter of all 26 posts — confirm
counts match (25 voice decisions, 26 image decisions, 24 date-mapping
applications, 3 documented date exclusions incl. `_index.md`, 26 lastmod
additions, 0 unresolved mapping-coverage flags from Step 0).
**Files**: `docs/2026-content-refresh/audit-log-batch{1..5}.md` (read-only).
**Test**: Every acceptance criterion in requirements.md has a concrete
pass/fail line recorded (in this session's report, not a new file).
**Depends on**: Steps 0-6.
**Parallelizable**: No.

## Rollback plan
All tracked-file edits reversible via git — every edit is a Markdown/YAML
front matter change inside a single worktree branch, nothing is pushed until
the outer ship-it pipeline's commit/merge phase. `git checkout -- <file>`
reverts any single post; `git reset --hard origin/main` (inside the worktree
only, never on the original checkout) reverts the whole batch if needed.
The 5 new `audit-log-batchN.md` files and `date-mapping.txt` are untracked
until committed — a `git reset --hard` does NOT remove them; follow it with
`git clean -fd docs/2026-content-refresh/` (scoped to that directory only)
to fully roll back a batch's audit trail along with its content edits.
