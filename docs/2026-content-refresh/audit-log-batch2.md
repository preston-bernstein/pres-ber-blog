# Content Refresh Audit Log — Batch 2

Scope: posts 6-10 (alphabetical). Format per plan.md's "Audit-log entry format."

## deciding-whats-worth-a-saturday-estate-sale-scanner.md
- Voice: left-alone — first-person, part 2 of a named series, real admitted
  bias ("I'd be lying if I said that number wasn't also the thing that let
  me stop second-guessing myself and ship it") and unresolved uncertainty
  about a class of silent-failure bug. Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the four-gate photo pipeline (dedup,
  quality gate, free pre-filter, full vision analysis) is the post's central
  mechanism, described as a numbered list but never shown as an actual flow
  with the fail-open branch a reader needs to see to understand the "three
  failures that never threw an error" section later in the post.
- Date: mapping applied (2026-08-10T16:36:57Z)
- lastmod: added

## dueling-agent-orchestration-suites.md
- Voice: left-alone — first-person design sketch, explicit and repeated
  admission this is unbuilt ("This is a design sketch pulled together from
  research, not a system I've built or run"), genuine open question stated
  directly. Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the author/reviewer duel loop (suite A
  opens PR, suite B reviews cold, suite A fixes, repeat to a round limit) is
  the whole design being proposed; a diagram makes the loop and its exit
  condition concrete instead of only described in prose.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md
- Voice: N/A — `draft: true`, front matter only, zero body content (confirmed
  by the prior markup pass's own audit log: "front matter only — draft post
  has no body content, so no spans to review"). Nothing to revise.
- Image: N/A — no body content to illustrate.
- Date: mapping applied (2024-07-05T20:58:50Z)
- lastmod: added

## gaming-desktop-vs-dedicated-compute-box-idle-power.md
- Voice: left-alone — first-person, concrete numbers throughout, a genuine
  reversal admitted mid-post ("That fact kills the power-savings case
  outright... Mine didn't, so I didn't get that check to cash."). Passes
  both Self-checks as-is.
- Image: added (Mermaid diagram) — the entire post pivots on one conditional
  (does the desktop actually idle down?) that changes the financial
  conclusion in opposite directions; a small decision-flow diagram makes
  that branch, which is the counterintuitive core of the piece, click faster
  than the surrounding prose alone.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## github-agents-tab-vs-claude-code.md
- Voice: left-alone — first-person throughout, genuine stated uncertainty at
  the close ("I'd rather report back after a month of actual use than guess
  now"). Passes both Self-checks as-is.
- Image: none — this is a comparison/analysis piece (billing paths,
  permission models, benchmark numbers) with no single flow or architecture
  to diagram; the natural visual aid here would be a comparison table, which
  is markup work already covered by the prior markup-conventions pass, not
  this pass's scope.
- Date: EXCLUDED (documented exclusion — current value 2026-08-10T12:30:00Z
  is already accurate, this post was created today, after the date-mapping
  file was captured; left untouched per requirements.md req 12, even though
  the mapping file technically also has a row for this slug — see
  challenge-notes.md for the full reasoning).
- lastmod: added
