# Spec Challenge Notes

## Agents run
- Requirements Auditor (haiku): 11 issues found, 7 accepted (folded into the same 7 combined fixes applied across files)
- Scope & Dependency Auditor (sonnet): 8 issues found, 5 accepted
- Design Devil's Advocate (sonnet): 7 issues found, 5 accepted
- Implementation Realist (sonnet): 5 numbered findings (several sub-findings each), 6 accepted
- Steps & Sequencing Critic (sonnet): 12 issues found, 10 accepted
- Data Model Critic (sonnet): 7 issues found, 3 accepted, 2 rejected as factually wrong (verified against the real repo)
- Security/Threat Auditor (haiku): 1 issue found, 1 accepted (as a documentation note, not a blocker)

## Changes made
- **Draft-post handling, corrected and closed.** Two posts, not one, have `draft: true` (`enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md` and `performance-optimizations-using-top-level-await.md`). Hugo's default production build skips drafts entirely, so the spec now requires a second local build with `-D`/`--buildDrafts` (verification-only, doesn't touch the real deploy command) so both posts' edits actually get rendered and checked before anyone assumes they're fine.
- **The two demo features (line-highlighted code, admonition) now get real, permanent tests, not a one-time look.** The existing 17-test Playwright suite touches images, captions, Disqus, and navigation — nothing about code highlighting or admonitions. The spec now requires two new Playwright assertions (checking for Chroma's highlight marker and for Blowfish's `data-type="warning"` attribute) so a future edit that silently breaks either feature gets caught by CI, not just by whoever happened to look at the page once.
- **Fence-relative vs. absolute line numbers, pinned down before anyone can get it wrong.** The `hl_lines=[22,34]` values for the docker-compose demo count from the top of the code fence, not the top of the file (the real lines are 318 and 330 in the file). This is exactly the kind of mistake that fails silently — Hugo won't error, it'll just highlight nothing or the wrong lines — so the plan and steps now spell out the exact syntax and line-counting rule.
- **Both demo edits get a mechanical check instead of "looks right to me."** A malformed highlight or a malformed admonition block both degrade gracefully with zero build error — they just don't render specially. Steps now grep the built HTML for the actual marker/attribute after each edit, closing a gap where a broken feature could have shipped looking fine locally.
- **The bold/italic/code-font review now leaves a paper trail.** The original steps allowed "spot-check 5-10 spans" as proof that all spans across 25 posts were reviewed — that's roughly 10% coverage standing in for a 100% claim. The rewrite adds a review log (`docs/markup-2026-baseline/audit-log.md`) with one line per span reviewed, so completeness is a count-match, not a sample.
- **The single riskiest step in the whole plan — the actual push to `main` — now has a step.** The original steps.md ended at a front-matter check with no push step at all, even though this is a live site with no staging.
- **Version-drift risk documented, not silently ignored.** Three of four CI configs in the repo (`.gitlab-ci.yml`, `amplify.yml`, `netlify.toml`) pin a Hugo version that predates the admonition feature this work depends on. DNS and the live workflow file both point to the fourth config (GitHub Actions + FTP, pinned correctly) as the actual deploy path, but the risk is now written down instead of assumed away.

## Critiques rejected
- A finding claiming front matter uses a singular `author` field — checked directly against the repo; every post uses `authors: ["preston-bernstein"]` (array). The agent was reasoning from a hypothetical example in its own prompt, not the real files. Rejected as a hallucination.
- A finding suggesting all five GFM alert types (`note`/`tip`/`warning`/`important`/`caution`) each need their own demo edit — rejected as over-engineering. Blowfish's admonition renderer is generic and type-driven (confirmed by reading its source): one real instance proves the mechanism works for all types, not just `[!WARNING]`.
- A finding that the Playwright-depends-on-Hugo-build step ordering might be wrong (double-building or testing stale output) — checked directly against `playwright.config.js`: its `webServer` explicitly serves the already-built `./public/` directory, so the original dependency was correct. No change made.
- A finding that decorative-span fixes might require new CSS the theme doesn't have (colliding with the "no new CSS" constraint) — rejected as hypothetical; none of the 25 posts' actual bold/italic/code usage needs styling beyond what Tailwind/Blowfish already ships.

## Open questions requiring human input
- None block starting the build. The Hugo-version-drift risk (three dead-looking CI configs pinning an older Hugo) is documented as an accepted, out-of-scope risk rather than something this pass fixes — if any of those three configs turns out to be secretly live, that would need a separate conversation, but DNS and the confirmed live workflow both point the other way.
