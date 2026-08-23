# Sources: Adversarial Verification for Home Lab Alerts

## Facts

- Four alerts firing in home infrastructure at same time | memory/project_alert_diagnosis.md:11 | "Four alerts were going off across my home infrastructure at once"
- 18 candidate root causes examined | memory/project_alert_diagnosis.md:12 | "Eighteen candidates went in"
- 15 of 18 root causes refuted | memory/project_alert_diagnosis.md:12, vault/home-infra-alert-diagnosis.md:13 | "15 of 18 candidate root causes were REFUTED"
- 3 root causes survived verification | vault/home-infra-alert-diagnosis.md:34-38 | "Three survivors" (two confirmed, one split)
- 2 survivors were actively harmful if left alone | post:95 | "Two of the three survivors were actively harmful if left alone"
- Fixes merged as PR #34 | memory/project_alert_diagnosis.md:12 | "Fixes merged as PR #34 (`22d30e2`)"
- Three independent checks per candidate: correctness, alternative explanation, fix safety | post:30-35 | "three independent checks against three different failure modes"
- Two negative checks out of three killed a finding | post:36 | "Two negative checks out of three killed a finding"
- SABnzbd shows "Speed limit set to 0 B/s" in logs | vault/home-infra-alert-diagnosis.md:36 | "0 means unlimited. `Speed limit set to 0 B/s` is SABnzbd's log for unlimited"
- Zero limit in SABnzbd percentage branch means unlimited | memory/project_alert_diagnosis.md:20-27, vault/home-infra-alert-diagnosis.md:35-45 | "`0 means UNLIMITED`; log line `Speed limit set to 0 B/s` is for unlimited"
- Setting bandwidth_max would break governor's release path | vault/home-infra-alert-diagnosis.md:43-48 | "Set it, and release takes absolute branch → RuntimeError every release cycle"
- `sabnzbd_postproc_oldest_wait_seconds` measured collector uptime not item age | memory/project_alert_diagnosis.md:29, vault/home-infra-alert-diagnosis.md:64-69 | "measured collector uptime, not item age"
- Metric now seeded from SABnzbd's `time_added` field | vault/home-infra-alert-diagnosis.md:69-73 | "Now seeded from SABnzbd's own `time_added`"
- Post-processing queue showed 85.7h and 39.6h after fix | memory/project_alert_diagnosis.md:29 | "live 85.7h/39.6h, instances differ for the first time"
- Budget governor bare `OnCalendar=` left timer unit broken | memory/project_alert_diagnosis.md:31, vault/home-infra-alert-diagnosis.md:76-79 | "bare `OnCalendar=` leaves `[Timer]` with no directive, systemd refuses entire unit"
- Budget governor "reduced" tier appended instead of replaced schedules | memory/project_alert_diagnosis.md:33, vault/home-infra-alert-diagnosis.md:82-84 | "the reduce-cadence lever was increasing cadence"
- Two YouTube alerts gated on sample being under 36h old | memory/project_alert_diagnosis.md:34 | "alerts now freshness-gated at 36h"
- NAS eth0 negotiated at 100 Mb/s on DS1522+ with 4 GbE ports | memory/project_alert_diagnosis.md:14-18, vault/home-infra-alert-diagnosis.md:20-26 | "NAS `eth0` is negotiated at 100 Mb/s on a DS1522+ that has four 1GbE ports"
- Measured NAS NFS throughput 11.6 MB/s, 93% of 100 Mbit wire | vault/home-infra-alert-diagnosis.md:23-25 | "NFS throughput 11.6–11.7 MB/s, which is 93% of a 100 Mbit wire"
- Local file read on NAS achieved 135 MB/s | memory/project_alert_diagnosis.md:16 | "135 MB/s reading the same file locally on the NAS"
- NAS eth1-eth3 show "Link detected: no" | vault/home-infra-alert-diagnosis.md:19-20 | "`eth1`, `eth2`, `eth3` show `Link detected: no` — not cabled"
- Investigation ran four diagnostic lanes with 59 agents | vault/home-infra-alert-diagnosis.md:7-8 | "A 59-agent read-only investigation ran four diagnostic lanes"
- Raising `SCAN_WINDOW_CONCURRENCY` 4→6 measured +7% throughput | vault/home-infra-alert-diagnosis.md:110-115 | "adding four more NFS readers moved total 10.94 → ~11.7 MB/s (+7%)"
- uid-1024 permission mismatch: 16,703 files owned by unrecognized uid | vault/home-infra-alert-diagnosis.md:155-158 | "16,703 `SABnzbd_nzf_*` files... are mode `0600` owned by uid 1024"
- File permission split finding: one reviewer found files created during import, another found failures post-restart | memory/project_alert_diagnosis.md:44, vault/home-infra-alert-diagnosis.md:162-166 | "one found evidence the bad files existed for hours before the failures started, another found the same failures beginning within minutes of a container restart"
- Majority-refutation needs actual majority | memory/project_alert_diagnosis.md:44 | "Majority-refutation needs an actual majority, and a genuine split doesn't produce one"
- Post-processing backlog still draining slower than expected | post:101 | "the backlog itself is also still draining slower than it should"
- No item traced through full pipeline start to finish | post:101 | "I haven't traced a single item through the pipeline start to finish to prove why"

## Anything Preston Himself Said

- Do not set `bandwidth_max` (SABnzbd config) | vault/home-infra-alert-diagnosis.md:40-48 | "Do not set `bandwidth_max`"
- The refutation rate is more important than individual bugs found | post:26 | "That refutation rate is the actual finding here, more than any single bug I fixed"
- Confirmation and refutation are different jobs | post:40 | "confirmation and refutation are different jobs"
- Doing both with same brain in same sitting is how bad root causes survive | post:40 | "Doing both with the same brain in the same sitting is how bad root causes survive into production"
- A plausible root cause has to survive someone actively trying to kill it before acting | post:103 | "building a process where a plausible root cause has to survive someone actively trying to kill it before I'm allowed to act on it"
- Learned not to trust a single signal promoted straight to ground truth | post:71 | "It's the same trust-a-single-signal failure that produced my GPU broker's phantom-game bug"
- Adversarial verification didn't resolve the split finding, just prevented pretending it had | post:99-100 | "adversarial verification didn't resolve it, it just kept me from pretending it had"
- The backlog is genuinely unknown and honest move is to say so | post:101-102 | "some things are still genuinely unknown, and the honest move is to say so instead of closing the ticket"
- The point was about the process, not the agents | post:103 | "The point of this exercise was never about the agents"

