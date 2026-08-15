# Sources: $364 Claude Code Session Blog Post

## Facts

| Fact | Source | Verbatim Quote (≤30 words) |
|------|--------|---------------------------|
| One Claude Code session cost $364 | blog post, line 24 | "A single Claude Code session in my home lab cost $364." |
| 100% of spend from subagent-heavy sessions | blog post, line 28 | "100% of spend came from sessions that had spawned subagents." |
| 99% of spend from 8+ hour sessions | blog post, line 29 | "99% came from sessions that ran longer than eight hours straight." |
| 90% of spend at >150k context tokens | blog post, line 30 | "90% of spend happened while the session's context window sat above 150,000 tokens." |
| 62% of weekly cap burned by mid-week | blog post, line 31 | "62% of my weekly usage cap was already burned by the middle of that week." |
| Every turn re-sends full conversation history | blog post, line 51 | "Claude Code resends the full conversation history with every turn." |
| Message 201 costs as much as messages 1–200 combined (before caching) | blog post, line 51 | "Message 201 in an eight-hour session costs as much input processing as messages 1–200 combined." |
| 99% of weekly spend in sessions that never closed | blog post, line 53 | "99 percent of the week's spend sat in sessions that never closed." |
| Sessions with any subagent fan-out accounted for entire week's spend | blog post, line 59 | "sessions with any subagent fan-out accounted for the entire week's spend." |
| claude -p and Agent SDK share subscription cap with interactive sessions (2026-06-15 change) | blog post, line 73 | "programmatic usage draws from the same weekly subscription cap as interactive sessions." |
| CLAUDE_AUTOCOMPACT_PCT_OVERRIDE is env var (1–100) for context-fill % where compaction fires | blog post, line 93 | "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE is an environment variable (1–100) that sets the context-fill percentage where auto-compaction fires." |
| --max-turns is hard stop on headless invocation | blog post, line 96 | "--max-turns is the hard stop on every headless invocation." |
| SessionStart hook fires on clear/compact with source field | blog post, line 94 | "SessionStart hook fires with source field reporting whether session is starting fresh, resuming, or recovering." |
| Subagent model precedence: env var > invocation param > frontmatter | vault: claude-code-token-efficiency.md, Findings/experts | "Subagent model precedence: CLAUDE_CODE_SUBAGENT_MODEL env > invocation param > frontmatter model" |
| Anthropic paused Agent SDK billing separation (2026-06-15) | blog post, line 72 | "On 2026-06-15, Anthropic paused a planned change to Agent SDK billing." |
| Cadence governor deployed 2026-07-14 | MEMORY.md (feedback_token_discipline) | "CADENCE GOVERNOR (2026-07-14, deployed)" |
| algo-factory campaign fires average ~536k weighted tokens/session | MEMORY.md (project_claude_usage.md, line 76) | "algo-factory campaign fires average ~536k weighted tokens/session (315 fires/week)" |
| Cache pricing ratios: input/output=1x, cache_read=0.1x, cache_write_5m=1.25x, cache_write_1h=2x | MEMORY.md (project_claude_usage.md, line 49) | "Anthropic's real cache-pricing ratios (input/output=1x, cache_read=0.1x, cache_write_5m=1.25x, cache_write_1h=2x)" |
| Budget governor deployed 2026-07-27 via /ship-it pipeline (PR #12) | MEMORY.md (project_claude_usage.md, line 98–99) | "Merged to main via PR #12...merge commit a448f77." |
| --resume uses session ID from prior run's --output-format json | vault: autonomous-claude-session-lifecycle.md, experts | "--resume <session_id> (captured via --output-format json) is the reliable chaining primitive." |
| --continue can silently start NEW session in scripted loops | vault: autonomous-claude-session-lifecycle.md, experts | "--continue can silently start a NEW session in scripted loops." |
| SetupStart hook fires with --init/--maintenance in -p mode | vault: autonomous-claude-session-lifecycle.md, experts | "Setup hook fires with --init/--maintenance in -p mode — purpose-built one-time prep." |
| ccusage CLI (17.2k stars) for local token usage tracking | vault: claude-code-token-efficiency.md, github lane | "ccusage (17.2k★, 2026-07-10) — CLI analyzing token usage/costs from local logs." |
| Anthropic docs: session/context lifecycle link | blog post, line 55 | "The fix [Anthropic documents in the Claude Code cost guide]." |
| Cadence pattern already applied to campaign fires | blog post, line 84–85 | "My own automation pipelines already write state that way...I got session hygiene as a side effect." |
| CLAUDE_AUTOCOMPACT_PCT_OVERRIDE not yet verified with real before-and-after /usage data | blog post, line 100–104 | "What I don't have yet is a second week of /usage data proving any of it actually moved the number down." |
| SessionStart hook needs to echo re-ground instruction after clear/compact | MEMORY.md (feedback_token_discipline, line 36) | "SessionStart hook (matcher clear/compact) in ~/.claude/settings.json injects re-ground-from-disk instruction." |
| --max-turns undocumented in --help but real/tested | MEMORY.md (feedback_token_discipline, line 57–66) | "--max-turns 1 genuinely stops execution; do NOT remove because help doesn't show it." |
| oauth-factory campaign fires alone consume ~$145/day continuous (~$70/day 4h-cadence) | vault: claude-code-token-efficiency.md, "Measured baseline" section | "Desktop campaign, CONTINUOUS mode (~30min fires): ~$145/day sonnet-equivalent." |
| Subagent model is overridable per definition or globally | vault: claude-code-token-efficiency.md, Findings/experts | "subagent model is overridable per definition (model: haiku frontmatter) or globally." |
| Spawn subagents for output-heavy operations (test runs, log processing) | vault: claude-code-token-efficiency.md, experts | "Spawn subagents specifically for OUTPUT-HEAVY operations — verbose output stays in their context." |
| Multi-agent fan-out runs ~7x standard-session tokens | vault: claude-code-token-efficiency.md, experts | "Agent teams run ~7x standard-session tokens when teammates plan." |
| Keep CLAUDE.md under ~200 lines | vault: claude-code-token-efficiency.md, experts | "Keep CLAUDE.md under ~200 lines; move workflow detail into on-demand skills." |
| Thinking bills as output tokens; controllable via /effort, /model, MAX_THINKING_TOKENS | vault: claude-code-token-efficiency.md, experts | "Thinking bills as output tokens; control via /effort or MAX_THINKING_TOKENS (fixed-budget models only)." |
| PreToolUse hooks can grep 10k-line outputs down to FAIL/ERROR lines | vault: claude-code-token-efficiency.md, experts | "PreToolUse hooks can grep 10k-line outputs down to FAIL/ERROR lines before context." |
| CLI tools (gh/aws) preferred over MCP where both exist | vault: claude-code-token-efficiency.md, experts | "Prefer CLI tools (gh/aws) over MCP where both exist." |
| --max-turns, --max-budget-usd, --allowedTools essential for unattended execution | vault: claude-code-token-efficiency.md, experts | "--max-turns + --max-budget-usd + --allowedTools; 'essential for unattended execution.'" |
| Rate limits doubled 2026-05-06 for Pro/Max/Team; peak reduction removed; 5h rolling window | vault: claude-code-token-efficiency.md, "Refresh" section | "Rate limits doubled 2026-05-06 for Pro/Max/Team; 5h rolling session window." |
| No session-concurrency cap documented, but ~3-4 simultaneous starts succeed before burst limiter | vault: claude-code-token-efficiency.md, "Refresh" section | "~3-4 simultaneous session STARTS succeed, the rest get 'Server is temporarily limiting.'" |
| Usage credits (Settings > Usage) OFF by default; pay-as-you-go PAST weekly/5h caps | vault: claude-code-token-efficiency.md, "Refresh" section | "Usage credits...OFF by default...pay-as-you-go PAST the weekly/5h caps at standard API rates." |
| Hitting cap is HARD STOP; prompts pause, threads read-only | vault: claude-code-token-efficiency.md, "Refresh" section | "Hitting a cap is a HARD STOP — prompts pause, threads read-only." |
| Usage pool spans Claude Code + claude.ai chat + Cowork | vault: claude-code-token-efficiency.md, "Refresh" section | "One usage pool spans Claude Code + claude.ai chat + Cowork." |
| PreCompact/PostCompact hooks (matcher manual/auto) persist/react; cannot FORCE compaction | vault: autonomous-claude-session-lifecycle.md, experts | "PreCompact/PostCompact hooks...cannot FORCE compaction." |
| SessionEnd hook is cleanup/analytics only, cannot block termination | vault: autonomous-claude-session-lifecycle.md, experts | "SessionEnd hook...is cleanup/analytics only, cannot block termination." |
| Piped stdin to claude -p capped at 10MB; use file paths for big context | vault: autonomous-claude-session-lifecycle.md, experts | "Piped stdin to claude -p capped at 10MB; pass file paths for big context." |
| Background tasks killed ~5s after final result; background subagents block up to 10min | vault: autonomous-claude-session-lifecycle.md, experts | "Background bash tasks killed ~5s after final result; subagents block up to 10min." |

## Preston's Own Words

Only one item survives: everything else the gather agent listed here was a first-person sentence from the existing post, which was LLM-drafted — those are NOT his words and are untrusted for voice (kept above as facts only).

| Quote | Source | Context |
|-------|--------|---------|
| "token/performance discipline must be BAKED INTO the workflows, not left to habit" | memory `feedback_token_discipline.md` (Preston's directive, 2026-07-14, after the $364 session) | the only sentence here that is actually his |

Everything else about how he felt, why he cared, and what he believes now must come from the intake interview (`what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md`, pending).
