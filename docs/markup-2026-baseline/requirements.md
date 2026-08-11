# Requirements: Markup 2026 Baseline

## Problem statement
pres-ber-blog just migrated its theme from Hugoplate to Blowfish (commit 5755da9), and Blowfish already ships modern code-block rendering (language tags, line-highlighting, copy-to-clipboard) and an icon+label admonition shortcode — but the blog's existing content was written for the old theme and has never been checked against these features or against basic accessibility and semantic-markup rules. Preston Bernstein, the site's sole author, needs the 25 posts in `content/english/blog/` brought up to a consistent 2026 baseline: every code block correctly tagged, at least one real demonstration of the new capabilities, no non-descriptive link text, and bold/italic/code-font used for meaning instead of decoration. This matters now because the theme migration is the natural checkpoint to fix inherited content debt before it compounds across future posts, and because the site has no staging environment — a broken build or a bad in-content example would go live on push.

## Users / stakeholders
- Preston Bernstein — site author and sole content editor; writes and reviews every post.
- Site readers — consume rendered posts on prestonbernstein.com; benefit from readable code samples, scannable admonitions, and link text that works with screen readers.
- CI/CD pipeline (`.github/workflows/main.yml`) — builds and FTP-deploys on every push to `main`; must keep succeeding.
- Future post authors (Preston, going forward) — inherit whatever markup conventions this pass establishes.

## Functional requirements
1. The system shall add a language tag to the code block in `deciding-whats-worth-a-saturday-estate-sale-scanner.md` (lines 37-41), using a plain-text-appropriate tag (e.g. `text`) since the block is a model-output sample, not executable code.
2. The system shall add a language tag to the code block in `scrape-score-alert-resale-hunting-pipelines-local-vision-models.md` (lines 31-44), using a plain-text-appropriate tag (e.g. `text`) since the block is an ASCII architecture diagram, not executable code.
3. The system shall scan every fenced code block across all posts in `content/english/blog/` and confirm each one carries a language tag, so no block silently falls back to unhighlighted plain text.
4. The system shall review every post in `content/english/blog/` for bare URLs appearing in prose (outside code/shell blocks) and replace each one with a markdown link whose text describes the destination, so no link text is a raw URL, determining prose-vs-code context per the rule in requirement 5.
5. The system shall leave bare URLs that appear inside code blocks or shell examples unchanged, since a URL used as a literal command argument or config value is not prose link text. The system shall determine prose-vs-code-block context by tracking fenced-code-block state line by line (a URL between an opening and matching closing fence, or inside inline backticks, counts as code context) — not by a blind whole-file text search that could match inside a fence.
6. The system shall review every post in `content/english/blog/` for non-descriptive link text (e.g. "click here," "read more," "this link," "here") and replace it with text that describes the link's destination out of context, per WCAG 2.4.4.
7. The system shall review every bold span in `content/english/blog/` and classify it as semantic or decorative per the semantic-use rule: bold marks a UI element or genuinely strong claim; italics mark a term being defined or a word-as-word reference; code font marks a literal command, filename, identifier, or config value; anything else is decorative. The system shall convert decorative bold to plain text or, where warranted, to italics or code font per this rule.
8. The system shall review every italic span in `content/english/blog/` and classify it as semantic or decorative per the semantic-use rule in requirement 7, converting decorative italics to plain text.
9. The system shall review every inline-code span in `content/english/blog/` and classify it as semantic or decorative per the semantic-use rule in requirement 7, converting decorative code-font spans to plain text or the correct semantic markup (bold/italic) as the content warrants.
10. The system shall preserve the original meaning and factual content of every post during the bold/italic/code-font remediation pass — this is a markup correction, not a content rewrite.
11. The system shall add at least one line-highlighted code block (using Chroma fence attributes, e.g. `hl_lines`) to an existing post where the highlighted line(s) genuinely aid the reader's understanding of that post's existing code example, not a block inserted solely to demonstrate the feature.
12. The system shall add at least one admonition (GFM blockquote-alert syntax, e.g. `> [!TIP]`) to an existing post where the callout content is genuinely useful to that post's argument, not inserted solely to demonstrate the feature.
13. The system shall build the site locally with Hugo 0.164.0+extended and confirm the build completes with zero errors after all content changes.
14. The system shall run the existing Playwright e2e suite (`npm run test:e2e`, 17 tests) after all content changes and confirm all 17 tests still pass.
15. The system shall add a new Playwright assertion (in `tests/e2e/blog-post-content.spec.js` or a new spec file) that verifies the demonstration code block in `secure-services-docker-compose-and-nordvpn.md` renders a Chroma line-highlight marker on the two `hl_lines` target lines.
16. The system shall add a new Playwright assertion that verifies the demonstration admonition in `nine-fixes-lightrag-embedding-crash-one-afternoon.md` renders an element with `data-type="warning"` (the actual attribute Blowfish's `render-blockquote.html` emits).
17. The system shall build the site locally with the `--buildDrafts` (`-D`) flag in addition to the standard production build, so both draft posts' markup edits are also rendered and verified locally, even though `-D` is not used in the actual CI/deploy build.
18. The system shall commit and push the verified changes to `main` only after every other acceptance criterion in this document passes locally.

## Non-functional requirements
- Zero regressions: all 17 existing Playwright e2e tests must pass after the change (binary pass/fail, not a performance target).
- Local Hugo build must complete with zero errors and zero broken internal links introduced by the content edits.
- Content edits must preserve each post's existing front matter (dates, slugs, tags) so URLs and publish dates do not change.

## Constraints
- Blowfish v2.105.0 (submodule at `themes/blowfish`) is the mandated theme; it already ships copy-to-clipboard (`themes/blowfish/assets/js/code.js`), language-tag pass-through (`themes/blowfish/layouts/_default/_markup/render-codeblock.html`), line-highlighting via Chroma fence attributes, and GFM blockquote-alert admonitions (`themes/blowfish/layouts/_default/_markup/render-blockquote.html`). No part of this feature may modify theme submodule files.
- Hugo version is pinned to 0.164.0+extended in both CI (`.github/workflows/main.yml`) and local dev (Homebrew) — content must build correctly under this exact version.
- No staging environment exists. A push to `main` is a live deploy to prestonbernstein.com via FTP. All verification must happen locally before any push.
- `main` has no branch protection — process discipline (local build + test pass before push) is the only safeguard.
- Existing Playwright suite (`tests/e2e/*.spec.js`, 17 tests) and Jasmine suite (`npm test`) must keep passing; this feature must not require changes to those test files to pass.
- This is a single-author, no-auth, no-payment personal blog — no multi-tenant, authentication, or transaction concerns apply.

## Out of scope
- No new shortcode, JS, or CSS for admonitions or code blocks — Blowfish already ships copy-to-clipboard, language-tag rendering, line-highlighting, and the full admonition system natively.
- No changes to theme submodule files (`themes/blowfish/**`).
- No changes to Hugo version, CI workflow, or deploy mechanism.
- No addition of a staging environment.
- No rewriting of post content beyond markup correctness — this excludes changing a sentence's argument, facts, or structure. Composing new link-anchor text to replace a bare URL or non-descriptive phrase (e.g. "click here") is in scope, since the destination and meaning stay the same and only the visible link text changes.
- No retroactive addition of a table of contents or in-page anchor links to long posts (a separate concern from markup correctness).
- No changes to posts outside `content/english/blog/` (e.g. `_index.md`, non-blog pages).

## Acceptance criteria
1. Zero fenced code blocks in `content/english/blog/` lack a language tag.
2. The two known missing-tag blocks (`deciding-whats-worth-a-saturday-estate-sale-scanner.md` lines 37-41; `scrape-score-alert-resale-hunting-pipelines-local-vision-models.md` lines 31-44) render with `text`-appropriate highlighting in the local build.
3. Every prose bare URL identified in the full-content review has been replaced with a descriptive markdown link; URLs inside code/shell blocks remain unchanged.
4. Zero non-descriptive link text ("click here," "read more," "this link," bare "here") remains in `content/english/blog/`.
5. A per-span review log exists (one line per bold, italic, or inline-code span found by a repo-wide scan of `content/english/blog/`) recording each span's location and semantic/decorative verdict per the semantic-use rule in requirement 7, and every span the scan found has a corresponding log entry — zero spans unaccounted for. Decorative spans are corrected.
6. At least one post contains a line-highlighted code block that did not exist before this change, and the highlight targets a line the surrounding prose specifically discusses.
7. At least one post contains an admonition that did not exist before this change, and its content is specific to that post (not generic filler).
8. `hugo --gc --minify` (or the project's equivalent build command) completes locally against Hugo 0.164.0+extended with zero errors.
9. `npm run test:e2e` passes all 17 existing Playwright tests with zero failures.
10. A new Playwright assertion (added per requirement 15) passes, verifying the demonstration code block in `secure-services-docker-compose-and-nordvpn.md` renders a Chroma line-highlight marker on the two `hl_lines` target lines — an automated check, not only a manual look at the local build.
11. A new Playwright assertion (added per requirement 16) passes, verifying the demonstration admonition in `nine-fixes-lightrag-embedding-crash-one-afternoon.md` renders an element with `data-type="warning"` — an automated check, not only a manual look at the local build.
12. No post's front matter (date, slug, tags) differs from its pre-change value.
13. Both draft posts (`enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md`, `performance-optimizations-using-top-level-await.md`) render without error under a local `hugo --gc --minify -D` build.
14. The push to `main` happens exactly once, after all other acceptance criteria are confirmed locally, not incrementally per file.
