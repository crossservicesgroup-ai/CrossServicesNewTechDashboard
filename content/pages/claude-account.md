---
title: Claude
slug: claude
status: in-progress
owner: TODO
lastReviewed: 2026-08-17
summary: One shared Claude account at $20 a month, and the separate API bill that sits behind three of these systems.
---

Claude is the AI tool behind the website, the scheduler and this dashboard, described on `/how-this-was-built`. Cross Services pays for it in two separate ways, and the difference matters when a bill arrives.

## The two Claude bills

| What | Cost | What it is |
|---|---|---|
| Claude account (claude.ai) | $20/month | The chat product people open in a browser and type into. One account, shared. |
| Anthropic API | Usage-based, estimated ~$5/month | The developer key that lets the built systems call Claude on their own. Nobody types into this one. |

These are billed separately and go up for different reasons. The $20 goes up if more people need their own login; the API bill goes up if the systems get busier. Neither one covers the other.

## The shared account

There is **one Claude account for the whole team**, not a seat per person. At $20 a month this is the cheapest way to give the office access to Claude, and while only one or two people are actually using it, it is the right call.

It has three consequences worth knowing before more people start using it.

**Usage limits are shared, not per person.** Claude plans cap how much you can use in a rolling window. One account means one pool: if somebody runs a long session in the morning, the person who needs it in the afternoon can find it already at its limit. This is the thing most likely to become annoying first.

**There is no record of who did what.** Everyone signs in as the same account, so conversation history is pooled and there is no way to tell whose work is whose. Anything one person types is visible to everyone else who signs in.

**Access cannot be revoked for one person.** If somebody leaves, the only way to cut off their access is to change the password for everybody. See `/runbooks/revoke-access`.

None of these is a reason to buy more seats today. They are the signals that tell you when to.

> [!TODO] Who holds the Claude login
> Confirm who is responsible for this account and its payment method. The login belongs in the vault — see `/accounts`.

> [!TODO] Confirm Claude Code works on the current plan
> Claude Code is the tool used to build and maintain the website, the scheduler and this dashboard. Confirm that the $20/month plan gives whoever takes over maintenance enough Claude Code access to do the job, because that is the one use of this account the systems actually depend on. If it does not, that is a plan-tier decision, not a seat-count one.

<!-- TECHNICAL -->

## The API bill, estimated

The Anthropic API is metered per request rather than per person, and it is currently uncapped — see the warning on `/spend`. Nobody has read a real invoice yet, so the figure below is an estimate built from the expected volume, not a number off a statement.

**Three systems call the API:**

| System | State | What a request looks like |
|---|---|---|
| Furies Scheduler | Live | An agent that plans routes — one question can trigger several model calls and tool lookups |
| This dashboard (`/ask`) | Live | One question against the whole dashboard as context; the context is cached for an hour |
| Cross Services website | Being built | Not yet running, so not yet billing |

**Expected volume: roughly 1–10 requests a week per system** — call it 3 to 30 requests a week in total once the website assistant is live.

**Estimated cost at that volume:**

| Scenario | Roughly |
|---|---|
| Low end — about 1 request a week to each system | **$3–4 a month** |
| Typical | **about $5 a month** |
| High end — 10 requests a week to all three, all of them agent-heavy | **about $30 a month** |

The scheduler dominates the high end, because a single scheduling request runs an agent loop of several model calls rather than one. A question to this dashboard is cheaper than it looks: the whole dashboard is sent as context, but it is cached for an hour, so follow-up questions in one sitting cost roughly a tenth of the first.

At this volume the API is a rounding error next to the $20 subscription. The reason it still gets a page is not the size of the bill — it is that this is the one line on `/spend` with no ceiling on it.

> [!WARNING] The API has no spend cap
> Usage billing with no cap is how a surprise invoice happens: a loop that runs away, or a key that leaks, bills silently until somebody reads the statement. The estimate above assumes everything behaves. A cap turns the worst case from open-ended into a known number.

> [!TODO] Set a spend cap and a billing alert
> Set a monthly spend limit in the Anthropic console. Given an estimate of about $5 a month, a cap of $50 leaves an order of magnitude of headroom and still stops anything genuinely runaway. Add an email alert well below the cap so somebody hears about it before the cap is hit.

> [!TODO] Confirm the estimate against a real invoice
> After a full month of the systems running, compare the actual bill with the estimate above and correct this page. Until that happens, every figure here is arithmetic rather than fact.

> [!TODO] Confirm whether the systems share one API key
> It is not recorded whether all three systems use one key or one each. It matters: with a shared key, revoking it for one system revokes it for all of them, and there is no way to tell which system is responsible for which part of the bill.

## Related pages

- `/how-this-was-built` — what Claude Code is actually used for.
- `/spend` — this account and the API alongside every other running cost.
- `/accounts` — where the login lives and what happens if it lapses.
- `/runbooks/revoke-access` — what a shared login means when somebody leaves.
