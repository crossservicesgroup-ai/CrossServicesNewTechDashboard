---
title: QuickBooks Automation
slug: quickbooks-automation
status: not-built
owner: TODO
liveUrl: TODO
repo: TODO
lastReviewed: 2026-08-17
summary: Planned automation involving QuickBooks. Nothing has been built and no scope has been agreed.
---

## What this is

An automation involving QuickBooks has been raised as something Cross Services Group wants. **No work has started and no scope has been agreed**, so this page records the decision rather than a system.

It is listed here rather than only on the [Roadmap](/roadmap) so that it is visible next to the systems it would touch.

## What has to be decided before anything is built

> [!TODO] Agree what the QuickBooks automation is actually for
> "QuickBooks automation" could mean several unrelated things — pushing invoices in from somewhere else, pulling payment status out, syncing customers, chasing unpaid invoices, or filing receipts. They have different costs and different risks. Write down which one is wanted, in one sentence, before any work starts.

> [!TODO] Confirm which QuickBooks account and plan
> Which QuickBooks account would this connect to, who owns it today, and what plan is it on? API access is not available on every tier. Add the account to [Accounts](/accounts) once it is identified, whether or not this gets built — it is a business-critical login either way.

> [!TODO] Decide whether it writes to QuickBooks or only reads
> This is the decision that determines how careful everything else has to be. Something that only reads out of QuickBooks is low risk and can be tried quickly. Something that writes into it is changing the accounts, and a bug there produces wrong financial records that somebody has to unpick by hand.
>
> If it writes, it needs the same staged rollout the [Linen Order Automation](/systems/linen-automation) is going through: a rehearsal mode that produces nothing real, then a supervised period, then live.

> [!TODO] Assign an owner before work starts, not after
> Every other system on this dashboard acquired its owner question after it was built, which is why several of them still carry one. Name the person now.
