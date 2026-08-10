# Markup audit log — Group B

Scope: 7 files under content/english/blog/ (see task). For each file, every bold/italic/inline-code
span found is logged below (kept or removed). Files with no spans of a given type have no lines for
that type. No bare URLs, non-descriptive link text, decorative bold, or decorative italic were found
anywhere in this batch — every markup span present was inline code marking a literal command, flag,
filename, env var, or identifier, per Task 5's semantic rule, and was kept as-is.

- auditing-what-an-agent-pipeline-shipped-in-an-afternoon.md:30 | code | kept | literal HTTP header name (Retry-After), 1st occurrence
- auditing-what-an-agent-pipeline-shipped-in-an-afternoon.md:30 | code | kept | literal HTTP header name (Retry-After), 2nd occurrence

- dueling-agent-orchestration-suites.md | (none) | n/a | no bold/italic/code spans found in this file

- github-agents-tab-vs-claude-code.md:24 | code | kept | literal GitHub App identifier (claude-code-action)
- github-agents-tab-vs-claude-code.md:24 | code | kept | literal CLI command (/install-github-app)
- github-agents-tab-vs-claude-code.md:24 | code | kept | literal env var name (ANTHROPIC_API_KEY)
- github-agents-tab-vs-claude-code.md:28 | code | kept | literal filename (CLAUDE.md), 1st occurrence
- github-agents-tab-vs-claude-code.md:28 | code | kept | literal filename (AGENTS.md)
- github-agents-tab-vs-claude-code.md:28 | code | kept | literal file glob path (.github/instructions/**/*.instructions.md)
- github-agents-tab-vs-claude-code.md:28 | code | kept | literal filename (CLAUDE.md), 2nd occurrence
- github-agents-tab-vs-claude-code.md:28 | code | kept | literal config property name (excludeAgent)
- github-agents-tab-vs-claude-code.md:28 | code | kept | literal filename (CLAUDE.md), 3rd occurrence
- github-agents-tab-vs-claude-code.md:36 | code | kept | literal CLI command (/delegate)

- one-observability-stack-not-one-per-repo.md | (none) | n/a | no bold/italic/code spans found in this file

- self-throttling-claude-max-without-a-published-ceiling.md:21 | code | kept | literal CLI command (claude -p), 1st occurrence
- self-throttling-claude-max-without-a-published-ceiling.md:41 | code | kept | literal CLI command (claude -p), 2nd occurrence
- self-throttling-claude-max-without-a-published-ceiling.md:43 | code | kept | literal CLI command (claude -p), 3rd occurrence

- three-failure-modes-one-name-concurrent-claude-code-agents.md:26 | code | kept | literal CLI flag (--worktree)
- three-failure-modes-one-name-concurrent-claude-code-agents.md:26 | code | kept | literal tool identifier (EnterWorktree), 1st occurrence
- three-failure-modes-one-name-concurrent-claude-code-agents.md:40 | code | kept | literal tool identifier (EnterWorktree), 2nd occurrence
- three-failure-modes-one-name-concurrent-claude-code-agents.md:40 | code | kept | literal tool identifier (ExitWorktree)

- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:21 | code | kept | literal CLI command (/usage), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:23 | code | kept | literal CLI command (claude -p), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:27 | code | kept | literal CLI command (/compact), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:27 | code | kept | literal CLI command (/clear), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:31 | code | kept | literal config field name (model:)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:31 | code | kept | literal env var name (CLAUDE_CODE_SUBAGENT_MODEL)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:35 | code | kept | literal CLI command (claude -p), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:39 | code | kept | literal CLI command (/clear), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:39 | code | kept | literal CLI command (/compact), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:39 | code | kept | literal CLI command (claude -p), 3rd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:39 | code | kept | literal CLI flag (--continue), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:39 | code | kept | literal CLI flag (--resume), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:39 | code | kept | literal CLI command (/clear), 3rd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:39 | code | kept | literal CLI command (claude -p), 4th occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:45 | code | kept | literal env var name (CLAUDE_AUTOCOMPACT_PCT_OVERRIDE)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:47 | code | kept | literal hook name (SessionStart), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:47 | code | kept | literal field name (source)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:47 | code | kept | literal field value (clear)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:47 | code | kept | literal field value (compact)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:49 | code | kept | literal CLI flag (--resume), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:49 | code | kept | literal CLI flag+value (--output-format json)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:49 | code | kept | literal CLI flag (--continue), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:49 | code | kept | literal CLI flag (--max-turns), 1st occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:53 | code | kept | literal env var assignment (CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=60)
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:53 | code | kept | literal hook name (SessionStart), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:53 | code | kept | literal CLI flag (--max-turns), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:53 | code | kept | literal CLI command (/usage), 2nd occurrence
- what-a-364-dollar-claude-code-session-taught-me-about-agent-hygiene.md:53 | code | kept | literal CLI command (/usage), 3rd occurrence
