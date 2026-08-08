---
title: Monday.com
slug: monday
status: in-progress
owner: TODO
liveUrl: TODO
repo: TODO
lastReviewed: 2026-08-07
summary: A Monday.com workspace set up to organize tasks by division, built but not yet in real day-to-day use.
---

## What this is

Monday.com is a task-and-project tracking tool. A workspace has been built out for Cross Services Group, but it is not yet in real use — it is set up and waiting on a few decisions before it can be rolled out to the company.

## How it's organized

There is one Main workspace. Inside it, there is a folder for each division:

- Landscaping
- Irrigation
- New-View
- Car Detailing
- Carpentry & Painting
- House Cleaning
- Furies
- AV Technology
- Janitorial Cleaning
- Junk Removal
- Property Management

Each division folder currently holds a single board, named "Jobs" (likely to be renamed "To Dos"), with items grouped into New Jobs and Completed.

A separate CSG Office folder holds four more boards, in the same format: Everyone Tasks, Sales Pipeline, Technology / Systems, and Marketing. More boards may be added over time.

## What it costs — and why this matters now

> [!WARNING] The trial ends and this structure collapses
> The current structure is about sixteen boards. Monday's free plan only allows 2 seats and 3 boards, with no automations or integrations — so everything built so far is running on a trial. When the trial ends, this structure will collapse unless a paid plan is in place.
>
> Roughly, the paid tiers are:
>
> | Plan | Roughly | What it adds |
> | --- | --- | --- |
> | Basic | $9/seat/month | No automations or integrations |
> | Standard | $12/seat/month | Adds automations, integrations, and guest access |
> | Pro | $19/seat/month | Further tier above Standard |
>
> All of these are billed annually with a three-seat minimum. **Standard is the realistic floor for a company rollout** — Basic can't run automations at all. Guest access on Standard is the inexpensive way to give field crews visibility into their boards without buying each of them a full seat.
>
> These figures are approximate. Verify current pricing at `monday.com/pricing` before committing to a plan.

> [!TODO] Assign an owner for Monday.com
> Someone needs to be responsible for this workspace going forward — for the plan decision below, for keeping the structure clean, and for the eventual rollout.

> [!TODO] Confirm the trial end date
> Find out when the current free trial actually ends, so the plan decision doesn't get made at the last minute.

> [!TODO] Decide the seat count
> Decide how many seats are actually needed at rollout (versus how many people should instead get guest access).

> [!TODO] Decide which plan to commit to
> Decide between Basic, Standard, and Pro before the trial ends. Standard is described above as the realistic floor for a real rollout, since it's the cheapest tier with automations and integrations — but confirm this against actual needs and current pricing.

<!-- TECHNICAL -->

## Open structural decisions

These are decisions that need to be made before rollout, not bugs to fix. Doing this now, while there is no real data on the boards yet, is much cheaper than doing it after people are relying on them.

### 1. Where does a division task live?

A task belonging to a division could go on Everyone Tasks or on that division's own board. Nothing currently forces one or the other. Write down the rule now, or the same task will end up entered twice — once on each board — within a month.

### 2. Two sources of truth for "done"

Right now there are two ways an item can be marked complete: being moved into the Completed group, or having its Status column set. Some items currently sit in the Completed group with a blank status. Pick one as the source of truth. Using the Status column as the source of truth, with an automation that moves the item into Completed automatically, is the cleanest option — but automations require the Standard plan or higher.

### 3. Column names don't match across boards

Everyone Tasks uses the columns Assigned To, Date Added, and Due Date. The division boards use People, Date of Entry, and Customer instead. Cross-board reporting will not work until these line up. Fix this now, while the boards are still empty of real data.

### 4. Placeholder rows still on the boards

Placeholder items (Item 1 through Item 5, dated September 2025) are still sitting on the boards. Clear these out before rollout so new users don't mistake them for real data.
