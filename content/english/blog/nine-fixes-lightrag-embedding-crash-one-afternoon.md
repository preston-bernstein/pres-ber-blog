---
title: "It Took Nine Fixes to Stop a LightRAG Crash. The First Eight Were All Real Bugs"
meta_title: "Debugging a LightRAG + Ollama Embedding Crash: Eight Real Fixes, One Root Cause"
description: "Eight real fixes didn't stop a LightRAG crash. The host NAS was out of memory, 5GB deep in swap, stalling network I/O; the real fix was moving the workload."
date: 2026-08-10T11:15:00Z
lastmod: 2026-08-11T20:34:13Z
categories: [
  "Machine Learning",
  "Software Architecture",
  "Home Lab"
]
authors: ["preston-bernstein"]
tags: [
  "RAG",
  "LightRAG",
  "Ollama",
  "Debugging"
]
draft: false
---

A bulk-reprocess job against one of my LightRAG instances crashed three times in one afternoon, and I shipped eight legitimate fixes before I found the actual cause. That same afternoon I'd also fixed [a false-positive bug in the GPU broker](/blog/debugging-false-positive-gpu-contention-detection/) that arbitrates my home GPU between gaming and local inference. The two bugs had nothing to do with each other. They just happened to land on the same day, which made it tempting at first to blame one on the other. I want to walk through the LightRAG crash specifically, because the honest version of this story is that most of my fixes were correct and still didn't solve it.

## The crash looked like a concurrency problem, and the first fix was one

[LightRAG](https://github.com/HKUDS/LightRAG) is a knowledge-graph pipeline I run against a local Ollama embedding backend for a personal research project. I'd triggered its `reprocess_failed` endpoint against an 800-document backlog, and it kept dying with the same signature: an `httpx.ReadError`, then `IndexFlushError`, then `Pipeline halted`, cascading the entire in-flight batch to failed. A stray backup file on disk showed that an earlier session had quietly raised `MAX_ASYNC` and `MAX_PARALLEL_INSERT` from 1 to 4, chasing throughput without realizing it would destabilize a local embedding backend. Community guidance backs this up directly: parallel-insert should stay well under async concurrency, not equal to it, and that gap matters more against a local model than a cloud API. ([The same knobs, tuned against a rate-limited cloud API instead](/blog/tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits/), got a post of their own.) I reverted both to 1. It was a real bug that had probably been causing failures for a while. It was not the crash.

## Reverting concurrency didn't stop the crash, so I chased connections next

The next run survived sixteen minutes instead of failing instantly, then died with a different-looking error: a stale connection reused after going dead. I added explicit idle timeouts on both sides of my broker's HTTP handling. Along the way I found a second real bug: Ollama's embedding model was cold-starting every seven to twelve minutes because idle gaps between embedding bursts routinely exceeded [its five-minute keep-alive default](https://docs.ollama.com/faq), and every one of those reloads was hitting a missing ROCm library file on my GPU. I set a sixty-minute keep-alive to stop the reload cycling entirely. Both fixes were correct diagnoses of real problems. The crash came back anyway, at almost the same elapsed time, on a different document.

## Three more fixes addressed real mechanisms and still didn't touch the cause

I kept narrowing. A retry layer for connection-level failures on the broker's outbound leg was real hardening, but the retries never fired, meaning the failure wasn't happening on that leg at all. Removing an inbound idle timeout I'd added earlier, once I realized it was closing connections during LightRAG's own multi-minute merge phases rather than protecting against staleness, was a legitimate correction that stayed reverted. Disabling connection reuse entirely on the broker's batch server, so every request got a fresh TCP connection, was also real and also didn't change the outcome. By fix eight I'd addressed concurrency, idle timeouts, a GPU driver bug, retry logic, and connection reuse, and the job still died in a seventeen-to-thirty-seven-minute window every time. That consistency, regardless of which mechanism I'd just changed, was the actual clue. Something systemic was setting the clock, not the code I kept adjusting.

Here's the shape of the whole afternoon, eight real fixes deep before the actual cause showed up:

```mermaid
flowchart TD
    A[Bulk reprocess job crashes] --> B[Fix 1: revert concurrency 4 to 1]
    B --> C[Crash persists, 16 min instead of instant]
    C --> D[Fixes 2-3: idle timeouts, 60min keep-alive]
    D --> E[Crash persists, same 17-37min window]
    E --> F["Fixes 4-8: retry logic, timeout removal,<br/>connection-reuse disabled"]
    F --> G[Crash STILL persists, same window every time]
    G --> H["Checked the host directly:<br/>NAS at &lt;500MB free, 5GB+ in swap"]
    H --> I["Real cause: host OOM stalling network<br/>under memory pressure, not the app"]
    I --> J[Real fix: moved the workload<br/>to a host with headroom]
```

## The real cause was the host running out of memory, not the application

Checking the NAS's own resource state directly settled it. The box had 7.7GB of RAM, roughly 38 Docker containers running on it, and under 500MB genuinely free during a live run, with over 5GB in swap and the kernel's swap-reclaim daemon burning real CPU. LightRAG's own footprint was tiny, under 1.5GB, but it didn't need to be large to get caught in the crossfire. Under that kind of sustained memory pressure, the kernel can stall a process's network handling unpredictably, and from either endpoint's perspective that looks exactly like the other side vanished mid-response. No exception in my code, no crash log on Ollama's side, nothing to grep for. Every timing and connection fix I'd shipped was chasing a symptom that could surface anywhere the OS decided to stall.

## The fix was moving the workload, not patching around the host

I migrated the LightRAG instance off the NAS onto a desktop machine with far more headroom, keeping every earlier hardening change in place since none of them were wrong, just insufficient alone. I hit one more mistake during the move.

> [!WARNING]
> Don't point a migrated container at a loopback address, even when co-locating services on the same host. A container has its own network namespace, so `127.0.0.1` inside it isn't the host's loopback — it won't reach a service the host itself is running. Use the host's real local-network address instead.

I'd reasoned that co-locating services meant loopback would work. It doesn't, for the reason above. Switching to the machine's real local-network address fixed the connection immediately. The reprocess job then ran clean for fifty-two minutes, well past the worst crash point of thirty-seven, with steady progress and zero halts.

I also owe a correction to my own process here. Partway through this, I declared an earlier fix verified after watching a run for thirty clean minutes, then stopped monitoring it to go write notes. The job crashed seven minutes later. Thirty minutes of no errors isn't proof of anything if you stop watching before the job finishes. I don't think that mistake changes the eventual diagnosis, but it added a full extra round of debugging that a longer, unattended check would have skipped.

## The GPU broker bug was a genuinely different problem, same day

The other bug that afternoon lived in a completely separate piece of code: the broker that decides when my shared GPU should yield away from local inference toward gaming or Plex. It was yielding every ten to twenty minutes around the clock, including at 1am, because its detector matched on a process name that Plex also runs for background maintenance work like intro-skip detection, not just during actual playback. The fix was to stop pattern-matching on a process name and start asking Plex's own session API whether anything is actually playing. That's a clean, self-contained fix with no connection to memory pressure, embedding batches, or anything else in the LightRAG saga. I mention it here only because "one bad day" is the accurate frame: two real, unrelated bugs, fixed hours apart, that happened to share an afternoon.

## What I'm not sure about

I'll admit the two bugs aren't fully unrelated in one respect: both started from trusting a single signal without corroborating it, a log line in one case, a process-name match in the other. That's a real pattern in how I was debugging that day, even though the bugs live in different systems. I'm also not confident I've found the true floor on the embedding-batch size that caused an earlier, secondary instability risk; I tested ten against two and picked the smaller number, without ever bisecting where the actual safe threshold sits. If that pipeline ever needs more throughput, I'll have to test that properly instead of assuming two is magic. What I am confident about is the general lesson: when a fix addresses a real, verified mechanism and the crash still recurs on the same clock, stop tuning that mechanism and check what the host itself is doing.
