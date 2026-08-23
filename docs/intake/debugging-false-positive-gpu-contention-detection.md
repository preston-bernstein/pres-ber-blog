# Intake — debugging-false-positive-gpu-contention-detection

Date: 2026-08-23. Answered in chat by Preston, verbatim, unedited. Questions synthesized from `docs/intake/debugging-false-positive-gpu-contention-detection.sources.md` per the adaptive-interview process (`~/.claude/commands/voice-draft.md` Phase 2, updated 2026-08-23), asked one at a time.

**Note on this piece's sources file:** it's genuinely well-sourced (vault docs, ADRs, commit messages, README) — much stronger than most of the other posts in this batch. A handful of "Preston's Own Words" entries near the bottom of that file are sourced only from the old LLM-drafted post body, though, so question 1 exists to reconcile a live discrepancy: earlier today, in a different post's interview, he described this same system as "not really solved" and "all or nothing, triggered by the LLM" — which doesn't match the sources file's claim that the debounce + Plex-session-API fix shipped and was accepted back on 2026-08-02.

1. What's actually true right now — is the debounce + Plex-session-API fix from the sources file still in place and working, or has something changed since August 2nd that makes it more of an "all or nothing, triggered by the LLM" situation again?
> Yeah, it's still in place on working, but I am interested in improving it in order to be more efficient with how I use my GPU and also doing more things that it would like to do concurrently if possible

2. The old post has you saying you'd find out whether the poll-confirmation count (2) was tuned right by watching an actual overnight job run. Did you ever check, and was it right?
> Well, it was right, but often we were finding bugs that happened later on that avenged themselves often after a different edge case has happened

2a. (follow-up — "avenged themselves" is a good line, asked if a specific edge case came to mind)
> Just a general pattern, you know I can't remember if anything off the top of my head you know this is a pretty typical process where when you create new programs and applications and then you use them you're gonna see edge cases, and stuff happen that you didn't plan for and that's why observe ability and monitoring is so important when building things

3. You wrote off that it was "two distinct root causes needing two different fixes, not one" — Plex maintenance and gaming-launcher blips. What was it like realizing partway through that it wasn't one bug, it was two separate things?
> That's just how it is when you're building stuff. Devils in the details.

4. Hard-cancel policy — force-cancel inference, unload VRAM, no exceptions, instead of priority-based throttling. Any regrets on that, or does it still feel like the right call for a shared family machine?
> Yeah, the heart canceled policy is a little annoying because it would be great to be able to have whatever the process that is on the GPU allow itself to put itself into a place where it can pause its work cause then I could just pick up instead of losing whatever it is that we had been working on. I really don't like it but you know keep it simple till you figure it out. It's a great way to do things.

5. This whole investigation started because you were chasing a totally different problem — a LightRAG bulk-ingest job crashing with a read error on Ollama calls. What was that moment like, realizing the real cause was something completely unrelated?
> Oh what was a little annoying? I didn't really wanna work on it but I mean yeah that's cool. When you find out that things happen just handle it at the moment if you can or document it so you can handle it later. It's all just iterative.

6. Anything to skip past?
> no

Other sourced facts used in the draft (not from the intake): see `docs/intake/debugging-false-positive-gpu-contention-detection.sources.md` for the full list — key facts include the broker's role arbitrating gaming/Plex/Ollama for one GPU, the 3-second /proc poll interval, zero-debounce root cause, Plex's independent background-maintenance transcoding (Skip Intro, Credits, thumbnails, loudness), the /status/sessions API fix (scoped to real "Now Playing," Tautulli precedent), BROKER_YIELD_CONFIRM_POLLS=2 default with asymmetric debounce (entry debounced, clearing instant), the Wine system32 false-positive fix (winedevice.exe/services.exe/plugplay.exe), the ADR-0012 accepted/implemented status, and the original LightRAG httpx.ReadError/IndexFlushError crash that led to discovering the false-positive yields in the first place.
