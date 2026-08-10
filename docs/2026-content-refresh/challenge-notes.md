# Spec Challenge Notes

## Agents run
- Requirements Auditor (haiku): 11 issues found, 7 accepted
- Scope & Dependency Auditor (sonnet): 10 issues found, 8 accepted
- Design Devil's Advocate (sonnet): 8 issues found, 6 accepted
- Implementation Realist (sonnet): 7 issues found, 6 accepted (1 critical)
- Steps & Sequencing Critic (sonnet): 12 issues found, 8 accepted
- Data Model Critic (sonnet): 5 issues found, 4 accepted (1 partially rejected)
- Security/Threat Auditor (haiku): 5 issues found, 3 accepted

## Changes made
- **Critical fix: wrong asset path.** The original plan pointed new
  screenshots at `images/blog/<slug>/`, but Hugo's render hook resolves
  local images against `assets/images/...` (confirmed by reading
  `render-image.html`). The wrong path would have produced a broken,
  unresolved `<img>` tag on the live site with `hugo build` still exiting 0
  — the Implementation Realist agent traced this exactly and it's now fixed
  in plan.md, with a new requirement (17) mandating an explicit on-disk
  existence check for every added image, since the build alone can't catch
  this class of bug.
- **Ephemeral, session-scoped mapping file replaced with a durable in-repo
  copy.** The date mapping originally lived only at a session scratchpad
  path containing this session's UUID — both fragile (cleared once the
  session ends) and a minor information-leak risk if that path string ever
  landed in the committed requirements.md (flagged independently by the
  Scope Auditor and the Security Auditor). Copied and UTC-normalized into
  `docs/2026-content-refresh/date-mapping.txt`, committed alongside the spec,
  with all references in requirements.md/plan.md/steps.md updated to point
  at it instead.
- **Sequencing contradiction fixed.** steps.md originally marked every batch
  `Parallelizable: Yes` while plan.md's own rationale for batching was
  sequential bisectability — a real contradiction three separate agents
  converged on independently (Design Devil's Advocate, Implementation
  Realist, Steps Critic). Fixed: batches now form an explicit `Depends on`
  chain (Step 2 depends on Step 1, etc.), each marked
  `Parallelizable: No`, with the reasoning stated inline.
- **Cross-batch voice-drift risk mitigated structurally**, not just noted:
  plan.md's Approach now states voice judgment is applied under one
  consistent rubric by the same orchestrating session across all 5 batches,
  rather than 5 independently-calibrated agents — closing the gap the
  Design Devil's Advocate raised about batch 5 potentially disagreeing with
  batch 1 on "does this pass the bar."
- **Audit-log format pinned.** The original plan said batches should "follow
  the pattern of" the markup pass's audit logs, but that pass's format
  (per-span line list) doesn't fit this pass's per-post, 3-decision shape.
  Added a concrete shared template (plan.md's "Audit-log entry format")
  so all 5 batch files come out structurally identical.
- **Date-format and lastmod-format inconsistencies pinned.** The mapping's
  raw timestamps used `-04:00` local offsets; every existing post uses `Z`
  (UTC). Normalized the committed mapping file to `Z` and stated the rule
  explicitly (requirement 10). `lastmod` had zero existing-post precedent to
  follow; pinned as a bare unquoted date (`lastmod: 2026-08-10`, no time),
  positioned immediately below `date:` (requirement 11), so 5 batches can't
  drift on formatting or placement.
- **Contradiction on exclusion count fixed.** Requirements originally said
  "the one documented exclusion" while actually describing three excluded
  posts (`_index.md`, `github-agents-tab-vs-claude-code.md`, the demo post).
  Now consistently plural and enumerated everywhere it's referenced.
- **RSS/sitemap blast radius surfaced, not silently absorbed.** Both
  templates key off `.Date`/`.Lastmod` (confirmed by reading them) — date
  corrections will reorder the RSS feed and change sitemap `lastmod` values.
  Recorded explicitly as the intended effect of the fix, not a regression,
  so it isn't mistaken for a bug during review.

## Critiques rejected
- **Data Model Critic's claim that clustered identical mapping timestamps
  are "the signature of a bulk filesystem-mtime dump"** — the exact defect
  this pass exists to fix. Rejected on the facts: `git log --follow` for
  three sampled slugs sharing that timestamp confirms they were genuinely
  added in the same real commit (`dc4d4f6`, "Add 19 posts from a vault
  research sweep") — the shared timestamp is correct, not mechanical noise,
  because 19 posts really were authored in one batch. The spirit of the
  finding (verify before trusting a suspicious pattern) was already applied
  during spec-gather; that verification is now stated explicitly in
  requirements.md rather than left implicit.
- **Steps Critic's request to split each 5-post batch into 5 individual
  per-post steps** (citing the "15min-2hr per step" rule literally). This
  spec is executed by an orchestrating agent applying one consistent
  judgment across a batch, not 5 separate human developers picking up
  isolated tickets — the per-post granularity that rule protects against
  (losing track of scope in a single huge task) is better served here by
  keeping batches as the unit (matching the task's own explicit instruction
  to decompose "similar to how the markup pass organized... groupA/B/C")
  while tightening each batch's Test field to check per-post outcomes
  (date-mapping match, image-existence), which was the real gap, not the
  batch size itself.
- **Design Devil's Advocate's suggestion to add a human-approval checkpoint
  before the no-staging push to main.** Rejected as out of scope for this
  spec to add unilaterally: full autonomous execution through deploy was
  explicitly authorized by the task that commissioned this pass. Recorded
  instead as an accepted, named risk in plan.md's Risk area 7, not silently
  dropped.
- **Security Auditor's Mermaid-injection finding.** No untrusted input path
  exists here — diagram content is hand-authored by the same agent doing the
  edit, not submitted by an external user, so there's no injection surface
  to mitigate. Noted and rejected rather than adding a mitigation for a risk
  that doesn't apply to this pass's actual data flow.
- **Security Auditor's FTP-credential finding.** This pass never touches
  `.github/workflows/` or any credential-handling code — out of scope by
  requirements.md's own explicit exclusion list, not a gap in this spec.

## Open questions requiring human input
None — the one item that looked like it needed Preston's sign-off (whether
to add a manual approval gate before the live push) was already resolved by
the task's own explicit authorization for full autonomous execution through
deploy, so it's recorded as an accepted risk rather than left open.
