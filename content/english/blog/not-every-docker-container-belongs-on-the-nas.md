---
title: "Not Every Docker Container Belongs on the NAS"
meta_title: "NAS vs Desktop Docker Placement: A RAM-Constrained Home Lab Framework"
description: "A Synology DS1522+ with 8GB of RAM kept crashing under roughly 35 Docker containers. The fix was a placement framework: family-facing, storage-coupled services stay on the NAS, compute-heavy personal projects move to a host with real memory, including how Immich's remote machine-learning support fits the split."
date: 2026-08-10T11:55:00Z
categories: [
  "Home Lab",
  "Networking",
  "DevOps"
]
author: "Preston Bernstein"
tags: [
  "Docker",
  "Synology NAS",
  "Home Lab",
  "Self-Hosting"
]
draft: false
---

Family-facing and storage-coupled services stay on the NAS. Compute-heavy personal projects move to a separate host with real memory to spare. That's the whole framework, and I only arrived at it after a Synology DS1522+ with 8GB of RAM spent months running roughly 35 Docker containers and periodically falling over under memory pressure. ContainerManager doesn't fail loudly when it runs out of headroom. It stalls, swaps, and eventually kills something, and figuring out which container mattered enough to protect took longer than it should have.

## Storage coupling decides placement, not how important a service feels

A service that's coupled to storage or answers requests from other people in real time belongs on the NAS regardless of how heavy it is. A photo backup tool needs to sit next to the disks it writes to and needs to respond whenever someone in the house opens the app, so it stays put. A knowledge-graph pipeline or a data-ingestion job runs on my own schedule, tolerates a restart without anyone noticing, and doesn't need to answer anything at 11pm on a Tuesday. That kind of workload moved to my desktop, which has far more RAM than the NAS and isn't a fragile appliance I need to baby. The shift buys headroom on the box that actually has to stay predictable.

## Immich's remote machine-learning support is meant to run alongside the local container, not replace it

Immich, the self-hosted photo app I use for family photo backup, officially supports running its machine-learning container on a separate host from the main server, through the `IMMICH_MACHINE_LEARNING_URL` setting. That's documented, production-used behavior. The trap is treating it as a full swap: point Immich only at the desktop's ML container, and Smart Search and Face Detection break outright the moment the desktop is off, because my desktop isn't an always-on box the way the NAS is. Immich's own docs are explicit about the right pattern. Keep the local ML container running as a fallback and add the remote URL alongside it, so jobs degrade to local processing instead of failing outright. Facial recognition itself talks to the database directly and doesn't care where the ML container lives, so the underlying Postgres database can stay NAS-side no matter what. One more detail worth flagging: the ML container ships with no authentication at all, so it only ever gets exposed on the local network, never forwarded anywhere.

## SQLite-backed services migrate cheaply; Postgres-backed services need a logical dump

Migrating a stateful service safely comes down to what's storing its state. Anything backed by SQLite in a config directory, which covers most media-automation tools in the `*arr` family, migrates with a stop-the-container, sync-the-volume, start-on-the-new-host sequence. That's close to zero-risk, because the database is just a file sitting still while you copy it. Anything backed by Postgres is a different problem: copying a live data directory risks corruption, so the safe path is a logical dump while the source stays running, a transfer of that dump, then a restore on the destination with a row-count check before you touch the original. I moved a Postgres-backed data pipeline this way and it went cleanly, though I'd braced for it to be worse. I'd read enough migration horror stories going in that I probably over-prepared for a problem that never showed up.

## A media library mounted at different paths on two hosts needs a one-time remap

One gotcha cost me more time than the actual migration. Media-automation tools store absolute library paths inside their own database, and if the new host mounts the same share at a different path than the old one did, every stored path is now wrong. Nothing crashes when this happens. Shows just stop being tracked as monitored, and the failure mode looks like a metadata bug instead of a path problem. The fix is a one-time script against the SQLite database that rewrites the stored root-folder paths to match the new mount layout. It's a five-minute job once you know it's coming and an afternoon of confused debugging if you don't.

## Monitoring belongs on the host that isn't under memory pressure

A watchdog that lives on the same box it's protecting adds to the exact pressure it's supposed to catch. I run a lightweight watchdog on the NAS itself, a cron job paired with an `ntfy` push notification, because that footprint is small enough to not matter. Anything heavier, like Uptime Kuma, I'd rather run on the desktop watching the NAS remotely than install directly on the NAS. Putting your monitoring right next to the thing it's watching feels natural. On a RAM-constrained box, it's backwards.

## A RAM upgrade is a hedge, not a proven fix

I haven't upgraded the NAS's memory, and I genuinely don't know if it would solve the problem I moved workloads to avoid. Third-party memory is a real risk on this model specifically. At least one report describes a 16GB module in a DS1522+ registering as only 8GB, so the upgrade can fail silently instead of throwing an obvious error. Even with compatible memory, I couldn't find a solid first-hand account confirming that more RAM actually stops the crash pattern rather than just raising the ceiling before it comes back at a higher container count. So the upgrade sits on my list as a possible complement to the migration, not a substitute for it. If I do it eventually, it's insurance layered on a split that's already working, not a fix I'm betting the outcome on.

The framework holds up months in, but I don't think the split is finished. Every time a new self-hosted idea shows up, the first question is still which side of this line it belongs on, and I've gotten that call wrong at least once. A stack I placed on the desktop early has since moved a second time, to a third box entirely, because "more RAM than the NAS" turned out not to be the same thing as "the right home for this workload." The framework tells you which way to lean. It doesn't promise you'll land a given workload in the right spot on the first try.
