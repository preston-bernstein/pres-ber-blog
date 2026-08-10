# Content Refresh Audit Log — Batch 3

Scope: posts 11-15 (alphabetical). Format per plan.md's "Audit-log entry format."

## mini-itx-is-the-wrong-form-factor-for-a-quiet-ai-homelab-pc.md
- Voice: left-alone — first-person, specific title stating a real contrarian
  claim, admits an unfinished decision directly ("I haven't picked a specific
  mATX board or case, and I don't want to dress up a guess as a confirmed
  pick... that search hit a wall this round and I'm not filling the gap with
  a guess dressed as a finding"). Passes both Self-checks as-is.
- Image: none — this is a component-selection narrative (idle watts, dB,
  efficiency-curve comparisons across specific parts), not a system flow or
  architecture; the natural visual aid would be a spec-comparison table,
  which is markup work already covered by the prior pass, not this one.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## nine-fixes-lightrag-embedding-crash-one-afternoon.md
- Voice: left-alone — first-person, the strongest "force a real stance /
  admit a real failure" example in this batch (owns a process mistake:
  "Thirty minutes of no errors isn't proof of anything if you stop watching
  before the job finishes"). Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — eight real, individually-correct fixes
  that didn't solve the crash, followed by the actual root cause (host OOM),
  is the entire structure of the post; a flowchart showing the fix ladder and
  where it actually broke (checking the host directly) makes that structure
  visible instead of only inferable from six subheads in sequence.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## not-every-docker-container-belongs-on-the-nas.md
- Voice: left-alone — first-person, admits getting the framework's own call
  wrong at least once ("A stack I placed on the desktop early has since
  moved a second time... 'more RAM than the NAS' turned out not to be the
  same thing as 'the right home for this workload'"). Passes both
  Self-checks as-is.
- Image: added (Mermaid diagram) — the post's central contribution is a
  placement framework (storage-coupled/real-time stays on the NAS,
  compute-heavy moves to desktop); a two-branch decision diagram makes that
  rule checkable at a glance instead of only stated in the opening
  paragraph.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## one-observability-stack-not-one-per-repo.md
- Voice: left-alone — first-person, names the actual anti-pattern found on
  the author's own desktop (two duplicate Grafana containers), admits a real
  downside of the fix ("I'll admit dashboard sprawl is a real risk...").
  Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the post argues for a specific topology
  change (stack-per-repo to hub-and-spoke with a shared backend and Alloy
  agents per host); a before/after architecture diagram makes that topology
  change concrete instead of only described in prose.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## performance-optimizations-using-top-level-await.md
- Voice: revised (light pass) — this is a `draft: true`, unpublished 2022-era
  SEO-template post (generic third-person filler, content-free transitions,
  and the literal banned word "delve"), structurally unlike the rest of this
  blog's first-person home-lab narrative voice. Given it never renders on
  the live site (`buildDrafts` is false), a full narrative rewrite is out of
  proportion to its actual reach; instead, replaced the worst AI-tell intro
  paragraphs (delve, "As JavaScript continues to evolve annually... boosts
  search engine rankings") with a direct, front-loaded explanation of what
  the post covers. Left the rest of the tutorial body untouched — it's
  legitimate reference content (syntax, examples), not narrative prose that
  needs a stance.
- Image: none — reference/tutorial content already illustrated by its own
  code examples; no flow or architecture to diagram, and it's an unpublished
  draft outside the blog's normal subject matter.
- Date: mapping applied (2024-07-05T20:58:50Z) — verified via `git log
  --follow`: the file's in-body date claims 2022-07-26, but the actual
  commit that added this draft to the repo is `f5fa23a`, 2024-07-05
  16:58:50-04:00 (`add draft for new article`), matching the mapping
  exactly. The mapping reflects real repo history, not the fictional date
  baked into the draft's own template text.
- lastmod: added
