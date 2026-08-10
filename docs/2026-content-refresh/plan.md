# Plan: 2026 Content Refresh Pass

## Approach
This is a content-editing pass, not a code change: 25 Markdown posts get a
per-post judgment call on voice, an optional image/diagram, and a front
matter date correction. The 25 posts split into 5 batches of ~5 posts each
for the audit-log trail (mirroring `docs/markup-2026-baseline/audit-log-
group{A,B,C}.md`), but editing and voice judgment for all batches is done
under one consistent set of criteria applied by the same orchestrating
session — not five independently-calibrated agents — specifically to avoid
batch-to-batch voice drift on a single author's catalog (a real risk five
isolated agents would have no way to catch). Validation
(`hugo --gc --minify` + the image-existence check below) runs once per
batch, in order, so a break is attributable to the batch that caused it.

## Architecture
No new components. Existing pipeline used as-is:

```
content/english/blog/*.md (25 posts)
        |
        v
  [5 batches, edited under one consistent voice/image rubric]
        |  each: read post -> voice judgment -> optional image/diagram
        |        -> date front matter -> audit-log entry
        v
docs/2026-content-refresh/audit-log-batch{1..5}.md  (decision trail,
        one shared entry format — see "Audit-log entry format" below)
        |
        v
  per batch: hugo build (0.164.0) + image-existence check (grep image refs,
  confirm each resolves to a real file under assets/images/...)
        |
        v
  npx playwright test (tests/e2e/*.spec.js) — full existing suite, once,
  after all batches. New Playwright coverage for the newly-illustrated posts
  is NOT written here — that's the outer ship-it pipeline's harden phase.
```

Image/diagram rendering itself is unchanged infrastructure: any Markdown
image reference routes through the already-live
`layouts/_default/_markup/render-image.html` hook automatically, resolving
against `assets/images/...` (Hugo module-mounts `assets/` to `assets/` per
`hugo.toml`; `render-image.html` calls `resources.Get` against that mount —
confirmed by reading the hook, lines 65-104, during spec-challenge). Any
` ```mermaid ` fenced block or `{{< mermaid >}}` shortcode routes through the
already-live `render-codeblock-mermaid.html` hook and the theme's
Mermaid-bundle loader. This plan does not touch either hook.

**Correction from the original draft of this plan**: the integration point
below originally said new screenshots go under a top-level `images/blog/
<slug>/` path. That path is wrong and would silently produce a broken image
on the live site — see Risk area 6.

## Audit-log entry format
Every batch file uses this exact per-post block, so all 5 files are
structurally identical:

```
## <slug>.md
- Voice: revised | left-alone — <one-sentence reason, citing which
  Self-check item failed/passed if revised, or "already passes both
  Self-checks" if left alone>
- Image: added (<type: Mermaid diagram | screenshot>) | none — <one-sentence
  reason: what it clarifies, or why nothing genuinely clarifies here>
- Date: mapping applied (<value written>) | excluded (<reason>) | FLAGGED
  missing from mapping
- lastmod: added
```

## Data model
No data model changes. Front matter fields touched per post: `date` (23 of
25 posts, from `date-mapping.txt`, normalized to the existing `Z`/UTC
convention every post already uses), `lastmod` (all 26 in-scope posts, added
immediately below `date` if missing, as a bare unquoted `2026-08-10` with no
time component — no existing post has a `lastmod` field yet, so this pins
the first instance of the convention rather than leaving it to 5 independent
guesses). No other front matter fields change.

## API / interface contract
None. No endpoints, CLI flags, or UI surfaces change. Two read-only template
checks, both already performed:
1. `themes/blowfish/layouts/partials/article-meta/basic.html` (lines 15-33)
   — confirmed renders `.Date` unconditionally when `showDate` is true
   (default), and only adds a `.Lastmod`-based "updated" line when
   `showDateUpdated` is explicitly true (default false, untouched by this
   pass). No action needed.
2. `themes/blowfish/layouts/_default/rss.xml` and
   `themes/blowfish/layouts/_default/sitemap.xml` both key off
   `.Date`/`.Lastmod` — confirmed during spec-challenge. Changing `date:` on
   23 posts will reorder the RSS feed and change sitemap `lastmod` values.
   This is the intended effect of correcting mechanically-wrong dates to
   real ones, not a regression — noted here so it isn't mistaken for one
   during review.

## Integration points
- `content/english/blog/*.md` (25 real posts) — voice revision, optional
  image/diagram, date front matter correction.
- `content/english/blog/github-agents-tab-vs-claude-code.md` — voice +
  image evaluation same as any other post, but `date:` stays untouched
  (already accurate — one of the three documented exclusions).
- `content/english/blog/native-hugo-image-pipeline-webp-lqip-and-mermaid.md`
  — `lastmod:` added if missing; `date:` untouched; voice/image untouched
  (today's demo post, already fresh 2026 voice and already the image-pipeline
  showcase — its audit-log entry records "none, already the showcase" to
  satisfy acceptance criterion 2, not silence).
- `docs/2026-content-refresh/audit-log-batch1.md` through `batch5.md` (new) —
  per-post decision trail, one file per batch, shared entry format above.
- `docs/2026-content-refresh/date-mapping.txt` (new, already written during
  spec-challenge) — the durable, in-repo, UTC-normalized copy of the
  session-captured date mapping. Committed so the source of truth for
  requirement 10 survives past this session, unlike the original ephemeral
  scratchpad path.
- `assets/images/blog/<slug>/*` (new, only for posts that get a real
  screenshot — corrected from `images/blog/<slug>/*` in the original plan
  draft) — Hugo resolves local image references against `assets/`, not the
  top-level `images/` directory (that top-level dir holds unrelated
  OG/hero-image assets referenced by a different front matter field,
  `image:`, not by in-body Markdown image references).
- No `layouts/`, `config/`, or `assets/images/` structural changes — pipeline
  is pre-built and used as-is; only new leaf image files are added, if any
  post's image decision is "added (screenshot)".

## Technology choices
No new libraries or patterns. Uses only what's already in the repo: Hugo's
native render hooks (WebP/srcset/LQIP, Mermaid), Blowfish shortcodes, and
Markdown/YAML front matter.

## Prerequisites (surfaced explicitly, were implicit in the original draft)
- `git submodule update --init --recursive` must be run before any build
  validation — `themes/blowfish` is a submodule and is NOT checked out on a
  fresh clone. Already done for this worktree.
- The two vault research docs this pass's voice/image judgment is grounded
  in, both already read in full during spec-gather: `Development/Research/
  blog-article-writing-2026.md` (voice) and `Development/Research/
  blog-images-visual-content.md` (images).
- A baseline `hugo --gc --minify` run, captured before any post is edited,
  to diff against post-batch output — this is how "zero new warnings" in
  acceptance criterion 7 is actually checked, not just asserted.

## Risk areas
1. **Screenshot posts need a real captured image, not a fabricated one.**
   Several debugging/output posts (e.g. `debugging-false-positive-gpu-
   contention-detection.md`) would benefit from a screenshot of the actual
   error/output described, but no such screenshot exists in this repo or was
   captured during this pass. Where a real screenshot isn't available, this
   plan defaults to a Mermaid diagram (architecture/flow, which can be
   built from the prose alone) instead of fabricating a "screenshot" that
   isn't real — a fabricated image would violate the "genuinely clarifies"
   requirement and the accessibility alt-text rule. This is a real scope
   constraint, not an oversight: flagged explicitly in each affected post's
   audit-log entry.
2. **Voice revision quality is subjective and judged per-post.** There's no
   mechanical test for "reads as first-person with a real stance." Mitigated
   two ways: (a) one consistent set of criteria applied across all 5
   batches by the same orchestrating session, not five independently-
   calibrated agents, closing the cross-batch drift gap the original draft
   left open; (b) the reasoning is recorded in the audit log so the decision
   is checkable, not just asserted.
3. **Local Hugo version drift.** Confirmed at spec-gather time: local
   Homebrew Hugo is already v0.164.0, matching the CI pin exactly — no
   version mismatch risk for this run. Still worth an explicit `hugo version`
   check immediately before the final build validation, since Homebrew can
   upgrade silently between sessions.
4. **Front matter YAML breakage.** A single malformed front matter block
   (bad indentation, unescaped colon in a title) breaks that post's page
   build. Mitigated by running `hugo --gc --minify` after every batch, not
   just once at the end, so a break is caught and attributed to a small
   batch rather than discovered after 25 edits.
5. **Mermaid diagram accuracy.** A diagram that's wrong (doesn't match the
   post's actual architecture) is worse than no diagram. Mitigated by a
   same-session self-check — re-read the diagram against the specific prose
   claims it illustrates before finalizing — rather than relying solely on
   the outer pipeline's generic code-review phase, whose normal remit
   (DRY, correctness, architecture) doesn't specifically target diagram-to-
   prose fidelity.
6. **`hugo --gc --minify` does not catch a broken image reference.**
   Confirmed by reading `render-image.html`: when the referenced asset
   doesn't resolve, the hook falls through to a plain `<img>` tag with the
   raw, unresolved path and no build error — `hugo build` exits 0 either
   way. Combined with the wrong-path bug this plan already corrected
   (`images/blog/` vs `assets/images/blog/`), an unverified image reference
   is the single most likely way this pass could ship something broken to
   the live, no-staging site without any of its own gates catching it.
   Mitigated by requirement 17: every added image reference gets an explicit
   on-disk existence check under `assets/images/...`, not just a passing
   build.
7. **No staging, immediate live deploy on push to main.** This pass's own
   gates (per-batch build, image-existence check, full Playwright run) are
   all mechanical — they can't catch a wrong subjective voice call, only a
   broken build or a missing asset. No additional human-approval checkpoint
   is added beyond those gates: full autonomous execution through deploy was
   explicitly authorized for this pass. This is recorded as an accepted,
   one-way-door risk (wrong-voice content, if it happens, is live and
   crawlable before anyone but this pass's own judgment reviews it) rather
   than left as an unstated gap.
