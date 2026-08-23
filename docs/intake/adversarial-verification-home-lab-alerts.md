# Intake — adversarial-verification-home-lab-alerts

Date: 2026-08-23. Answered in chat by Preston, verbatim, unedited. Questions synthesized from `docs/intake/adversarial-verification-home-lab-alerts.sources.md` per the adaptive-interview process (`~/.claude/commands/voice-draft.md` Phase 2, updated 2026-08-23) — not the fixed 7-category template, generated from what the sources file left unresolved or gap-shaped.

## Round 1 — synthesized from source gaps

1. Two reviewers gave you flat-out conflicting timelines on the uid-1024 files — one said hours before, one said minutes after a restart. What happened when that split showed up? Had you already guessed which one was right, or was it a real "huh"?
> Well, ultimately, you can't really trust the output of agents at least in my experience I expect to get conflicting reports from agents. They tend to get a general idea of things that's why it's important for me to review and that's why I am currently exploring applying different agents and select ways against one another I don't know. I'm still thinking about it..

2. You tied this whole thing back to the GPU broker's phantom-game bug — trusting one signal as ground truth. What was the actual moment you realized adversarial verification was the fix, not just "double-check more"?
> Well, I never was really sold on the exact trigger for the mechanism for not taking over the GPU if there is a game you know I expect that there will be false positives like if maybe a game update or if Steam is running as a back on process or say I'm watching Plex and it uses the GPU butonly briefly or what app and then you know we're still trying to figure out how to actually have it work properly and resiliently when different processes don't use the entire GP at the same time and how we can best adequately solve that issue. It's not really solved.

3. 59 agents, four lanes, for four alerts going off. What was going through your head building that instead of just grinding through it yourself?
> I always try to make things run as concurrently as possible to save time again I don't trust the input into an agent and I don't trust the output. I think it gets it generally right so being able to just think about like all the different lanes that I'm probably gonna need to have fixed and then just having it to research and try to implement touch in ways that it doesn't step on each other is the best way to do it in my opinion and then I can just look through interview.

4. Two of the three survivors were "actively harmful if left alone." Left alone — what breaks, and when did that land for you as more than an annoyance?
> I mean, bugs happen and I'm not upset that they happen but it's just great to be able to see when those bugs happen and cover it and observe ability and monitoring and test so at least that one will events itself the next time it pops up. It was good applications and tools are maintained over overtime. They aren't built in a day.

5. Backlog's still draining slower than it should and you never traced one item start to finish. You said the honest move is to say so instead of closing the ticket — anyone push back on leaving it open? What's still bugging you about it?
> Well, you know I only have so much time of the day and I only I should've done that and I probably will be doing it again later. I don't like leaving things open, but you just got to use your time wisely. I think that's the main thing.

6. Anything here you want to skip past, or that doesn't belong in the post at all?
> Not really sure I like to keep things pretty focused

## Round 2 — follow-up, from what he said in round 1

1. On "applying different agents and select ways against one another" — still thinking about it, you said. What's that actually look like right now, even half-formed? Since the whole post is about adversarial verification, this reads like the natural next step of the same idea.
> Well, I'm looking into using claude to do some of the heavy lifting, but I have some local LOM models that I have that are developed by different countries such as Quinn and developed by different companies, and I definitely believe that these two entities have dueling interests and would critique things in ways that the other models never would

2. The GPU broker phantom-game callback — sounds like that's not actually behind you, it's still an open problem (game-detection trigger, Steam/Plex background GPU use, not solved). Should that line still connect to this post as "the same mistake I made before," or does it need reframing so it doesn't read like the GPU broker thing got fixed?
> So it's kind of an all or nothing kind of thing right now where it just will kill or Q queue up GPU process is triggered by the LLM, but it works. It's just not very elegant that can be improved

Other sourced facts used in the draft (not from the intake): see `docs/intake/adversarial-verification-home-lab-alerts.sources.md` for the full list — key facts include 18 candidates examined / 15 refuted / 3 survivors, PR #34, the three-check design (correctness / alternative explanation / fix safety), the SABnzbd `bandwidth_max` / `Speed limit set to 0 B/s` finding, the `sabnzbd_postproc_oldest_wait_seconds` collector-uptime bug and its `time_added`-seeded fix, the budget-governor `OnCalendar=` and reduced-tier-appending bugs, the NAS eth0 100 Mb/s / NFS throughput measurements, and the uid-1024 permission-mismatch split finding itself (16,703 files, mode 0600).
