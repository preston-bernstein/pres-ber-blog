# Intake — clamav-clean-scan-doesnt-mean-safe

Date: 2026-08-23. Answered in chat by Preston, verbatim, unedited. Questions synthesized from `docs/intake/clamav-clean-scan-doesnt-mean-safe.sources.md` per the adaptive-interview process (`~/.claude/commands/voice-draft.md` Phase 2, updated 2026-08-23), asked one at a time.

**Note on this piece's sources file:** its "Anything Preston himself said" section was sourced entirely from the existing (LLM-drafted, rejected-process) post body, not from memory/vault/chat. Question 6 below exists specifically to re-elicit the closing belief in his real words rather than trust the old post's phrasing.

1. The post has you saying "for a long time I treated a clean verdict as the end of the question. It isn't." Was there an actual moment that flipped that, or was it more a slow realization?
> No, no real one purpose I just kinda never trust things to be ultimately secure or I just take the sad that something that I find to be secure probably isn't because of how fast things change and all the different vectors in which people can make a tax against

2. You turned on DetectPUA and category filtering knowing it's broken and would throw more false positives, tuning against them "as they show up." Has one actually annoyed you yet, or is that still hypothetical?
> Oh, nobody is annoyed me yet that's all hypothetical at this point at least that I know of

3. You called the third-party feeds (Sanesecurity, SecuriteInfo, URLhaus, MalwarePatrol) the "best ratio of detection gained to effort spent" of everything you added. What made that one the easy win compared to the rest?
> Well, I just thought the data drive it. I did some research and those were the bits that were added to my list. The research tried to be thorough and up-to-date but you know this may be outdated at this point. This is just the way that security is, but yeah, using third-party feeds is a great way to keep up-to-date and I feel like they're pretty trusted sources at least from what I've seen

4. You said not building a sandbox (CAPEv2) is fine unless something slips past the layers above in an actual incident — has anything come close to triggering that yet, or is it purely hypothetical?
> Again, that's a really good question. I don't know if anything has come close to triggering that yet. Nothing has as far as I know of, but that doesn't mean it hasn't happened. I mean it's probably a good time now to re-examine

5. The hash-lookup check against VirusTotal/MetaDefender isn't shipped in your scan gate's code yet. Priority, or are you actually stuck on something (the new verdict-state logic)?
> Well, I just had put it aside for now. I actually would like to do that now and see where it comes. Maybe you'll see that in another post.

6. The old post ends with you saying the scan gate isn't airtight now, you just stopped treating a clean verdict as proof and started treating it as one data point among several, none trustworthy alone. Is that really how you'd put it, or is there a sharper way to say what actually changed?
> It's one of the mini indicators that something is wrong or off. I always need more really it's a trade-off between trying to plug up every hole and trying to stay as current up-to-date as you can be at all times plus there's only so much compute and you can only spend so much of your time you have to making sure that they're safe. You know analysis paralysis is a real thing that being said, I definitely treat security is my priority one for anything that I do

7. Anything to skip past?
> all good

Other sourced facts used in the draft (not from the intake): see `docs/intake/clamav-clean-scan-doesnt-mean-safe.sources.md` for the full list — key facts include ClamAV as a signature-only engine (70-85% evasion rate against samples built to dodge open-source detectors), the original clamd+extension-blocklist gate, DetectPUA and its known-broken category-exclusion filtering, the four third-party feed sources deployed via cron+shared volume, clamd's restricted YARA subset (no imports, no external variables, 64-string cap, 2-byte minimum), YARA-Forge's curated "Core" tier (one bad community rule took a 3-hour scan to 7), the SHA-256 hash-only lookup design and its privacy rationale, Detect It Easy's ~7-bit entropy packer signal routed to quarantine-not-block, and the CAPEv2 sandbox left unbuilt by threat-model judgment.
