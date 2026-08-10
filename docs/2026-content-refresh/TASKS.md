# Tasks: 2026 Content Refresh Pass

Executed directly by the orchestrating session (not fan-out per-task
subagents) per plan.md's explicit voice-consistency mitigation — one
consistent rubric across all 5 batches, not 5 independently-calibrated
agents. TASKS.md still tracked for the same on-disk-state/resumability
contract the rest of the pipeline uses.

- [x] Step 0: Pre-flight — mapping coverage + baseline build (25/25 slugs covered, baseline build clean, demo post lastmod added)
- [x] Step 1: Batch 1 (posts 1-5) — all 5 voice left-alone, all 5 got Mermaid diagrams, dates applied, build clean
- [x] Step 2: Batch 2 (posts 6-10) — 4 voice left-alone + 1 N/A (draft stub), 3 diagrams added, dates applied incl. 1 documented exclusion, build clean
- [x] Step 3: Batch 3 (posts 11-15) — 4 left-alone + 1 light-pass revision (unpublished draft), 3 diagrams added, dates applied, build clean
- [x] Step 4: Batch 4 (posts 16-20) — 4 left-alone + 1 scoped revision (test-anchored reference post), 4 diagrams (1 upgraded from ASCII), 1 correctly excluded from Mermaid (negative test control), dates applied, build clean
- [x] Step 5: Batch 5 (posts 21-25) — all 5 left-alone, 5 diagrams added, dates applied, build clean
- [x] Step 6: Full-site build + Playwright verification — Hugo 0.164.0 build clean (188 pages, 0 errors/warnings), 30/30 Playwright specs pass incl. the mermaid negative-control on secure-services
- [x] Step 7: Acceptance-criteria audit — all 10 acceptance criteria verified programmatically, see report; 1 spec-doc arithmetic error found+fixed (AC3: 24 not 23), no content bugs found
