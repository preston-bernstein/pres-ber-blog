# Spec Challenge Notes

## Agents run
- Requirements Auditor (haiku): 3 issues found, 3 accepted
- Scope & Dependency Auditor (sonnet): 8 issues found, 6 accepted, 2 rejected
- Design Devil's Advocate (sonnet): 9 issues found, 9 accepted (several as lightweight comment-only fixes rather than structural changes)
- Implementation Realist (sonnet): 5 issues found, 4 accepted, 1 downgraded to informational (confirmed non-risk)
- Steps & Sequencing Critic (sonnet): 13 issues found, 11 accepted, 2 folded into existing gates rather than new steps
- Data Model Critic (sonnet): 6 issues found, 4 accepted, 2 rejected as over-engineering for a personal blog
- Security/Threat Auditor (haiku): 0 blocking findings — confirmed near-zero security surface for this static, single-author site

The orchestrator also ran direct empirical verification against the real repo using the project's pinned Hugo 0.164.0 binary (WebP encode, `.RawContent` detection, and the Mermaid render hook's `-->` escaping were all tested directly, not just reasoned about), and found one additional gap the agents didn't surface: zero pages anywhere on the site currently use the Mermaid shortcode, a fenced Mermaid block, an SVG image, or a remote image reference — meaning several planned regression tests had no real page to test against.

## Changes made

- **Fixed a real, reproduced bug in the image render hook's WebP conversion.** The original plan added WebP conversion only inside the width-gated `.Resize` calls Blowfish's theme already uses — meaning any image narrower than 800px would skip `.Resize` entirely and silently keep its original format, never converting to WebP. This was proven with a real 400×600 test image before the fix, not just theorized. The fix decouples "convert format" from "avoid upscaling": always resize-and-convert, capping the target width at the source image's own width. This was the single most important finding across all seven reviews — every page using the site's ~1600px-wide demo image would have hidden the bug from all planned tests.
- **The demo post will now use both Mermaid entry points, not just the new one.** A full-site grep found that zero pages anywhere currently use the `{{< mermaid >}}` shortcode, a fenced code block, an SVG image, or a remote image — so there was no existing page to prove the shortcode still works (requirement 13) or to prove the new double-load-prevention guard actually works when both syntaxes appear together (the plan's own top-named risk). Having the one new demo post use both, with real explanatory content, closes both gaps without adding a synthetic fixture page.
- **Pinned the LQIP placeholder's exact size and confirmed the aspect-ratio concern is already handled.** Empirically tested and set at 24px wide, quality 40. A reviewer worried a fixed-width placeholder would look wrong on tall or wide source images, but Hugo's single-dimension resize already preserves aspect ratio automatically — the missing piece was CSS (`background-size: cover`), which is now an explicit requirement rather than an implied detail.
- **Downgraded two acceptance criteria that assumed fixtures that don't exist.** The SVG and remote-image passthrough checks (both code paths copied unmodified from the theme) originally called for testing against "an existing SVG/remote reference elsewhere in the site" — there is no such reference anywhere. Rather than inventing content just to exercise unmodified code, these are now verified by direct template comparison plus a clean build, and the acceptance criteria were reworded to match.
- **Split three oversized implementation steps** (image hook, demo post, Mermaid Playwright spec) into smaller sub-steps, each independently testable, after the sequencing review found each one bundled 3+ unrelated concerns into a single unverifiable unit.
- **Fixed a portability bug in the build prerequisites.** The steps document had hardcoded one session's temporary file path for the Hugo binary — replaced with instructions for obtaining the correct pinned version (0.164.0 extended) from any environment.
- Empirically confirmed and documented (rather than left as open risks) that WebP encoding works on the pinned Hugo binary, that the Mermaid render hook's `.Inner | safeHTML` output matches the existing shortcode byte-for-byte (including unescaped `-->` arrows), and that the site's existing Tailwind CSS build-stats mechanism already handles new CSS classes from this feature with no extra step needed.

## Critiques rejected

- Adding a CI check to detect drift between the new site-level `render-image.html` and the theme's original file: over-engineering for a solo-maintainer blog. A one-line comment noting which theme version it was forked from is enough.
- Building real Markdown-AST-based Mermaid-fence detection instead of a `.RawContent` substring check: the substring approach has known edge cases (tilde-fences, quoting the marker in prose) but the sole content author controls 100% of the site's content, so the practical risk is near zero. Documented as an accepted limitation instead, with one constraint added: the demo post itself must not quote the literal marker as prose text.
- A second config flag to separately control LQIP vs. responsive resizing (currently both share `disableImageOptimizationMD`): unnecessary complexity for a two-feature site-wide switch: documented the semantic expansion instead of adding a flag.
- Building around a hypothetical future Content-Security-Policy that doesn't exist today (raised against the per-image inline `onload` handler): the site has no CSP and none is planned — reversible cheaply later if that ever changes.
- Making the responsive-image breakpoints configurable instead of hardcoded: requirements explicitly rule out adding a third breakpoint, so config-driving two fixed values would be speculative flexibility with no near-term use.
- Adding a bounded build-time/build-cost acceptance criterion for the growing per-image WebP+LQIP processing cost: premature for a 25-post personal blog whose full site build already completes in well under a second.

## Open questions requiring human input

None. Every finding either had a clear resolution the rewrite could apply directly, or was rejected with a stated reason above. Preston (site owner) should still eyeball the demo post's tone/content once written — that's an authoring judgment call, not a spec gap.
