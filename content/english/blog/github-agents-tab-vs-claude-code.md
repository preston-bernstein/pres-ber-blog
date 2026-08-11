---
title: "GitHub's Agents Tab Puts Claude and Codex in the Repo UI. It's a Separate Bill From Claude Code."
meta_title: "GitHub Agent HQ vs Claude Code: What the Repo Agents Tab Actually Does"
description: "GitHub's per-repo Agents tab lets Claude, Codex, or Copilot's own agent work issues into PRs from inside the repo UI. It's a real product, live since January 2026, and it runs on a completely different bill than a local Claude Code session. Here's what it does, and why I'm not sure it changes my workflow yet."
date: 2026-08-10T12:30:00Z
lastmod: 2026-08-11T20:34:13Z
categories: [
  "AI Infrastructure",
  "Software Architecture"
]
authors: ["preston-bernstein"]
tags: [
  "GitHub",
  "AI Agents",
  "Claude Code",
  "Developer Workflow"
]
draft: false
---

GitHub's per-repo Agents tab is a mission-control surface, live since January 26, 2026, where GitHub-hosted coding agents pick up issues and turn them into PRs without anyone opening a terminal. Copilot's own agent lives there by default, and Claude and Codex are selectable alongside it as "picked" third-party agents. The tab is part of Agent HQ, the umbrella GitHub announced on October 28, 2025, meant to give every agent vendor one shared surface inside Issues, PRs, and Actions instead of a pile of separate integrations. My read after digging into how it actually works: this is a real product, not a rebrand of anything Anthropic ships, and it solves a narrower slice of my workflow than local Claude Code already covers. Whether I keep reaching for it once the novelty wears off is the part I genuinely don't know yet.

## The Agents tab bills through Copilot, not through your Anthropic account

Running Claude or Codex inside GitHub's Agents tab requires a paid Copilot plan: Pro at $10 a month with $15 of included AI credits, Pro+ at $39 with $70, Max at $100 with $200. Every session the tab runs draws down those credits, and GitHub moved the whole system to usage-based credit billing on June 1, 2026, so cost tracks how much work the agent actually does rather than a flat seat price. Anthropic's own bridge into GitHub runs on a completely separate path: the `claude-code-action` GitHub App, which you install yourself by running `/install-github-app` from the Claude Code CLI, and which bills straight against an `ANTHROPIC_API_KEY` stored as a repo secret. Same Claude model either way, but two different accounts get charged, and two different places end up holding the session history. That's worth deciding on purpose rather than defaulting into both.

## It already reads the instructions file I wrote for a different reason

GitHub's Copilot cloud agent reads whatever `CLAUDE.md` sits at a repo's root, along with `AGENTS.md` and path-scoped `.github/instructions/**/*.instructions.md` files, with no extra setup on my end. Any repo I maintain that already keeps a `CLAUDE.md` as its canonical instructions file is handing that same document to GitHub's agent the instant the Agents tab gets turned on for it. An `excludeAgent` property exists for scoping a file to specific agents, useful once Copilot needs house rules that shouldn't also apply to Claude or Codex running in the same repo, though I haven't hit a case where I've needed it. GitHub caps a single instructions file around 1,000 lines before response quality reportedly drops, a ceiling worth knowing before any `CLAUDE.md` grows past what an agent, local or cloud, can actually use.

## The permission model is generic where mine is already specific

The cloud agent only touches the repo it's assigned to, and any Actions workflow its PR triggers needs write-access approval before it runs. GitHub built that sandbox to hold for any repo any customer points it at, which makes it necessarily generic. My local Claude Code sessions already operate under a tighter and more specific version of the same idea: I decide per repo what a session is allowed to touch, and nothing runs unsupervised against something live without a change-control gate I wrote for that exact system. The two guardrails aren't competing with each other. They sit at different points in the pipeline, and for anything touching a running service I still trust the gate I built over one designed to be safe for every customer's repo at once.

## Task suitability draws the same line I already draw myself

GitHub is explicit about what belongs in the Agents tab: bug fixes, doc updates, dependency bumps, test coverage, accessibility fixes. It's just as explicit about what doesn't: complex cross-repo refactors, anything security-sensitive, anything with requirements that aren't already nailed down. That boundary lands almost exactly where I already split unsupervised background work from the interactive sessions I sit and drive myself. GitHub's own framing puts it plainly: local agents for interactive work that needs immediate feedback, cloud agents for tasks that can run all the way to a finished PR with nobody watching, and a `/delegate` command meant to hand a task from one mode to the other without losing context. That's the model I was already running before this tab existed. What's new is a GitHub-native trigger for the cloud half, reachable from the repo UI or a phone instead of only from my own machine.

## Benchmark rankings mean the tab is routing, not competing

Third-party benchmarks put Claude Opus ahead on SWE-bench Verified at 88.6 percent, Codex ahead on Terminal-Bench 2.0 at 77.3 percent, Cursor around 74 percent on SWE-bench, and Copilot's own agent trailing around 54 percent. Picking Claude or Codex from inside the Agents tab, instead of defaulting to Copilot's built-in agent, means picking the same models I already reach for locally. GitHub sits underneath that choice as a router and a billing layer, not a rival source of intelligence. If Copilot's own agent were the only option in that tab, I'd have skipped this whole investigation. Because Claude sits there as a first-class pick, the real question the tab poses is whether I want GitHub's UI and GitHub's bill wrapped around Claude, or my own.

## Whether it earns a permanent spot comes down to one habit I haven't built yet

The place I can actually see this earning a spot is triage: assigning a low-risk issue to the Agents tab from my phone the second I file it, instead of sitting on it until I'm back at a keyboard to spin up a local session. That's a real gap in how I work today, since small fixes tend to wait for keyboard time regardless of how trivial they are. What I don't know is whether I'll build that habit once the first week of novelty wears off, or whether I'll keep defaulting to my own Claude Code session because I already trust its logs, its worktree lifecycle, and my own change-control gate more than a run I can only inspect through GitHub's diff view. I'm giving it a real trial on one low-stakes repo before I decide either way, and I'd rather report back after a month of actual use than guess now.
