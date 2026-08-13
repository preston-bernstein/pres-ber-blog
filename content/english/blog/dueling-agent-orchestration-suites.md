---
title: "What If Two Independently-Built Agent Suites Reviewed Each Other's Code?"
meta_title: "Dueling Agent Orchestration: An Unbuilt Design for Independent AI Code Review"
description: "A design sketch: two independently built agent suites reviewing each other's PRs. Self-review fails 64.5% per a study CodeRabbit cites. Nobody ships this yet."
date: 2026-08-10T11:35:00Z
lastmod: 2026-08-11T20:34:13Z
categories: [
  "AI Infrastructure",
  "Software Architecture"
]
authors: ["preston-bernstein"]
tags: [
  "AI Agents",
  "Code Review",
  "Automation",
  "Claude Code"
]
draft: false
---

Run two coding-agent orchestration suites that share nothing between them — no prompts, no config, no instruction derivation — and make them review each other's pull requests, the way two engineers who never compared notes catch each other's mistakes. Suite A opens a PR. Suite B, built from scratch with zero visibility into how A works, reviews it cold. Suite A reads the verdict, decides what's real, fixes what needs fixing, and the loop can run again from there.

I came up with this on my own, then went looking for it anyway — checking first is the fastest way to find out whether an idea is obvious or nobody's gotten around to it yet.

## A single agent reviewing its own PR doesn't catch much

A single agent reviewing its own pull request doesn't catch much, and now there's a number attached to it. [CodeRabbit, a production code-review tool, cites a study](https://www.coderabbit.ai/blog/code-review-needs-independence) that names the pattern the "Homogenization Trap": models trained on overlapping data share the same blind spots, so asking one model to grade its own work just replays the assumptions that produced the bug in the first place.

{{< alert >}}The study CodeRabbit cites found an average failure rate of 64.5 percent when models are asked to correct errors they produced themselves.{{< /alert >}}

That's the whole justification for splitting author and reviewer into separate agents — and why splitting them into two copies of the same model barely helps.

I've watched the same blind spot from the other side already. [A separate audit pass on a CLI my own agent pipeline built](/blog/auditing-what-an-agent-pipeline-shipped-in-an-afternoon/) found four real gaps the pipeline's built-in review never flagged, because the review only checked the code against the spec that shared its assumptions.

## The design: independent suites, not two calls to the same agent

The design only works if the two suites are **actually independent**, not just two separate agent invocations. Three requirements make that real:

- Different base models, or at minimum instruction sets and personas built without either side looking at the other's files — the way two engineers who never compared notes end up writing different code for the same ticket.
- A fresh session every round. When B reviews A's PR, it starts cold instead of carrying context forward — letting a reviewer hold onto its own earlier verdict is a known way for it to anchor on that verdict instead of actually looking again.
- A hard round limit, somewhere around three to five exchanges, so the respond-and-re-review cycle can't spin forever on a disagreement neither side will drop.

Here's the loop itself:

```mermaid
flowchart LR
    A[Suite A opens PR] --> B["Suite B reviews cold<br/>(fresh session, no shared config)"]
    B --> C[Suite A decides what's real, applies fixes]
    C --> D{"Round limit reached?<br/>(3-5 exchanges)"}
    D -->|No| B
    D -->|Yes| E[Loop ends]
```

## Nobody ships this as a preset, but the pieces exist

Nobody ships this exact pattern as a ready preset, but the pieces are scattered across current tools and papers. Academic research on adversarial debate between large language models already studies quality gains when review peers are genuinely different rather than cooperative copies of each other. At least one recent paper formalizes almost the same author-reviewer-critic loop sketched here, adding a third agent that audits the reviewer's own review.

[Qodo's second-generation review tool](https://www.qodo.ai/blog/introducing-qodo-2-0-agentic-code-review/) runs several specialized agents in parallel against one PR and posted the best F1 score — a standard accuracy measure combining precision and recall — of eight review tools tested. That's parallel specialist review, though, not an adversarial author-versus-reviewer duel.

Mainstream orchestration frameworks ship a generic writer/reviewer role you can wire up yourself, but none of them package "two independently-derived agent suites duel it out" as something you install and configure.

## The market's clearest independent reviewer just lost its independence

The strongest counter-signal I found points the other way. Cursor, one of the more popular AI coding tools, [acquired Graphite in December 2025](https://graphite.com/blog/graphite-joins-cursor), with a stated plan to combine Graphite's Diamond reviewer with Cursor's own Bugbot. The most notable separate-company code reviewer on the market is now owned by **the same vendor that ships the authoring agent**.

If the industry keeps consolidating that way, buying genuine cross-vendor independence gets harder every year, not easier. A dueling-suite design that leans on "different vendor, different training run" as its independence guarantee is betting against that trend.

## This is a design sketch, not something running

This is a design sketch pulled together from research, not a system I've built or run. No working prototype. No latency or cost numbers from my own attempts. Everything above about round limits and fresh sessions is a plan, not a measurement.

One source did report real numbers from someone else's cross-model adversarial review setup.

{{< alert icon="circle-info" >}}Each review pass took 30 to 90 seconds, and a full exchange ran three to five debate rounds with two separate models in play the entire time.{{< /alert >}}

Multiply that across a normal-sized PR, and the wait before a suite even finishes disagreeing with itself starts to look expensive for something that might just find the same handful of issues a single well-configured reviewer agent would have caught in one pass.

## The real question is whether disagreement finds bugs or just makes noise

The real question I can't answer yet is whether independent agent suites disagreeing actually surfaces real bugs, or just generates plausible-sounding noise a human still has to sort through.

Two of my sources flagged **negation-blindness** as a structural weakness independent of which model you pick — a reviewer agent can miss that a fix does the opposite of what's needed, regardless of how independently it was built. If that failure mode shows up in both suites, I end up with two agents that agree with each other and still miss the same bug.

I don't know yet whether that happens rarely enough to be worth the extra compute and wall-clock time, or often enough that this is just a more expensive way to get the review quality I'd already get from one well-configured agent and a human final pass. The only way I'll find out is by building a small version of this against a real repo — probably the old orchestration prototype that's already sitting around gathering dust.
