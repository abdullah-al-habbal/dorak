---
nodeid: docs.waves.wave-1-decisions
parentnode: docs.waves
childnodes: []
codeanchors:
  - backend/config/reverb.php
  - backend/modules/Core/Routes/channels.php
---

# Wave 1 decisions: open subscriptions and realtime hosting

Routes: [wave tracker](index.md) · [Wave 1](wave-1.md) · [backlog](../backlog/index.md)

Written 2026-11-27. Both are waiting for the owner. Nothing here is built or set up.

## Decision 1: subscriptions already open (BG-46, task W1.4)

**Reproduced locally:** after the brand was suspended, the branch and its stylist still received `chair.status.updated` on the floor plan channel they had joined before. New joins are refused.

**Exposure:** the events on those channels carry ids, and a status or start time; no names, prices or contact details. Loading the details over HTTP is refused for a suspended branch. The business app also signs the manager out when `brand.suspended` arrives, so a client keeps listening only if it missed that event or is modified.

| Option | What it does | Covers | Cost and risk |
|---|---|---|---|
| A. Accept | Document the limit | nothing more | none |
| **B. Stop publishing (recommended)** | Booking and chair events skip `branch.{id}` and `floor-plan.{id}` while the branch is not operational; `brand.suspended` is still sent | suspension and a disabled branch, for every listener on those two channels. Not a stylist who loses their chair, and not `barber.{id}` | small, server only, works on any host; one extra check per event |
| C. Close the sockets | Sign each private subscription with a user id, then ask the server to terminate that user's connections; clients reconnect and are refused where they no longer have access | every way of losing access, if each one triggers it | custom channel signing, ordering after the `brand.suspended` delivery, depends on Reverb and the Dart client reconnecting; the most moving parts |

B changes what a connected client receives, so it needs the owner's yes. C can follow later if unseated stylists matter.

## Decision 2: where realtime runs (RR-20, task W1.6)

Today dev has no server answering WebSockets (RR-20). Prices and limits below come from third-party pages found by web search on 2026-11-27, during sales, and were **not** confirmed on the vendors' own pages. Check them before paying.

| Option | Monthly cost | Work | Notes |
|---|---|---|---|
| **1. Hosted Pusher Channels, free sandbox (recommended for dev)** | $0; reported limits 200,000 messages a day and 100 connections (one source says 200); next plan reported $49 | configuration only, expected: Reverb speaks the same protocol. **Not tested** | no server to run; event data (ids, statuses, times) passes through a third party; the server and the apps use different Pusher host names |
| 2. Small VPS that runs only Reverb | Hostinger KVM 1 reported about $6.49 introductory on 24 months, renewing about $11.99 | a server to secure and update, TLS, a process supervisor, a host name | the API stays on shared hosting and publishes to the VPS |
| 3. Move the whole backend to a VPS | same VPS price range | migration, plus everything in option 2 | also gives a permanent queue worker and real cron |
| 4. Not yet | $0 | none | no live updates on dev; they can be tested locally ([runbook](runbook.md#local-realtime-reverb-and-a-queue-worker)) |

**Shared hosting and Reverb:** forum answers, one quoting Hostinger's documentation, say Hostinger web and cloud plans allow only outgoing WebSocket connections and no long-running server, so Reverb cannot run there. Not confirmed with Hostinger.

**Queue delay, for options 1 and 2:** broadcasts are queued. The documented dev cron starts `queue:work --stop-when-empty` once a minute ([CI/CD setup](../deployment/ci-cd-setup.md)), so an event could wait close to a minute, and the cron itself is unconfirmed (RR-8). Live updates that feel live need a permanent worker (option 3) or sending broadcasts without the queue, which makes the request wait on the realtime server. Decide this together with the host.

**Recommendation:** option 1 to prove the apps end to end on dev at no cost, then option 3 before real users.

Sources: [Laracasts: Reverb on shared hosting](https://laracasts.com/discuss/channels/reverb/laravel-reverb-in-share-hosting) · [Laravel discussion 51386](https://github.com/laravel/framework/discussions/51386) · [Ably on Pusher pricing](https://ably.com/topic/pusher-pricing) · [Pusher plans (apis.io)](https://apis.io/plans/pusher/pusher-plans-pricing/) · [Hostinger VPS pricing (hostingdive)](https://hostingdive.com/hostinger-vps-real-cost/) · [Hostinger VPS plans (HostingPickers)](https://hostingpickers.com/blog/hostinger-vps-plans)
