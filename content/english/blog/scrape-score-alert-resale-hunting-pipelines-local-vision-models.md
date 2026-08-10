---
title: "Scrape, Score, Alert: Two Home-Lab Pipelines Built on Local Vision Models"
meta_title: "Local Vision-LLM Scoring for Resale Hunting: A Home-Lab Case Study"
description: "How two personal projects, an estate-sale scanner and a resale-clothing monitor, use local vision models to decide what's worth a look, what broke building them, and what running vision inference on a shared home GPU actually costs."
date: 2026-08-10T10:00:00Z
categories: [
  "Home Lab",
  "Machine Learning",
  "Software Architecture",
  "Case Study"
]
author: "Preston Bernstein"
tags: [
  "Ollama",
  "Local LLM",
  "Computer Vision",
  "SQLite",
  "TypeScript",
  "Home Lab",
  "Automation"
]
draft: false
---

I've built two personal tools that follow the same shape. Scrape listings. Run every photo through a local vision model. Decide which ones are worth my attention. Surface only those. One watches a regional estate-sale listings site for furniture and collectibles worth driving to. The other watches several resale marketplaces for clothing that matches my taste. Both are self-hosted, running on hardware I already own. Both spent more of their build time on "what counts as a match" than on the scraping itself.

This post covers that middle part, the scoring, plus two infrastructure lessons that came with it: running a vision-language model on a GPU that also has to render video games, and building a feedback loop that doesn't quietly learn the wrong thing.

## The shared pattern

Strip away the specifics and both projects are the same four stages, talking to each other through a single SQLite database instead of a message queue:

```
 [ listings site ]
        |
        v
 +--------------+     +--------------+     +----------------+     +-----------+
 |   Scrape     | --> |   Prefilter  | --> |  LLM / Vision  | --> |   Alert   |
 |  (new items) |     |  (free, no   |     |     Score      |     | dashboard |
 |              |     |   LLM cost)  |     |  (Ollama, +    |     |  / push   |
 |              |     |              |     |  cloud escala- |     |           |
 |              |     |              |     |  tion for hard |     |           |
 |              |     |              |     |  cases)        |     |           |
 +--------------+     +--------------+     +----------------+     +-----------+
        \___________________ SQLite (single writer per stage) ________________/
```

Neither project uses a job queue. A run is one process that walks through the stages in order and writes its results to disk as it goes. The next stage reads whatever the last one left behind. That's a deliberate simplification. At personal-use volume, dozens to low hundreds of listings per run, a queue buys nothing and costs a service to operate and monitor.

The interesting decisions live in the middle two boxes: what gets filtered out before it costs anything, and what the model actually gets asked to judge.

## Deciding what's worth a Saturday: the estate-sale scanner

The estate-sale scanner pulls new listings from a regional aggregator once a week, then runs every photo through a pipeline before any of them reach a paid model call:

1. **Perceptual-hash dedup.** Catches the same photo re-uploaded across listings.
2. **A quality gate.** Brightness and blur checks, cheap and CPU-only, drop photos too dark or blurry to read.
3. **A free local pre-filter.** A small local Ollama call answers PASS or SKIP on things like empty rooms, driveways, or cardboard boxes, before any money gets spent on a stronger model. It's fail-open: if the model call errors, the photo passes through anyway. An outage never suppresses a real find. It just costs more that week.
4. **Full vision analysis.** Either a local Ollama model or, for volume, a hosted GPU endpoint running a larger vision-language model.

The model gets told what I collect: quality furniture and antiques, kitsch and camp collectibles, vintage electronics. It lists each item with a maker guess, era, materials, condition, and a confidence tag:

```
Danish teak side table, likely 1960s, veneer chip on one corner [high]
Chalkware TV lamp, mid-century, black light wear on base [medium]
NOTHING
```

Plain text, not JSON. An internal comparison found the plain-text format caught meaningfully more real items than forcing the same model into strict JSON output. Worth knowing before you assume structured output is free.

**Two separate scores handle two separate jobs.** One score decides whether the rest of a sale's photos are worth analyzing at all. Process the first quarter of a sale's photos; if they come back strong, run the rest; if they come back empty, spot-check a handful from later in the listing before giving up on the sale entirely. That's pure cost control. It decides how many model calls a sale gets, not whether any single item is good. A second, separate score, built from a curated brand list, era keywords, and the model's own confidence tag, is what the dashboard actually sorts by. The budget heuristic optimizes for not wasting calls on a dead sale. The display score optimizes for what to look at first. Conflating the two would have made cheap sales look worse than they are.

**The anti-overfit piece is the feedback loop, and it's asymmetric on purpose.** After visiting a sale, I log an outcome: good, meh, or waste. A "waste" outcome propagates in bulk. Every photo from that sale becomes a confirmed-negative training example, because "the whole sale was junk" is a clean, complete signal. A "good" outcome does not auto-label every photo in the sale as good. It only proves something there was worth it, not which item. Auto-labeling the whole sale would teach a future ranker that the box of tube socks next to the good chair was also desirable. Positive labels only get created when I tap the specific item that earned the trip. It's slower to build a clean positive set this way, but a small, correct one beats a large, contradictory one.

There's also a real ground-truth run behind the scenes. Occasionally I run every surviving photo from a batch of sales through the strongest model available, no sampling, no budget limit, and treat that as the reference answer. Comparing a cheaper run's recall against that reference is how I picked a monthly spend target instead of guessing at one.

## Deciding what fits: the resale monitor

The resale monitor is a full TypeScript monorepo watching several secondhand clothing marketplaces for items matching my aesthetic. Its pre-filter is a set of deterministic rules that runs before any model call: a fast-fashion brand blocklist, a per-brand minimum plausible price (a "designer" item priced far below that floor is usually a knockoff), and a price ceiling by category. Together those three rules eliminate roughly 40 to 60 percent of raw listings for free.

One deliberate choice: size is never a hard-reject rule. Sizing across resale platforms is too unreliable to gate on mechanically. Brands run differently, cuts vary, sellers mislabel. Instead of a brittle "reject anything not size L" rule, the raw size text and any stated measurements get passed to the model as a soft signal, with instructions that measurements in the description always override the label.

Scoring is two passes. Every new listing (title, brand, a truncated description, price, condition, size) goes through a local model first, batched 15 to 20 listings per call. That range matters: fewer wastes the fixed cost of the system prompt, and past roughly 30 the model's attention starts to degrade. The model returns a verdict, YES, MAYBE, or NO, broken into three independent dimensions (quality, value, aesthetic) plus a separate size read. Only listings that come back MAYBE and have a usable image go to a second pass with a vision-capable model. A MAYBE with no resolvable image just stays a MAYBE and still gets surfaced, at lower confidence, rather than getting silently dropped. A parse error or malformed model output defaults the same way. The design bias throughout: missing a genuinely good item is worse than one extra alert I dismiss in two seconds.

The provider for each pass, local, cloud, or a hybrid, sits behind one interface, so which backend actually runs a given scoring pass is a config change, not a code change. Once a listing has a real score, it's never re-scored. That alone is the single biggest cost reduction in the pipeline, ahead of anything model-related.

**Calibration here is a feedback loop that grows into the prompt itself.** Every run, the system prompt gets appended with a rotating set of my most recent thumbs-up and thumbs-down reactions to past alerts. The effect is staged: under 10 feedback events, nothing measurable; 10 to 25, a noticeable improvement; 25 to 50, strong calibration. Past 50, the oldest examples age out in favor of recent ones. Separately, I can hand-write known-good and known-bad example items directly into config. Those never rotate out, and exist so the system has some ground truth before a single real alert has fired.

## Running vision models on a shared GPU

Both pipelines lean on the same home-lab constraint: one GPU, shared with everything else that machine does, including gaming and media transcoding. That constraint shapes the architecture more than almost anything else.

Running the strongest available vision model on every image, unthrottled, priced out at ten to twenty times a reasonable monthly budget. Running everything locally on the home GPU instead worked, but a full unbounded pass over a week's photos took on the order of a day, on a machine other people in the house wanted to use in the meantime. Neither was acceptable. That's the actual reason both projects ended up with a tiered cascade instead of calling the best model on everything: cheap local checks first, a stronger model only on what survives, and an optional even-stronger model reserved for genuinely ambiguous cases.

Fitting a large vision model onto a consumer-class GPU has its own failure mode. The full-precision checkpoint of one candidate model didn't fit and left the worker in a permanently unhealthy state, until I switched to an FP8-quantized build of the same model, which loaded cleanly. Serverless GPU workers that scale to zero when idle, the thing that keeps cost near zero between runs, carry a real cold-start cost too. One backend took roughly eight minutes to spin up from cold, against a hardcoded two-minute timeout on the client side. The result was a guaranteed failure on the first image of every single run, and it stayed that way until someone timed the cold start directly instead of assuming a fixed timeout was generous enough.

Neither Ollama instance gets addressed directly by IP in either codebase anymore. Both pipelines read a plain environment variable for wherever inference happens to be running. That decision paid off the first time I moved the GPU host.

## What broke

A few incidents are worth remembering past the fix.

**A filter that looked like it worked and did nothing.** The estate scanner's free pre-filter asks a model to answer with exactly one word, PASS or SKIP, within a small token budget. The model in use is reasoning-tuned. It spends part of that budget thinking before it answers, and at the original budget it never got past its own reasoning. Every single call came back with an empty response. Because the fail-open logic treats anything that isn't literally SKIP as a pass, the gate silently passed everything, every time, for an unknown stretch, with no errors and no crashes to flag it. Fixed by raising the token budget and telling the model explicitly to skip its reasoning step. The lesson traveled: it's now the first thing checked whenever either project swaps in a new model.

**A scan that failed completely and reported success.** Per-image failures in the estate scanner were counted internally but never surfaced anywhere or reflected in the run's exit status. A week where every single paid vision call failed still logged "scan complete, 0 findings" and exited clean, indistinguishable from a genuinely quiet week, despite real money spent on every failed call. The fix split "found nothing" into three honest, differently-alarmed outcomes: genuinely nothing found, the source site's page structure likely changed, or the vision backend failed enough calls that the count can't be trusted.

**A split-brain database.** For a period, the estate scanner ran its weekly scan on one machine and served the dashboard from a different one, each with its own separate copy of the same SQLite file. The dashboard was quietly showing stale results relative to what the last real scan had actually found, with nothing anywhere to flag that the two had diverged. Fixed by consolidating both onto a single always-on host. The kind of bug that's obvious in hindsight and invisible while it's happening.

**An alert-channel migration that outran itself.** The resale monitor's alerts and feedback originally rode the same channel: a chat bot where a thumbs-up or thumbs-down tap wrote straight back to the feedback table, no extra infrastructure needed. When the design changed to stop depending on that bot's webhook, the alert transport got swapped to a self-hosted push service in one large change. But the feedback-ingestion path got gutted down to a disabled stub with no replacement wired up yet, while the docs of record still described the old bot. For a stretch, the code, the deployment config, and the docs each told a different story about how alerts and feedback worked, and the system's only learning mechanism sat fully severed with no error to say so. The fix restored feedback through a proper API endpoint on the dashboard instead of a chat bot's callback. More infrastructure, but no longer coupled to one channel's willingness to keep supporting inline buttons.

The common thread in all four: nothing crashed. Every one of these was a component that kept running, kept looking healthy from the outside, and just quietly stopped doing its job. That's a more dangerous failure mode than a crash, because nothing prompts you to go look.

## What I'd tell someone building this next

Split the cheap filters from the expensive ones, and put as much rejection as possible in the cheap layer: a regex, a price check, a brightness threshold. It saves money, and it means a paid-tier outage or a slow week won't stall your entire pipeline, since the free layer already did most of the work.

Keep the metric that controls spend separate from the metric a human reads. They optimize for different things. Conflating them makes the system's actual value judgments illegible even to you.

Treat "no findings" as a claim that needs evidence, not a default. A silent failure and a genuinely quiet week produce the exact same log line unless you go out of your way to make them look different. The failure is the one that costs you money without telling you.

Test your fail-open paths specifically. A gate that fails open does you no good if the thing it fails into is silently passing everything through. You find that out from a careful log read, not from an error report, because there isn't one.
