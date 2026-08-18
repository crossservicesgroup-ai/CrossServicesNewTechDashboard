---
title: Start Here
slug: start-here
status: live
owner: TODO
lastReviewed: 2026-08-17
summary: The handover record for every website, automation and AI tool built for Cross Services Group — what exists, what it costs, and what breaks if nobody acts.
---

This dashboard is the handover record for the websites, automations and AI tools built for Cross Services Group (CSG) over the past several months. The person who built them is leaving. If you inherit this work, start on this page.

This dashboard contains no passwords. It is a map to where credentials live (Bitwarden), not a vault.

## One account is now the key to everything

As of 13 Aug 2026 the credential map is largely complete, and it has a shape worth understanding before anything else. Almost every service — Supabase, GitHub, Vercel, Resend, the Google Maps console, Google Analytics and Search Console — is reached by signing in with a single Google account, `crossservicesgroup@gmail.com`. Bitwarden is reached through it too.

That is a sensible arrangement. It is far better than credentials scattered across personal accounts, which is where this started. But it concentrates the risk: this one account is now worth more than any individual password stored inside the vault, because it is the route to the vault.

> [!WARNING] Bitwarden and the Google account each depend on the other
> The Cross Services Google account is how you get into Bitwarden. The Google account's own password is stored inside Bitwarden. Anyone holding only one of the two can end up locked out of both — for example, someone who knows the Bitwarden master password but cannot receive the verification email, or someone with the Google account who needs a credential that only the vault holds. The break-glass envelope in the office safe must therefore contain the **Google account's password and its two-factor recovery codes**, not just Bitwarden's master password. If it holds only one of them, it does not work.

> [!TODO] Confirm two-factor on the Cross Services Google account, and put the recovery codes in the safe
> This is the single most important security task on the dashboard, because everything else now hangs off this one login. Confirm two-factor is switched on, confirm the backup codes exist, and put them in the office safe rather than leaving them on one person's phone. A lost phone should not be able to take Cross Services offline.

## The three things that will break if nobody acts

> [!WARNING] These are not risks. They are scheduled failures.
> 1. **Vercel may still be a personal workspace.** Sign-in now goes through the Cross Services Google account, which is a real improvement, but nobody has confirmed the two projects actually live under a Cross Services team rather than a personal one. If they do not, the CSG website and the Furies scheduler still go offline with that personal account.
> 2. **The Google Maps API key was issued from a personal console.** The console is now reached with the CSG Google account, but the key the scheduler is actually running on has not been replaced. If it goes away, the scheduler starts producing bad routes with no obvious cause.
> 3. **The Anthropic API is billed on usage with no spend cap.** Three systems call it and nothing limits what they can spend. Expected usage is small — an estimated $5 a month — but a loop that runs away or a key that leaks bills silently until somebody reads the statement. See [Claude](/claude).

Each of the three needs someone to actually do something. They are tracked separately below so none of them gets lost.

> [!TODO] Confirm the Vercel projects sit under a Cross Services team
> Sign in to Vercel with the Cross Services Google account and look at which scope the two projects are in. If it is a personal workspace, create a Cross Services team and transfer them. Having the login is not the same as owning the account.

> [!TODO] Issue a Google Maps API key from a CSG Google Cloud project
> The scheduler's current key belongs to a personal admin console. Having the console login does not reissue the key. Issue a replacement from a CSG-owned project, swap it in Vercel, and confirm routes still calculate correctly.

> [!TODO] Set a spend cap on the Anthropic API
> Set a monthly spend limit and a billing alert in the Anthropic console. The estimate is about $5 a month, so a $50 cap leaves plenty of headroom and still stops anything runaway. See [Claude](/claude) for the working.

## What exists

| System | Status | What it does | Link |
|---|---|---|---|
| CSG Website | live | The public company website, now measuring its own leads. | `https://www.crossservicesgroup.com` |
| The Furies Scheduler | live | Turns the weekly cleaning changeover export into an optimised driving route. | `https://cross-services-schedule-agent1.vercel.app/` |
| Linen Order Automation | live | Copies incoming linen orders from email into a spreadsheet on its own. Confirmation emails still draft rather than send. | see `/systems/linen-automation` |
| BD Dashboard | live | Michael's business development tracker — weekly outreach, leads and opportunities, in a real database. | see `/systems/bd-dashboard` |
| Monday.com | in-progress | Work tracking across the divisions. Set up but not yet in real use. | see `/systems/monday` |
| AI Receptionist | in-progress | Being built. Nothing about it is documented yet. | see `/systems/ai-receptionist` |
| QuickBooks Automation | not-built | Raised, not started, no scope agreed. | see `/systems/quickbooks-automation` |

## What state it's in

Four systems are live and running: the CSG website, the Furies scheduler, the linen order automation and the BD dashboard.

Two of those four are live with a caveat worth knowing. The linen automation writes new orders into the spreadsheet by itself, but its confirmation emails are still in draft mode — no customer has received an automatic email, and switching that on is a staged job, not a toggle. The BD dashboard is in use by Michael, but whether it is deployed anywhere or only runs on his machine is still not confirmed.

Monday.com is set up but not yet in real use. The AI receptionist is being built and nothing about it has been written down, which is the biggest documentation gap on this dashboard right now. The QuickBooks automation has been raised and not started.

**Changed on 13 Aug 2026.** Two things moved on the website, both good, and both with a tail:

- **The domain is connected.** `www.crossservicesgroup.com` now serves the live site, closing a problem that had been open since this dashboard was written. The tail: that annual domain renewal is now load-bearing — if it is missed, the public site goes offline — and nobody has the registrar login to check it.
- **The website now counts its own leads.** Google Analytics and Google Search Console are set up, on the `crossservicesgroup@gmail.com` login. Quote requests, contact requests and phone taps are all counted, and quote requests are attributed to the service page that produced them. The tail: three settings still need switching on inside Google Analytics, and **one of them is not retroactive** — see [CSG Website](/systems/csg-website).
- **All the source code is now owned by Cross Services.** Every repository was transferred from a personal GitHub account to the CSG organisation `crossservicesgroup-ai`. This closes one of the standing risks on this page outright — the code no longer disappears if a personal account does. The tail: transferring a repository can quietly break Vercel's deploy connection, so both live sites need one test push to confirm they still publish, and the BD dashboard's repository could not be confirmed as moved. Both are on the [to do list](/todos).

## Your first week

1. Read this page.
2. Read the accounts page: `/accounts`.
3. Get into Bitwarden.
4. Walk the runbooks: `/runbooks`.
5. Check the TODO list: `/todos`.

## Who to call

> [!TODO] Who to call
> Nobody has yet been named as the point of contact for these systems once Gavin leaves. Confirm who owns this going forward — the office owner or office manager should assign this and record a name and phone number here.
