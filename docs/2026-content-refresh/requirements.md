# Requirements: 2026 Content Refresh Pass

## Problem statement
pres-ber-blog's 25 posts still carry three kinds of history debt from earlier
theme migrations and mechanical passes: SEO-template-voice prose from the old
Hugoplate defaults that never got a real edit, a total absence of images or
diagrams even in posts that describe system architecture or debugging output,
and front matter `date:` values that reflect whichever commit last touched the
file mechanically (a theme migration, a markup pass) rather than when the post
was actually written. A newly built image pipeline (WebP/srcset/LQIP render
hook, Mermaid support) and a set of 2026 voice-writing findings (specificity as
credibility signal, first-person over corporate distance, force-a-real-stance)
are ready to use but haven't been applied to the existing catalog yet. Preston
owns and reads this content; the fix needs to be judged post-by-post, not
templated.

## Users / stakeholders
- Preston Bernstein — site owner, sole author, the one who has to live with
  both under-revised (still-templatey) and over-revised (mechanically
  rewritten past his real voice) outcomes.
- Blog readers — see clearer explanations where a diagram would have helped,
  and accurate "posted"/"updated" dates in the post list, RSS feed, sitemap,
  and per-post byline.
- Future editing passes — the audit-log trail this pass produces is the record
  future agents check before re-touching a post ("was this already revised?").

## Functional requirements
1. The system shall evaluate each of the 25 real posts in
   `content/english/blog/` (all files except `_index.md` and
   `native-hugo-image-pipeline-webp-lqip-and-mermaid.md`) against the 2026
   voice conventions in `writing-style.md` and `plain-writing.md` (first-person
   voice, specific titles/subheads, a real stance or admitted failure, NN/g
   [Nielsen Norman Group] scannability) and revise body prose only where the
   post does not already pass both skill files' own Self-check sections — that
   Self-check is the testable bar, not a separate new rubric.
2. The system shall leave a post's prose untouched when it already passes
   both Self-checks, and shall record that decision (not just silence) in the
   audit log.
3. The system shall NOT rewrite front matter SEO fields (`meta_title`,
   `description`, `categories`, `tags`) as part of the voice pass — those stay
   factually accurate, not rewritten in narrative voice.
4. The system shall NOT alter markup conventions already applied by the prior
   pass (semantic emphasis, code-block language tags, admonitions, link text),
   except where a voice edit incidentally touches a sentence containing one —
   that incidental overlap is in scope for this requirement, not a violation
   of it.
5. The system shall evaluate each of the 26 in-scope posts (25 real posts +
   the demo post) for a genuinely clarifying image or diagram — for example,
   an architecture/flow Mermaid diagram for a post describing system
   structure, or a screenshot of real output/error/UI the post discusses —
   and add one only when it clarifies something real in that specific post.
6. The system shall NOT add decorative, generic, or forced imagery to a post
   that doesn't call for one, and shall record "no image added, and why" in
   the audit log for every post that gets none, including the demo post
   (whose expected answer is "none — it is itself the pipeline's live
   showcase, already image/diagram-rich").
7. When a post describes real debugging output, an error, or a UI, and no
   real screenshot of that exact output exists or can be captured during this
   pass, the system shall use a Mermaid diagram of the underlying flow
   instead of fabricating a screenshot — a fabricated "screenshot" is a
   correctness violation (its alt text would describe something that never
   happened), not an acceptable substitute.
8. Any image or diagram added shall use the live pipeline exactly as
   demonstrated in `native-hugo-image-pipeline-webp-lqip-and-mermaid.md` —
   either a plain image reference (routes through `render-image.html`
   automatically, resolved from `assets/images/...` per Hugo's module mount,
   NOT from a bare top-level `images/` path) or a ` ```mermaid ` fenced code
   block / `{{< mermaid >}}` shortcode for diagrams.
9. Every diagram or screenshot added shall carry specific, hand-written alt
   text (5-15 words, describing the pattern/content, never a filename or a
   generic "screenshot") per the accessibility findings in
   `blog-images-visual-content.md`, and shall NOT reveal private
   infrastructure detail (internal IP addresses, internal hostnames, port
   numbers) beyond what the post's own prose already states publicly.
10. The system shall set `date:` in front matter, in the same
    `YYYY-MM-DDTHH:MM:SSZ` (UTC) format every existing post already uses, to
    the value in `docs/2026-content-refresh/date-mapping.txt` for the
    matching slug, for every post covered by that mapping, EXCEPT
    `github-agents-tab-vs-claude-code.md`, whose current `date:`
    (2026-08-10T12:30:00Z) is already accurate and shall be left untouched.
11. The system shall add `lastmod: 2026-08-10` (bare date, no time component,
    unquoted — the date this pass commits) immediately below the `date:`
    field in front matter, on every one of the 26 in-scope posts that does
    not already have a `lastmod` field.
12. The system shall NOT alter `date:` on `_index.md`,
    `github-agents-tab-vs-claude-code.md`, or
    `native-hugo-image-pipeline-webp-lqip-and-mermaid.md` — these are the
    three documented exclusions from the date-mapping change (see
    `date-mapping.txt`'s header comment for why each is excluded).
13. The system shall verify, before any post is edited, that
    `date-mapping.txt` contains an entry for every one of the 25 real posts'
    slugs (i.e. every slug except the 2 documented exclusions plus `_index`);
    any slug found missing from the mapping gets flagged in the audit log
    and its `date:` left untouched, never guessed.
14. The confirmation that
    `themes/blowfish/layouts/partials/article-meta/basic.html` renders
    `.Date` (not `.Lastmod`) by default in the blog list — already performed
    during spec-gather and recorded in `docs/2026-content-refresh/.ctx.md` —
    satisfies this requirement; no further action needed unless a later
    read of that same file finds it no longer true.
15. The system shall record every per-post decision (voice: revised/left-alone
    + why; image: added/none + why; date: mapping applied/excluded + why) in
    a set of audit-log files under `docs/2026-content-refresh/`, one file per
    batch, using the single shared per-post template given in `plan.md`'s
    "Audit-log entry format" section — so all 5 batch files are
    structurally identical and machine-diffable against each other.
16. The system shall validate the full site builds cleanly
    (`hugo --gc --minify`) using Hugo 0.164.0 specifically (the version pinned
    in `.github/workflows/main.yml`), not a locally installed Hugo of a
    different version, after every batch (not only at the end) — so a build
    break is attributable to the batch that caused it.
17. For every image or diagram this pass adds, the system shall verify the
    referenced local asset file actually exists on disk under
    `assets/images/...` before considering that post's image work done — a
    successful `hugo --gc --minify` alone does NOT prove this, because
    `render-image.html` falls through to a plain, unresolved `<img>` tag with
    no build error when the referenced asset is missing.
18. The system shall confirm the existing Playwright suite
    (`tests/e2e/*.spec.js`) still passes after all edits. New Playwright
    coverage for newly-added images/diagrams on the 25 posts is explicitly
    NOT this pass's own responsibility — it is covered by the outer ship-it
    pipeline's harden phase (Phase 3.5), which runs after this content pass
    and writes real coverage for every UX surface a change touched.

## Non-functional requirements
- No application code, template, or config changes, other than the read-only
  template confirmation in requirement 14 — this is a content-only pass.
- Every front matter change stays valid YAML; a malformed front matter block
  that breaks the Hugo build on any post is a hard failure, not a partial
  pass.
- The live site has no staging — a push to `main` deploys immediately via
  GitHub Actions FTP. All validation must happen before that push, not after.
  No additional human-approval checkpoint is inserted beyond the pipeline's
  own build/test/review gates: full autonomous execution through deploy was
  explicitly authorized for this pass by the task that commissioned it. This
  is a deliberate, acknowledged choice, not an oversight — see plan.md's Risk
  areas for the one-way-door consequence it accepts.
- Changing `date:` to the corrected values will reorder the blog list and
  reorder/republish entries in the RSS feed and sitemap (both templates key
  off `.Date`/`.Lastmod`, confirmed in plan.md's Integration points). This is
  the intended effect of the fix — surfacing genuinely correct history — not
  a regression to prevent.

## Constraints
- Hugo version must be 0.164.0 exactly for build validation (CI-pinned
  version), regardless of what Homebrew has installed locally. Confirmed
  matching during spec-gather; re-verify with `hugo version` immediately
  before the final build in case of a Homebrew upgrade between sessions.
- Existing markup conventions (Chroma highlighting, copy button, admonitions)
  from the prior pass must not regress.
- `docs/2026-content-refresh/date-mapping.txt` (committed in-repo, normalized
  to UTC `Z` format, derived from a session-local capture that has since been
  superseded by this durable copy) is the source of truth for `date:` values,
  except for the two documented exclusions in requirement 12. No guessing a
  date for a post not covered by the mapping or those two exclusions — flag
  it (requirement 13), don't resolve it silently.
- Image pipeline usage must match the demonstrated working pattern in the
  reference post exactly (same render hooks, same Mermaid syntax options,
  same `assets/images/...` asset location).

## Out of scope
- Rewriting front matter SEO metadata voice (meta_title, description,
  category/tag lists).
- Markup-convention work already covered by `docs/markup-2026-baseline/`
  (semantic emphasis, link text, code-block formatting, admonitions) —
  except the incidental overlap described in requirement 4, which stays in
  scope.
- Adding images to `_index.md` (not a post) or altering its date.
- Changing the image pipeline or Mermaid render hooks themselves — this pass
  only uses them.
- Site-wide `showDateUpdated` display change (requirement 14 found no reason
  to change it).
- Any post not present in `content/english/blog/` at the time this pass
  starts (no new posts created by this pass, only edits to existing ones).
- Writing new Playwright coverage for the newly-added images/diagrams
  (requirement 18 — that is the outer pipeline's harden phase, not this
  pass).
- Any change to the FTP deploy workflow, its credentials, or CI config — this
  pass never touches `.github/workflows/`.

## Acceptance criteria
1. All 25 real posts have a documented voice decision (revised or
   left-alone-with-reason) in an audit-log file.
2. All 26 in-scope posts have a documented image decision (added-with-reason
   or none-with-reason) in an audit-log file, including the demo post.
3. All 24 mapping-covered, non-excluded real posts (the 25 real posts minus
   `github-agents-tab-vs-claude-code.md`, the one documented exclusion that
   falls inside that set — `_index.md` and the demo post are excluded from
   the 25-real-post set entirely, not counted against it here) have `date:`
   matching `date-mapping.txt` exactly, in `YYYY-MM-DDTHH:MM:SSZ` format,
   for their slug.
4. `github-agents-tab-vs-claude-code.md` and
   `native-hugo-image-pipeline-webp-lqip-and-mermaid.md` have unchanged
   `date:` values, verified against their pre-pass state.
5. All 26 in-scope posts have `lastmod: 2026-08-10` present in front matter,
   positioned immediately below `date:`.
6. `_index.md` has no `date:` or `lastmod:` change.
7. `hugo --gc --minify` (Hugo 0.164.0) completes with zero errors and zero
   new warnings introduced by this pass's edits, checked after every batch.
8. `npx playwright test` (or the repo's equivalent test:e2e script) passes
   against the built site.
9. Every image/diagram added has specific alt text, no filename-as-alt-text,
   no generic "screenshot" alt text, and every referenced local asset file
   is verified to exist on disk under `assets/images/...` (not just a
   passing Hugo build).
10. The `.Date`-not-`.Lastmod` default-rendering finding for
    `themes/blowfish/layouts/partials/article-meta/basic.html` is recorded in
    `docs/2026-content-refresh/.ctx.md` (already true as of spec-gather).
