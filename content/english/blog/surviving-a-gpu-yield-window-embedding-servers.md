---
title: "No Embedding Server Survives a GPU Yield Gracefully. I Had to Build That Layer Myself"
meta_title: "GPU-Yield Tolerance for Embeddings: What Ollama, TEI, and llama.cpp Don't Do"
description: "Ollama, TEI, Infinity, and llama.cpp all reject requests when the GPU disappears. My broker parks embedding requests up to 600s and replays them after a yield."
date: 2026-08-10T11:05:00Z
lastmod: 2026-08-15T13:24:15Z
categories: [
  "Home Lab",
  "Machine Learning",
  "Software Architecture"
]
authors: ["preston-bernstein"]
tags: [
  "Ollama",
  "Home Lab",
  "GPU",
  "LLM Infrastructure"
]
draft: false
featureimage: "/images/gigabyte-rtx-3090-eagle-oc-gpu.jpg"
showHero: true
---

Every embedding server I tested handles a vanished GPU the same way: queue requests until a buffer fills, then reject them. Ollama does this. TEI does this. Infinity and llama.cpp do it too, with different buffer sizes and different error codes but the same outcome. None of them pause a request and wait out a short outage; they drop it the moment the queue overflows or a limit is hit.

I run one GPU at home across gaming, media transcoding, and every local model behind my personal tools, and a broker process decides who gets the card and when. That gap between reject-fast and wait-it-out is what forced me to build the missing layer myself. Nobody else was going to pause a request while my GPU stepped away to render frames for a game instead.

## The shared GPU has to change hands, and that's the actual problem

My home GPU juggles three tiers of work:

- **Interactive chat**: needs an answer in seconds.
- **Batch jobs** like embeddings: can tolerate a delay.
- **Long-running jobs**: can wait minutes.

A broker I run arbitrates between them (the same broker whose [phantom-game detection bug got its own post](/blog/debugging-false-positive-gpu-contention-detection/)). When gaming or a higher-priority job needs the card, the broker yanks it away from whatever lower-priority work was using it.

That yield might last a few seconds, or a couple of minutes. Nothing about the GPU itself failed. It's just busy elsewhere for a bounded window, and any request caught mid-flight has to survive that window instead of dying because of it.

## No shipping server treats a busy GPU as temporary

I went looking for prior art before writing a line of this. The pattern held across every tool I checked:

- [Ollama's queue](https://docs.ollama.com/faq) (`OLLAMA_MAX_QUEUE`, default 512) holds requests FIFO and returns a 503 once it's full.
- [TEI's `--max-concurrent-requests` flag](https://huggingface.co/docs/text-embeddings-inference/en/cli_arguments) is explicit reject-fast backpressure by design.
- Infinity and llama.cpp follow the same logic with their own limits.

All of them treat a full queue as a hard stop rather than something to wait out. That's a reasonable default for a public-facing server fielding requests from strangers. It's the wrong default for a private broker that knows exactly why the GPU is unavailable and roughly how long the wait will be.

## LightRAG has no protection of its own, so it has to come from below

I run LightRAG for a knowledge-graph project ([the same one whose ingestion concurrency I tuned separately](/blog/tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits/)). It talks straight to an embedding backend with no retry logic and no backpressure of its own. The maintainers' fix for slow embed calls is to set `TIMEOUT=None` and disable the timeout entirely, rather than add retries.

Three separate open issues track embed failures during batch ingest across different backends, and one traces directly to an embed call timing out mid-ingest. None of that gets fixed inside LightRAG. Whatever protection exists has to sit underneath it, in whatever actually talks to the GPU. That's why this logic belongs in the broker instead of waiting on some upstream project to add it.

## litellm's Router solves a different problem than mine

The closest thing to a real solution I found was [litellm's Router](https://docs.litellm.ai/docs/routing), which supports fallback, cooldown, and timeout configuration for embedding calls. It's a useful primitive I'd reach for if I ever wanted a second embedding backend to fail over to. But its timeout wraps the entire call including retries, rather than each individual attempt inside it. Backend selection is what it solves. Waiting for one backend to come back online is a different problem.

I also checked two open-source Ollama proxies: Olla (roughly 260 stars, actively maintained) and ollamaMQ (roughly 114 stars, a fair-share queue proxy written in Rust). Both are solid queueing and failover tools. Neither parks a request through an outage and replays it once the outage ends. That's the specific behavior I needed, and nothing I found already did it.

## The fix: park requests instead of rejecting them

The fix lives in the fronting proxy inside my broker, one layer above Ollama. When a yield starts, batch-class synchronous requests (in practice, embeddings) get **parked** instead of bounced:

- **Hold bound**: 600 seconds by default.
- **Parked-queue ceiling**: past it, the broker returns a fast 503. That's the same reject-fast principle TEI already applies, just moved up a layer instead of reinvented.
- **Replay**: when the yield ends, parked requests replay in FIFO order with a cap on how many go out at once, so the queue doesn't dump a burst back onto Ollama the instant the GPU returns.
- **Metrics**: Prometheus gauges for parked depth, time spent parked, and replay outcomes, plus an alert rule. TEI already treats queue depth as worth exposing, so I didn't see a reason to do less.

{{< alert icon="circle-info" >}}600 seconds is comfortably under LightRAG's own 1200-second embedding timeout, so a parked request never expires on the caller's side while it's still waiting on mine.{{< /alert >}}

The path a request takes once a yield starts:

```mermaid
flowchart LR
    A[Embedding request arrives] --> B{GPU yielded to<br/>higher-priority work?}
    B -->|No| C[Serve immediately]
    B -->|Yes| D{Parked queue below cap?}
    D -->|No| E[Fast 503, reject]
    D -->|Yes| F[Park request, up to 600s]
    F --> G[Yield ends]
    G --> H["Replay parked requests FIFO,<br/>capped rate"]
```

Whether 600 seconds is the right number, I'm honestly not sure. It's tuned to my current yield patterns. If a yield ever runs long for a reason the broker doesn't already know about, that bound will need to move.

## I haven't turned on the CPU fallback I built

There's an obvious alternative to parking: fall back to a CPU-based embedding model during a yield instead of making anything wait. That path is built, but I'm leaving it off by default.

{{< alert >}}I don't trust CPU fallback as a silent switch. I've seen it misbehave unpredictably, and a LightRAG issue reports CPU-only embedding backends behaving badly specifically inside LightRAG's pipeline, well beyond just running slow.{{< /alert >}}

Before I flip that flag on, I want to smoke-test it through LightRAG's actual embedding function, the real call path it uses during ingest. A prompt-response check alone won't tell me enough. A silent, unverified fallback is worse than an honest wait.

## Next: proving the parking logic survives a real embed burst

The parking logic passes against requests I send it directly, one at a time. What it hasn't seen yet is a forced yield in the middle of a real embed burst. That's the exact failure mode this whole thing exists to survive, and the test is next:

1. Trigger a yield artificially while LightRAG is mid-ingest.
2. Confirm zero failures on the caller's side.
3. Add it to the broker's regression suite so it can't quietly break later.

Until that runs, this is a design I believe in, not one I've fully verified under load.

Running an embedding server behind a shared GPU at home? Check for this gap yourself. Query your server's own queue limit, and ask what happens to a request sitting in that queue when the GPU it's waiting on disappears for reasons the server itself doesn't control. In every server I checked, the answer was the same: it dies.

Mine doesn't anymore. The GPU still steps away for gaming whenever gaming wins the tiebreak, and that's fine. That's what the burst test above will decide. If it turns up a problem, the 600-second bound moves before I let this run unattended.
