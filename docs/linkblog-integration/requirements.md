# Requirements: Linkblog Integration (linkblog-commons pipeline)

## Problem statement

pres-ber-blog has no way to publish short link-plus-commentary posts. Every post currently goes through content/english/blog/, which is built and gated for long-form writing (80-160 char descriptions, JSON-LD BlogPosting, internal/external link minimums tuned to full articles). linkblog-commons is a private Python library, already built and published at github.com/preston-bernstein/linkblog-commons, that defines the LinkPost shape and can render a LinkPost into a Hugo content file and into an Atom feed — but nothing in pres-ber-blog calls it. Preston is the only author and the only stakeholder who needs this now: he wants to hand-author a small JSON file of links with commentary and have a build step turn that into a separate, discoverable section of the live site, without the long-form GEO gate rules applying to a format they weren't designed for. This matters now because linkblog-commons has shipped with no consumer — the library is dead weight until something wires it in, and CONTRACT.md's design decisions (structural separation from content/english/blog/) can't be validated end-to-end until a real pipeline runs it.

## Users / stakeholders

- Preston Bernstein — sole author; hand-edits the link-post data file; the only person whose workflow this changes.
- Site visitors / readers of prestonbernstein.com — consume the rendered links section and its feed.
- CI (GitHub Actions `main.yml` / `geo-gate.yml`) — must run the pipeline before `npm run build` and must not be broken by it.
- Future maintainers of linkblog-commons — the CONTRACT.md shape this pipeline consumes is a public interface; a second consumer may exist later.

## Functional requirements

1. The system shall provide a hand-editable data source at `data/linkposts.json` containing an array of entries matching linkblog-commons' `LinkPost` shape (`url`, `published`, `comment`, `tags`), so that Preston can add a link post by editing one file with no admin UI.
2. The system shall provide a pre-build Python script (e.g. `scripts/build-linkblog.py`) that reads `data/linkposts.json` and, for each entry, invokes `python -m linkblog_commons render` to produce one Hugo content file per link post, so that each entry becomes a page without hand-written Markdown.
3. The system shall write rendered link-post content files into a directory distinct from `content/english/blog/` (e.g. `content/english/links/`), so that linkblog-commons' CONTRACT.md requirement of structural separation from long-form posts is satisfied.
4. The system shall wipe (delete) all existing files under `content/english/links/` at the start of every pre-build script run and regenerate them from the current `data/linkposts.json` — never append to prior output — so that an entry removed from `data/linkposts.json` does not leave an orphaned page in a subsequent build.
5. The system shall commit all build-generated linkblog output — `content/english/links/*.md` and the generated links Atom feed file — to version control, matching this repo's existing `data/geo-battery.json` precedent of committing machine-generated files so drift is diffable/reviewable in a PR before it goes live (this repo has no staging environment).
6. The system shall invoke `python -m linkblog_commons feed` once per build to produce a links-only Atom feed containing only entries from `data/linkposts.json`, so that readers can subscribe to link posts independent of the long-form blog feed.
7. The system shall supply the feed's `--title` and `--link` values as fixed constants in the pre-build script, documented as mirroring the site's own identity as configured in `hugo.toml` (its `title` and `baseURL`) — not read dynamically from `hugo.toml` at build time, which would add an unneeded TOML-parsing dependency.
8. The system shall order the Atom feed's `<entry>` elements reverse-chronologically by `published` (newest first), the standard convention for a subscribable feed.
9. The system shall fail the build step (non-zero exit) if `python -m linkblog_commons render` or `python -m linkblog_commons feed` exits non-zero for any entry, so that a malformed `data/linkposts.json` entry cannot silently produce a partial or missing page.
10. The system shall validate that every entry in `data/linkposts.json` has non-empty `url`, `published`, and `comment` fields before invoking linkblog-commons, so that a missing required field is reported with the offending entry's index/URL rather than surfacing as an opaque subprocess failure.
11. The system shall validate that each entry's `published` field is parseable as a timezone-aware ISO 8601 datetime string, rejecting entries with an unparseable non-empty `published` value or a value that parses but has no timezone offset (linkblog-commons' own `LinkPost` validation requires `published` to be timezone-aware; a bare date or tz-naive datetime passes a naive ISO-8601 parse but is rejected downstream with a less specific error, so this repo's own validation checks for tz-awareness too).
12. The system shall validate that each entry's `url` field starts with `http://` or `https://`, rejecting entries with any other scheme or a relative path.
13. The system shall validate that each entry's `tags` field, when present, is an array whose elements are all strings, rejecting entries where `tags` is present but is not an array or contains a non-string element.
14. The system shall reject an entry whose `url`, `published`, or `comment` field is whitespace-only after trimming, not only when the field is an empty string.
15. The system shall reject `data/linkposts.json` if two or more entries share the same `url`, reporting the duplicate `url` and the indices involved — since the rendered filename is derived as `sha256(url|published)`, a duplicate `url` risks silently overwriting a prior entry's page during the wipe-and-regenerate render.
16. The system shall run the pre-build script in `.github/workflows/main.yml` before the `npm run build` step, so that rendered link-post pages and the links feed exist before Hugo builds `public/`.
17. The system shall run the pre-build script in `.github/workflows/geo-gate.yml` before its `npm run build` step, so that link-post rendering is exercised identically on PRs/branches and on the main-branch deploy path.
18. The system shall install linkblog-commons in CI via a PAT-scoped `pip install` against its private GitHub repository, authenticated using a credential stored as a GitHub Actions repo secret, so that CI can resolve a dependency that `pip install` cannot reach unauthenticated.
19. The system shall pin the linkblog-commons dependency install to a specific tag or commit SHA — never the default/main branch — so that a breaking change pushed upstream to linkblog-commons cannot fail pres-ber-blog's CI on a commit that only touches blog posts.
20. The system shall NOT assume that Preston's local development credentials for installing linkblog-commons are the same as the CI-specific PAT stored as a repo secret — any valid local credential with read access to linkblog-commons (an SSH key, a personal PAT, or existing `gh` CLI auth) is sufficient for local development; only CI requires the specific repo-secret-stored PAT.
21. The system shall NOT modify `scripts/geo-gate.py` to check `content/english/links/` unless a separate, explicit decision is made to extend it — the default behavior of this feature is that link posts are not subject to the GEO gate's 8 checks.
22. The system shall place the links Atom feed output at a path that does not collide with Hugo's own generated section-level RSS output for `content/english/links/` (Hugo's default `[outputs]` config emits section RSS at `/links/index.xml` once that section exists; the pipeline's own feed output must use a distinct path, e.g. `/links/atom.xml`, or explicitly replace Hugo's default rather than silently colliding with it).
23. The system shall ensure link posts do NOT appear in the site's home-page RSS/Atom output (`/index.xml`) — Blowfish's default `layouts/_default/rss.xml` builds that feed from `.Site.RegularPages` with no section filter, so without an explicit fix every new link post would automatically and silently appear in the site's main, already-subscribed feed alongside blog posts. The existing home feed must remain scoped to blog content only, matching how `mainSections = ["blog"]` already scopes the homepage's visible list and `llms.txt`.
24. The system shall document, as a named and accepted known limitation of this pass (not something this feature is required to fix), that Blowfish's `terms.html` taxonomy template is similarly unfiltered by section — a tag shared between a blog post and a link post will show both on the same `/tags/<tag>/` page.
25. The system shall render each link post as a valid Hugo content page under `content/english/links/` such that `hugo --gc --minify` builds it into `public/links/<slug>/index.html` (or equivalent) without error, using Blowfish's existing default section/page templates unless a specific rendering need is identified that Blowfish does not cover.
26. The system shall render each link post's URL as an actual clickable anchor (`<a href="...">`) pointing at that URL, not as plain title text — this requires a minimal repo-local Hugo template override for the links section, since linkblog-commons' `hugo_render()` sets the Hugo page `title` to the raw URL string and Blowfish's default page template renders `.Title` as a plain heading, not a hyperlink.
27. The system shall include a link to the new links section in the site's navigation, so that the section is discoverable rather than reachable only by direct URL.
28. The system shall include a `<link rel="alternate" type="application/atom+xml">` tag in the site's HTML head pointing at the links Atom feed, so that feed readers can auto-discover it.
29. The system shall be verified end-to-end with at least one test/placeholder `LinkPost` entry that proves: `data/linkposts.json` → rendered content file → `hugo build` → a viewable HTML page → a valid Atom feed containing that entry.
30. The system shall remove the placeholder `LinkPost` entry used for verification before this feature merges to `main`, OR — if it is left in for any reason — that decision shall be raised explicitly as an open question during spec-challenge/review rather than merged silently, so that no fake content is shipped to the live site unflagged.
31. The system shall document, in the pipeline script or adjacent README, that `data/linkposts.json` is a hand-authored source file — not a Hugo-native content type — consistent with the existing `data/authors/` and `data/geo-battery.json` precedent of non-Hugo-native files living under `data/`.
32. The system shall document, as a hand-authoring convention, that once an entry in `data/linkposts.json` is published, its `url` and `published` fields are immutable identifiers — they determine the generated filename/slug (`sha256(url|published)`-based, per linkblog-commons) — and that only `comment` and `tags` are safe to edit after publishing without changing the post's URL.

## Non-functional requirements

- The pre-build script shall exit non-zero on any linkblog-commons invocation failure, causing the CI job to fail before the Hugo build step runs (fail-fast, not silent skip).
- The pre-build script shall run to completion within the existing CI job's overall time budget with no dedicated timeout of its own beyond the job-level default, since `data/linkposts.json` is expected to hold a small, hand-authored entry count (tens, not thousands).
- The credential used to install linkblog-commons in CI shall be stored as a GitHub Actions repo secret (or deploy key), never committed to the repository or logged in plaintext in workflow output.
- The pipeline shall not require any new runtime service — it runs only as a CI/local pre-build step, consistent with linkblog-commons being an imported library / CLI, not a standalone service (per linkblog-commons' own CLAUDE.md).

## Constraints

- Must integrate with the existing GitHub Actions workflows `.github/workflows/main.yml` (push-to-main = live deploy via FTP, no staging) and `.github/workflows/geo-gate.yml` (PR/branch gate) — both currently have no Python dependency-install step; `scripts/geo-gate.py` is stdlib-only today, so this is the first Python dependency this repo's CI will install.
- linkblog-commons is a **private** GitHub repository. The existing `themes/blowfish` submodule pattern is not directly reusable as-is because Blowfish is public and needs no credential; a private submodule or private pip install needs its own credential, and if that credential does not already exist as a repo secret, Preston must provision it — this requirement cannot be silently worked around.
- Must not alter `content/english/blog/` or its existing GEO-gate coverage.
- Must not change `scripts/geo-gate.py`'s existing 8 checks or their thresholds for long-form posts.
- Must use the Blowfish theme already vendored at `themes/blowfish` (git submodule) for any rendering/templating; no new theme or templating framework.
- Must use Hugo Extended v0.164.0, matching the version pinned in `main.yml` and `geo-gate.yml`.
- Must call linkblog-commons only via its documented interfaces: `from linkblog_commons import LinkPost, hugo_render, generate_feed` (Python import) or `python -m linkblog_commons render|feed` (CLI) — per linkblog-commons' CLAUDE.md, it is imported or shelled out to, never run as a service.
- linkblog-commons and this pipeline must not fetch or validate URLs over the network (per linkblog-commons' CONTRACT.md scope: it never fetches anything itself).

## Out of scope

- Authoring real link-post content / commentary. This pass builds the pipeline only; populating `data/linkposts.json` with real entries is a future pass.
- Any bylined commentary text written for real link posts goes through `/voice-draft`, not this pipeline — this requirements doc governs the mechanism, not the prose.
- An admin UI or web form for adding link posts.
- Extending `scripts/geo-gate.py` to check `content/english/links/` (explicitly deferred per requirement 21; a separate future decision).
- New Hugo templates beyond what Blowfish's existing theme layouts already provide for a new content section, unless investigation during implementation finds a specific gap Blowfish does not cover.
- Changes to `content/english/blog/`, its GEO-gate checks, or its existing feed.
- Comment systems, likes, or any interactive feature on link posts.
- Modifying linkblog-commons itself (its CONTRACT.md/CLAUDE.md define it as already built and shipped; this feature only consumes it).

## Acceptance criteria

1. Running the pre-build script locally against a `data/linkposts.json` containing one valid entry produces exactly one new file under `content/english/links/` and exits 0.
2. Running the pre-build script against a `data/linkposts.json` entry missing a required field (`url`, `published`, or `comment`) exits non-zero and prints an error identifying which entry/field is invalid, without invoking linkblog-commons for that entry.
3. Running `hugo --gc --minify` after the pre-build script produces `public/links/<slug>/index.html` (or equivalent path) for each rendered link post, with no Hugo build errors introduced by the new content, and the count of Hugo build warnings after this feature must not increase relative to the count produced by a build without this feature's content.
4. The generated links Atom feed validates as well-formed XML/Atom and contains one `<entry>` per entry in `data/linkposts.json`, at a URL path distinct from Hugo's own default `/links/index.xml` section RSS output.
5. A baseline run of `python3 scripts/geo-gate.py` shall be captured on the unmodified branch before any feature changes land (before `content/english/links/` or the pre-build script exist). After this feature's changes land, `python3 scripts/geo-gate.py` run against a build that includes `content/english/links/` content shall produce the same result (pass/fail set) as that captured baseline — i.e., link posts do not introduce new geo-gate failures or silently get scanned by checks not designed for them.
6. `.github/workflows/main.yml` and `.github/workflows/geo-gate.yml`, when run against a branch containing a test `data/linkposts.json` entry, both complete the pre-build linkblog step before their respective `npm run build` steps, using a documented credential (repo secret or deploy key) to resolve the private linkblog-commons dependency — pipeline failure to authenticate is reported as a clear CI error, not a silent skip.
7. No entry remains in `data/linkposts.json` on `main` after this feature merges unless its presence was explicitly flagged and accepted during review — a merge to `main` containing an unflagged placeholder entry fails this criterion.
8. A site visitor loading the rendered links section index page (`/links/` or equivalent) sees, for each link post: the link's target URL rendered as an actual clickable anchor (`<a href="...">`) — not as plain title text — the comment text, and the published date, all rendered as HTML.
