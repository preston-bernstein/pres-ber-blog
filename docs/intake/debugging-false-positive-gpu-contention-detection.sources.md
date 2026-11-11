---
slug: debugging-false-positive-gpu-contention-detection
topic_mode: true
---

# Sources: Debugging False-Positive GPU Contention Detection

## Facts

| Fact | Source | Quote |
|------|--------|-------|
| Broker arbitrates single GPU between gaming, Plex, and Ollama inference | ~/dev/resource-broker/README.md | "Three things compete for it: gaming, Plex video transcoding, and Ollama inference" |
| Detector scans /proc every 3 seconds default (BROKER_DETECT_INTERVAL) | ~/dev/resource-broker/README.md | "BROKER_DETECT_INTERVAL \| 3s \| Contention re-check period" |
| Zero debounce before fix: acted on single poll match | vault/gpu-broker-false-positive-detection-fix.md | "The instant *any single poll* matches...There is zero debounce and no corroborating signal" |
| Plex runs transcoder for background maintenance independent of playback | ~/dev/resource-broker/internal/plex/plex.go | "Plex runs its 'Plex Transcoder' binary for background maintenance too...on its own server-scheduled cadence, completely independent of anyone actually watching" |
| Plex background work: Skip Intro, Credits detection, thumbnails, loudness analysis | ~/dev/resource-broker/docs/adr/0012 | "Skip Intro/Credits detection, chapter-thumbnail generation, loudness analysis" |
| Process-name match could not distinguish Plex playback from maintenance | resource-broker commit ab9512a | "a bare process-name match yielded the GPU for that too, refusing all inference for no real contention" |
| ADR-0012 status: accepted, implemented | ~/dev/resource-broker/docs/adr/0012 | "Status: accepted; implemented in internal/plex/, internal/detect/detect.go, internal/yield/yield.go" |
| Plex session corroboration: queries /status/sessions API | ~/dev/resource-broker/internal/plex/plex.go | "c.baseURL+'/status/sessions'" |
| /status/sessions scoped to "Now Playing" activity only | vault/gpu-broker-false-positive-detection-fix.md | "Plex's own '/status/sessions' endpoint (scoped to real 'Now Playing' activity, unlike a process-name match)" |
| PLEX_TOKEN enables corroboration, unset keeps old behavior | ~/dev/resource-broker/README.md | "PLEX_TOKEN \| _(unset)_ \| Plex API token. Unset disables Plex session corroboration entirely (process-name match alone is treated as contention, the pre-existing behavior)" |
| Plex API error fails toward yielding, never toward serving | ~/dev/resource-broker/docs/adr/0012 | "a Plex API error still fails toward yielding, never toward serving" |
| Yield-entry debounce requires BROKER_YIELD_CONFIRM_POLLS consecutive detections | ~/dev/resource-broker/README.md | "BROKER_YIELD_CONFIRM_POLLS \| 2 \| Consecutive same-reason detections required before entering yield (filters single-poll false positives; clearing is never debounced)" |
| Default BROKER_YIELD_CONFIRM_POLLS: 2 | ~/dev/resource-broker/docs/adr/0012 | "'BROKER_YIELD_CONFIRM_POLLS' (default '2')" |
| Reason change resets confirmation count | ~/dev/resource-broker/docs/adr/0012 | "A reason change...resets the count rather than carrying it over" |
| Clearing contention never debounced, instant recovery | ~/dev/resource-broker/docs/adr/0012 | "Clearing contention is never debounced: it takes effect on the very next poll" |
| Gaming launcher false positive: single-poll process-match blips | resource-broker commit ab9512a | "a single-poll process-match blip (game launcher background housekeeping transiently matching a gaming regex) also forced a yield" |
| Wine system32 false positive fix excludes Wine bootstrap executables | resource-broker commit 41ce03f | "Exclude Wine's own system32 runtime executables from gaming-wine detection" |
| Wine bootstrap executables: winedevice.exe, services.exe, plugplay.exe | resource-broker commit 41ce03f | "winedevice.exe/services.exe/plugplay.exe always run from the prefix's windows/system32 directory" |
| Deployed 2026-08-02 | resource-broker commit ab9512a | "Sun Aug 2 22:07:59 2026 -0400" |
| Detection logic ported from Bash V3 daemon | ~/dev/resource-broker/docs/adr/0012 | "Detection (ported verbatim from the Bash V3 daemon, see ADR-0001)" |
| ADR-0003/0004 define yield-to-gaming/Plex policy, untouched by fix | ~/dev/resource-broker/docs/adr/0012 | "Neither change touches the yield-to-gaming/Plex law itself (ADR-0003/0004)" |
| Plex /status/sessions returns mediaContainer.Size=0 when nothing playing | ~/dev/resource-broker/internal/plex/plex.go | "size is the count of active sessions (0 when nothing is playing)" |
| Plex API endpoint: /status/sessions (requires X-Plex-Token header) | ~/dev/resource-broker/internal/plex/plex.go | "req.Header.Set('X-Plex-Token', c.token)" |
| Tautulli (shipping Plex tool) already uses session API for playback detection | vault/gpu-broker-false-positive-detection-fix.md | "Tautulli's get_activity API mirrors Plex's session-scoped semantics...pattern to copy: consume the session API" |
| No official "game running in foreground" API exists for Heroic/Lutris | vault/gpu-broker-false-positive-detection-fix.md | "No official 'game running in foreground' API found for Heroic Games Launcher or Lutris" |
| Hard-cancel policy: unload VRAM, kill inference, return GPU completely | blog post line 26-27 | "force-cancels whatever inference is running and unloads the model from VRAM, no exceptions" |
| Detector checks for process substrings: Plex Transcoder, Steam, Heroic, Lutris, wine .exe | blog post line 41-46 | "command-line substrings: Plex Transcoder, Steam's launch marker, Heroic's and Lutris's runner patterns, bare wine .exe" |
| LightRAG crash cascaded from Ollama read errors during yields | blog post line 31 | "LightRAG embedding crash...kept dying partway through with a read error on the Ollama calls" |
| Yield events every 10-20 minutes around the clock including 1am-6am | blog post line 35 | "roughly every 10 to 20 minutes, around the clock, including the 1am to 6am stretch" |
| Plex support docs confirm background maintenance run on server schedule | https://support.plex.tv/articles/credits-detection/ | "Credits detection runs as a scheduled task during regular server maintenance" |
| Practitioner pattern: N-consecutive-poll before state change not on first sample | https://web-alert.io/blog/alert-flapping-detection-taming-unstable-alerts | "require multiple consecutive failures (e.g. 3 in a row) before declaring a state change" |
| Standard debounce flapping detection applied to process matches | vault/gpu-broker-false-positive-detection-fix.md | "require N consecutive positive polls (a standard SRE flapping-detection pattern)" |

## Preston's Own Words

| Statement | Source | Full Quote |
|-----------|--------|-----------|
| How the bug was discovered | vault/gpu-broker-false-positive-detection-fix.md | "Diagnosed 2026-07-15 while investigating why a LightRAG bulk-ingest job kept crashing (`httpx.ReadError` on `ollama_embed`, cascading into `IndexFlushError` → full pipeline halt)" |
| Symptom: yield events every 10-20 minutes around clock | vault/gpu-broker-false-positive-detection-fix.md | "journalctl -u ollama-broker on the desktop shows a yield event roughly every 10–20 minutes, **around the clock including 1am–6am** — far too frequent to be real sustained gameplay/streaming" |
| Evidence yield was spurious | vault/gpu-broker-false-positive-detection-fix.md | "ps aux during one such window showed only Steam's idle background client, no actual game process" |
| Plex false-positive was the dominant case | vault/gpu-broker-false-positive-detection-fix.md | "Plex false-positives are the *dominant, well-understood* case: Plex's own support docs confirm its background maintenance (Skip Intro/Credits detection, chapter-thumbnail generation) runs the identical `Plex Transcoder` binary on a server-scheduled cadence, completely independent of playback" |
| Root cause of Plex false positive | vault/gpu-broker-false-positive-detection-fix.md | "a substring match on that process name can never tell the two apart, no matter how much debounce is added" |
| Correct fix for Plex: query session API | vault/gpu-broker-false-positive-detection-fix.md | "The correct fix is to stop grepping for the process and instead ask Plex directly via its own session API (`/status/sessions`), which is documented and confirmed-in-practice (Tautulli...already does exactly this) to be scoped to actual 'Now Playing' activity only" |
| Gaming false positives required debounce | vault/gpu-broker-false-positive-detection-fix.md | "no vendor exposes an official 'a game is actually running in the foreground' API...so the right fix there is exactly the threshold/debounce pattern...require N consecutive positive polls (a standard SRE flapping-detection pattern)" |
| False positives two distinct root causes | vault/gpu-broker-false-positive-detection-fix.md | "The false positives are real and have two distinct root causes needing two different fixes, not one" |
| Cost analysis of debounce latency | vault/gpu-broker-false-positive-detection-fix.md | "which costs a few seconds of added latency on a genuine game launch — the same order of magnitude ADR-0003 already accepts" |
| Why false positives were worth fixing | vault/gpu-broker-false-positive-detection-fix.md | "~3–6s single-poll blips that dominate the gaming-reason false positives observed in the logs" |
| Commit message: Plex background work independence | resource-broker commit ab9512a | "Plex runs its transcoder binary for background maintenance (Skip Intro/Credits detection, thumbnail generation) on its own schedule, independent of anyone actually watching something" |
| Commit message: impact of bare process match | resource-broker commit ab9512a | "a bare process-name match yielded the GPU for that too, refusing all inference for no real contention" |
| Commit message: gaming launcher false positives | resource-broker commit ab9512a | "a single-poll process-match blip (game launcher background housekeeping transiently matching a gaming regex) also forced a yield for something that wasn't sustained gameplay" |
| Commit message: debounce asymmetry rationale | resource-broker commit ab9512a | "Clearing contention is never debounced — recovery only helps inference and never risks starving gaming/Plex, so it stays instant" |
| Commit message: fail-safe direction | resource-broker commit ab9512a | "both fail toward yielding on any doubt (Plex API error, ambiguous reason)" |
| Why hard-cancel was the right choice | blog post line 102 | "I wanted a guarantee that the GPU comes back completely clean the moment someone in this house wants to play, and priority-based throttling can't promise that as cleanly. I still think that tradeoff was right for a shared family machine." |
| Debounce fix is live, Plex fix not yet shipped | blog post line 87 | "I've only shipped half of this fix. The poll-confirmation gate is small, self-contained, and went in first. The Plex session-API swap hasn't happened yet." |
| Uncertainty on confirmation poll count | blog post line 89 | "I'm also not confident two or three polls is the right number for every workload this machine runs. I picked it from a general flapping-detection convention rather than from measurement on my own logs." |
| Will verify in live overnight job run | blog post line 103 | "I'll find out whether either was tuned right the next time this job runs unattended overnight, and either survives or it doesn't." |
