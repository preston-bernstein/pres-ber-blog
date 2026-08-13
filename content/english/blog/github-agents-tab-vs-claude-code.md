---
title: "GitHub's Agents Tab Puts Claude and Codex in the Repo UI. It's a Separate Bill From Claude Code."
meta_title: "GitHub Agent HQ vs Claude Code: What the Repo Agents Tab Actually Does"
description: "GitHub's Agents tab runs Claude or Codex against issues from the repo UI, live since January 2026 — billed through Copilot credits, not your Anthropic account."
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

GitHub's per-repo Agents tab is a mission-control surface, [live since January 26, 2026](https://github.blog/changelog/2026-01-26-introducing-the-agents-tab-in-your-repository/), where GitHub-hosted coding agents pick up issues and turn them into PRs. No terminal required. Copilot's own agent lives there by default, and [Claude and Codex have been selectable alongside it in public preview since February 4, 2026](https://github.blog/changelog/2026-02-04-claude-and-codex-are-now-available-in-public-preview-on-github/). The tab is part of **Agent HQ**, the umbrella [GitHub announced on October 28, 2025](https://github.blog/news-insights/company-news/welcome-home-agents/), meant to give every agent vendor one shared surface across Issues, PRs, and Actions.

My read after digging into how it actually works: this is a real product, not a rebrand of anything Anthropic ships, and it covers a narrower slice of my workflow than local Claude Code already handles. Whether I keep reaching for it once the novelty wears off is the part I genuinely don't know yet.

## The Agents tab bills through Copilot, not through your Anthropic account

Running Claude or Codex inside GitHub's Agents tab requires a paid Copilot plan, [per GitHub's plan matrix](https://github.com/features/copilot/plans):

- **Pro** — $10/month, $15 in AI credits
- **Pro+** — $39/month, $70 in AI credits
- **Max** — $100/month, $200 in AI credits

Every session the tab runs draws down those credits. GitHub [moved the whole system to usage-based credit billing on June 1, 2026](https://github.blog/changelog/2026-06-01-updates-to-github-copilot-billing-and-plans/), so cost tracks the work done, not a flat seat price.

Anthropic's own bridge into GitHub runs on a completely separate path: the `claude-code-action` GitHub App, which [you install yourself by running `/install-github-app`](https://code.claude.com/docs/en/github-actions) from the Claude Code CLI, and which bills straight against an `ANTHROPIC_API_KEY` stored as a repo secret.

I've already learned the hard way that [usage-based agent billing punishes unattended workloads](/blog/what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene/), so which bill a session lands on is not a detail I'll shrug off. Same Claude model either way, but **two different accounts get charged**, and two different places end up holding the session history — one Claude wearing two different name tags, depending which bill it's on. Worth deciding that on purpose instead of defaulting into both.

## It already reads the instructions file I wrote for a different reason

GitHub's Copilot cloud agent [reads whatever `CLAUDE.md` sits at a repo's root](https://docs.github.com/en/copilot/reference/custom-instructions-support), along with `AGENTS.md` and path-scoped `.github/instructions/**/*.instructions.md` files. No extra setup on my end. Any repo I maintain that already keeps a `CLAUDE.md` as its canonical instructions file is **handing that same document to GitHub's agent** the instant the Agents tab gets turned on for it.

An `excludeAgent` property exists for scoping a file to specific agents, useful once Copilot needs house rules that shouldn't also apply to Claude or Codex running in the same repo — I haven't hit that case yet.

{{< alert >}}GitHub caps a single instructions file around 1,000 lines before response quality reportedly drops — a ceiling worth knowing before any `CLAUDE.md` grows past what an agent, local or cloud, can actually use.{{< /alert >}}

## The permission model is generic where mine is already specific

The cloud agent only touches the repo it's assigned to, and any Actions workflow its PR triggers needs write-access approval before it runs. GitHub built that sandbox to hold for any repo any customer points it at, which makes it necessarily generic.

My local Claude Code sessions already run a tighter, more specific version of the same idea: I decide per repo what a session is allowed to touch, and nothing runs unsupervised against something live without a **change-control gate I wrote for that exact system**. The two guardrails aren't competing. They sit at different points in the pipeline, and for anything touching a running service, I still trust the gate I built over one designed to be safe for every customer's repo at once.

## Task suitability draws the same line I already draw myself

GitHub is explicit about what belongs in the Agents tab: bug fixes, doc updates, dependency bumps, test coverage, accessibility fixes. It's just as explicit about what doesn't: complex cross-repo refactors, anything security-sensitive, anything with requirements that aren't already nailed down. That boundary lands almost exactly where I already split unsupervised background work from the interactive sessions I sit and drive myself.

GitHub's own framing puts it plainly: local agents for interactive work that needs immediate feedback, cloud agents for tasks that can run all the way to a finished PR with nobody watching, and a `/delegate` command meant to hand a task from one mode to the other without losing context. I was already running that model before this tab existed — what's new is a GitHub-native trigger for the cloud half, reachable from the repo UI or a phone instead of only from my own machine.

## Benchmark rankings mean the tab is routing, not competing

Third-party benchmarks rank the models the tab routes to, and Copilot's own agent isn't near the top:

- **Claude Opus** — 88.6% on SWE-bench Verified
- **Codex** — 77.3% on Terminal-Bench 2.0
- **Cursor** — ~74% on SWE-bench
- **Copilot's own agent** — ~54%

Picking Claude or Codex from inside the Agents tab, instead of defaulting to Copilot's built-in agent, means picking the same models I already reach for locally. GitHub sits underneath that choice as a router and a billing layer, not a rival source of intelligence.

If Copilot's own agent were the only option in that tab, I'd have skipped this whole investigation. But Claude sits there as a first-class pick, and the real question the tab poses is whether I want GitHub's UI and GitHub's bill wrapped around Claude, or my own.

## Whether it earns a permanent spot comes down to one habit I haven't built yet

The place I can actually see this earning a spot is triage: assigning a low-risk issue to the Agents tab from my phone the second I file it, instead of sitting on it until I'm back at a keyboard to spin up a local session. That's a real gap in how I work today: small fixes wait for keyboard time regardless of how trivial they are.

Maybe I build that habit once the first week of novelty wears off. But I might just keep defaulting to my own Claude Code session, because I already trust its logs, [its worktree lifecycle](/blog/three-failure-modes-one-name-concurrent-claude-code-agents/), and my own change-control gate more than a run I can only inspect through GitHub's diff view. **I'm giving it a real trial on one low-stakes repo before I decide either way** — I'd rather report back after a month of actual use than guess now.
