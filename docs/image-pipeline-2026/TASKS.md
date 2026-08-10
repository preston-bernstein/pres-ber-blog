# Tasks: 2026 Image Pipeline (WebP/srcset/LQIP + Mermaid)

Generated from: docs/image-pipeline-2026/ on 2026-08-10

## Status legend
- [ ] pending
- [>] in progress
- [x] done
- [!] blocked

## Tasks

### Task 1: Step 2a — WebP conversion and responsive srcset generation
**Status**: [x] done
**Files**: layouts/_default/_markup/render-image.html
**Test**: `hugo build` zero errors. Confirm a raster image narrower than 800px gets `.webp` src/srcset (not just the demo post's 1600px-wide image, which hides the width-gating bug this step exists to avoid).
**Depends on**: none (Prerequisites only)
**Parallelizable**: Yes (with Task 4, Task 5 — different files)
**Notes**:

### Task 2: Step 2b — LQIP base64 placeholder and onload swap
**Status**: [x] done
**Files**: layouts/_default/_markup/render-image.html (amends Task 1's file)
**Test**: `hugo build` zero errors. Rendered HTML has a `data:image/webp;base64,...` background-image with `background-size: cover`, cleared on load (`naturalWidth > 0`).
**Depends on**: Task 1
**Parallelizable**: No (same file as Task 1)
**Notes**:

### Task 3: Step 2c — Escape hatch + full site build verification
**Status**: [x] done
**Files**: layouts/_default/_markup/render-image.html (amends Task 2's file)
**Test**: `hugo build` zero errors across ALL 25 existing posts (not just demo post). `disableImageOptimizationMD = true` reverts to original format; unset resumes WebP. Manual visual spot-check of q75 quality against an existing text-heavy screenshot post.
**Depends on**: Task 2
**Parallelizable**: No (same file as Task 1/2)
**Notes**:

### Task 4: Step 3 — Mermaid codeblock render-hook
**Status**: [x] done
**Files**: layouts/_default/_markup/render-codeblock-mermaid.html
**Test**: `hugo build` zero errors.
**Depends on**: none (Prerequisites only)
**Parallelizable**: Yes (with Task 1, Task 5 — different files)
**Notes**:

### Task 5: Step 4 — Mermaid JS load-gate partial
**Status**: [x] done
**Files**: layouts/partials/extend-head-uncached.html
**Test**: `hugo build` zero errors. Mermaid `<script>` tag appears exactly once on a page using both shortcode and fenced block.
**Depends on**: none (Prerequisites only)
**Parallelizable**: Yes (with Task 1, Task 4 — different files)
**Notes**:

### Task 6: Step 5a — Author demo blog post
**Status**: [x] done
**Notes**: Closing paragraph currently says Playwright tests aren't written yet — must be updated once Tasks 8/9/10 land, before final commit.
**Files**: content/english/blog/native-hugo-image-pipeline-webp-lqip-and-mermaid.md
**Test**: `hugo build` zero errors. Confirm `assets/images/blog/secure-services-docker-compose-and-nordvpn/dockerComposeWithVPNDiagram.png` exists before referencing it. Post includes BOTH a fenced mermaid block AND a shortcode example; prose must NOT show the literal ` ```mermaid ` marker as example text.
**Depends on**: Task 3, Task 4, Task 5
**Parallelizable**: No
**Notes**:

### Task 7: Step 5b — Integration smoke-verify demo post
**Status**: [x] done
**Notes**: 10/10 checks passed. Page count went 173→188 (not the naively-expected 174) — traced to legitimate new taxonomy term pages (1 new category + 6 new tags × 2 pages each), not a defect.
**Files**: none (verification only)
**Test**: `hugo build` zero errors. 7-point check: webp extensions, srcset, LQIP placeholder+swap, figure, figcaption, data-zoom-src, lazy loading. Mermaid `<script>` present exactly once. Page count +1 vs. 173 baseline (relative, not hardcoded).
**Depends on**: Task 6
**Parallelizable**: No
**Notes**:

### Task 8: Step 6 — image-pipeline Playwright spec
**Status**: [x] done
**Files**: tests/e2e/image-pipeline.spec.js
**Test**: WebP extensions, srcset breakpoints, LQIP swap, figure/caption/alt/zoom attribute preservation all assert-pass.
**Depends on**: Task 7
**Parallelizable**: Yes (with Task 9 — different files; run together via one `npx playwright test` invocation at Task 12)
**Notes**:

### Task 9: Step 7a — Mermaid bundle-load-gate assertions
**Status**: [x] done
**Files**: tests/e2e/mermaid.spec.js
**Test**: Fenced-only loads bundle once; both-entry-points loads bundle exactly once (not twice); neither loads nothing.
**Depends on**: Task 7
**Parallelizable**: Yes (with Task 8 — different files)
**Notes**:

### Task 10: Step 7b — Mermaid visual rendering assertions
**Status**: [x] done
**Files**: tests/e2e/mermaid.spec.js (amends Task 9's file)
**Test**: Fenced diagram renders as `<svg>` inside `pre.mermaid`. Colors visibly differ light vs dark via `#appearance-switcher` click (same pattern as dark-mode.spec.js).
**Depends on**: Task 9
**Parallelizable**: No (same file as Task 9)
**Notes**:

### Task 11: Step 8 — Verify SVG/remote-image passthrough branches
**Status**: [x] done
**Files**: layouts/_default/_markup/render-image.html (read/compare only, no further edits)
**Test**: Direct template diff of SVG/remote branching logic against theme's original render-image.html — byte-for-byte unchanged. `hugo build` zero errors.
**Depends on**: Task 3
**Parallelizable**: Yes (with Task 6 — no file-write conflict, Task 11 is comparison-only)
**Notes**:

### Task 12: Step 9 — Full test suite + regression check
**Status**: [x] done
**Notes**: All 30 Playwright tests pass (24 existing + 6 new) via single `npx playwright test` invocation. git status confirms content/english/blog/ has exactly one new untracked file, zero mods to the 25 existing posts. module.toml has zero [[imports]] and no diff. No go.mod anywhere in repo.
**Files**: none (verification only)
**Test**: Single `npx playwright test` invocation, all specs pass (existing 4 + new 2). `git diff content/english/blog/` shows only the one new post. No new `[[imports]]` in module.toml, no go.mod anywhere.
**Depends on**: Task 8, Task 9, Task 10, Task 11
**Parallelizable**: No
**Notes**:

## Blocked / open
(none yet)
