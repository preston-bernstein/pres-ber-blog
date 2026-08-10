# pres-ber-blog

[![Deploy](https://github.com/preston-bernstein/pres-ber-blog/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/preston-bernstein/pres-ber-blog/actions/workflows/main.yml) [![License](https://img.shields.io/github/license/preston-bernstein/pres-ber-blog)](LICENSE)

Source for [prestonbernstein.com](https://www.prestonbernstein.com), a personal blog built on Hugo and the [Hugoplate](https://github.com/gethugothemes/hugoplate) theme.

## Stack

| Layer | Tech |
|---|---|
| Static site generator | [Hugo](https://gohugo.io/) (extended, v0.125.7 in CI) |
| Theme | [Hugoplate](https://github.com/gethugothemes/hugoplate) (Hugo modules, Go modules) |
| Styling | Tailwind CSS + PostCSS + PurgeCSS + Autoprefixer |
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
config/       # Hugo site config (_default, development)
assets/       # scss, svg, images processed by Hugo pipes
data/         # site.json-style data (social links, theme settings)
i18n/         # locale strings
themes/hugoplate/  # vendored theme (Hugo module)
scripts/      # project-setup, theme-setup/update, darkmode removal helpers
```

## Quick start

### Prerequisites

- [Hugo Extended v0.124+](https://gohugo.io/installation/)
- [Node v20+](https://nodejs.org/en/download/)
- [Go v1.22+](https://go.dev/doc/install) (Hugo modules)

### Run locally

```bash
git clone git@github.com:preston-bernstein/pres-ber-blog.git
cd pres-ber-blog

npm run project-setup   # first-time theme/module setup
npm install
npm run dev              # hugo server
```

### Build

```bash
npm run build             # hugo --gc --minify ...
```

## Writing a post

Add a Markdown file under `content/english/blog/` with Hugoplate's post front matter (see existing posts in that directory for the shape). Tags, categories, and author are set in front matter and drive the tag/category/author pages.

## Deploy

`main.yml` builds with Hugo + Hugo modules (Go) and deploys `public/` to the production host over FTP on every push to `main`. `.gitlab-ci.yml`, `netlify.toml`, `vercel.json`, and `amplify.yml` are alternate/legacy build configs for those platforms and are not the active deploy path unless wired up on that platform.

## License

The [Hugoplate](https://github.com/gethugothemes/hugoplate) theme code is © [DigitalMast](https://digitalmast.tech/) / [Gethugothemes](https://gethugothemes.com/), released under [CC BY-NC-ND 4.0](LICENSE) (non-commercial, no derivatives redistribution). Blog content under `content/` is Preston Bernstein's own.
