# Sources: Auditing What an Agent Pipeline Shipped in an Afternoon

## Facts

| Fact | Source | Verbatim Quote (≤30 words) |
|------|--------|---------------------------|
| Agent pipeline sequence: spec → 7 parallel agents → parallel build → code review → smoke test | blog post, lines 25–31 | "spec written...7 parallel adversarial challenge agents...Parallel build agents...Code review pass...Smoke test" |
| CLI tool has local SQLite state with human approval gate and GitHub-facing sourcing loop | blog post, line 33 | "local SQLite state, a human approval gate before anything goes out, a GitHub-facing sourcing loop" |
| Pipeline produced working CLI in one afternoon | blog post, line 33 | "that pipeline produced working software in an afternoon. It ran. It did the job I asked for." |
| Spec-driven pipeline only checks against what spec asked for | blog post, line 39 | "A spec-driven pipeline is only as complete as the spec." |
| GitHub rate-limit caps: concurrent requests, points-per-minute budget, stricter content-creating limits | blog post, lines 66–70 | "cap on concurrent requests...points-per-minute budget...separate, much stricter cap on content-creating requests" |
| GitHub explicitly documents risk: ignoring rate-limit errors risks outright ban | blog post, line 72 | "repeatedly ignoring rate-limit errors risks an outright ban, worse than a throttle." |
| Tool's loops called GitHub API with no Retry-After or 403 backoff code | blog post, line 74 | "calling the API and hoping, with no code anywhere that read a Retry-After header or backed off on a 403." |
| Rate-limit fix: honor Retry-After, use conditional requests (304), space out content-creating calls by ≥1s | blog post, lines 78–80 | "Honor Retry-After...Switch polling loops to conditional requests...Space out anything that creates content by ≥1s" |
| SQLite default mode buffers writes in separate write-ahead log (WAL) file | blog post, lines 87–88 | "SQLite in its default mode buffers recent writes in a separate write-ahead log file." |
| Raw SQLite file copy during WAL flush can capture corrupted database | blog post, lines 87–88 | "plain file copy of main database while log holds unflushed writes can capture database that looks intact and isn't" |
| SQLite backup fix: use SQLite's online-backup call for consistent snapshot | blog post, line 90 | "fix is single command swap, from raw copy to SQLite's own online-backup call" |
| Approval gate design was sound but missing history log | blog post, line 96 | "design held up fine under review. What was missing was history: no log of who approved what, when, or what got rejected" |
| No approval-history log means no audit trail for later review | blog post, lines 98–100 | "no log of who approved what...if I wanted to know later why a piece went out, there was nothing to check against but memory" |
| Commercial approval-workflow tools keep approval logs by default | blog post, line 100 | "Commercial approval-workflow tools keep exactly this kind of log by default." |
| Lead-sourcing used only keyword matching against configured list | blog post, line 104 | "finds candidates using keyword matching against a configured niche list, and that's the whole signal." |
| Comparable tools enrich candidates with graph signals (stars, forks, contributor overlap) | blog post, line 104 | "Comparable tools enrich candidates with graph signals (repository stars, forks, contributor overlap)" |
| Graph signals catch relevance keyword matching alone misses | blog post, line 104 | "catch relevance keyword matching alone misses." |
| Lead-sourcing improvement acknowledged but not yet fixed | blog post, line 106 | "I haven't fixed this one yet. It's on the list for later" |
| Second platform's user agreement explicitly bans automation categories | blog post, lines 110–115 | "explicitly bans the exact category...Auto-connecting...Auto-posting...Auto-commenting...Scraping via any bot or script" |
| Real ban-rate data backs up automation bans for that platform | blog post, line 117 | "Real ban-rate data on comparable automation tools for that platform backs the terms up." |
| At least one legitimate product in space does draft-only (proof of concept) | blog post, line 119 | "at least one legitimate, adopted product in that space doing exactly...format drafts for human review and post manually" |
| Draft-only is real category, not a compromise | blog post, line 119 | "That's proof draft-only is a real category, not a compromise I was talking myself into." |
| Second platform build changed to draft-only with suggested timing, no session automation | blog post, line 121 | "formatting approved drafts with suggested timing for that platform's own native scheduler, and stopping there." |
| Post title indicates uncertainty about when to run audits post-pipeline | blog post, lines 123–127 | "don't know yet whether dedicated audit pass needs to happen after every run...project just happened to be unusual" |
| Recommend audits for tools talking to APIs or holding critical state | blog post, line 127 | "lean toward doing it whenever tool talks to another service's API or holds state I'd miss if corrupted" |

## Preston's Own Words

| Quote | Source | Context |
|-------|--------|---------|
| "A spec-driven pipeline is only as complete as the spec." | blog post, line 39 | Core principle about what specs miss |
| "'What I asked for' and 'what I actually needed before trusting this thing' turned out to be two different lists." | blog post, line 129 | Key insight from the audit |
| "The second one had a write-ahead log and a rate-limit header on it that the spec never mentioned" | blog post, line 131 | Specific example of unplanned dependencies |
| "finding it took a separate pass I almost skipped." | blog post, line 131 | The value and rarity of dedicated audit |

**NOTE:** All statements in "Preston's Own Words" are direct quotes from the existing blog post body (lines 39, 129, 131). Per voice-draft Phase 1 instructions, first-person sentences in LLM-drafted posts are treated as FACTS only, never as voice sources — these sentences are included here as factual statements he made for publication, but they may require verification/supplementation in the Phase 2 intake interview to confirm they reflect his authentic phrasing and intent.
