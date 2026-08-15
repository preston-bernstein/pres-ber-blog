# Post intake — answer this before anyone drafts a post

This is the interview a ghostwriter would run before writing a word. It exists because a post drafted from notes alone comes out as a report, and a report with asides stapled on comes out as a costume. Everything in the draft has to trace back to what's written here. If a detail isn't here, it doesn't go in.

Answer by voice memo (transcribe it raw, don't clean it up) or by bullets. Fragments, tangents, and swearing are all fine — they're the point. Aim for five minutes of talking, not five minutes of writing.

Sources for the question shape: how ghostwriters run a first interview (storytelling and sensory prompts, verbatim cadence bank), McPhee's "Elicitation," Vonnegut's "genuine caring, not games with language." Full citations: vault `Development/Research/humanizing-llm-writing-voice-capture.md`.

## The questions

1. **Take me to the moment.** Not the summary — the scene. When did you decide to do this / when did it break / when did you notice? Where were you, what were you looking at, what time was it, what else was going on?
2. **Why did you care?** What was the itch? What were you actually trying to get, or get away from?
3. **What surprised you or pissed you off?** Name the feeling plainly. What did you expect and what happened instead?
4. **What do you believe now that you didn't before?** One sentence if you can. This is the post's real claim; the front-loaded verdict comes from here.
5. **What would you tell a friend about this over a beer that you'd never put in a README?** The opinion you'd hedge in public. The thing that's a little embarrassing. The part you'd skip if you were being professional.
6. **What's still bugging you / unresolved?** The loose end. Don't tidy it.
7. **Anything the reader should skip past?** What's obvious to anyone who'd read this — so the draft doesn't spend a paragraph on it.

## What the drafting agent does with this

- Keeps your phrasing wherever it exists. Sentences you actually said go in as close to verbatim as grammar allows (McPhee: tighten for clarity, never falsify).
- Adds no fact, feeling, number, or scene that isn't in the answers or in the linked notes/decision records. Vague-but-true beats specific-but-invented every time.
- Spends words in proportion to what you spent breath on. If you talked for two minutes about the SSH hop and ten seconds about the distro, the post does too.
- Uses at most one or two of your presence moves per post (an aside, a direct address, a blunt undefended opinion, a "wait, but") — and only ones that were in the answers.
- Then cuts to ≤65% of its first draft, reads it aloud, runs `~/.claude/skills/writing-style.md`'s checklist last, then the GEO contract in `CLAUDE.md`.

## Where the answers live

`docs/intake/<post-slug>.md` — raw transcript or bullets, dated, unedited. Committed with the post so the provenance is inspectable later.
