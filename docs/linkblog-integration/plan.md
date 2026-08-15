# Plan: Linkblog Integration (linkblog-commons pipeline)

## Approach

Add one new pre-build Python script, `scripts/build-linkblog.py`, that reads the hand-authored `data/linkposts.json`, validates it, then shells out to linkblog-commons' documented CLI (`python -m linkblog_commons render` / `feed`) to regenerate `content/english/links/*.md` and `static/links/atom.xml` from scratch on every build. Both CI workflows run this script immediately before their existing `npm run build` step, so Hugo always builds against freshly derived content — nothing under `content/english/links/` is hand-edited except the section's own `_index.md`. linkblog-commons is installed in CI via a fine-grained PAT stored as a repo secret (not a private submodule — see Technology choices), keeping the private-dependency problem to a single `pip install` line rather than new SSH infrastructure, and that line is pinned to a specific tag/commit SHA rather than the default branch (see Technology choices) so an unrelated upstream change can't silently break CI on a blog-post-only push. The Hugo-vs-linkblog-commons feed collision is resolved at **two** levels, not one: the section-level `/links/index.xml` is turned off via a front-matter `outputs` override on `content/english/links/_index.md`, and — confirmed by direct inspection of Blowfish's actual theme source, not assumed — the **home-level** `/index.xml` feed also needs a fix, because Blowfish's `rss.xml` builds the home feed from `.Site.RegularPages` with no section filter, meaning link posts would otherwise silently leak into the site's already-live main blog feed. Both fixes are narrowly-scoped repo-local Hugo template overrides, in scope under this plan's existing "no new Hugo templates unless investigation finds a specific gap Blowfish does not cover" carve-out — a third override, also newly in scope under that same carve-out, makes the rendered link post's URL an actual clickable `<a href>` (Blowfish's default single template renders linkblog-commons' `title`-as-raw-URL front matter as plain text, which would otherwise defeat the point of a linkblog). Generated `content/english/links/*.md` and `static/links/atom.xml` are committed to git, not `.gitignore`d — see Data model — so slug/permalink drift is visible in PR diffs before it goes live, since this repo has no staging environment.

## Architecture

```
data/linkposts.json  (hand-authored, source of truth; url+published treated
        │              as immutable once published -- see Design decisions)
        ▼
scripts/build-linkblog.py   (new; runs in CI before `npm run build`,
        │                     also runnable locally)
        │  1. load + validate all entries (fail fast, all-or-nothing;
        │     includes duplicate-url detection, see API/interface contract)
        │  2. wipe generated *.md under content/english/links/
        │     (except _index.md)
        │  3. for each entry: subprocess → `python -m linkblog_commons render`
        │  4. once: subprocess → `python -m linkblog_commons feed`
        │  5. self-verify: parse generated atom.xml with ElementTree +
        │     confirm each .md's front matter has a parseable `date`;
        │     fail the build if either check fails
        │
        ├──► content/english/links/<slug>.md   (N files, regenerated each
        │                                        run, COMMITTED to git)
        └──► static/links/atom.xml             (1 file, regenerated each
                                                  run, COMMITTED to git)
        │
        ▼
hugo --gc --minify   (existing `npm run build`, unchanged invocation)
        │  - renders content/english/links/*.md via a new repo-local
        │    single-page template override (links section only) that wraps
        │    .Params.url in a real <a href> anchor -- Blowfish's default
        │    single template only renders .Title as plain text, and
        │    linkblog-commons sets .Title to the raw URL string
        │  - copies static/links/atom.xml → public/links/atom.xml verbatim
        │  - does NOT emit public/links/index.xml (RSS disabled for this
        │    section via _index.md front matter -- section-level fix)
        │  - a new repo-local layouts/index.xml (or _default/rss.xml --
        │    exact override path confirmed empirically at implementation
        │    time, see Risk areas) filters the HOME feed to mainSections
        │    only, so public/index.xml stops silently absorbing link posts
        │    via .Site.RegularPages -- home-level fix, Blowfish's stock
        │    rss.xml has no section filter
        ▼
scripts/geo-gate.py   (unchanged; globs are content/english/blog/*.md and
                        public/blog/*/index.html only — links/ is outside
                        its scope by construction, not by exemption)
        ▼
FTP deploy (main.yml, main branch only)
```

Both `.github/workflows/main.yml` and `.github/workflows/geo-gate.yml` get the identical new steps (setup Python, install linkblog-commons, run build-linkblog.py) inserted between "Install npm dependencies" and "Build", so the two workflows stay behaviorally identical up to the FTP-deploy step that only `main.yml` has.

## Design decisions

Explicit call-outs for decisions that were implicit in the original draft, or that critique surfaced and resolved:

- **`url` + `published` are immutable once a `data/linkposts.json` entry is published.** Both fields feed the derived filename/slug (`sha256(url|published)`-based, per linkblog-commons), so changing either after publish moves the permalink. `comment` and `tags` are safe to hand-edit later without affecting the URL. This is a hand-authoring convention documented in `readme.md`/`build-linkblog.py`'s header comment, not a schema or validation change — linkblog-commons itself stays out of scope for this pass.
- **Generated output is committed, not gitignored** — see Data model and Integration points. Reconsidered from treating `content/english/links/*.md` and `static/links/atom.xml` as build artifacts by analogy to `public/`; the closer, contradicting precedent is `data/geo-battery.json`, deliberately committed per CLAUDE.md's battery-refresh flow so it's diffable/reviewable in PRs. No staging environment here means the PR diff is the only pre-live check on slug/permalink drift.
- **Two new, narrowly-scoped Hugo template overrides are in scope this pass** (home-feed RSS filter, links single-page clickable-link view), plus the section-level RSS override already planned — all three under this plan's existing "no new Hugo templates unless investigation finds a specific gap Blowfish does not cover" carve-out. Both new gaps were confirmed by reading Blowfish's actual theme source, not assumed. See Integration points and Risk areas for the open question of exact override filenames.
- **Version-pin the linkblog-commons dependency** (Technology choices) rather than track its default branch, given this repo's no-staging deploy model.
- **Explicitly out of scope for this pass** (deliberate, documented deferrals, not omissions): fixing linkblog-commons' missing `date` field upstream instead of working around it locally; CI path-filtering to skip the linkblog step on pushes that don't touch `data/linkposts.json`; a fix for Blowfish's `terms.html` mixing blog and link posts on shared tag pages. See Risk areas for each.

## Data model

`data/linkposts.json` — hand-authored, non-Hugo-native, same category as the
existing `data/authors/*.json` and `data/geo-battery.json`:

```
[
  {
    "url": string,        // required, non-empty; the link being shared
    "published": string,  // required, non-empty; timezone-aware ISO 8601
                           // datetime (e.g. "2026-08-15T10:00:00+00:00") --
                           // a bare date or tz-naive value is rejected
    "comment": string,    // required, non-empty; Preston's commentary
    "tags": [string]      // optional; defaults to [] if omitted
  },
  ...
]
```

No database. No schema enforcement beyond `build-linkblog.py`'s own validation
(requirement 6, plus duplicate-`url` detection — see API/interface contract)
— this is a flat array validated at build time, not a Hugo-native content
type or a JSON Schema file. The exact `LinkPost` field set and types are
owned by linkblog-commons' `CONTRACT.md`; this table mirrors what's already
confirmed in this repo's requirements doc and must be checked against that
file at implementation time for any field beyond these four. Once an entry
is published, `url` and `published` are treated as immutable (see Design
decisions) since together they derive the stable filename/slug.

`content/english/links/` — generated Hugo content, not a data model change
in the traditional sense, but worth stating explicitly: every `.md` file in
this directory except `_index.md` is a build artifact, fully derived from
`data/linkposts.json`, regenerated (not merged) on every run. **Committed to
git, not `.gitignore`d** — reconsidered from an earlier draft that treated
it by analogy to `public/`. The closer precedent in this repo is
`data/geo-battery.json`, a machine-generated file CLAUDE.md deliberately
commits so it's diffable/reviewable in PRs. `content/english/links/*.md` is
Hugo *source* content — it determines real permalinks/URLs, not just final
build output like `public/` — and this repo has no staging environment to
catch a silent broken-permalink regression before it's live, so slug/
permalink drift must be visible in the PR diff. `static/links/atom.xml`
(below) follows the same reasoning and is committed too.

## API / interface contract

**CLI: `scripts/build-linkblog.py`**
- No flags required for the common case; defaults: `--data data/linkposts.json`, `--content-dir content/english/links`, `--feed-out static/links/atom.xml`.
- Exit 0: all entries valid, all renders succeeded, feed generated, self-verification (below) passes.
- Exit 1: one or more entries fail validation (requirement 6) — script prints one line per invalid entry in the form `data/linkposts.json[<index>] (<url or "no url">): missing <field>` for every offending entry (not just the first), then exits **without invoking linkblog-commons at all** — stronger than requirement 6's minimum ("without invoking linkblog-commons for that entry"): validating the whole file before rendering anything means a bad entry can never leave `content/english/links/` in a half-regenerated state.
- Exit 1: validation also includes **duplicate-`url` detection**. The derived filename is `sha256(url|published)`-based, so two entries sharing the same `url` and `published` produce an identical filename — the second silently overwrites the first with no error today. `build-linkblog.py` treats any two entries sharing a `url` (regardless of `published`) as a validation error, printed with both offending indices, since two live link posts pointing at the same URL is itself a content mistake worth catching before render, not just a filename collision to dodge.
- Exit 1: any `python -m linkblog_commons render` or `feed` subprocess exits non-zero — script prints the offending entry's index/URL and the subprocess's stderr, then exits (requirement 5).
- Exit 1: **self-verification failure after generation.** `build-linkblog.py` parses the just-written `static/links/atom.xml` with `xml.etree.ElementTree` to confirm it's well-formed XML, and confirms each just-written `content/english/links/*.md` file's front matter contains a parseable `date` field (the value injected by the front-matter fix below); either failure exits 1 with the parse error and the offending file path. This matches the repo's existing deterministic-release-gate culture (`scripts/geo-gate.py`) rather than leaving this pass's one new output surface — the generated feed and content — with zero automated check beyond subprocess exit codes.

**Subprocess calls into linkblog-commons** (confirmed against linkblog-commons' actual `cli.py`, not assumed):
- `python -m linkblog_commons render --url <url> --published <published> --comment <comment> [--tag <tag> ...] --output-dir content/english/links` — invoked once per valid entry (flags, not stdin/JSON — `render` takes no data-file input). Writes one Hugo content file (front matter: `title`=url, `url`, `published`, `tags`) into `--output-dir`. Prints a JSON status envelope to stdout (`{"schema_version":1,"status":"ok"|"fail",...}`); `build-linkblog.py` must check this exit code/envelope, not just the subprocess return code, since a `LinkBlogError` maps to a clean `status: "fail"` envelope with exit 1.
- `python -m linkblog_commons feed --input <path-or-​-> --output static/links/atom.xml --title <site title> --link <site link>` — invoked once per build. `--input` accepts either a JSON array file path or `-` for stdin; `build-linkblog.py` can point `--input` directly at `data/linkposts.json` (same shape linkblog-commons expects: array of `{url, published, comment, tags}`) rather than reformatting it. Writes the Atom feed to the `--output` path; also prints a JSON status envelope to stdout, not the feed content itself.

**Front-matter/theme compatibility gap (found by ground-truth check against linkblog-commons' actual `render.py`, not present in the original plan draft):** `hugo_render()`'s front matter uses the key `published`, not Hugo's native `date` field. Hugo's own sorting, RSS/date logic, and permalink `:year`/`:month` tokens all read `.Date`, which comes from front matter `date` (or `publishdate`) — `published` is not a Hugo-recognized alias and would be treated as an arbitrary custom param, leaving `.Date` at Hugo's zero value. Blowfish's list/section templates almost certainly rely on `.Date` for sorting and the visible date on each card. Since modifying linkblog-commons itself is out of scope (see requirements.md Out of scope, and Risk areas below), `build-linkblog.py` must post-process each file linkblog-commons writes: after `render`, parse the YAML front matter it just wrote and inject a `date: "<published value>"` line (front matter can safely carry both `published` and `date` with the same value — `published` stays as linkblog-commons' own canonical field, `date` is added purely for Hugo/Blowfish's benefit). This is a new, explicit step — see Integration points.

**Site surface**: `/links/` — section index page (Blowfish default section template driven by `content/english/links/_index.md`), listing rendered link posts with URL, comment, and published date. `/links/<slug>/` — one page per link post, using the new clickable-link single-page override (see Integration points). `/links/atom.xml` — Atom feed, static-copied by Hugo, distinct from the (disabled) `/links/index.xml`. `/index.xml` — site-wide home feed, now filtered to `mainSections` only via a new template override, so it excludes link posts (see Integration points).

## Integration points

- `scripts/build-linkblog.py` — new file. Owns validation (including duplicate-`url` detection, see API/interface contract), the wipe-and-regenerate cycle for `content/english/links/*.md`, the two linkblog-commons subprocess calls, the post-render `date` front-matter injection, and post-generation self-verification (parses `static/links/atom.xml` with `xml.etree.ElementTree`, confirms each `.md`'s front matter has a parseable `date`; fails the build on either error). Documents at the top of the file (per requirement 15) that `data/linkposts.json` is hand-authored and non-Hugo-native, same precedent as `data/authors/` and `data/geo-battery.json`, plus the url/published immutability convention (see Design decisions).
- `content/english/links/*.md` — generated per-entry link-post pages, one per `data/linkposts.json` entry; build artifact wiped and regenerated on every `build-linkblog.py` run, **committed to git** (not gitignored — see Data model), so a bad slug/permalink is visible in the PR diff before it goes live.
- `static/links/atom.xml` — generated Atom feed for the links section; build artifact regenerated on every `build-linkblog.py` run, **committed to git** for the same reason, first use of a `static/` directory in this repo.
- `data/linkposts.json` — new file. Starts as `[]` on `main`; a single placeholder entry is added on the feature branch only, for the requirement-13 end-to-end verification, and removed before merge (requirement 14). Once an entry is published, its `url`/`published` are immutable (see Design decisions).
- `content/english/links/_index.md` — new file, hand-maintained (title/description, same shape as `content/english/blog/_index.md`), plus a front-matter `outputs = ["html"]` override so Hugo does not emit `/links/index.xml` for this section (resolves the section-level feed collision — distinct from the home-level collision below).
- **`layouts/index.xml` (exact filename TBD — see Risk areas) — new file, repo-local Hugo template override.** Confirmed against Blowfish's live theme source (`layouts/_default/rss.xml`) that the site's HOME feed builds from `.Site.RegularPages` with no section filter — once `content/english/links/` pages exist as `RegularPages`, they leak into the already-live `/index.xml` home feed alongside blog posts, a real production regression once link posts exist. This override is a copy of Blowfish's `rss.xml` filtered to `where site.RegularPages "Type" "in" site.Params.mainSections` (or equivalent), matching the same `mainSections`-scoping convention `layouts/index.llms.txt` already uses. In scope under the plan's existing "no new Hugo templates unless investigation finds a specific gap Blowfish does not cover" carve-out.
- **`layouts/links/single.html` (or equivalent — exact path TBD, see Risk areas) — new file, repo-local Hugo template override scoped to the links section only.** linkblog-commons' `hugo_render()` sets front-matter `title` to the raw URL string, and Blowfish's default single template renders `.Title` as plain heading text, not a hyperlink — without this override, a rendered link post never actually links anywhere, defeating the point of a linkblog. Renders `.Params.url` as a real `<a href>` around/near the title; everything else continues to use Blowfish's default single-page layout/styling — this does not rebuild the whole page template. Also in scope under the same carve-out.
- `.github/workflows/main.yml` — insert steps between "Install npm dependencies" and "Build": (1) `actions/setup-python`, pinned to a specific version matching linkblog-commons' `requires-python = ">=3.11"` — this repo's workflows have no Python setup step today (`geo-gate.py` runs on whatever `python3` `ubuntu-latest` ships by default); adding an explicit pin brings Python in line with how Hugo and Node are already version-pinned in the same workflow and avoids a future runner-image update silently changing the Python version this pipeline runs against; (2) `pip install` linkblog-commons from its private GitHub URL, pinned to a tag or commit SHA — not the default branch (see Technology choices) — using the PAT secret; (3) `python3 scripts/build-linkblog.py`. Nothing after "Build" changes.
- `.github/workflows/geo-gate.yml` — identical three-step insertion in the identical position, so PR/branch builds exercise the same pipeline as the main-branch deploy path (requirement 8).
- GitHub repo secret (new, e.g. `LINKBLOG_COMMONS_PAT`) — Preston must provision this manually in repo settings; CI cannot create it. Both workflow files reference `${{ secrets.LINKBLOG_COMMONS_PAT }}` in the pip-install step only, never echoed or logged.
- `readme.md` (or a short comment block at the top of `build-linkblog.py`) — document the `data/linkposts.json` hand-authoring workflow, the url/published immutability convention, and that the linked pages/feed are fully regenerated on every build but committed (not hand-edited) (requirement 15).
- `scripts/geo-gate.py` — **no changes**. Confirmed by direct inspection that its globs (`content/english/blog/*.md`, `public/blog/*/index.html`) already exclude `content/english/links/` and `public/links/`; this satisfies requirement 10 by construction rather than by adding an exemption.
- `hugo.toml` — **no changes**. Both the section-level RSS fix (`content/english/links/_index.md`'s own `outputs` override) and the home-level RSS fix (new `layouts/index.xml` template) work without touching `[outputs]` in `hugo.toml`, so `content/english/blog/`'s existing output behavior is untouched (constraint: must not alter `content/english/blog/`).

## Technology choices

- **PAT-scoped `pip install` via repo secret, not a private git submodule with a deploy key** — recommended over the submodule route. `main.yml`/`geo-gate.yml` already authenticate `actions/checkout` over HTTPS using GitHub's built-in token; a `pip install git+https://x-access-token:${TOKEN}@github.com/preston-bernstein/linkblog-commons.git@<tag-or-sha>` line reuses that same HTTPS auth idiom with one new secret, works identically for Preston running the script locally (export the same PAT as an env var), and needs no `ssh-agent`/`known_hosts` setup in CI. The existing `themes/blowfish` submodule is public HTTPS with no credential at all, so it doesn't actually establish a reusable SSH-auth pattern — adopting deploy-key/SSH submodule infrastructure for this one private dependency would be net-new CI complexity for no isolation benefit a fine-grained, read-only, single-repo PAT doesn't already provide. Fine-grained PAT scoped to `Contents: Read-only` on just `linkblog-commons` keeps blast radius equivalent to a deploy key.
- **Pin the `pip install` line to a specific tag or commit SHA, not `main`/the default branch.** Exact syntax: `pip install git+https://x-access-token:${{ secrets.LINKBLOG_COMMONS_PAT }}@github.com/preston-bernstein/linkblog-commons.git@<tag-or-sha>`. An unrelated upstream change to linkblog-commons' default branch must never be able to silently break pres-ber-blog's CI on a blog-post-only push — this repo has no staging environment (push-to-main is the live deploy), so an unrelated CI failure blocking an unrelated blog post's deploy is a real, avoidable cost. `<tag-or-sha>` is chosen at implementation time against whatever released tag/commit linkblog-commons is actually at when this is built, and bumped deliberately (a reviewable diff), never floated.
- **`actions/setup-python`, pinned to a specific version** (matching linkblog-commons' `requires-python = ">=3.11"`) — added to both workflows rather than relying on `ubuntu-latest`'s implicit default `python3`, for the same version-pinning discipline Hugo (`HUGO_VERSION: 0.164.0`) and Node (`actions/setup-node`) already get in these files. See Integration points.
- **`subprocess` (stdlib) for CLI invocation, not the Python `import` interface** — requirements 2 and 4 explicitly specify invoking `python -m linkblog_commons render`/`feed`, so `build-linkblog.py` shells out rather than importing `hugo_render`/`generate_feed` directly, even though the constraints section allows either. Entry count is "tens, not thousands" (non-functional requirement), so N subprocess calls carry no meaningful performance cost.
- No new npm packages, no new Hugo modules, no new Python packages beyond linkblog-commons itself — everything else uses stdlib `json`/`subprocess`/`pathlib`/`xml.etree.ElementTree`, consistent with `scripts/geo-gate.py`'s existing stdlib-only precedent.

## Risk areas

- **`hugo_render()`'s front matter omits Hugo's native `date` field (confirmed, not hypothetical).** It writes `published` instead, which Hugo does not treat specially — Blowfish's list/section templates rely on `.Date`, sourced from front-matter `date`. Without the post-render `date` injection described in API/interface contract, rendered link posts will likely sort incorrectly (Hugo's zero-date fallback) or fail to show a date on their card in Blowfish's default templates. `build-linkblog.py`'s self-verification checks that each file's front matter has a *parseable* `date` after injection, but that only checks presence/parseability, not correctness against Blowfish's actual rendered output — this must still be verified with a real local `hugo --gc --minify` run against a rendered test entry, checking the actual HTML output, not just that the build exits 0.
- **Exact override filenames for the two new Hugo templates (home-feed RSS filter, links clickable-link single view) are not yet confirmed.** Hugo's template lookup order for home-page RSS output can resolve to either `layouts/index.xml` or `layouts/_default/rss.xml` depending on Hugo version/theme structure, and the correct single-page override path depends on this repo's actual `content/english/` structure and Hugo's lookup rules for a nested section (`layouts/links/single.html` vs `layouts/links/single.rss.html` vs other candidates). Both must be confirmed empirically at implementation time with a real `hugo --gc --minify` run, inspecting `public/index.xml`'s contents and a rendered link post's actual HTML before/after — not assumed from theme docs alone.
- **`static/` doesn't exist in this repo today** (hugo.toml carries an explicit comment noting its absence). Introducing `static/links/atom.xml` is a first-of-its-kind directory addition; needs a real local `hugo --gc --minify` run to confirm the file lands at `public/links/atom.xml` unmolested and that `--gc` doesn't treat it as an orphaned resource.
- **The PAT doesn't exist yet.** `LINKBLOG_COMMONS_PAT` (or equivalent) must be created by Preston in GitHub repo settings before either workflow can pass; until then, CI fails at the pip-install step. This should surface as a clear, named failure ("secret not set" / 401 from GitHub), not a silent skip — worth a quick manual check of the actual error text `pip install` produces on a missing/blank token, so the failure is legible in the Actions log rather than a cryptic auth trace.
- **Stale generated pages if the wipe-before-regenerate step is skipped or done wrong.** Because `content/english/links/*.md` is fully derived, any implementation that appends rather than wipes-and-regenerates will leave orphaned pages live on the site after an entry is removed from `data/linkposts.json`. The plan calls for wiping non-`_index.md` files at the start of every `build-linkblog.py` run specifically to avoid this — a straightforward but easy-to-skip detail worth a dedicated check during review.
- **The placeholder verification entry (requirement 13/14) is a real footgun.** It must exist on the feature branch to prove the pipeline end-to-end, and must not exist on `main`. This plan removes it as the last step before merge; if it's ever left in for a legitimate reason, requirement 14 requires that decision be raised explicitly rather than merged silently — flag this in the PR description regardless of outcome so it can't be missed in review.
- **Accepted, documented limitation, not fixed this pass:** Blowfish's `layouts/_default/terms.html` has no section filter either, so `/tags/<tag>/` will show a mixed list of blog-post and link-post cards if a tag is reused across both content types. Link posts' minimal front matter (no `description`/`featureimage`) means their cards will likely render with blank imagery/summary in that mixed list. This is a conscious decision to leave as-is for this pass, not an oversight — see Design decisions.
- **Considered and rejected: fixing linkblog-commons' missing `date` field upstream instead of working around it in `build-linkblog.py`.** Modifying linkblog-commons is out of scope here — it was already built, hardened, reviewed, and deployed in a separate prior pass, and reopening it would need its own review cycle. The front-matter-injection workaround (API/interface contract) is a deliberate choice, not a silent omission; a reasonable future improvement would be an optional `date` alias in a later linkblog-commons revision.
- **Considered and rejected: conditioning the new CI step on `data/linkposts.json` having changed, to avoid failing unrelated blog-post pushes on a linkblog-commons/PAT problem.** Path-filtering adds real workflow complexity for a project with tens of entries and a single author; version-pinning the linkblog-commons dependency (Technology choices) is the primary mitigation for this pass instead. Path-filtering remains a reasonable future optimization if unrelated-push CI failures become a real annoyance — not a blocking requirement now.

Plan written: 13 integration points, 9 risk areas.
