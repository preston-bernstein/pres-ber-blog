# Content Refresh Audit Log — Batch 1

Scope: posts 1-5 (alphabetical). Format per plan.md's "Audit-log entry format."

## adversarial-verification-home-lab-alerts.md
- Voice: left-alone — already first-person throughout, admits a real mistake
  (the earlier "zero means stopped" misdiagnosis that would have broken a
  healthy client) and a genuine unresolved split finding left open rather
  than forced to a verdict. Passes both writing-style.md and plain-writing.md
  Self-checks as-is.
- Image: added (Mermaid diagram) — the post's core mechanism (18 candidates
  through 3-lens adversarial checks, funneling to refuted/confirmed/left-open)
  is described narratively across several paragraphs; a flowchart makes the
  actual funnel (15 refuted, 2 confirmed, 1 left open) visible at a glance.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## auditing-what-an-agent-pipeline-shipped-in-an-afternoon.md
- Voice: left-alone — first-person, specific title naming the real subject
  (auditing an agent-built CLI), ends with genuine open uncertainty ("I don't
  know yet whether a dedicated audit pass... needs to happen after every
  run"). Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the post's whole point is the shape
  difference between the build pipeline (spec through verify) and a separate
  audit pass that ran after it; a side-by-side flow diagram makes that
  two-stage structure concrete instead of implied across five subheads.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## clamav-clean-scan-doesnt-mean-safe.md
- Voice: left-alone — first-person, concrete numbers (70-85% evasion rate,
  the specific `DetectPUA` tradeoff), ends with an honest admission the fix
  isn't airtight ("None of this closes the gap completely... That's a more
  honest place to operate from, even if it's a less comfortable one.").
  Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — six defense layers (signature scan, PUA,
  third-party feeds, YARA, hash lookup, entropy check) are each covered in
  their own subhead; a single flowchart showing the actual order a file
  passes through them clarifies the pipeline shape the prose only implies
  section by section.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## debugging-false-positive-gpu-contention-detection.md
- Voice: left-alone — first-person debugging narrative, admits real
  uncertainty about the fix's tuning ("I picked it from a general
  flapping-detection convention, not from measurement on my own logs, and I
  won't know if it's wrong until..."). Passes both Self-checks as-is.
- Image: added (Mermaid diagram, NOT a screenshot) — this post describes
  real debugging output (`ps aux`, `/proc` polling) that would benefit from a
  screenshot, but no real screenshot of that output exists or was captured
  during this pass. Per requirement 7's fallback policy, used a before/after
  state diagram of the detection logic (single-poll trigger vs. debounced
  trigger) instead of fabricating a screenshot that never happened.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## deciding-what-fits-resale-clothing-monitor.md
- Voice: left-alone — first-person, part 3 of a named series with working
  cross-links, ends with a genuine admitted gap ("I haven't built anything
  that would catch it sooner than that, and I don't have a good reason why
  not beyond not having hit it yet."). Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the two-pass scoring pipeline (rules
  pre-filter, then a local model, then a vision model only for MAYBE cases
  with an image) is the post's central mechanism and is described across
  three separate subheads; a flowchart makes the actual routing logic
  (NO/YES/MAYBE branches) visible in one place.
- Date: mapping applied (2026-08-10T16:36:57Z)
- lastmod: added
