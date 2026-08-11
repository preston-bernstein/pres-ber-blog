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
  blog/       # posts (Markdown)
  authors/    # author bio(s)
  pages/      # static pages (privacy policy, elements, ...)
  contact/    # contact page
  sections/   # homepage sections (call-to-action, ...)
config/       # Hugo site config (_default)
assets/       # images, svg processed by Hugo pipes
data/         # authors data
i18n/         # locale strings (currently empty -- Blowfish ships its own)
themes/blowfish/  # vendored theme (git submodule, see .gitmodules)
scripts/      # (currently empty -- see git history for retired Hugoplate scaffolding scripts)
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

## Deploy

`main.yml` builds with Hugo and deploys `public/` to the production host over FTP on every push to `main` -- there is no staging environment. `.gitlab-ci.yml`, `netlify.toml`, `vercel.json`, and `amplify.yml` are alternate/legacy build configs for those platforms and are not the active deploy path unless wired up on that platform.

## License

The [Blowfish](https://github.com/nunocoracao/blowfish) theme code is © [Nuno Coração](https://nunocoracao.com/), released under the [MIT License](https://github.com/nunocoracao/blowfish/blob/main/LICENSE). Blog content under `content/`, and this repo's own scripts/config, are under [CC BY-NC-ND 4.0](LICENSE) (non-commercial, no derivatives redistribution) unless noted otherwise.
