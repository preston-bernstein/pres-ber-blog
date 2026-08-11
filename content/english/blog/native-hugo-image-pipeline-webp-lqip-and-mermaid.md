---
title: "A Native Hugo Image Pipeline: WebP, LQIP Blur-Up, and Mermaid Diagrams"
meta_title: "Native WebP, LQIP, and Mermaid Diagrams in Hugo Without a CDN"
description: "This blog had zero image optimization and diagrams that only worked through one theme-specific shortcode. Here's the Hugo render-hook pipeline that fixed both — automatic WebP conversion, responsive srcset, blur-up placeholders, and Mermaid diagrams from a plain fenced code block — plus the width-gating bug that nearly shipped broken."
date: 2026-08-10T18:00:00Z
lastmod: 2026-08-11T20:34:13Z
categories: [
  "Software Architecture",
  "Web Development",
  "Home Lab"
]
authors: ["preston-bernstein"]
tags: [
  "Hugo",
  "Static Site",
  "Image Optimization",
  "WebP",
  "Mermaid",
  "Performance"
]
draft: false
---

This site had no image pipeline until this week. Every image in every post loaded at its original file size and format, usually a multi-megabyte PNG screenshot, with no responsive sizing and no loading placeholder. Diagrams worked through exactly one path: a Blowfish theme shortcode you had to remember to wrap your diagram in by hand, with no way to drop a diagram into a plain fenced code block the way you would in a GitHub README or almost anywhere else that renders Markdown. I fixed both problems in the same pass, because they share a mechanism: Hugo render hooks, which let a site override how the built-in Markdown renderer turns one specific element — an image, a code block — into HTML.

## Render hooks, not a CDN

The obvious alternative to fixing this in Hugo would have been an image CDN — a hosted service like Cloudinary or imgix that resizes and reformats images on request. I didn't want a third-party dependency for something Hugo already does natively at build time. Every image on this blog is a file checked into the repo. Hugo's `resources.Get` and the image processing methods it exposes (`.Resize`, format conversion, quality settings) run once, during `hugo build`, and the output is a static file next to everything else this site already serves. No runtime cost, no external service, no new failure mode when that service has an outage.

A render hook is Hugo's supported way to intercept one piece of that build. Drop a template at `layouts/_default/_markup/render-image.html` and every Markdown image reference in every post routes through it instead of Hugo's default renderer. Same idea for code blocks: `layouts/_default/_markup/render-codeblock-mermaid.html` intercepts only the fenced blocks tagged with the language name `mermaid`, leaving every other code block (Python, Bash, YAML, whatever) untouched.

## WebP conversion, responsive srcset, and a blur-up placeholder

The image hook does three things to every local raster image (a PNG or JPEG that isn't an SVG and isn't loaded from a remote URL):

1. **Converts it to WebP** at two widths, 800px and 1280px, quality 75. WebP is a modern image format that produces meaningfully smaller files than PNG or JPEG at the same visual quality — the actual win here, since the original screenshots on this blog were often 1–3MB PNGs.
2. **Builds a `srcset`** so the browser picks whichever of the two sizes fits the reader's screen, instead of always downloading the largest version.
3. **Generates a low-quality placeholder.** LQIP stands for low-quality image placeholder: a tiny, heavily compressed preview — 24px wide, WebP quality 40 — encoded directly into the HTML as a base64 data URI and shown as a blurred background while the real image loads, then swapped out once it finishes (`onload`, checking the image actually has real pixels rather than firing on a broken image).

Neither the resizing nor the srcset width, both capped at the source image's own width so a small source image never gets upscaled past its native resolution.

Two cases skip all of this on purpose. Remote images (anything with an `http://`, `https://`, or `data:` URL) pass straight through, since Hugo can't resize a file it doesn't have locally. SVGs also pass through unmodified — SVG is already a compact vector format, and converting one to a raster WebP would only make it bigger and blurrier. There's also a site-wide escape hatch, a `disableImageOptimizationMD` parameter that reverts every image on the site to the original, unconverted file, for the rare case where exact pixel fidelity matters more than page weight.

Here's the decision flow the hook actually runs, from a Markdown image reference to the final rendered figure:

```mermaid
flowchart TD
    A[Markdown image reference] --> B[render-image.html hook fires]
    B --> C{Remote URL, or local resource not found?}
    C -->|Yes| D[Plain img tag, no conversion]
    C -->|No, local resource found| E{SVG, or optimization disabled by site param?}
    E -->|Yes| D
    E -->|No| F[Responsive path]
    F --> G[Resize to 800w and 1280w WebP, quality 75, capped at source width]
    F --> H[Resize to 24px WebP, quality 40, base64-encode]
    G --> I[img src + srcset + sizes]
    H --> J[Inline background-image data URI, cleared once the real image loads]
    I --> K[Rendered figure: responsive WebP with blur-up placeholder]
    J --> K
```

Here's a real image going through that exact path, reused from an earlier post on this blog rather than a synthetic test image, so the pipeline is doing real work instead of rendering a stock placeholder:

![Docker Compose network diagram showing application containers routed through a NordVPN container via a shared network namespace, with only the VPN container publishing ports to the host](images/blog/secure-services-docker-compose-and-nordvpn/dockerComposeWithVPNDiagram.png "The Docker Compose + VPN topology from an earlier post on this blog, now served as WebP with a blur-up placeholder")

## The bug that would have shipped: images under 800px skipped WebP

Blowfish, the theme this site runs on, already had an image render hook, and the one I built started as a fork of it rather than something written from scratch. Its responsive-image logic resized to WebP only inside a conditional gated on the source image's width, and that conditional was written so images narrower than 800px fell through without ever hitting the `.Resize` call. A screenshot that happened to be, say, 600px wide would render as a plain, unconverted PNG — no WebP, no srcset, no LQIP, and no error to indicate anything had gone wrong.

I caught this during spec review, before it shipped, by deliberately testing against a narrow image instead of only the wide screenshot used elsewhere in this post. The fix was to make the WebP conversion unconditional: every local raster image gets resized to WebP now, with each target width capped at `math.Min(originalWidth, 800)` (or 1280 for the larger variant) so a small source image gets downsized cleanly and never upscaled. A conditional that silently skips work instead of erroring is invisible until someone tests the exact input it was written to exclude — this one only surfaced because the test plan called for a narrow image specifically instead of reusing the same wide screenshot every other check already covered.

## Diagrams from a plain code fence, not just a custom shortcode

Before this, the only way to add a diagram to a post was Blowfish's `mermaid` shortcode — Hugo's mechanism for calling a custom template from inside Markdown by name, wrapped around the content it applies to. It works, but it's specific to this theme. Paste the same Markdown into GitHub, or into any other Hugo site without that exact shortcode installed, and it renders as literal, broken-looking text instead of a diagram.

Mermaid — the diagramming library, not the theme feature — has a real, portable convention for this: a fenced code block tagged with the word `mermaid` as its language name, the same triple-backtick-plus-language convention you'd use for any other code block, just with `mermaid` in place of `python` or `bash`. GitHub, GitLab, and most Markdown renderers already recognize that convention natively. Hugo's code-block render hook lets this site recognize it too: `render-codeblock-mermaid.html` intercepts any fenced block tagged that way and wraps its raw content in a `<pre class="mermaid">` element — the exact markup the existing shortcode already produced, so the same CSS and the same Mermaid JavaScript runtime pick it up identically no matter which syntax wrote it. The diagram earlier in this post, the one showing the image hook's decision flow, is a real instance of that fenced block, not a mockup.

## Loading the Mermaid bundle exactly once, from either entry point

Mermaid's JavaScript runtime is a real cost — tens of kilobytes a reader's browser has to fetch and execute — so it should only load on pages that actually use it, and it should never load twice on the same page. Blowfish's theme already handled the first half of that for the shortcode: a partial checks `.Page.HasShortcode "mermaid"` and only then fetches, minifies, concatenates, and fingerprints the Mermaid library and its config into one bundle.

Rather than fork that theme file too, which would mean re-syncing it by hand on every future Blowfish update, I added a second, narrower check in a site-level partial, `extend-head-uncached.html`. It loads the same bundle only when the page's raw source contains a fenced block tagged `mermaid` *and* the shortcode is absent. That "and shortcode is absent" clause is the double-load guard: on a page that uses only the shortcode, the theme's own check already loads the bundle, so this second check backs off. On a page that uses only the fenced-block syntax, the theme's check is false (no shortcode), so this one fires instead. On a page using both — like this one — the theme's check fires and loads it, and this one backs off for the same reason as the shortcode-only case. One script tag, regardless of which syntax, or both, a given post uses.

### The old shortcode syntax still renders on the same page

The diagram below is a regression check more than content in its own right: it's written with the original `mermaid` shortcode syntax, sitting on the same page as the fenced diagram above, to confirm both entry points coexist without loading the Mermaid bundle twice or conflicting with each other.

{{< mermaid >}}
flowchart LR
    A[Shortcode entry point] --> B[Blowfish's original loader: HasShortcode check]
    B --> C[Same Mermaid runtime bundle]
    C --> D[Renders next to the fenced-block diagram above]
{{< /mermaid >}}

## Where this stands

`hugo build` runs clean across every existing post plus this one, and the build output confirms both diagrams render and the image above comes out as WebP with a srcset and a blur-up placeholder rather than a flat PNG. I also wrote real browser tests, not just a clean build, to catch a regression here automatically: they confirm the bundle loads exactly once on this page (both syntaxes present), stays absent on pages with neither, that the diagram actually renders as an SVG rather than sitting as unrendered text, that its colors really change between light and dark mode after clicking the appearance switcher, and that the LQIP placeholder clears once the real image loads rather than just being present in the markup. One gap I'm not pretending isn't there: there's still no isolated fixture anywhere on this site for "fenced block only, no shortcode" or "shortcode only, no fenced block" in separate pages — this post exercises both at once, which proves the double-load guard but not each syntax fully alone. That guard's logic is simple enough to have checked by reading the template directly, so I'm treating it as covered, not untested.
