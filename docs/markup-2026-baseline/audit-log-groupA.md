# Markup Audit Log — Group A

Scope: the 10 files listed in the Group A task. For every bold, italic, and
inline-code span found in body content (front matter excluded), one line
below records whether it was kept or removed and why. Files with no entries
had zero bold/italic/code spans in their body content.

No bold spans and no italic spans (`*text*` or `_text_`) were found in any
of the 10 files' body content — nothing to log for those two categories.
Only inline-code spans exist, listed below.

## adversarial-verification-home-lab-alerts.md
(no bold, italic, or code spans found)

## debugging-false-positive-gpu-contention-detection.md
- debugging-false-positive-gpu-contention-detection.md:24 | code | kept | literal shell command (`ps aux`)
- debugging-false-positive-gpu-contention-detection.md:28 | code | kept | literal filesystem path (`/proc`)
- debugging-false-positive-gpu-contention-detection.md:28 | code | kept | literal process-name string the detector matches (`Plex Transcoder`)
- debugging-false-positive-gpu-contention-detection.md:28 | code | kept | literal example process-name pattern (`wine .exe`)
- debugging-false-positive-gpu-contention-detection.md:32 | code | kept | literal binary/process name (`Plex Transcoder`)
- debugging-false-positive-gpu-contention-detection.md:32 | code | kept | literal API endpoint path (`/status/sessions`)

## enabling-docker-read-write-operations-on-synology-nas-from-windows-11.md
(front matter only — draft post has no body content, so no spans to review)

## gaming-desktop-vs-dedicated-compute-box-idle-power.md
(no bold, italic, or code spans found)

## mini-itx-is-the-wrong-form-factor-for-a-quiet-ai-homelab-pc.md
(no bold, italic, or code spans found)

## not-every-docker-container-belongs-on-the-nas.md
- not-every-docker-container-belongs-on-the-nas.md:29 | code | kept | literal environment variable / config setting name (`IMMICH_MACHINE_LEARNING_URL`)
- not-every-docker-container-belongs-on-the-nas.md:33 | code | kept | literal naming convention for the `*arr` app family
- not-every-docker-container-belongs-on-the-nas.md:41 | code | kept | literal tool/service name (`ntfy`)

## proxmox-for-the-xps-17-offload-box.md
- proxmox-for-the-xps-17-offload-box.md:24 | code | kept | literal shell command (`docker compose down -v`)
- proxmox-for-the-xps-17-offload-box.md:28 | code | kept | literal shell command (`apt upgrade`)
- proxmox-for-the-xps-17-offload-box.md:32 | code | kept | literal filename (`docker-compose.yml`)
- proxmox-for-the-xps-17-offload-box.md:38 | code | kept | literal config directive (`HandleLidSwitch=ignore`)
- proxmox-for-the-xps-17-offload-box.md:38 | code | kept | literal file path (`/etc/systemd/logind.conf`)
- proxmox-for-the-xps-17-offload-box.md:38 | code | kept | literal filename (`sleep.conf`)
- proxmox-for-the-xps-17-offload-box.md:38 | code | kept | literal kernel boot parameter (`consoleblank=300`)

## rebuilding-home-network-from-the-modem-up.md
(no bold, italic, or code spans found)

## runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md
- runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md:31 | code | kept | literal CLI flag (`--limit-mm-per-prompt`)
- runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md:31 | code | kept | literal flag value example (`image=1`)
- runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md:39 | code | kept | literal API mutation name (`podStop`)
- runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md:39 | code | kept | literal API call signature example (`podStop(input: {podId: "ID"}) { id desiredStatus }`)
- runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md:39 | code | kept | literal API mutation name being cited as absent (`podTerminate`)
- runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md:43 | code | kept | literal API mutation name (`podStop`)

## surviving-a-gpu-yield-window-embedding-servers.md
- surviving-a-gpu-yield-window-embedding-servers.md:29 | code | kept | literal environment variable name (`OLLAMA_MAX_QUEUE`)
- surviving-a-gpu-yield-window-embedding-servers.md:29 | code | kept | literal CLI flag (`--max-concurrent-requests`)
- surviving-a-gpu-yield-window-embedding-servers.md:33 | code | kept | literal environment variable and value (`TIMEOUT=None`)

## Link text (Task 2) — for reference, not part of the bold/italic/code count
- runpod-vs-gemini-vlm-inference-idle-auto-stop-gap.md:21 | link | kept | text "the estate-sale scanner series" already describes the destination, no change needed
