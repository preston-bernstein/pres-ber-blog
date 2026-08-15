---
slug: gpu-broker-false-positive-bug-blocked-my-own-inference
topic_mode: true
---

# Sources: GPU Broker False-Positive Bug

## Facts

| Fact | Source | Quote |
|------|--------|-------|
| Broker arbitrates single GPU between gaming, Plex, and Ollama inference | ~/dev/resource-broker/README.md:3 | "Three things compete for it: gaming, Plex video transcoding, and Ollama inference" |
| Detector scans /proc every 3 seconds default (BROKER_DETECT_INTERVAL) | ~/dev/resource-broker/README.md:52 | "BROKER_DETECT_INTERVAL \| 3s \| Contention re-check period" |
| Zero debounce before fix: acted on single poll match | vault/gpu-broker-false-positive-detection-fix.md:Context | "The instant *any single poll* matches...There is zero debounce and no corroborating signal" |
| Plex runs transcoder for background maintenance independent of playback | ~/dev/resource-broker/internal/plex/plex.go:4-9 | "Plex runs its 'Plex Transcoder' binary for background maintenance too...on its own server-scheduled cadence, completely independent of anyone actually watching" |
| Plex background work: Skip Intro, Credits detection, thumbnails, loudness analysis | ~/dev/resource-broker/docs/adr/0012:20 | "Skip Intro/Credits detection, chapter-thumbnail generation, loudness analysis" |
| Process-name match could not distinguish Plex playback from maintenance | commit ab9512a message | "a bare process-name match yielded the GPU for that too, refusing all inference for no real contention" |
| ADR-0012 status: accepted, implemented | ~/dev/resource-broker/docs/adr/0012:1 | "Status: accepted; implemented in internal/plex/, internal/detect/detect.go, internal/yield/yield.go, internal/config/config.go, cmd/broker/main.go" |
| Plex session corroboration: queries /status/sessions API | ~/dev/resource-broker/internal/plex/plex.go:50 | "c.baseURL+'/status/sessions'" |
| /status/sessions scoped to "Now Playing" activity only | ~/dev/resource-broker/docs/adr/0012:9 | "Plex's own '/status/sessions' endpoint (scoped to real 'Now Playing' activity, unlike a process-name match)" |
| PLEX_TOKEN enables corroboration, unset keeps old behavior | ~/dev/resource-broker/README.md:55 | "PLEX_TOKEN \| _(unset)_ \| Plex API token. Unset disables Plex session corroboration entirely (process-name match alone is treated as contention, the pre-existing behavior)" |
| Plex API error fails toward yielding, never toward serving | ~/dev/resource-broker/docs/adr/0012:9 | "a Plex API error still fails toward yielding, never toward serving" |
| Yield-entry debounce requires BROKER_YIELD_CONFIRM_POLLS consecutive detections | ~/dev/resource-broker/README.md:53 | "BROKER_YIELD_CONFIRM_POLLS \| 2 \| Consecutive same-reason detections required before entering yield (filters single-poll false positives; clearing is never debounced)" |
| Default BROKER_YIELD_CONFIRM_POLLS: 2 | ~/dev/resource-broker/docs/adr/0012:20 | "'BROKER_YIELD_CONFIRM_POLLS' (default '2')" |
| Reason change resets confirmation count | ~/dev/resource-broker/docs/adr/0012:10 | "A reason change...resets the count rather than carrying it over" |
| Clearing contention never debounced, instant recovery | ~/dev/resource-broker/docs/adr/0012:10 | "Clearing contention is never debounced: it takes effect on the very next poll" |
| Gaming launcher false positive: single-poll process-match blips | commit ab9512a message | "a single-poll process-match blip (game launcher background housekeeping transiently matching a gaming regex) also forced a yield" |
| Wine system32 false positive fix excludes Wine bootstrap executables | commit 41ce03f title | "Exclude Wine's own system32 runtime executables from gaming-wine detection" |
| Wine system32 match on Norgate Data Updater Wine prefix | ~/dev/resource-broker/internal/detect/detect.go (post-41ce03f) | "non-game tools like the Norgate Data Updater" |
| Wine bootstrap executables: winedevice.exe, services.exe, plugplay.exe | commit 41ce03f | "winedevice.exe/services.exe/plugplay.exe always run from the prefix's windows/system32 directory" |
| Wire-up: cmd/broker/main.go, internal/config, internal/detect, internal/yield | ~/dev/resource-broker/docs/adr/0012:3 | "implemented in cmd/broker/main.go" |
| Deployed 2026-08-02 | commit ab9512a Date | "Sun Aug 2 22:07:59 2026 -0400" |
| Detection logic ported from Bash V3 daemon | ~/dev/resource-broker/docs/adr/0012:5 | "Detection (ported verbatim from the Bash V3 daemon, see ADR-0001)" |
| ADR-0003/0004 define yield-to-gaming/Plex policy, untouched by fix | ~/dev/resource-broker/docs/adr/0012:17 | "Neither change touches the yield-to-gaming/Plex law itself (ADR-0003/0004)" |
| Plex /status/sessions returns mediaContainer.Size=0 when nothing playing | ~/dev/resource-broker/internal/plex/plex.go:42-43 | "size is the count of active sessions (0 when nothing is playing)" |
| Plex API endpoint: /status/sessions (requires X-Plex-Token header) | ~/dev/resource-broker/internal/plex/plex.go:54 | "req.Header.Set('X-Plex-Token', c.token)" |
| Tautulli (shipping Plex tool) already uses session API for playback detection | vault/gpu-broker-false-positive-detection-fix.md:apps section | "Tautulli's get_activity API mirrors Plex's session-scoped semantics...pattern to copy: consume the session API" |
| No official "game running in foreground" API exists for Heroic/Lutris | vault/gpu-broker-false-positive-detection-fix.md:apps section | "No official 'game running in foreground' API found for Heroic Games Launcher or Lutris" |

## Preston's Own Words

| Statement | Source | Full Quote |
|-----------|--------|-----------|
| How the Plex bug was discovered | vault/gpu-broker-false-positive-detection-fix.md:Context | "Diagnosed 2026-07-15 while investigating why a LightRAG bulk-ingest job kept crashing (`httpx.ReadError` on `ollama_embed`, cascading into `IndexFlushError` → full pipeline halt)" |
| Symptom: yield events every 10-20 minutes | vault/gpu-broker-false-positive-detection-fix.md:Context | "journalctl -u ollama-broker on the desktop shows a yield event roughly every 10–20 minutes, **around the clock including 1am–6am** — far too frequent to be real sustained gameplay/streaming" |
| Evidence yield was spurious | vault/gpu-broker-false-positive-detection-fix.md:Context | "ps aux during one such window showed only Steam's idle background client, no actual game process" |
| Plex false-positive was the dominant case | vault/gpu-broker-false-positive-detection-fix.md:Verdict | "Plex false-positives are the *dominant, well-understood* case: Plex's own support docs confirm its background maintenance (Skip Intro/Credits detection, chapter-thumbnail generation) runs the identical `Plex Transcoder` binary on a server-scheduled cadence, completely independent of playback" |
| Root cause of Plex false positive | vault/gpu-broker-false-positive-detection-fix.md:Verdict | "a substring match on that process name can never tell the two apart, no matter how much debounce is added" |
| Correct fix for Plex: query session API | vault/gpu-broker-false-positive-detection-fix.md:Verdict | "The correct fix is to stop grepping for the process and instead ask Plex directly via its own session API (`/status/sessions`), which is documented and confirmed-in-practice (Tautulli...already does exactly this) to be scoped to actual 'Now Playing' activity only" |
| Gaming false positives required debounce | vault/gpu-broker-false-positive-detection-fix.md:Verdict | "no vendor exposes an official 'a game is actually running in the foreground' API...so the right fix there is exactly the threshold/debounce pattern...require N consecutive positive polls (a standard SRE flapping-detection pattern)" |
| False positives two distinct root causes | vault/gpu-broker-false-positive-detection-fix.md:Verdict | "The false positives are real and have two distinct root causes needing two different fixes, not one" |
| Cost analysis of debounce latency | vault/gpu-broker-false-positive-detection-fix.md:Verdict | "which costs a few seconds of added latency on a genuine game launch — the same order of magnitude ADR-0003 already accepts" |
| Why false positives were worth fixing | vault/gpu-broker-false-positive-detection-fix.md:Verdict | "~3–6s single-poll blips that dominate the gaming-reason false positives observed in the logs" |
| Commit message: Plex background work independence | commit ab9512a | "Plex runs its transcoder binary for background maintenance (Skip Intro/Credits detection, thumbnail generation) on its own schedule, independent of anyone actually watching something" |
| Commit message: impact of bare process match | commit ab9512a | "a bare process-name match yielded the GPU for that too, refusing all inference for no real contention" |
| Commit message: gaming launcher false positives | commit ab9512a | "a single-poll process-match blip (game launcher background housekeeping transiently matching a gaming regex) also forced a yield for something that wasn't sustained gameplay" |
| Commit message: debounce asymmetry rationale | commit ab9512a | "Clearing contention is never debounced — recovery only helps inference and never risks starving gaming/Plex, so it stays instant" |
| Commit message: fail-safe direction | commit ab9512a | "both fail toward yielding on any doubt (Plex API error, ambiguous reason)" |
