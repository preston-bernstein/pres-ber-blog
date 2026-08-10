# Blowfish Schema Reference

Theme version referenced: Blowfish **v2.105.0** (pinned submodule commit `4afcd32b9950f16afbd686175b0f49a906d87626`, 2026-07-26), at `themes/blowfish/` in this worktree. Hosted docs at https://blowfish.page/docs/ were fetched and cross-checked against the submodule's own doc source (`themes/blowfish/exampleSite/content/docs/`) and template code (`themes/blowfish/layouts/`) — content matches verbatim, so the hosted docs are current for this pinned version.

## Author front-matter

Blowfish has **two independent author mechanisms** that are easy to conflate. Get the distinction right or author cards/taxonomy links silently no-op.

**1. Site-wide single author** — configured entirely in `config/_default/languages.en.toml` under `[params.author]` (name/email/image/headline/bio/links), no content file at all. Controlled per-page/site by `showAuthor` (front matter) / `article.showAuthor` (site param).

**2. Per-article multi-author (`authors:` front matter)** — this is the one relevant to per-post attribution:

```md
---
title: "Multiple Authors"
authors:
  - "nunocoracao"
showAuthor: true
showAuthorsBadges: false
---
```

- `authors` is a **YAML list of strings**. Each string is looked up as `index hugo.Data.authors <string>` (theme source: `layouts/_default/single.html:118`, `layouts/partials/schema.html:23`) — i.e. it must exactly match the **filename slug** of a Hugo Data file at `data/authors/<slug>.json` (extension stripped), **not** a field read from inside any content file. There is no `slug:` front-matter field involved in this lookup.
- Separately, the same `authors` string is also used as an Author **taxonomy term** (if the `authors` taxonomy is registered — see below), which is what drives `/authors/<slug>/` list pages and the optional bio page.
- Author bio/detail pages for the taxonomy are **page-bundle directories, not flat files**: `content/authors/<slug>/index.md` (Hugo `_index.md`), e.g. `content/authors/nunocoracao/_index.md`. Confirmed both in the theme's own `exampleSite/content/authors/nunocoracao/_index.md` and explicitly in the docs prose: "create a folder with the `key` to each author inside `./content/authors` and inside each folder place a `_index.md` file." A flat `content/authors/nunocoracao.md` is not the documented shape.
- To get the `authors` taxonomy (author archive/list pages) at all, it must be registered explicitly, since defining any `[taxonomies]` block overrides Hugo's tag/category defaults:

```toml
# hugo.toml
[taxonomies]
  tag = "tags"
  category = "categories"
  author = "authors"
```

- The rich author "card" partial (`author-extra.html`) is driven by `data/authors/<slug>.json`, **not** by the content-bundle `_index.md` — the bundle only supplies bio prose/taxonomy-page content, the JSON supplies name/image/bio/social for the card and for JSON-LD schema.org author info.

Sources:
- https://blowfish.page/docs/multi-author/ (hosted, matches `themes/blowfish/exampleSite/content/docs/multi-author/index.md`)
- https://blowfish.page/docs/front-matter/ (`authors` row: "Array of values for authors, if set it overrides `showAuthor` settings for page or site.")
- Theme source: `themes/blowfish/layouts/_default/single.html` lines 100–134 (`SingleAuthor` define block), `themes/blowfish/layouts/partials/schema.html` lines 20–27
- Theme version: v2.105.0 / commit `4afcd32b`

## Author-social schema

**Two different key names depending on which author mechanism is in play** — this is a real footgun if you copy one shape into the other's file:

- **`data/authors/<slug>.json`** (per-article multi-author) uses a `social` key: an array of single-key objects, each `{ "<network>": "<url>" }`. The `<network>` key is looked up directly as an icon name (`partial "icon.html" $name`) — it is a network-name string, not a raw CSS class.

```json
{
  "name": "Nuno Coração",
  "image": "img/nuno_avatar.jpg",
  "bio": "Theme Creator",
  "social": [
    { "linkedin": "https://linkedin.com/in/nunocoracao" },
    { "twitter": "https://twitter.com/nunocoracao" },
    { "github": "https://github.com/nunocoracao" }
  ]
}
```

- **`config/_default/languages.en.toml` → `[params.author]`** (site-wide default author) uses a `links` key with the identical `{network: url}` shape, just a different top-level key name:

```toml
[params.author]
  name = "Blowfish"
  email = "nuno@n9o.xyz"
  image = "img/blowfish_logo.png"
  headline = "..."
  bio = "..."
  links = [
    { x-twitter = "https://twitter.com/burufugu" },
    { github = "https://github.com/nunocoracao/blowfish" },
  ]
```

The theme's own source comment makes the distinction explicit: `layouts/partials/schema.html:27` — *"sameAs from social profiles: data/authors uses `social`, the site author uses `links` (each a {platform: url} map)."*

Custom networks are supported by dropping a matching SVG into `assets/icons/` — the key string is used as the icon filename lookup, not a CSS class.

Sources:
- https://blowfish.page/docs/configuration/ (`params.author.links` row)
- https://blowfish.page/docs/multi-author/ ("`name`, `image`, `bio`, and `social` are the 4 parameters supported... the key in the social object will be used to fetch one of the theme's icons")
- Theme source: `themes/blowfish/layouts/partials/author-links.html`, `themes/blowfish/layouts/partials/author-extra.html`, `themes/blowfish/exampleSite/data/authors/secondauthor.json`
- Theme version: v2.105.0

## Table of contents (TOC) params

Enable/disable is **scoped per page-kind** (article/list/taxonomy/term each have their own key, no single global on/off) plus two independent "smart TOC" behavior flags:

| Key | Scope | Default | Effect |
|---|---|---|---|
| `article.showTableOfContents` | site param (`params.toml`) or per-page front matter `showTableOfContents` | `false` | Show TOC on single article pages |
| `list.showTableOfContents` | site param or per-page front matter | `false` | Show TOC on list pages |
| `taxonomy.showTableOfContents` | site param | `false` | Show TOC on taxonomy pages |
| `term.showTableOfContents` | site param | `false` (but `false` in this repo's default `config/_default/params.toml`; the theme's own `exampleSite` ships it `true`) | Show TOC on term pages |
| `smartTOC` | site param (top-level `params.toml`, commented out by default) | _not set_ | "Activate smart Table of Contents, items in view will be highlighted" — scrollspy behavior |
| `smartTOCHideUnfocusedChildren` | site param | _not set_ | When `smartTOC` is on, collapses nested TOC levels not currently in focus |

Notes:
- Front matter `showTableOfContents` (no scope prefix) overrides the site param on a per-page basis (`.Params.showTableOfContents | default $enableToc` in `layouts/_default/single.html:35` and `layouts/_default/list.html:3`).
- There is **no separate Blowfish "depth/levels" param**. TOC depth is a Hugo core (Goldmark) setting, not documented on Blowfish's own configuration page, but this theme's own `config/_default/markup.toml` (and `exampleSite/config/_default/markup.toml`, identical) ships explicit values that this repo will inherit if not overridden:

```toml
# config/_default/markup.toml
[tableOfContents]
  startLevel = 2
  endLevel = 4
```

  i.e. TOC entries are generated for H2–H4 by default; H1/H5/H6 are excluded. The theme only gates whether the (already-rendered) `.TableOfContents` HTML is shown/sticky/scrollspy'd via the params above — depth control is entirely upstream of Blowfish.
- "Sticky" positioning (`lg:sticky`) and scroll-linked active-item highlighting (`smartTOC`'s JS in `layouts/partials/toc.html`) are theme behavior, not independently configurable beyond the `smartTOC*` flags above.

Sources:
- https://blowfish.page/docs/configuration/ (`smartTOC`, `smartTOCHideUnfocusedChildren`, `article.showTableOfContents`, `list.showTableOfContents`, `taxonomy.showTableOfContents`, `term.showTableOfContents` rows)
- https://blowfish.page/docs/front-matter/ (`showTableOfContents` row)
- Theme source: `themes/blowfish/layouts/_default/single.html:34-36`, `themes/blowfish/layouts/_default/list.html:3-4`, `themes/blowfish/layouts/partials/toc.html` (full smartTOC scrollspy JS), `themes/blowfish/config/_default/params.toml` lines 37-38, 99, 121, 141, 152
- Theme version: v2.105.0

## Comments support

Blowfish does **not** ship a built-in comments partial or any first-party provider integration (no Disqus/giscus/utterances template included). It ships only an **extension point**: you provide your own `layouts/partials/comments.html` in your site (not the theme) with whatever provider code you want (Hugo's built-in Disqus shortcode/template, or fully custom giscus/utterances/whatever markup). Confirmed directly from the theme's own docs source and hosted docs, identical wording:

> "To add comments to your articles, Blowfish includes support for a comments partial that is included at the base of each article page. Simply provide a `layouts/partials/comments.html` which contains the code required to display your chosen comments. You can use either the built-in Hugo Disqus template, or provide your own custom code. Refer to the [Hugo docs](https://gohugo.io/content-management/comments/) for further information."

Once that partial exists, visibility is gated by `showComments`:
- Site-wide default: `article.showComments` in `params.toml`, default `false`
- Per-article override: `showComments` front-matter key (same default/inheritance pattern as the TOC key above)

There is no theme-shipped `layouts/partials/comments.html` at all in this submodule (confirmed by `find . -iname "*comment*"` in `themes/blowfish/` turning up nothing but an SVG icon asset) — the partial must be authored in the parent site (e.g. `pres-ber-blog-theme-refresh/layouts/partials/comments.html`), which will be picked up via Hugo's standard theme-override lookup order.

Sources:
- https://blowfish.page/docs/partials/ (Comments section)
- https://blowfish.page/docs/front-matter/ (`showComments` row) and https://blowfish.page/docs/configuration/ (`article.showComments` row)
- Theme source check: `themes/blowfish/exampleSite/content/docs/partials/index.md` (Comments section, matches hosted text verbatim); no `layouts/partials/comments.html` present anywhere under `themes/blowfish/`
- Theme version: v2.105.0

**Safest default assumption if picking a provider now:** since nothing is baked in, giscus (GitHub-Discussions-backed, no ads/tracking, static embed script) is a reasonable low-maintenance choice — but that's an implementation decision for this repo, not something Blowfish prescribes. Whatever is chosen, it's a plain HTML/JS partial at `layouts/partials/comments.html` plus flipping `showComments = true` (site-wide or per-post).
