---
title: "Scrape, Score, Alert: The Pattern Behind Two Home-Lab Vision Pipelines"
meta_title: "Local Vision-LLM Pipeline Architecture: A Home-Lab Case Study, Part 1"
description: "Part 1 of 3. An estate-sale scanner and a resale-clothing monitor run on the same architecture: one SQLite-only pipeline, one shared GPU. What that shared foundation looks like, and the two decisions in it I'm not fully sure were right."
date: 2026-08-10T10:00:00Z
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
  "Computer Vision",
  "SQLite",
  "TypeScript",
  "Home Lab",
  "Automation"
]
draft: false
---

Two personal tools I've built, an estate-sale scanner and a resale-clothing monitor, run on the exact same architecture: scrape listings, score every photo with a local vision model, surface only the ones worth my attention. This post covers that shared foundation, one SQLite-only pipeline and one shared GPU, and the two decisions in it I'm still not fully sure were right. Two follow-ups go deep on how each project decides what actually counts as a match: [Deciding what's worth a Saturday](/blog/deciding-whats-worth-a-saturday-estate-sale-scanner/) for the estate-sale scanner, and [Deciding what fits](/blog/deciding-what-fits-resale-clothing-monitor/) for the resale monitor.

## One pipeline, two projects, no message queue

Both projects are the same four stages, talking to each other through a single SQLite database instead of a queue:

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

A run is one process that walks through the stages in order and writes its results to disk as it goes, and the next stage reads whatever the last one left behind. I'd defend that against anyone who reflexively reaches for a queue on a hobby project this size; at dozens to low hundreds of listings per run, a queue buys nothing and costs a service to operate and monitor. I don't think the choice is free, though. The first time I want two scrapers writing to the same SQLite file at once, or want one stage to retry independently of the one before it, this is the design that starts to hurt. I haven't hit that yet. I expect I will.

What differs between the two projects is entirely inside the middle two boxes, what gets filtered out before it costs anything, and what the model actually gets asked to judge. That's what the next two posts cover.

## One shared GPU forces the same cost tradeoff on both projects

Both pipelines lean on the same home-lab constraint: one GPU, shared with everything else that machine does, including gaming and media transcoding. That constraint shapes the architecture more than almost anything else.

The strongest available vision model, run on every image unthrottled, priced out at ten to twenty times a reasonable monthly budget. The obvious alternative, running everything locally on the home GPU, worked, but a full unbounded pass over a week's photos took on the order of a day, on a machine other people in the house wanted to use in the meantime. Neither was acceptable, and that's the actual reason both projects ended up with a tiered cascade instead of calling the best model on everything: cheap local checks first, a stronger model only on what survives, and an optional even-stronger model reserved for genuinely ambiguous cases.

Fitting a large vision model onto a consumer-class GPU has its own failure mode. The full-precision checkpoint of one candidate model didn't fit and left the worker in a permanently unhealthy state, until I switched to an FP8-quantized build of the same model, which loaded cleanly. Serverless GPU workers that scale to zero when idle, the thing that keeps cost near zero between runs, carry a real cold-start cost too. One backend took roughly eight minutes to spin up from cold, against a hardcoded two-minute timeout on the client side. The result was a guaranteed failure on the first image of every single run, and it stayed that way until someone timed the cold start directly instead of assuming a fixed timeout was generous enough.

Neither Ollama instance gets addressed directly by IP in either codebase anymore. Both pipelines read a plain environment variable for wherever inference happens to be running. That decision paid off the first time I moved the GPU host.

## What's next

The scoring logic, the part that actually decides what's worth flagging, is different enough between the two projects that it doesn't fit here. [Part 2](/blog/deciding-whats-worth-a-saturday-estate-sale-scanner/) covers the estate-sale scanner's asymmetric feedback loop, where a bad sale and a good sale teach the system very different things. [Part 3](/blog/deciding-what-fits-resale-clothing-monitor/) covers the resale monitor's two-pass scoring and a false-positive bias I haven't fully stress-tested.
