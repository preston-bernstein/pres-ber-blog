# Steps: Linkblog Integration (linkblog-commons pipeline)

## Prerequisites

- **`LINKBLOG_COMMONS_PAT` (or equivalent) GitHub Actions repo secret must be provisioned by Preston** in pres-ber-blog's repo settings (fine-grained PAT, `Contents: Read-only` scoped to `linkblog-commons`) before either `.github/workflows/main.yml` or `.github/workflows/geo-gate.yml` can complete a full green CI run. No step in this repo can create this secret. Steps 1–9 (local validation, rendering, Hugo build, geo-gate regression) do not depend on it and must pass locally before the secret exists. Step 10 (CI wiring) only needs the secret to be *referenced correctly*, not to exist yet. Step 12 (push/watch CI) is explicitly written to accept "fails with a clear auth error because the secret isn't provisioned yet" as a valid, non-blocking outcome.
- Preston's own machine must already have git/SSH or HTTPS credentials with read access to the private `github.com/preston-bernstein/linkblog-commons` repo, so `pip install git+...` works locally in steps 3–6 and 8 without needing the CI secret.
- Hugo Extended v0.164.0 available locally (matching the version pinned in both workflows), for local `hugo --gc --minify` runs in step 8 and 14.

## Implementation steps

### Step 0: Capture pre-feature geo-gate.py baseline
**What**: Run `python3 scripts/geo-gate.py` against the unmodified `main` branch and record its full pass/fail output to a scratch file (not committed), so later verification has a real diff target.
**Files**: none (read-only verification)
**Test**: The recorded baseline output exists, is non-empty, and reflects the current pass/fail state of geo-gate against unmodified main.
**Depends on**: none
**Parallelizable**: Yes

### Step 1: Scaffold `data/linkposts.json` and `content/english/links/_index.md`
**What**: Add both scaffold files in one step: (1) hand-authored link-post data source with a single placeholder `LinkPost` entry for end-to-end verification (requirement 13; removed in step 13 per requirement 14), and (2) the section index page with Blowfish-compatible front matter and an `outputs = ["HTML"]` override so Hugo does not emit its own `/links/index.xml`.
**Files**: `data/linkposts.json`, `content/english/links/_index.md`
**Test**: 
  - `python3 -m json.tool data/linkposts.json` succeeds; file contains exactly one entry with non-empty `url`, `published`, `comment`, and a `tags` array.
  - Front matter in `_index.md` parses (TOML/YAML), contains `title`/`description`, and includes the `outputs` override excluding RSS.
**Depends on**: none
**Parallelizable**: Yes

### Step 2: Write `scripts/build-linkblog.py` — validation only
**What**: Add the script skeleton that loads `data/linkposts.json`, validates every entry has non-empty `url`/`published`/`comment` (defaulting `tags` to `[]`), prints one line per invalid entry naming its index/URL/field, and exits 1 before invoking linkblog-commons if any entry is invalid — plus a top-of-file docstring documenting `data/linkposts.json` as hand-authored/non-Hugo-native (requirement 15).
**Files**: `scripts/build-linkblog.py`
**Test**: `python3 scripts/build-linkblog.py` against the step-1 file exits 0 (no-op, render not yet implemented). Copy the data file, blank out `comment` on the one entry, run the script against the copy — exits 1 and stderr names the entry's index and the missing field.
**Depends on**: Step 1
**Parallelizable**: No

### Step 3a: Extend build-linkblog.py — wipe stale generated files
**What**: Add the logic to delete all `.md` files under `content/english/links/` except `_index.md` (only files matching the generated-filename pattern, never a blanket delete), so stale rendered entries don't accumulate across runs.
**Files**: `scripts/build-linkblog.py`
**Test**: Create a dummy `.md` file under `content/english/links/` (e.g., `stray.md`). Run the wipe logic. Confirm the stray file is deleted while `_index.md` survives. Confirm `_index.md` is never touched.
**Depends on**: Step 2
**Parallelizable**: No

### Step 3b: Extend build-linkblog.py — render each entry
**What**: Add the per-entry `subprocess` call to `python -m linkblog_commons render ...`, checking the JSON status envelope (not just process exit code) for `status: "fail"`.
**Files**: `scripts/build-linkblog.py`
**Test**: `pip install git+https://github.com/preston-bernstein/linkblog-commons.git` locally (Preston's own credentials, no CI secret needed). Run `python3 scripts/build-linkblog.py`; confirm exactly one new `.md` file appears under `content/english/links/` (acceptance criterion 1).
**Depends on**: Step 3a
**Parallelizable**: No

### Step 4: Extend build-linkblog.py — inject `date` front matter
**What**: After each successful render, parse the front matter linkblog-commons just wrote and inject a `date: "<published>"` line alongside the existing `published` field, so Blowfish's `.Date`-driven sort/display works (the front-matter gap identified in the plan).
**Files**: `scripts/build-linkblog.py`
**Test**: Rerun the script. Open the rendered `.md` file directly and confirm its front matter contains both a `published:` key and a `date:` key set to the same value — inspect the actual front matter text, not just the script's exit code.
**Depends on**: Step 3b
**Parallelizable**: No

### Step 5: Extend build-linkblog.py — generate the feed
**What**: Add the once-per-run `subprocess` call to `python -m linkblog_commons feed --input data/linkposts.json --output static/links/atom.xml ...`, checking its status envelope for failure.
**Files**: `scripts/build-linkblog.py`
**Test**: Rerun the script. Confirm `static/links/atom.xml` exists and parses as well-formed XML (`python3 -c "import xml.etree.ElementTree as ET; ET.parse('static/links/atom.xml')"`) with exactly one `<entry>`.
**Depends on**: Step 4
**Parallelizable**: No

### Step 6: Add Hugo template override for home-page RSS scoping
**What**: Add a repo-local override (e.g. `layouts/index.xml` or `layouts/_default/rss.xml`—exact path confirmed empirically via real hugo build test) filtered to `mainSections`-only content so link posts don't leak into the site's existing home-page RSS feed `/index.xml`.
**Files**: a new `layouts/` file (path TBD during implementation)
**Test**: After a full Hugo build with at least one link post present, `public/index.xml` does NOT contain that link post's URL/title, while existing blog posts in `public/` still do.
**Depends on**: Step 3b
**Parallelizable**: No

### Step 7: Add Hugo template override for clickable link title
**What**: Add a minimal repo-local single-page template override scoped to the links section so the rendered page's URL renders as an actual clickable `<a href>` anchor, not just plain title text (Blowfish's default template doesn't do this).
**Files**: a new `layouts/` file (path TBD during implementation)
**Test**: After a full Hugo build, `public/links/<slug>/index.html` contains an `<a href="<the actual url>">` element.
**Depends on**: Step 6
**Parallelizable**: No

### Step 8: Local end-to-end build verification
**What**: Run the full local pipeline output through Hugo, proving the rendered page, date, feed, and RSS-collision fix all work. Verify: Hugo build success, date in HTML, feed existence/well-formedness, `/links/index.xml` absence, `/index.xml` does NOT contain link posts, and `/tags/<tag>/` pages are not newly broken.
**Files**: none (verification only; reads `content/english/links/`, `static/links/`, `public/`)
**Test**: Run `hugo --gc --minify`. Confirm `public/links/<slug>/index.html` exists and its HTML contains the placeholder's real published date (not blank/zero-date) plus its comment and URL text (acceptance criteria 3, 8). Confirm `public/links/atom.xml` exists. Confirm `public/links/index.xml` does NOT exist. Confirm `public/index.xml` does NOT contain the link post's URL or title. Verify no new broken links in `/tags/` pages.
**Depends on**: Step 1, Step 4, Step 5, Step 6, Step 7
**Parallelizable**: No

### Step 9: Verify geo-gate regression
**What**: Run the existing `python3 scripts/geo-gate.py` and diff results against the baseline captured in Step 0, confirming that the linkblog feature introduces no regressions to the geo-gate pass/fail outcome.
**Files**: none (read-only verification)
**Test**: Run `python3 scripts/geo-gate.py` and diff its output against the baseline file from Step 0. The pass/fail result set must match exactly.
**Depends on**: Step 0, Step 8
**Parallelizable**: No

### Step 10: Wire both CI workflows
**What**: Insert two identical steps — (1) `pip install` linkblog-commons using `${{ secrets.LINKBLOG_COMMONS_PAT }}`, (2) `python3 scripts/build-linkblog.py` — between "Install npm dependencies" and "Build" in both `.github/workflows/main.yml` and `.github/workflows/geo-gate.yml`.
**Files**: `.github/workflows/main.yml`, `.github/workflows/geo-gate.yml`
**Test**: Both files parse as valid YAML (`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/main.yml'))"`, same for geo-gate.yml). Diff the two inserted step blocks to confirm they're identical. Confirm the secret is referenced only in the pip-install step, never echoed/logged elsewhere.
**Depends on**: Step 2
**Parallelizable**: No

### Step 11: Document the CI credential mechanism
**What**: Add a short comment block at the top of each CI workflow's new pip-install step (or a section in readme.md) stating which credential mechanism was chosen (PAT-scoped pip install via repo secret, pinned to a specific tag/SHA — not the submodule route) and why, satisfying the requirement that this choice be explicitly chosen and documented.
**Files**: `.github/workflows/main.yml`, `.github/workflows/geo-gate.yml` (comment additions) or `readme.md`
**Test**: The documentation text exists, is visible in the workflow or readme, and names the actual mechanism and its rationale.
**Depends on**: Step 10
**Parallelizable**: No

### Step 12: Push branch and watch CI
**What**: Push the branch, open/update the PR, and observe the `geo-gate.yml` run reach the new steps.
**Files**: none (CI-only)
**Test**: Two acceptable outcomes, given the external PAT prerequisite: (a) secret already provisioned → pip-install and build-linkblog steps both succeed and `npm run build` proceeds with links content, workflow green; (b) secret not yet provisioned → CI logs show the failure occurring specifically at the pip-install step (named in the log), with a clear, named auth error (401/403), not an unrelated error. Either outcome confirms correct wiring; outcome (b) is expected and does not block step 13.
**Depends on**: Step 11
**Parallelizable**: No

### Step 13: Remove the placeholder entry before merge
**What**: Restore `data/linkposts.json` to `[]`, per requirement 14 — OR, if Preston explicitly decides to keep the placeholder, state that decision visibly in the PR description instead of removing it. This step must not be folded into a general "verify everything" pass; it is a standalone, explicit go/no-go on requirement 13/14.
**Files**: `data/linkposts.json`
**Test**: `python3 -m json.tool data/linkposts.json` shows `[]` — OR the PR description contains an explicit, visible statement that the placeholder is intentionally retained and why. `git diff main -- data/linkposts.json` must not contain the placeholder URL unless that flagged exception applies.
**Depends on**: Step 8, Step 12
**Parallelizable**: No

### Step 14: Regenerate artifacts and confirm clean merge state
**What**: Re-run the pipeline against the now-empty (or explicitly-flagged) data file so no stale generated content or feed entries linger, and confirm the repo is left in a mergeable state.
**Files**: `content/english/links/*.md` (deleted, generated-only), `static/links/atom.xml` (regenerated)
**Test**: `python3 scripts/build-linkblog.py` then confirm `content/english/links/` contains only `_index.md`. `hugo --gc --minify` builds cleanly. `public/links/atom.xml` contains zero `<entry>` elements (or matches whatever requirement-14 exception was recorded in step 13). `git status` shows no unexpected tracked changes under `content/english/links/`.
**Depends on**: Step 13
**Parallelizable**: No

### Step 15: Merge and verify live
**What**: Once CI is green (or shows the expected pre-provisioned-secret auth failure), merge to main, then curl-verify the live site's `/links/` page and `/links/atom.xml` actually resolve with real content (or the expected empty-array state if the placeholder was stripped per step 13).
**Files**: none
**Test**: After merge and deploy completion, `curl` against the live URLs (`https://<live-site>/links/` and `https://<live-site>/links/atom.xml`) returns 200 with expected content structure (or empty-array state if placeholder was removed).
**Depends on**: Step 12, Step 14
**Parallelizable**: No

## Rollback plan

All steps reversible via git (`git revert` / `git checkout` on the affected files). No step performs an irreversible external action from within this repo — the one non-git action, provisioning `LINKBLOG_COMMONS_PAT` (Prerequisites), is additive and low-risk: deleting or rotating the secret afterward simply returns CI to its pre-feature (Python-dependency-free) state with no code changes required.

If placeholder content is accidentally deployed live (e.g., if the placeholder-retention exception in step 13 is exercised and goes live before being removed), the recovery path is reverting the commit on main and re-pushing: re-pushing triggers a fresh FTP deploy of the reverted `public/` output. No separate cache-purge or CDN consideration exists in this repo's current deploy setup.
