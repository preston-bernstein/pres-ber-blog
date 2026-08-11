# CLAUDE.md

## GEO content contract

Every published post and site page follows these rules. They exist because AI answer engines cite content that front-loads answers, names its numbers, and links its sources (arXiv 2311.09735).

1. **Front-load the answer.** Sentence one of the post states the verdict or finding, not a lead-in. Sentence one of each section makes that section's point.
2. **Named statistics link their primary source.** Any statistic, company claim, study, GitHub issue, or vendor doc mentioned by name gets a hyperlink to the primary source, verified to actually support the claim before linking. A named-but-unlinked source is a defect. If no verifiable source exists, either drop the claim or leave it clearly framed as the author's own measurement.
3. **At least one contextual in-body internal link** to a related post. No "Related posts" list spam — the link lives in a sentence that earns it.
4. **At least two external links** in posts that reference outside material (tools, docs, studies). Posts built entirely on the author's own work are exempt — never pad with gratuitous links.
5. **Link text stands alone.** No "here", no bare URLs. The text must describe the destination out of context (WCAG 2.4.4).
6. **Front-matter `description` is 80–160 characters** and states the post's concrete claim with its number where one exists — not a teaser.
7. **Subheads work as a standalone outline.** Each h2 states a claim ("Fedora Server lost on two separate grounds"), never a label ("Background").
8. **Real dates.** `date` is the post's actual publish time, never a bulk deploy stamp shared across posts. `lastmod` is a full timestamp, updated when the post meaningfully changes, and never earlier than `date`.

## Release gate

`scripts/geo-gate.py` enforces the contract above deterministically. It runs after the Hugo build in CI — in `main.yml` before the FTP deploy (a failure blocks deploy) and in `geo-gate.yml` on PRs and non-main branches (a failure surfaces before merge). Run it locally with `hugo --gc --minify && python3 scripts/geo-gate.py`. Stdlib-only Python 3, no extra deps.

Checks (any FAIL exits non-zero):

1. `public/robots.txt` has `Allow` stanzas for OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User, plus a `Sitemap:` line.
2. `public/llms.txt` exists, first line starts with `# `, contains at least 10 markdown links.
3. `public/sitemap.xml` exists.
4. Every built post page (`public/blog/<slug>/index.html`) carries parseable JSON-LD with `@type: BlogPosting`, `datePublished`, and `dateModified >= datePublished`.
5. Every published post's front-matter `description` is 80–160 characters.
6. Every published post body has at least 1 internal link.
7. Site-wide in-body external links across all published posts total at least 40 (regression floor, deliberately not per-post).
8. `data/geo-battery.json` exists, parses, has `date`/`engine`/`hits`/`total`, and `date` is within 45 days of the build.

Battery refresh flow: run `~/dev/geo-prompt-battery/run_battery.sh`, then `sync_snapshot.sh <blog-repo>`, and commit the updated `data/geo-battery.json`. If the gate fails on snapshot age, that is the fix — do not hand-edit the date.
