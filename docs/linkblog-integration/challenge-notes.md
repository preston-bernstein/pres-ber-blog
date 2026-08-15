# Spec Challenge Notes

## Agents run
- Requirements Auditor (haiku): 8 issues found, 4 accepted
- Scope & Dependency Auditor (sonnet): 8 issues found, 6 accepted
- Design Devil's Advocate (sonnet): 8 issues found, 6 accepted
- Implementation Realist (sonnet): 4 findings (integration points, ordering, blast radius, test gaps), 3 accepted
- Steps & Sequencing Critic (sonnet): 13 issues found, 13 accepted
- Data Model Critic (sonnet): 16 issues found, 9 accepted
- Security/Threat Auditor (haiku): 14 issues found, 3 accepted directly, 3 folded into other accepted fixes

## Changes made

- **Home-page RSS feed leak (most significant finding of the round).** The Implementation Realist fetched Blowfish's actual `layouts/_default/rss.xml` from its GitHub source and confirmed the site's existing, already-live `/index.xml` home feed builds from `.Site.RegularPages` with no section filter. The original plan only solved the *section*-level feed collision (`/links/index.xml` vs. the new Atom feed) — it never considered that the *home* feed would silently start absorbing link posts the moment they exist, mixing them into the main blog's subscribed RSS feed with zero code change to trigger it. Fixed with a new, narrowly-scoped Hugo template override that filters the home feed to `mainSections`-only content, matching the same convention `layouts/index.llms.txt` already uses.

- **Clickable-link gap.** linkblog-commons' `hugo_render()` sets the Hugo page `title` to the raw URL string; Blowfish's default single-page template renders `.Title` as plain heading text, not a hyperlink. Without a fix, a "linkblog" post's link might never actually be clickable anywhere on the rendered page — defeating the genre's entire point. Fixed with a second new, narrowly-scoped template override that renders `.Params.url` as a real `<a href>` anchor. Both new overrides are explicitly in scope under the original plan's own "no new templates unless a real gap is found" carve-out — this is exactly such a gap, found by verifying against Blowfish's actual source rather than assuming its defaults were sufficient.

- **Reversed the generated-content gitignore decision.** The original plan treated `content/english/links/*.md` as a pure build artifact to gitignore, by analogy to `public/`. The Design Devil's Advocate pointed out a closer, contradicting precedent already in this repo: `data/geo-battery.json` is also machine-generated but is deliberately committed so drift is visible in PR diffs. Since `content/english/links/*.md` affects real permalinks (not just final HTML), and this repo has no staging environment to catch a silent broken-permalink regression before it ships live, the plan now commits generated link-post files and the feed instead of ignoring them.

- **Validation depth.** The original plan validated only that `url`/`published`/`comment` were non-empty. Multiple agents independently flagged the same gap from different angles: `published` isn't checked for parseability, `url` isn't checked for scheme, duplicate URLs aren't detected (and would silently overwrite each other, since the render filename is `sha256(url|published)`-derived), and whitespace-only strings pass a naive emptiness check. All four are now explicit requirements.

- **Dependency pinning and no-baseline testability gap.** The `pip install git+...` line had no version pin — an unrelated upstream linkblog-commons change could silently break pres-ber-blog's CI on an unrelated blog-post-only push (this repo has no staging; a broken CI run blocks a live deploy). Now pinned to a tag/SHA. Separately, acceptance criterion 5 required comparing geo-gate.py's result "to before this feature" with no baseline ever captured — added a new first step that records a real baseline before any change lands, so that comparison is actually possible.

- **Discoverability.** The requirements' own problem statement calls this a "discoverable section," but nothing wired it into site navigation or feed autodiscovery. Added explicit requirements for both.

## Critiques rejected

- Fixing `hugo_render()`'s missing `date` field upstream in linkblog-commons itself, rather than working around it in `build-linkblog.py` — rejected because modifying linkblog-commons is out of scope for this task (it was already built, hardened, reviewed, and deployed in a separate prior pass); reopening it would require its own review cycle. Documented as a flagged future-improvement instead of a silent omission.
- Path-filtering the CI steps to only run when `data/linkposts.json` changes — rejected as unnecessary complexity for a sole-author, tens-of-entries project; version pinning (accepted above) is the primary mitigation for the same underlying risk (an unrelated CI failure blocking a blog-post-only deploy).
- Adding a `schema_version` field to `data/linkposts.json`, tags dedup/case-folding, a PAT rotation runbook, and a build-lock/concurrent-invocation guard — all rejected as premature for the current scale (sole author, hand-edited file, tens of entries), noted as accepted known gaps rather than built.
- Fixing Blowfish's `terms.html` taxonomy-page mixing (a blog post and a link post sharing a tag will show on the same `/tags/<tag>/` page) — accepted as a real but lower-severity issue (UX inconsistency, not a live-feed content leak) and explicitly documented as a known limitation for this pass, not fixed now.
- Treating the YAML-front-matter-injection risk a security reviewer raised for the `comment` field as blocking — rejected on the actual facts: `comment` is written as the Markdown body by linkblog-commons' `render.py`, never inserted into YAML front matter, so this specific injection path doesn't exist. The XML-escaping concern for the Atom feed is likely already handled by the `feedgen` library's own content-setting API, not raw string concatenation — flagged for empirical verification during implementation rather than assumed safe or unsafe.

## Open questions requiring human input

None. The two structural gaps that would have needed human judgment (home-feed leak, clickable-link) were resolved with concrete, verifiable technical fixes rather than left open. The one remaining uncertainty — the exact filenames Hugo's template lookup will resolve for the two new overrides — is an implementation-time verification detail, not a decision requiring Preston's input.
