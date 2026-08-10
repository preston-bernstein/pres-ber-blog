# Audit log — demo-edit files (secure-services-docker-compose-and-nordvpn.md, nine-fixes-lightrag-embedding-crash-one-afternoon.md)

Handled directly (not via a subagent) because both files carry the plan's precision-critical demo edits (hl_lines line-highlighting, admonition).

## content/english/blog/secure-services-docker-compose-and-nordvpn.md

- secure-services-docker-compose-and-nordvpn.md:172-181 | bold | removed (converted to code font) | these are literal YAML directive names (`version:`, `services:`, `image:`, `build:`, `ports:`, `volumes:`, `networks:`) — a config-key identifier, not a UI element or strong claim, belongs in code font per the semantic rule
- secure-services-docker-compose-and-nordvpn.md:228-232 | bold | kept | structural list-item labels ("Reliablity:", "Security Features:", "Compatibility:", "Performance:", "Support:") functioning as inline mini-headers for a factors-to-consider list, consistent with the "Issue:"/"Solution:" and step-heading pattern used throughout the rest of this same document
- secure-services-docker-compose-and-nordvpn.md:254,264,273,361,369,381 | bold | kept | numbered-step headings ("Initialize the OpenVPN Configuration:", "Check the VPN Container Logs:", etc.) — structural labels marking a distinct procedural step, not decorative emphasis
- secure-services-docker-compose-and-nordvpn.md:394,395,399,400,404,405 | bold | kept | "Issue:"/"Solution:" pair labels — a real structural/semantic pattern (problem-then-fix), not decorative
- secure-services-docker-compose-and-nordvpn.md:411,419,427 | bold | kept | step-heading labels ("View Container Logs:", "Inspect Network Settings:", "Check IP Routes:"), same structural pattern as above
- secure-services-docker-compose-and-nordvpn.md:437,439,441 | bold | kept | category labels immediately preceding a descriptive link ("Docker Documentation:", "OpenVPN Documentation:", "Community Forums:"), structural, not decorative
- secure-services-docker-compose-and-nordvpn.md | italic | none found | file contains zero `*italic*`/`_italic_` spans
- secure-services-docker-compose-and-nordvpn.md | link text | none changed | all markdown links already descriptive: "the official Docker documentation", "OpenVPN", "WireGuard", "The official Docker documentation", "The OpenVPN documentation", "Stack Overflow", "Docker Community Forums", "Reddit" — all named entities or clear destination descriptions
- secure-services-docker-compose-and-nordvpn.md | bare URL in prose | none found | all raw URLs present are inside fenced bash/yaml code blocks (curl commands, GPG key URLs, docker-compose download URL) — legitimate code content, left unchanged
- secure-services-docker-compose-and-nordvpn.md:296 | demo edit | added `{hl_lines=[22,34]}` to the docker-compose fence | highlights the two `network_mode: service:vpn` lines (fence-relative 22/34, absolute file lines 318/330) that the prose immediately below the block (lines 347-349) already discusses by name

## content/english/blog/nine-fixes-lightrag-embedding-crash-one-afternoon.md

- nine-fixes-lightrag-embedding-crash-one-afternoon.md | bold | none found | zero `**bold**` spans in the file
- nine-fixes-lightrag-embedding-crash-one-afternoon.md | italic | none found | zero `*italic*`/`_italic_` spans (underscores present are all inside code identifiers like `reprocess_failed`, `MAX_PARALLEL_INSERT`, not italic markup)
- nine-fixes-lightrag-embedding-crash-one-afternoon.md | code | kept (7 spans) | `httpx.ReadError`, `IndexFlushError`, `Pipeline halted`, `MAX_ASYNC`, `MAX_PARALLEL_INSERT`, `reprocess_failed`, `127.0.0.1` — all literal error names, env vars, an endpoint name, or an IP address; all correctly code-font
- nine-fixes-lightrag-embedding-crash-one-afternoon.md | link text | kept | `[LightRAG](https://github.com/HKUDS/LightRAG)` — descriptive (names the linked project)
- nine-fixes-lightrag-embedding-crash-one-afternoon.md | bare URL in prose | none found | the only URL in the file is the href inside the existing LightRAG markdown link, not a bare prose URL
- nine-fixes-lightrag-embedding-crash-one-afternoon.md | demo edit | added a `> [!WARNING]` admonition | extracted the existing loopback/network-namespace pitfall from the "fix was moving the workload" paragraph into a callout; surrounding paragraph reworded minimally to stay grammatical around the extraction, meaning and facts preserved (container has its own network namespace, loopback doesn't reach the host, fix is using the real local-network address)

## content/english/blog/deciding-whats-worth-a-saturday-estate-sale-scanner.md and scrape-score-alert-resale-hunting-pipelines-local-vision-models.md

(gap found by parallel-review: these two files only got the language-tag fix in Step 2, never a bold/italic/code/link audit pass under any of the three group agents or the demo-file pass above — closing that gap here.)

- deciding-whats-worth-a-saturday-estate-sale-scanner.md:30 | bold | kept | "Perceptual-hash dedup." — numbered-list item-label lead-in naming a distinct pipeline stage, the same structural pattern kept elsewhere in this repo (secure-services-docker-compose-and-nordvpn.md's step/issue/solution headings) — not decorative
- deciding-whats-worth-a-saturday-estate-sale-scanner.md:31 | bold | kept | "A quality gate." — same structural item-label pattern
- deciding-whats-worth-a-saturday-estate-sale-scanner.md:32 | bold | kept | "A free local pre-filter." — same structural item-label pattern
- deciding-whats-worth-a-saturday-estate-sale-scanner.md:33 | bold | kept | "Full vision analysis." — same structural item-label pattern
- deciding-whats-worth-a-saturday-estate-sale-scanner.md | italic | none found | zero italic spans
- deciding-whats-worth-a-saturday-estate-sale-scanner.md | code | none found | zero inline-code spans
- deciding-whats-worth-a-saturday-estate-sale-scanner.md | link text | kept (2 links) | "part 1", "Part 3" — descriptive within a named series (matches the already-approved pattern in the same series' other posts)
- scrape-score-alert-resale-hunting-pipelines-local-vision-models.md | bold | none found | zero bold spans
- scrape-score-alert-resale-hunting-pipelines-local-vision-models.md | italic | none found | zero italic spans
- scrape-score-alert-resale-hunting-pipelines-local-vision-models.md | code | none found | zero inline-code spans
- scrape-score-alert-resale-hunting-pipelines-local-vision-models.md | link text | kept (4 links) | "Deciding what's worth a Saturday", "Deciding what fits", "Part 2", "Part 3" — all descriptive series-part names
