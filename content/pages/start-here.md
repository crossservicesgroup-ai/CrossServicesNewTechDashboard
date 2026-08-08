---
title: Start Here
slug: start-here
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: The handover record for every website, automation and AI tool built for Cross Services Group — what exists, what it costs, and what breaks if nobody acts.
---

This dashboard is the handover record for the websites, automations and AI tools built for Cross Services Group (CSG) over the past several months. The person who built them is leaving. If you inherit this work, start on this page.

This dashboard contains no passwords. It is a map to where credentials live (Bitwarden), not a vault.

## The three things that will break if nobody acts

> [!WARNING] These are not risks. They are scheduled failures.
> 1. **Vercel projects sit on Gavin's personal account.** If it goes away, the CSG website and the Furies scheduler both go offline. They need to move to a CSG-owned Vercel team.
> 2. **The Google Maps API key is on Gavin's personal admin console.** If it goes away, the scheduler starts producing bad routes with no obvious cause. A new key needs issuing from a CSG Google Cloud project.
> 3. **The Monday.com account is on a trial.** When it ends, the free plan allows 2 seats and 3 boards, and the twelve-folder structure collapses.

Each of the three needs someone to actually do something. They are tracked separately below so none of them gets lost.

> [!TODO] Move the Vercel projects to a CSG-owned team
> Create a Vercel team owned by Cross Services and transfer both projects to it. Until this is done, both live websites depend on one personal account.

> [!TODO] Issue a Google Maps API key from a CSG Google Cloud project
> The scheduler's current key belongs to a personal admin console. Issue a replacement from a CSG-owned project, swap it in Vercel, and confirm routes still calculate correctly.

> [!TODO] Decide the Monday.com plan before the trial ends
> Confirm the trial end date and choose a paid tier, or accept that the board structure collapses to the free plan's 2 seats and 3 boards. See [Monday.com](/systems/monday) for the detail.

## What exists

| System | Status | What it does | Link |
|---|---|---|---|
| CSG Website | live | The public company website. | `https://cross-services-site.vercel.app/` |
| The Furies Scheduler | live | Turns the weekly cleaning changeover export into an optimised driving route. | `https://cross-services-schedule-agent1.vercel.app/` |
| Linen Order Automation | in-progress | Copies incoming linen orders from email into a spreadsheet. Built and tested, currently switched off. | see `/systems/linen-automation` |
| Monday.com | in-progress | Work tracking across the divisions. Set up but not yet in real use. | see `/systems/monday` |

## What state it's in

Two systems are live and running: the CSG website and the Furies scheduler. The linen automation is built and tested but currently switched off. Monday.com is set up but not yet in real use.

## Your first week

1. Read this page.
2. Read the accounts page: `/accounts`.
3. Get into Bitwarden.
4. Walk the runbooks: `/runbooks`.
5. Check the TODO list: `/todos`.

## Who to call

> [!TODO] Who to call
> Nobody has yet been named as the point of contact for these systems once Gavin leaves. Confirm who owns this going forward — the office owner or office manager should assign this and record a name and phone number here.
