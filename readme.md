# pres-ber-blog

[![Deploy](https://github.com/preston-bernstein/pres-ber-blog/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/preston-bernstein/pres-ber-blog/actions/workflows/main.yml) [![License](https://img.shields.io/github/license/preston-bernstein/pres-ber-blog)](LICENSE)

Source for [prestonbernstein.com](https://www.prestonbernstein.com), a personal blog built on Hugo and the [Blowfish](https://blowfish.page/) theme.

## Stack

| Layer | Tech |
|---|---|
| Static site generator | [Hugo](https://gohugo.io/) (extended, v0.164.0 in CI) |
| Theme | [Blowfish](https://github.com/nunocoracao/blowfish) (git submodule) |
| Styling | Blowfish's own precompiled CSS bundle (no site-level Tailwind/PostCSS build step) |
| Content | Markdown, under `content/english/` |
| Comments | Disqus |
| Deploy | GitHub Actions → FTP (push to `main`); GitLab CI + Netlify/Vercel/Amplify configs also present |

## Project layout

```
content/english/
  blog/       # long-form posts (Markdown, hand-authored)
  links/      # short link+commentary posts (generated, see Linkblog below)
  authors/    # author bio(s)
  pages/      # static pages (privacy policy, elements, ...)
  contact/    # contact page
  sections/   # homepage sections (call-to-action, ...)
config/       # Hugo site config (_default)
assets/       # images, svg processed by Hugo pipes
data/         # authors data, linkposts.json (see Linkblog below)
i18n/         # locale strings (currently empty -- Blowfish ships its own)
static/       # files copied verbatim into public/ (links/atom.xml, see Linkblog below)
themes/blowfish/  # vendored theme (git submodule, see .gitmodules)
scripts/      # geo-gate.py (release gate), build-linkblog.py (see Linkblog below)
```

## Quick start

### Prerequisites

- [Hugo Extended v0.164+](https://gohugo.io/installation/)
- [Node v20+](https://nodejs.org/en/download/)

### Run locally

```bash
git clone --recurse-submodules git@github.com:preston-bernstein/pres-ber-blog.git
cd pres-ber-blog

npm install
npm run dev              # hugo server
```

If you already cloned without `--recurse-submodules`, run `git submodule update --init` to fetch the Blowfish theme before building.

### Build

```bash
npm run build             # hugo --gc --minify ...
```

## Writing a post

Add a Markdown file under `content/english/blog/` with Blowfish's post front matter (see existing posts in that directory for the shape). Tags, categories, and author are set in front matter and drive the tag/category/author pages.

## Linkblog

Short link+commentary posts live under `/links/`, structurally separate from
`content/english/blog/`. Nothing under `content/english/links/*.md` is hand-edited
except `_index.md` -- everything else, plus `static/links/atom.xml`, is fully
regenerated on every build by `scripts/build-linkblog.py` and committed to git (not
`.gitignore`d), so a bad slug or permalink shows up in the PR diff before it goes live.

To add a link post, add an entry to `data/linkposts.json`:

```json
{
  "url": "https://example.com/some-article",
  "published": "2026-08-15T10:00:00+00:00",
  "comment": "Why this is worth reading.",
  "tags": ["some-tag"]
}
```

`url` and `published` must be treated as immutable once an entry has been published --
changing either changes the generated page's slug, breaking any existing external link
to it. `published` must be a timezone-aware ISO 8601 datetime (a bare date is rejected).

Locally: `python3 scripts/build-linkblog.py` validates every entry, wipes and
regenerates `content/english/links/*.md`, and regenerates `static/links/atom.xml`. CI
runs this same script (both `main.yml` and `geo-gate.yml`) immediately before
`npm run build`, using [linkblog-commons](https://github.com/preston-bernstein/linkblog-commons)
(a private sibling repo) for the actual rendering. Since it's private, CI installs it via
a fine-grained GitHub PAT (`Contents: Read-only` on just that repo) stored as the repo
secret `LINKBLOG_COMMONS_PAT` -- **Preston must provision this manually** in
Settings > Secrets and variables > Actions; CI cannot create it itself, and the
pip-install step fails with a clear auth error until it exists. The dependency is
pinned to a specific commit SHA, not a branch, so an unrelated change to
linkblog-commons can't silently break this repo's push-to-main deploy.

## Deploy

`main.yml` builds with Hugo and deploys `public/` to the production host over FTP on every push to `main` -- there is no staging environment. `.gitlab-ci.yml`, `netlify.toml`, `vercel.json`, and `amplify.yml` are alternate/legacy build configs for those platforms and are not the active deploy path unless wired up on that platform.

## License

The [Blowfish](https://github.com/nunocoracao/blowfish) theme code is © [Nuno Coração](https://nunocoracao.com/), released under the [MIT License](https://github.com/nunocoracao/blowfish/blob/main/LICENSE). Blog content under `content/`, and this repo's own scripts/config, are under [CC BY-NC-ND 4.0](LICENSE) (non-commercial, no derivatives redistribution) unless noted otherwise.
