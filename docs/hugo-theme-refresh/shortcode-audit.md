# Shortcode Audit — Hugoplate to Blowfish Migration

Grepped `content/` for `{{< shortcodename` calls for each Hugoplate-only shortcode.
Note: `content/english/pages/elements.md` and `content/english/sections/call-to-action.md`
are deleted by a concurrent migration task (confirmed via `git status --short`: both show
as `D` mid-audit). Occurrence data below was captured before that deletion completed and
reflects the pre-deletion state of those two files.

- accordion: 3 uses in content/english/pages/elements.md — moot, file being deleted
- button: 1 use in content/english/pages/elements.md — moot, file being deleted
- gallery: 1 use in content/english/pages/elements.md — moot, file being deleted
- image: 5 uses total — 4 in content/english/blog/secure-services-docker-compose-and-nordvpn.md, 1 in content/english/pages/elements.md — blog file: hand-edit to plain Markdown/HTML (count confirmed matches expected 4 uses, handled by separate task); elements.md instance: moot, file being deleted
- notice: 4 uses in content/english/pages/elements.md — moot, file being deleted
- slider: 1 use in content/english/pages/elements.md — moot, file being deleted
- tab: 3 uses in content/english/pages/elements.md — moot, file being deleted
- tabs: 1 use in content/english/pages/elements.md — moot, file being deleted
- toc: 1 use in content/english/pages/elements.md — moot, file being deleted
- video: 1 use in content/english/pages/elements.md — moot, file being deleted
- youtube: 1 use in content/english/pages/elements.md — moot, file being deleted

## Summary

- 11 of 11 shortcode names appear somewhere in content/.
- Total occurrences: 23.
- All occurrences except the 4 `{{< image >}}` calls in
  `secure-services-docker-compose-and-nordvpn.md` live in
  `content/english/pages/elements.md`, which is being deleted by another task — no
  hand-edit work required for those.
- `content/english/sections/call-to-action.md` (the other file being deleted) contains
  none of the audited shortcodes.
- The 4 `{{< image >}}` uses in `secure-services-docker-compose-and-nordvpn.md` match the
  expected count and are already covered by a separate hand-edit task.
