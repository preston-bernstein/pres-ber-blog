---
title: "Tuning LightRAG Ingestion Concurrency Against a Rate-Limited Gemini API"
meta_title: "LightRAG + Gemini: Concurrency Tuning Without Silent 429 Failures"
description: "Ingesting a large, entity-dense document corpus into LightRAG through Gemini hit a wall of silent 429 failures. The fix wasn't more concurrency. It was one wrong batch setting and a proxy that could absorb overshoot instead of dropping documents."
date: 2026-08-10T11:10:00Z
categories: [
  "Machine Learning",
  "Software Architecture",
  "Home Lab"
]
authors: ["preston-bernstein"]
tags: [
  "RAG",
  "LightRAG",
  "LLM Infrastructure",
  "Rate Limiting"
]
draft: false
---

Feeding a few hundred books into LightRAG through Gemini taught me that concurrency tuning is the wrong first lever, and the rate-limit table you'd normally tune it against doesn't exist anymore anyway. I run a personal knowledge-graph project that ingests close to a thousand book-length documents through [LightRAG](https://github.com/HKUDS/LightRAG) (HKUDS), using Gemini for entity extraction and embeddings behind a LiteLLM proxy. The corpus is entity-dense enough that the LLM merge phase dominates ingestion time, and early runs kept marking documents FAILED with no obvious cause in the LightRAG logs. This post covers what I found chasing that down: the actual concurrency knobs, why Gemini's rate limits are a moving target now, and the one setting that mattered more than any of it.

## A 429 in LightRAG doesn't retry, it fails the document

The failure mode is quiet and that's what makes it dangerous. When a Gemini call returns HTTP 429, LightRAG doesn't queue the document and try again later. It marks the document FAILED and moves on. Nothing crashes, nothing pages you, and unless you're watching the per-document status table you won't notice until the corpus finishes and a chunk of it is just missing from the graph. On my first real run against this corpus, that's exactly what happened: documents disappeared from the pipeline in a way that looked like success from a distance.

## LightRAG's own tuning knobs assume a ratio, not a rate

LightRAG exposes four environment variables that govern ingestion concurrency, and reading the source is more reliable than trusting the docs prose. `MAX_ASYNC_LLM` sets the number of concurrent LLM calls (extraction, merge, keyword generation, answer synthesis) and defaults to 4. `MAX_PARALLEL_INSERT` sets how many documents get processed in parallel, defaults to 3, and LightRAG's own `env.example` recommends keeping it near `MAX_ASYNC_LLM / 3`. `EMBEDDING_FUNC_MAX_ASYNC` governs concurrent embedding calls on a separate pool from the LLM pool, default 8. `EMBEDDING_BATCH_NUM` sets how many chunks get bundled into one embedding request, default 10.

The project's documented high-throughput profile is `MAX_ASYNC_LLM=8, MAX_PARALLEL_INSERT=3, EMBEDDING_FUNC_MAX_ASYNC=16, EMBEDDING_BATCH_NUM=32`, and a real-world test on GitHub (issue #2264) using a similar profile took ingestion from 7 hours 8 minutes down to 1 hour 45 minutes on the same corpus. That's a legitimate 4x. But that ratio describes how LightRAG should divide work internally. It says nothing about how much total work your Gemini project is allowed to accept per minute, and that ceiling is the one that actually throws the 429s.

## Gemini's rate limit isn't a table you can hardcode anymore

Google stopped publishing a static per-model rate-limit table as of July 2026. The docs now say limits depend on your project's usage tier and are "not guaranteed," which in practice means you read the live number out of AI Studio for your specific project before you tune anything. That was a real adjustment for me: I'd been treating rate limits like a spec you design against once, and they're now closer to a runtime condition you have to check. Free and early-tier flash access is often in the 10-15 RPM range, which makes `MAX_ASYNC_LLM=8` from the "official" profile actively dangerous rather than aspirational. There's also a second, independent limiter on paid tiers: a spend-based burst cap over a rolling 10-minute window, separate from the RPM/TPM ceiling. You can be well under your requests-per-minute limit and still get 429'd by the burst cap.

The derivation that actually holds up: set `MAX_ASYNC_LLM` to roughly your live RPM times average call latency in seconds, divided by 60. Flash's latency runs 1-3 seconds per call, so a 10 RPM tier caps you at 2-4 concurrent calls, while a paid tier with thousands of RPM lets you approach the documented profile. Everything else (insert parallelism, embedding pool size) derives from that number, not the other way around. Tune to the ratio first and you're tuning against a number that doesn't reflect your actual ceiling.

## The single highest-leverage fix wasn't concurrency at all

My container had `EMBEDDING_BATCH_NUM` set to 2, a leftover from an earlier era when embeddings ran on a local GPU model instead of Gemini's hosted embedding API. Against a local model, batch size barely matters. You're not paying per request. Against a rate-limited cloud API, a batch size of 2 versus the recommended 32 means sixteen times more embedding requests for the exact same corpus, which is sixteen times more pressure on the embedding RPM ceiling for zero benefit. Fixing that one line did more for my 429 rate than any concurrency change did, and it carried no downside: same total work, dramatically fewer requests. If you're moving a LightRAG setup from a local embedder to a cloud one, check this value before touching anything else.

GitHub issue #1648 is a useful reality check here too: someone running a 50,000-document ingest with a conservative embedding concurrency of 5 still hit 429s on the embedding service. Low concurrency reduces the odds of hitting a ceiling, but it doesn't eliminate them, because a single misconfigured batch size can undo the benefit of a conservative concurrency setting entirely.

## The proxy layer should absorb overshoot, not let it fail documents

Concurrency limits are a best-effort guess at the ceiling, and best-effort guesses are sometimes wrong. The fix isn't guessing more precisely, it's making the failure mode survivable when you guess wrong. LiteLLM's router supports `rpm` and `tpm` caps per model in its `model_list`, and if you don't set `max_parallel_requests` explicitly it derives concurrency from those numbers automatically. It also supports a `retry_policy` with a dedicated `RateLimitErrorRetries` count, separate from timeout or server-error retries, which is the setting that actually matters here: a 429 that hits LiteLLM with that policy configured gets retried with backoff instead of surfacing as an error LightRAG has to interpret. Set those caps to your project's real live limits, add the retry policy, and a burst that exceeds your ceiling turns into a delayed request instead of a failed document. Without that layer, every concurrency tweak is a bet that you never overshoot, and eventually you will.

One caveat if you run LiteLLM with multiple worker processes: rpm/tpm counters need to be backed by Redis to be shared across workers, or each worker enforces the cap independently and your real aggregate concurrency against Gemini is a multiple of what you configured. I haven't needed multi-worker LiteLLM for this corpus size, so I can't speak to how much that matters in practice, but it's a documented gap worth knowing about before you scale up.

## What I'd push back on in my own conclusion

The uncomfortable part of this whole exercise is that the "optimal ratio" LightRAG documents is close to useless without knowing your live rate limit first, which makes it feel like the wrong thing to have started with. I could argue I wasted time reading `env.example` in detail when the real fix was one line in a docker-compose file. I don't think that's quite right, though. The ratio still matters once you know your ceiling, because it tells you how to divide a fixed budget of concurrent calls between insertion and embedding rather than just picking a number. What I'm genuinely unsure about is whether the entity-merge phase's partial serialization (the same GitHub issue that got the 4x speedup also noted the GPU sat underutilized because merge logic doesn't fully parallelize) is a bigger long-term bottleneck than rate limits for a corpus this size. I haven't run the numbers on a from-scratch full reingest with the fixed batch size and proxy guardrails in place, so that's a real open question, not a settled one.

If you're running LightRAG against any rate-limited cloud LLM, check three things before you touch a single concurrency variable: your embedding batch size, your provider's live rate limit for your actual tier, and whether your proxy retries 429s or just lets them through. Concurrency tuning is the part that feels like engineering. Getting those three right is the part that actually stops documents from silently failing.
