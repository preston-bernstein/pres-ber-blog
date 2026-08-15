# Tasks: Linkblog Integration (linkblog-commons pipeline)

Generated from: docs/linkblog-integration/ on 2026-08-15

## Status legend
- [ ] pending
- [>] in progress
- [x] done
- [!] blocked

## Tasks

### Task 0: Capture pre-feature geo-gate.py baseline
**Status**: [x] done
**Files**: none (read-only verification)
**Test**: The recorded baseline output exists, is non-empty, and reflects the current pass/fail state of geo-gate against unmodified main.
**Depends on**: none
**Parallelizable**: Yes
**Notes**: First attempt gave a false FAIL — the worktree's Blowfish theme submodule was never initialized and node_modules never installed, so `npm run build` produced no blog pages. Fixed directly (`git submodule update --init --recursive` + `npm install`), rebuilt, re-ran geo-gate: real baseline is PASS (8/8 checks), saved to /Users/prestonbernstein/.claude/jobs/1f942deb/tmp/geo-gate-baseline.txt.

### Task 1: Scaffold `data/linkposts.json` and `content/english/links/_index.md`
**Status**: [x] done
**Files**: `data/linkposts.json`, `content/english/links/_index.md`
**Test**: `python3 -m json.tool data/linkposts.json` succeeds; file contains exactly one entry with non-empty `url`, `published`, `comment`, and a `tags` array. Front matter in `_index.md` parses, contains `title`/`description`, and includes the `outputs` override excluding RSS.
**Depends on**: none
**Parallelizable**: Yes
**Notes**: Verified against content/english/blog/_index.md's actual convention — matches exactly (YAML `---` front matter, same field names). Placeholder entry uses example.com with an explicit "must be removed before merge" comment.

### Task 2: Write `scripts/build-linkblog.py` — validation only
**Status**: [x] done
**Files**: `scripts/build-linkblog.py`
**Test**: `python3 scripts/build-linkblog.py` against the Task-1 file exits 0 (no-op, render not yet implemented). Copy the data file, blank out `comment` on the one entry, run against the copy — exits 1 and stderr names the entry's index and the missing field.
**Depends on**: Task 1
**Parallelizable**: No
**Notes**: Verified directly — covers all requirements: presence/whitespace, ISO-8601 published, url scheme, tags type, duplicate-url detection. All-or-nothing (collects every error before printing). Mirrors geo-gate.py's parse_iso pattern.

### Task 3a: Extend build-linkblog.py — wipe stale generated files
**Status**: [x] done
**Files**: `scripts/build-linkblog.py`
**Test**: Create a dummy `.md` file under `content/english/links/`. Run the wipe logic. Confirm the stray file is deleted while `_index.md` survives.
**Depends on**: Task 2
**Parallelizable**: No
**Notes**: Verified — pattern-matched deletion only (GENERATED_FILENAME_RE), non-matching files and _index.md untouched. Runs after validation succeeds, before any render.

### Task 3b: Extend build-linkblog.py — render each entry
**Status**: [x] done
**Files**: `scripts/build-linkblog.py`
**Test**: `pip install git+https://github.com/preston-bernstein/linkblog-commons.git` locally. Run the script; confirm exactly one new `.md` file appears under `content/english/links/`.
**Depends on**: Task 3a
**Parallelizable**: No
**Notes**: Agent found a real bug: linkblog-commons requires `published` to be timezone-aware; Task 1's placeholder used a bare date and Task 2's validation didn't check for tz-awareness, so a bad entry passed local validation but failed deep in the render subprocess. Fixed directly (orchestrator-level, ground-truth knowledge of linkblog-commons): tightened `parse_iso` to reject tz-naive values, fixed the placeholder's `published` to include a UTC offset, updated requirements.md/plan.md docs to match. Re-verified end-to-end: renders correctly, front matter and body correct, exit 0. linkblog-commons installed via `pip3 install --user --break-system-packages` from local path (PEP 668 environment).

### Task 4: Extend build-linkblog.py — inject `date` front matter
**Status**: [x] done
**Files**: `scripts/build-linkblog.py`
**Test**: Rerun the script. Open the rendered `.md` file and confirm its front matter contains both `published:` and `date:` keys set to the same value.
**Depends on**: Task 3b
**Parallelizable**: No
**Notes**: Verified directly — reuses geo-gate.py's regex-based front-matter parsing style, idempotent, treats parse failures as entry failures. Live-verified: both keys present with matching values.

### Task 5: Extend build-linkblog.py — generate the feed
**Status**: [x] done
**Files**: `scripts/build-linkblog.py`
**Test**: Rerun the script. Confirm `static/links/atom.xml` exists and parses as well-formed XML with exactly one `<entry>`.
**Depends on**: Task 4
**Parallelizable**: No
**Notes**: Verified directly — feed title/link mirror hugo.toml's real site identity. self_verify() (XML well-formedness + date-field parseability) confirmed to actually catch a real corruption, not just pass trivially.

### Task 6: Add Hugo template override for home-page RSS scoping
**Status**: [x] done
**Files**: `layouts/_default/rss.xml` (confirmed path — mirrors Blowfish's own theme path exactly, repo-local override takes priority)
**Test**: After a full Hugo build with at least one link post present, `public/index.xml` does NOT contain that link post's URL/title, while existing blog posts still do.
**Depends on**: Task 3b
**Parallelizable**: No
**Notes**: I personally investigated Blowfish's actual theme source first (submodule now initialized) and handed the agent the confirmed override path + confirmed `mainSections` config location, rather than leaving it to discover empirically — reduced risk on the most critical fix in this feature. `.Type` worked as the filter field on the first try. Agent surfaced a critical NEW bug during testing (see below) — worked around it in-memory to complete this task without touching build-linkblog.py (correct scope discipline), then I fixed the root cause directly. Re-verified myself with a full `hugo --gc --minify`: public/index.xml has 0 occurrences of the link post, public/links/atom.xml still has it, public/blog/index.xml unaffected.

**CRITICAL BUG FOUND AND FIXED (by me, orchestrator-level, outside any single task's scope):** linkblog-commons' rendered front matter uses `url:` as a key, which collides with Hugo's own RESERVED `url` front-matter field (overrides a page's permalink) — this broke `hugo build` outright for any real external URL. Fixed in `scripts/build-linkblog.py`: added `rename_url_field()` (same pattern as `inject_date_field`) that renames `url:` to `source_url:` immediately after render, wired into `render_all()` before date injection. Re-verified full pipeline end-to-end: build-linkblog.py exits 0, `hugo --gc --minify` builds cleanly (195 pages), link post page builds at the correct path. **Task 7's clickable-link template must reference `.Params.source_url`, not `.Params.url`** — flagging this explicitly for that task.

### Task 7: Add Hugo template override for clickable link title
**Status**: [x] done
**Files**: `layouts/links/single.html` (confirmed path — section-scoped override, takes priority over `themes/blowfish/layouts/_default/single.html` for pages under `content/english/links/`)
**Test**: After a full Hugo build, `public/links/<slug>/index.html` contains an `<a href="<the actual url>">` element.
**Depends on**: Task 6
**Parallelizable**: No
**Notes**: Implemented directly (no delegate agent — small, well-understood change). Blowfish's `_default/single.html` renders the h1 title inline with no partial seam to hook into, so per plan.md's own note this override is a full copy of the stock file with only the `<h1>` block changed: `{{ with .Params.source_url }}<a href="{{ . }}" target="_blank" rel="noopener noreferrer">{{ $.Title | emojify }}</a>{{ else }}{{ .Title | emojify }}{{ end }}` — uses `source_url` per Task 6's rename fix, falls back to plain text if a links-section page ever lacks it. Verified via `npm run build` (195 pages, unchanged count) + direct inspection of `public/links/2026-08-15-e3295f44566c58bc/index.html`: `<h1 ...><a href=https://example.com/placeholder-link target=_blank rel="noopener noreferrer">https://example.com/placeholder-link</a></h1>` — real anchor, not plain text.

### Task 8: Local end-to-end build verification
**Status**: [x] done
**Files**: none (verification only)
**Test**: `hugo --gc --minify`. Confirm `public/links/<slug>/index.html` exists with real date/comment/URL text. Confirm `public/links/atom.xml` exists, `public/links/index.xml` does NOT exist, `public/index.xml` does NOT contain the link post.
**Depends on**: Task 1, Task 4, Task 5, Task 6, Task 7
**Parallelizable**: No
**Notes**: Verified directly via `npm run build` (confirmed this repo's `build` script is `hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic`) — 195 pages, exit 0. Checked every condition: rendered page has real date (`15 August 2026`, not zero-date fallback), comment text, and clickable URL (Task 7); `public/links/atom.xml` exists and is well-formed XML (`xml.etree.ElementTree` parse OK) with 1 occurrence of the placeholder entry; `public/links/index.xml` absent (section RSS correctly disabled); `public/index.xml` has 0 occurrences of the placeholder (home-feed fix from Task 6 holds); `public/tags/` built 111 tag index pages with no errors.

### Task 9: Verify geo-gate regression
**Status**: [x] done
**Files**: none (read-only verification)
**Test**: Run `python3 scripts/geo-gate.py`, diff against the Task-0 baseline. Pass/fail result set must match exactly.
**Depends on**: Task 0, Task 8
**Parallelizable**: No
**Notes**: Verified directly — `python3 scripts/geo-gate.py` exits 0, PASS 8/8 checks, identical result set to the Task 0 baseline (`/Users/prestonbernstein/.claude/jobs/1f942deb/tmp/geo-gate-baseline.txt`). Confirms by construction (globs scoped to `content/english/blog/`/`public/blog/`) plus empirically (this run) that the links section introduces no regression.

### Task 10: Wire both CI workflows
**Status**: [x] done
**Files**: `.github/workflows/main.yml`, `.github/workflows/geo-gate.yml`
**Test**: Both files parse as valid YAML. Diff the two inserted step blocks to confirm they're identical. Secret referenced only in the pip-install step.
**Depends on**: Task 2
**Parallelizable**: No
**Notes**: Implemented directly. Inserted 3 steps (`actions/setup-python@v6.0.0` pinned to `3.11`, `pip install` linkblog-commons via PAT over HTTPS pinned to commit SHA `f12f008` — no tag exists yet, plan.md accepts either — and `python3 scripts/build-linkblog.py`) between "Install npm dependencies" and "Build" in both files. Verified: both files parse as valid YAML (`yaml.safe_load`), the two inserted blocks are byte-identical, `LINKBLOG_COMMONS_PAT` appears exactly once per file, in the pip-install step only. Secret name matches plan.md's `LINKBLOG_COMMONS_PAT` — Preston must still provision it (see Task 11 / Blocked-open).

### Task 11: Document the CI credential mechanism
**Status**: [x] done
**Files**: `.github/workflows/main.yml`, `.github/workflows/geo-gate.yml`, `readme.md`
**Test**: Documentation text exists, is visible, names the actual mechanism and rationale.
**Depends on**: Task 10
**Parallelizable**: No
**Notes**: Implemented directly, both places (belt and suspenders — inline for readers of the YAML, readme for discoverability). Added an identical 5-line comment above the pip-install step in both workflow files naming the PAT scope, where it's stored, that Preston must provision it manually, and why the SHA-pin exists. Added a new "Linkblog" section to `readme.md` (confirmed `readme.md`/`README.md` are the same inode on this filesystem, so one edit covers both) covering the `data/linkposts.json` authoring format, the url/published immutability convention (requirement 15), the generated-and-committed convention, and the full CI credential mechanism/rationale. Also updated the stale "Project layout" block (`scripts/` was documented as empty; it already held `geo-gate.py` before this feature) to reflect `links/`, `data/linkposts.json`, `static/`, and `scripts/build-linkblog.py`.

### Task 13: Remove the placeholder entry before merge
**Status**: [x] done
**Files**: `data/linkposts.json`
**Test**: `python3 -m json.tool data/linkposts.json` shows `[]` — OR an explicit flagged exception is recorded.
**Depends on**: Task 8
**Parallelizable**: No
**Notes**: Depends on Task 8 only (not Task 12/15 — those are owned by ship-it's outer phases, see Blocked/open). Implemented directly — replaced the single placeholder entry with `[]`. `python3 -m json.tool data/linkposts.json` confirms valid empty-array JSON.

### Task 14: Regenerate artifacts and confirm clean merge state
**Status**: [x] done
**Files**: `content/english/links/*.md` (deleted, generated-only), `static/links/atom.xml` (regenerated)
**Test**: Re-run build-linkblog.py against the now-empty data file; confirm `content/english/links/` contains only `_index.md`; `hugo --gc --minify` builds cleanly; `git status` shows no unexpected tracked changes.
**Depends on**: Task 13
**Parallelizable**: No
**Notes**: Verified directly. `python3 scripts/build-linkblog.py` against the empty `data/linkposts.json` exits 0; `content/english/links/` contains only `_index.md`; `static/links/atom.xml` regenerated as a valid, well-formed, 0-entry feed. `npm run build` builds cleanly — 192 pages (matches the Task 0 pre-feature baseline exactly, confirming no orphaned placeholder page survives). `git status` clean: 4 modified files (both CI workflows, `readme.md`, `.gitignore`), rest untracked new files from this feature — no unexpected changes. Along the way found and fixed a real gap: this repo's `.gitignore` never excluded `__pycache__/`/`*.pyc`, which `scripts/build-linkblog.py` and `scripts/geo-gate.py` now both generate locally — added both entries and deleted the stray `scripts/__pycache__/` directory so it can't get committed by accident.

## Blocked / open

- **steps.md Step 12 ("Push branch and watch CI") and Step 15 ("Merge and verify live") are intentionally NOT tracked as new-story tasks.** They duplicate what the outer `/ship-it` pipeline's own Phase 5 (verify), Phase 6 (commit + merge), Phase 7 (deploy), and Phase 8 (post-deploy verification) already own — new-story's job is to get the worktree to a locally-verified, mergeable state (Tasks 0–14), not to push/merge/deploy itself. Ship-it's own later phases execute the equivalent of Steps 12 and 15 with their own (more careful) process.
- **FINAL STATE (2026-08-15): PR #6 opened, not yet merged.** All local verification passed (build, geo-gate.py 8/8, Playwright 55/55, code review clean) and the branch is pushed. CI's new `Install linkblog-commons` step fails on both workflow runs with a clean, expected error: `remote: Invalid username or token... fatal: Authentication failed` — because the `LINKBLOG_COMMONS_PAT` repo secret has not been provisioned yet, exactly as flagged throughout requirements.md/plan.md/the PR body. `main` has no branch protection, so a merge is not mechanically blocked, but merging now would also fail the live `main.yml` deploy at the same step (push-to-main is this repo's only deploy path — no staging). Stopped short of merging to avoid landing a guaranteed-broken deploy. **Preston must add `LINKBLOG_COMMONS_PAT`** (Settings → Secrets and variables → Actions on `pres-ber-blog`) — a fine-grained GitHub PAT scoped to `Contents: Read-only` on `linkblog-commons` only — then either re-run the failed checks on PR #6 or ask for the merge to be completed.
