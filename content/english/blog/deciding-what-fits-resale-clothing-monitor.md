---
title: "Deciding What Fits: Inside My Resale-Clothing Monitor"
meta_title: "Resale Monitor Two-Pass LLM Scoring and False-Positive Bias: A Home-Lab Case Study, Part 3"
description: "Part 3 of 3: the resale monitor rejects 40-60% of listings with free rules before any model call, and its false-positive bias still has no counterweight."
date: 2026-08-10T10:10:00Z
lastmod: 2026-08-11T20:34:13Z
categories: [
  "Home Lab",
  "Machine Learning",
  "Software Architecture",
  "Case Study"
]
authors: ["preston-bernstein"]
tags: [
  "Ollama",
  "Local LLM",
  "TypeScript",
  "Home Lab",
  "Automation"
]
draft: false
featureimage: "/images/resale-clothing-monitor-thrift-rack.jpg"
showHero: true
---

My resale-clothing monitor's hardest problem isn't finding new listings. It's deciding which ones fit my taste well enough to interrupt me over, and the design leans hard toward **false positives over false negatives**, a call I can defend today but haven't actually stress-tested.

Three posts make up this series: [part 1](/blog/scrape-score-alert-resale-hunting-pipelines-local-vision-models/) covers the shared architecture, [part 2](/blog/deciding-whats-worth-a-saturday-estate-sale-scanner/) covers a sibling project, an estate-sale scanner, running on the same foundation, and this is the third.

## A free rules layer rejects most listings before any model sees them

The monitor watches several secondhand clothing marketplaces. Before any model ever sees a listing, a pre-filter of deterministic rules runs first:

- A fast-fashion brand blocklist.
- A per-brand minimum plausible price (a "designer" item priced far below that floor is usually a knockoff).
- A price ceiling by category.

{{< alert icon="circle-info" >}}Those three rules eliminate roughly 40 to 60 percent of raw listings for free, before any model call.{{< /alert >}}

**Size is never a hard-reject rule**: sizing across resale platforms is too unreliable to gate on mechanically.

- Brands run differently.
- Cuts vary.
- Sellers mislabel.

So instead of a brittle "reject anything not size L" rule, the raw size text and any stated measurements get passed to the model as a soft signal. Measurements in the description always override the label.

## Scoring is two passes, and only the ambiguous cases get the expensive one

Every new listing goes through a local model first, batched 15 to 20 listings per call. Each listing carries:

- Title
- Brand
- A truncated description
- Price
- Condition
- Size

That batch range matters: fewer wastes the fixed cost of the system prompt, and past roughly 30 the model's attention starts to degrade.

The model returns a verdict, YES, MAYBE, or NO, across three independent dimensions (quality, value, aesthetic), plus a separate size read.

Only listings that come back MAYBE and have a usable image go to a second pass with a vision-capable model. But a MAYBE with no resolvable image isn't dropped: it stays a MAYBE and surfaces at lower confidence. A parse error or malformed model output defaults the same way.

The provider for each pass, local, cloud, or a hybrid, sits behind one interface, so which backend runs a given scoring pass is a config change, not a code change.

Once a listing has a real score, it's **never re-scored**. That alone is the single biggest cost reduction in the pipeline, ahead of anything model-related.

Here's the scoring pipeline a listing moves through:

```mermaid
flowchart TD
    A[New listing] --> B{"Rules pre-filter:<br/>brand blocklist, price floor/ceiling"}
    B -->|Rejected, 40-60%| C[Discarded, free]
    B -->|Passed| D[Local model, batched 15-20/call]
    D --> E{Verdict per dimension}
    E -->|NO| C
    E -->|YES| F[Surfaced as alert]
    E -->|MAYBE + usable image| G[Vision model, second pass]
    E -->|MAYBE, no image| H[Surfaced at lower confidence]
    G --> F
```

## The bias toward false positives has no counterweight yet

Missing a genuinely good item is worse than one extra alert I dismiss in two seconds. For a system with one user and nothing riding on a bad alert, I still think that's the right call.

But it doesn't push back against alert volume creeping up as more edge cases land in MAYBE instead of NO over time, and **nothing in the current design notices that drift or corrects for it**. If this ever had to serve more than one household, that gap would be the first thing I'd have to actually solve instead of shrug at.

## Feedback splits into two tiers with different lifespans

Every run, the system prompt gets appended with a rotating set of my most recent thumbs-up and thumbs-down reactions to past alerts. The effect is staged:

- Under 10 feedback events: nothing measurable.
- 10 to 25: a noticeable improvement.
- 25 to 50: strong calibration.
- Past 50: the oldest examples age out in favor of recent ones.

Separately, I can hand-write known-good and known-bad example items directly into config. Those **never rotate out**, and exist so the system has some ground truth before a single real alert has fired.

## One migration broke three things at once, silently

The incident I'd flag hardest here broke silently across three places at once. The monitor's alerts and feedback originally rode the same channel: a chat bot where a thumbs-up or thumbs-down tap wrote straight back to the feedback table, no extra infrastructure needed.

When the design changed to stop depending on that bot's webhook, the alert transport got swapped to a self-hosted push service in one large change. But the feedback-ingestion path got gutted down to a disabled stub with no replacement wired up yet, while the docs of record still described the old bot.

{{< alert >}}For a stretch, the code, the deployment config, and the docs each told a different story about how alerts and feedback worked, and the system's only learning mechanism sat fully severed with no error to say so.{{< /alert >}}

The fix: a proper API endpoint on the dashboard, no more depending on a chat bot's callback.

## Where both projects' open questions actually meet

Both this project's MAYBE-drift and the estate scanner's cascade-complexity doubt (in [part 2](/blog/deciding-whats-worth-a-saturday-estate-sale-scanner/)) share a shape I didn't notice until writing all three of these posts back to back: **every incident across both systems announced itself eventually**, through a dashboard that looked stale or a log that looked suspiciously clean. Neither open question has that kind of tell.

Two things wouldn't announce themselves at all:

- Alert volume creeping up over months as more edge cases land in MAYBE instead of NO.
- A feedback loop gradually reinforcing a preference I don't actually hold anymore.

I'd have to notice it myself, on some Saturday, looking at a list that feels a little worse than it used to for reasons I can't immediately name. I haven't built anything that would catch it sooner than that, and I don't have a good reason why not beyond not having hit it yet.
