---
title: "My GPU Broker Kept Killing Inference Jobs for Games That Weren't Running"
meta_title: "Fixing a False-Positive GPU Contention Bug in a Home-Lab Broker"
description: "A Go service that arbitrates one home-lab GPU between gaming, Plex, and local LLM inference was canceling inference jobs for phantom games. What the detector was actually catching, and the two-part fix."
date: 2026-08-10T11:00:00Z
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
  "Debugging",
  "Go"
]
draft: false
---

A Go service I run at home kept canceling in-flight LLM inference jobs because it thought a game had launched, and most of the time nothing had launched at all. The service is a broker that arbitrates my desktop's single GPU between gaming, Plex transcoding, and local inference through Ollama. When it detects gaming or Plex activity, it force-cancels whatever inference request is running and unloads the model from VRAM, no exceptions, because in my house whoever is playing a game or watching something wins that argument. That priority order is correct. The detector deciding when to enforce it was not.

I found the bug while chasing a different crash. A bulk ingestion job that leans on the broker for embeddings kept dying partway through with a read error on the Ollama calls, which cascaded into a full pipeline halt. Nothing in the job's own code looked wrong. Checking the broker's logs during the failure windows turned up the real problem: it was flipping into a "yielding" state roughly every 10 to 20 minutes, around the clock, including the 1am to 6am stretch when nobody in this house is playing anything. `ps aux` during one of those windows showed only Steam's idle background client. No game process, no active transcode, nothing.

## A single matching process was enough to cancel a running job

The detector scans `/proc` every three seconds for command-line substrings: `Plex Transcoder`, Steam's launch marker, Heroic's and Lutris's runner patterns, a bare `wine .exe`. The moment any one poll matched, the controller flipped to yielding and canceled whatever inference was in flight. There was no debounce, the industry term for waiting out a signal before trusting it, and no second signal to corroborate the first. One sample counted as ground truth. That design wasn't an oversight so much as an unexamined assumption: I'd built the hard-cancel policy deliberately, then never asked whether the thing triggering it deserved that much trust.

## Plex's own maintenance jobs look identical to real playback

Plex's own support documentation confirms that Skip Intro and Credits detection, along with chapter-thumbnail generation, run through the same `Plex Transcoder` binary that handles real playback, on a server-scheduled cadence that has nothing to do with anyone pressing play. My detector grepped for that process name, so a 3am maintenance pass looked exactly like me starting a movie. No amount of debounce timing fixes this, because the false match isn't a brief blip, it can run for several minutes at a stretch. Tautulli, a widely used third-party Plex monitoring tool, sidesteps the whole problem by reading Plex's `/status/sessions` API instead of the process table, since that endpoint only reports sessions that are actually "now playing." That's the real fix for the Plex side: stop grepping for the binary and ask Plex what's actually playing.

## No game launcher exposes a real "foreground game" signal

The gaming side is a different problem, and I can't fix it by finding a better API, because none exists. Steam's overlay APIs report whether the overlay is active, not whether a game is running in the foreground. Heroic and Lutris expose no equivalent signal at all. Process-name matching is the only practical option left for gaming detection, and the logs showed those false matches clustering as three-to-six-second blips rather than Plex's multi-minute stretches. Different noise shape, different fix.

## Confirmation gates the cancel, not the recovery

For the gaming side, the fix is the debounce pattern I should have had from the start: require several consecutive positive polls, not one, before flipping to yielding. I set the default at two or three consecutive matches. Recovery, the transition back out of yielding, stays instant and undebounced, because delaying it only costs a few extra seconds of inference downtime and never risks letting inference run over an actual game. Requiring confirmation before the cancel and skipping it before the recovery isn't symmetric, and it doesn't need to be, the two directions have different failure costs. On a genuine game launch this adds a few seconds of latency before the GPU actually frees up, which is a small price against jobs dying for no reason.

I've only shipped half of this. The poll-confirmation gate is small, self-contained, and went in first. The Plex session-API swap hasn't happened yet, because it needs a token Plex issues locally, and I haven't wired that up. Until I do, a multi-minute Plex maintenance run will still trip the broker no matter how high I set the confirm-poll count, since debounce only filters single-sample noise and does nothing against a signal that stays true for five straight minutes. I'm also not confident two or three polls is the right number for every workload this machine runs. I picked it from a general flapping-detection convention, not from measurement on my own logs, and I won't know if it's wrong until the false positives either stop or don't.

## Hard-canceling instead of throttling is a defensible but costly choice

There's a case against the whole design that the debounce fix doesn't touch. My broker treats every real contention event as a hard stop: cancel the inference request, unload the model, hand the GPU over completely. A tool called Process Lasso does something closer to priority scheduling instead, deprioritizing background GPU compute rather than killing it outright when a game starts. That approach would have made this entire bug far less painful, a false positive would have meant a slower inference request instead of a canceled one. I built it as a hard cutover on purpose, because I wanted a guarantee that the GPU comes back completely clean the moment someone in this house wants to play, and priority-based throttling can't promise that as cleanly. I still think that tradeoff was right for a shared family machine. But it's the reason a detection bug that would have been a minor inconvenience under a softer policy turned into a pipeline outage under mine.

The debounce fix is live, the Plex fix isn't, and I'll find out whether either was tuned correctly the next time this job runs unattended overnight and either survives or doesn't.
