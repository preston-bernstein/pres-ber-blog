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
