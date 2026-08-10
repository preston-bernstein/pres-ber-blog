# Content Refresh Audit Log — Batch 4

Scope: posts 16-20 (alphabetical). Format per plan.md's "Audit-log entry format."

## proxmox-for-the-xps-17-offload-box.md
- Voice: left-alone — first-person, admits a real ongoing cost of the
  decision made ("I don't love it. Some days I still type the wrong SSH
  target out of habit"), names an unresolved item honestly ("an unfinished
  cleanup rather than a design flaw"). Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the whole post argues for LXC-per-workload
  isolation over a flat Docker host; a side-by-side diagram of the rejected
  and chosen topologies makes the five-workload isolation argument visible
  instead of only listed in prose.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## rebuilding-home-network-from-the-modem-up.md
- Voice: left-alone — first-person, phased narrative, ends with a genuinely
  unresolved gap stated plainly ("The device-landing question is still
  sitting there unresolved... It didn't [wrap up neatly], not yet.").
  Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the post explicitly describes a wiring
  order and a power-on sequence (modem to gateway to switch to Pi
  controller); a network-topology diagram is the single clearest match for
  a diagram in this entire content set, since the prose already narrates a
  literal physical/logical topology step by step.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md
- Voice: left-alone — first-person, admits the comparison isn't fully
  settled ("I haven't run a real head-to-head... I'd rather admit that's a
  decision I haven't fully stress-tested than pretend the comparison is
  closed"). Passes both Self-checks as-is.
- Image: added (Mermaid diagram) — the watchdog mechanism (poll idle time,
  call `podStop` past a threshold) is the post's actual engineering
  contribution; a small loop diagram makes the mechanism checkable instead
  of only described in one paragraph.
- Date: mapping applied (2026-08-10T18:02:27Z)
- lastmod: added

## scrape-score-alert-resale-hunting-pipelines-local-vision-models.md
- Voice: left-alone — first-person, series intro, honest self-assessment of
  a design choice ("I don't think the choice is free, though... I haven't
  hit that yet. I expect I will."). Passes both Self-checks as-is.
- Image: upgraded existing diagram, not net-new — this post already had a
  fixed-width ASCII-art box diagram (in a ` ```text ` fence) of the 4-stage
  pipeline. Converted it to an equivalent real Mermaid flowchart using the
  now-live pipeline, since a fixed-width text diagram can wrap or truncate
  on narrow viewports where a real rendered SVG won't; same information,
  genuinely more robust presentation.
- Date: mapping applied (2026-08-10T16:36:57Z)
- lastmod: added

## secure-services-docker-compose-and-nordvpn.md
- Voice: revised (scoped) — classic 2024 SEO-template voice (banned
  vocabulary "crucial"/"robust", content-free transition "In today's digital
  landscape...", corporate third-person distance, a generic
  summary-of-summary conclusion). Revised the Introduction, "Why Use a VPN
  with Docker Services?", "Understanding the Challenge", and Conclusion
  sections to plain, direct, non-redundant language. Left every code block,
  every heading, every image, and the step-by-step instructional body
  UNTOUCHED — this post is a genuine how-to/reference piece (Diátaxis), not
  narrative, and it's a live test fixture: `tests/e2e/blog-post-content.spec.js`
  asserts exactly 4 images / 3 captioned figures / 2 highlighted
  `network_mode` lines in the docker-compose block, and `tests/e2e/
  mermaid.spec.js` explicitly uses this post as the "no Mermaid syntax
  present" control case for the bundle-load-gate test. No Mermaid diagram
  was added here for that reason — doing so would flip this post from the
  suite's negative control into a false test failure.
- Image: none added (see above) — but fixed real accessibility defects on
  the 4 existing images while editing nearby: one had the literal placeholder
  alt text "alter-text" (a typo for "alt-text"), and the other three used
  bare dash-separated keyword strings instead of descriptive alt text
  (`choosing-a-vpn`, `open-vpn`, etc.) — both patterns the accessibility
  research doc names directly. Replaced with specific, hand-written
  descriptions of each image's actual content, without touching src, title/
  caption text, or figure structure (verified this doesn't change the
  Playwright-asserted image/figure counts).
- Date: mapping applied (2024-07-01T22:01:16Z) — verified via `git log
  --follow`: the file's actual first commit is `fa1550c`, 2024-07-01
  18:01:16-04:00 (`V1/new blog (#3)`), matching the mapping exactly.
- lastmod: added
