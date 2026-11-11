# Sources for "A Clean ClamAV Scan Doesn't Mean the File Is Safe"

## Facts

- ClamAV is a **signature engine** that only matches known signatures | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:26 | "only catches what someone has already seen, fingerprinted, and shipped a rule for"
- Zero-days and packed/obfuscated executables walk past signature scanning | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:26 | "Zero-days and packed or obfuscated executables walk right past it"
- ClamAV is open source so attackers can test malware against it pre-release | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:28 | "anyone can download the exact detection logic and test their malware against it"
- Researchers measured samples built to dodge open-source detectors evading ClamAV 70–85% of the time | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:30 | "70 to 85 percent of the time, without even needing inside knowledge"
- Original scan gate had clamd plus blocklist on file extensions (.exe, .scr, .bat, etc.) | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:53 | "clamd plus a blocklist on file extensions like `.exe`, `.scr`, `.bat`"
- Threat model is commodity crack and keygen malware bundled into executables | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:55 | "commodity crack and keygen malware bundled into an executable a downloader was told to run"
- DetectPUA flag in ClamAV targets keygens and cracks, available via clamd.conf | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:59 | "ClamAV has a flag, `DetectPUA`, that flags potentially unwanted applications"
- PUA signatures are less rigorously curated than malware signatures, expect more false positives | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:61 | "less rigorously curated than core malware signatures, so expect more false positives"
- ClamAV's category-exclusion filtering for PUA is broken in current shipped version | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:63 | "ClamAV's own category-exclusion filtering for PUA is currently broken in the shipped version"
- clamav-unofficial-sigs aggregates four feeds: Sanesecurity, SecuriteInfo, URLhaus, MalwarePatrol | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:67–72 | feeds listed by name in text
- Third-party feeds deploy via cron job and shared volume, no code changes to scan gate | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:74 | "just a cron job and a shared volume"
- Clamd loads .yar files natively from database directory and applies YARA against unpacked files | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:80 | "clamd loads `.yar` files natively...and applies YARA rules against files it has already unpacked"
- Clamd's YARA support is a subset: no imports, no external variables, 64-string cap per rule, min 2-byte strings | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:84–87 | "No imports, No external variables, A 64-string cap per rule, Minimum two-byte string segments"
- YARA-Forge "Core" tier is curated to avoid unvetted community rules tanking performance | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:89 | "one bad community rule reportedly took a three-hour scan job to seven"
- Hash lookup uses SHA-256, checks VirusTotal or MetaDefender free tier, hash-only (never upload file) | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:97 | "compute a SHA-256...and check it against VirusTotal's or MetaDefender's free tier — hash only"
- Privacy concern: uploading file to public multi-scanner makes it permanently visible and searchable | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:99 | "Uploading the actual file to a public multi-scanner makes it permanently visible and searchable"
- Hash lookup requires new verdict state in scan gate's aggregation logic (not yet shipped) | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:101 | "This isn't shipped in my scan gate's code yet"
- Detect It Easy (diec) identifies packers and reports Shannon entropy; ~7 bits entropy signals packed/encrypted code | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:105 | "A section reading above roughly **7 bits of entropy** is the standard first signal"
- Entropy/packer detection routed to quarantine-and-alert (not auto-block) due to legitimate installers being highly compressed | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:107 | "plenty of legitimate installers are also highly compressed"
- Self-hosted dynamic-analysis sandbox (CAPEv2) exists but not being built; threat model doesn't warrant it | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:111–113 | "not a targeted attacker who needs behavioral analysis to unmask"
- A sufficiently novel packer + payload built against ClamAV public signatures + PUA can still slip through all layers | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:117–119 | "paired with a payload built against ClamAV's public signature set and PUA rules specifically, can still get through"
- Hash lookup only helps once a file is known; first-seen samples get a pass by definition | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:119 | "only helps once a file is already known to someone. A first-seen sample gets a pass there by definition"

## Anything Preston himself said

- "I run a scan gate in front of my media-download pipeline: everything that lands from the download clients gets checked by a ClamAV daemon before it's allowed into the library" | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:24 | direct first-person statement of his architecture decision
- Treating a clean verdict as the end of the question was wrong, "It isn't" | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:25–26 | explicit verdict correction
- "For a long time I treated a clean verdict as the end of the question. It isn't." | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:25 | his own changing perspective on the issue
- "What changed isn't that my scan gate is now airtight. It's that I stopped treating a clean verdict as **proof of safety**, and started treating it as one data point among several, none of which is trustworthy alone." | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:121 | his final honest assessment and posture shift
- ClamAV's own category-exclusion filtering is "currently broken in the shipped version I'm running, so I can't cleanly say 'flag keygens but ignore adware'" yet is "turning it on anyway, tuning against real false positives as they show up" | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:63 | his pragmatic call on an imperfect tool
- "The alternative is leaving the single most on-target detection knob switched off" (on DetectPUA) | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:63 | his reasoning for enabling PUA despite false positives
- "Of everything I added, this is the **best ratio of detection gained to effort spent**" (on third-party feeds) | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:76 | his prioritization judgment
- On sandboxing: "If one of the layers above misses something in an actual incident, that's the trigger to revisit sandboxing" | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:113 | his incident-driven approach to adding tools
- Clamd's YARA support: "Curation here isn't optional polish: it's the difference between a scan gate that finishes and one that doesn't" | content/english/blog/clamav-clean-scan-doesnt-mean-safe.md:93 | his experience-backed statement on rule-set quality tradeoffs

## Memory and observability context (supporting but not directly quoted)

- 2026-07-21: clamd YARA-rule silent failure discovered during observability audit; Sanesecurity feed only ~10% parse success on clamd's YARA engine subset | ~/.claude/projects/-Users-prestonbernstein/memory/project_observability_gaps.md | informs his later choice of YARA-Forge "Core" tier over raw community packs
- 2026-07-15 vault research: media-scan-gate-detection-hardening.md sweep found exact same detection layers (DetectPUA, third-party feeds, YARA rules, hash lookup, entropy checks) as technical recommendations | /volume1/obsidian-vault/Development/Research/media-scan-gate-detection-hardening.md | independent research validation of his chosen layering strategy
- 2026-07-16 vault research: clamav-large-file-scanning-limits.md documents separate 2GB cap problem (outside this post's scope but reflects his broader scan-gate knowledge) | /volume1/obsidian-vault/Development/Research/clamav-large-file-scanning-limits.md | shows depth of his ClamAV operator knowledge

---

**Count: 27 facts | 9 Preston's own statements**
