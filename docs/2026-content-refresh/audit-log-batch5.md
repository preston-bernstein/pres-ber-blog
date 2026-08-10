# Content Refresh Audit Log — Batch 5

Scope: posts 21-25 (alphabetical). Format per plan.md's "Audit-log entry format."

## self-throttling-claude-max-without-a-published-ceiling.md
- Voice: left-alone — first-person, ends with a directly admitted
  uncertainty ("I'm comfortable shipping that. I'm not comfortable calling
  it settled."). Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the governor's actual control loop (two
  rolling windows, ramp cadence toward a 98% target, calibrate from a real
  429's reset timestamp) is described across two dense paragraphs; a flow
  diagram makes the loop's actual shape checkable at a glance.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## surviving-a-gpu-yield-window-embedding-servers.md
- Voice: left-alone — first-person, explicit unverified-claim admission
  ("this is a design I believe in, not one I've fully verified under
  load"). Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the "park instead of reject" mechanism
  (the post's actual engineering contribution, contrasted against every
  other tool surveyed) is a real decision flow; a diagram makes the park/
  replay logic concrete instead of only narrated in one paragraph.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## three-failure-modes-one-name-concurrent-claude-code-agents.md
- Voice: left-alone — first-person, admits a real remaining gap directly
  ("I haven't fixed the part where nothing reminds me to go check for it
  after a run stops early. That's still a manual habit, not automation.").
  Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the post's entire argument is that three
  things that looked like one problem resolved to three different states
  (resolved, resolved-by-generalizing, still open); a status diagram makes
  that resolution split visible in one place instead of requiring a reader
  to track it across three separate sections.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md
- Voice: left-alone — first-person, ends with a real open question stated
  as such ("I haven't run the numbers on a from-scratch full reingest...
  so that's a real open question, not a settled one."). Passes both
  Self-checks as-is.
- Image: added (Mermaid diagram) — the concurrency-tuning derivation chain
  (live RPM to `MAX_ASYNC_LLM` to the dependent knobs, plus the separate
  `EMBEDDING_BATCH_NUM` fix and the LiteLLM retry-absorb layer) spans four
  subheads; a single diagram ties the whole chain together, which the prose
  never does in one place.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md
- Voice: left-alone — first-person, explicitly labels its own fix as
  unconfirmed ("this is the right fix on paper, applied, and unconfirmed").
  Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — four independent usage-breakdown numbers
  (100% subagent fan-out, 99% long sessions, 90% high context, 62% weekly
  cap) converge into one diagnosis and three fixes; a diagram condenses that
  many-to-one-to-many structure faster than the six subheads that carry it
  in prose.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## native-hugo-image-pipeline-webp-lqip-and-mermaid.md (handled in Step 0, logged here for completeness)
- Voice: N/A — today's demo post for the image/Mermaid pipeline itself,
  already written in first-person 2026 voice, already includes a real
  admitted gap (the width-gating bug caught during spec review, and the
  untested "fenced-only / shortcode-only in isolation" fixture gap named at
  its own close). Nothing to revise.
- Image: none — this post IS the pipeline's live showcase (a real WebP image
  with LQIP, a fenced Mermaid diagram, and a shortcode Mermaid diagram all
  already present). Adding another image/diagram would be decorative on a
  post whose entire point is demonstrating the mechanism, not illustrating
  a separate argument.
- Date: EXCLUDED (documented exclusion — 2026-08-10T18:00:00Z is the real
  commit timestamp this post was added, confirmed via `git log --follow`,
  `bbe5f94`).
- lastmod: added (2026-08-10, in Step 0)
