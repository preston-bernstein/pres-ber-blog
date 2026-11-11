# Intake — auditing-what-an-agent-pipeline-shipped-in-an-afternoon

Date: 2026-08-23. Answered in chat by Preston, verbatim, unedited. Questions synthesized from `docs/intake/auditing-what-an-agent-pipeline-shipped-in-an-afternoon.sources.md` per the adaptive-interview process (`~/.claude/commands/voice-draft.md` Phase 2, updated 2026-08-23), asked one at a time — not the fixed 7-category template, and not a numbered batch.

**Note on this piece's sources file:** its "Preston's Own Words" section was sourced entirely from the existing (LLM-drafted, rejected-process) post body, not from memory/vault/chat — flagged by the source-gather agent as unverified. Question 5 below exists specifically to re-elicit that belief in his real words rather than trust the old post's phrasing.

1. You said you "almost skipped" this audit pass. What almost stopped you, and what actually tipped it toward doing it?
> Yeah, this was earlier on in my process for using agents and I was still getting familiar with their limitations. I was overtime prioritizing moving fast instead of moving accurately and I think that influences my first instinct of not doing that audit. I think you know it's really important to alwaysor as routinely as you can manage without going insane examining and refining your process.

2. The GitHub CLI tool had real teeth pulled — rate limits, a WAL corruption risk, a missing approval log. The second platform got killed outright because its own terms ban the whole automation category. Which hit harder: finding real bugs in something that shipped, or finding out the second build shouldn't exist at all?
> I mean, I like to say that I definitely think that the whole automation category is valuable and that the platforms banning it outright tend to have a approach of killing everything to stop the bad actors instead of the good actors that just value the efficiency and deterministic repeatability and just the basic hacking culture that being a good programmer or what have you computer guy is all about it at the end of

2a. (follow-up — that last line cut off, asked him to finish it)
> at the end of the day i'm a hacker and i'm all about the free spirit hacker culture

3. Lead-sourcing is still just keyword matching — you said it's "on the list for later." Be honest, is that actually priority, or something else?
> Yeah, I mean everything's on the list for later. I just don't know the order of what I should be looking at and when.

4. You're not sure yet whether every agent-pipeline run needs a dedicated audit pass, or if this one was just unusual. What's your gut say right now?
> My gut right now says that every agent needs an audit pass generally as much as you possibly can do it because nothing is ever perfect and once you've used them for a bit to draw up data of how it has been doing and consequently why I think observability and monitoring is important important then you can start to get data based ideas about where you should focus on refinance

5. The old post has you saying "what I asked for" and "what I actually needed before trusting this thing" turned out to be two different lists. Is that really how you'd put it, or is there a sharper way to say what that gap actually was?
> You know I don't trust it and I'm not going to trust it. What I ask for is never always going to be given to me. It's always a very imperfect thing or it has been and I just need to continuously look and make sure that it's good it's eliminating as much of the manual will work that I can do as possible. That is my goal, but I need to bethe "" ghost in the machine.

6. Anything to skip past?
> Not that I can think of

Other sourced facts used in the draft (not from the intake): see `docs/intake/auditing-what-an-agent-pipeline-shipped-in-an-afternoon.sources.md` for the full list — key facts include the pipeline sequence (spec → 7 parallel adversarial agents → parallel build → code review → smoke test), the GitHub rate-limit fixes (Retry-After, conditional 304 requests, ≥1s spacing on content-creating calls), the SQLite WAL raw-copy corruption risk and the online-backup fix, the missing approval-history log (commercial tools keep one by default), the keyword-only lead-sourcing vs. graph-signal alternatives, and the second platform's explicit ban on auto-connecting/auto-posting/auto-commenting/scraping plus the draft-only pivot with suggested timing and no session automation.
