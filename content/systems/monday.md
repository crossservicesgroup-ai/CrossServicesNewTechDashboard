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

**Monday.com is now on a paid plan at $63 a month.** That settles the question this page used to open with — the trial is no longer counting down, and the sixteen-board structure is not about to collapse back onto a free plan that allows three boards.

What is not settled is what that $63 buys. Monday prices per seat, so the figure is a plan tier multiplied by a seat count, and neither is written down anywhere. That matters for one reason: rolling the workspace out to more of the company means buying more seats, and without knowing the per-seat rate nobody can say what a wider rollout costs. Guest access is the lever worth knowing about here — on the tiers that support it, it is the inexpensive way to give field crews visibility into their own boards without buying each of them a full seat.

> [!TODO] Assign an owner for Monday.com
> Someone needs to be responsible for this workspace going forward — for the rollout, for keeping the structure clean, and for a bill that is now being paid every month.

> [!TODO] Record what the $63 covers
> Confirm which plan tier and how many seats the $63/month figure represents, and whether it is billed monthly or annually. Until that is written down, nobody can work out what adding a person costs.

> [!TODO] Decide the seat count for rollout
> Decide how many full seats are actually needed when the workspace goes into real use, versus how many people should instead get guest access. This is the decision that moves the $63.

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
