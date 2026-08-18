---
title: CSG Website
slug: csg-website
status: live
owner: TODO
liveUrl: https://www.crossservicesgroup.com
repo: https://github.com/crossservicesgroup-ai/CrossServicesSite
lastReviewed: 2026-08-13
summary: The public Cross Services Group website — company info, services, the online quote request form, and the analytics that count the leads it produces.
---

This is the Cross Services Group public website: the homepage, service pages, about, careers, club, and the contact/quote forms visitors use to request a quote.

The site is live and working today at `https://www.crossservicesgroup.com`. The old Vercel address, `https://cross-services-site.vercel.app/`, still answers as well — Vercel keeps it as the project's built-in URL. Use the real domain when giving the address to anyone.

It updates itself. Whenever an approved change is pushed to the `main` branch of the website's code, the live site rebuilds and goes out automatically within a few minutes — nobody has to manually publish it.

**Important**: because publishing is automatic, there is no review step between "pushed to `main`" and "live on the internet." Anyone who can push to `main` can change the live site immediately, including by mistake. Any process for making changes should account for this.

**Domain situation**: resolved as of 13 Aug 2026. `www.crossservicesgroup.com` is now connected and serving the site, which closes a problem that had been open since this dashboard was written — the site's own settings had been telling Google it lived at that address while it only actually answered at the Vercel one. Those two now agree.

One consequence to be aware of: the domain renewal is now load-bearing. Before it was connected, letting the domain lapse would have been embarrassing but harmless, because the site answered elsewhere. Now, if that annual renewal is missed, the public website goes offline.

The registrar is **GoDaddy**, and the login is now in the vault — see [Accounts](/accounts). That was the missing piece: somebody can now actually check the renewal.

> [!TODO] Check the domain's renewal date and turn on auto-renew
> Log in to GoDaddy, confirm when `crossservicesgroup.com` next renews, and confirm auto-renew is on with a payment card that will still be valid then. Record the date on the [Spend](/spend) page. This is a small task guarding a large failure — a missed renewal now takes the public website offline.

## How to see how many leads the website is bringing in

As of 13 Aug 2026 the site counts its own leads. Google Analytics records every quote form submission, every contact form submission, and every tap on a phone number, and it records **which service page the person came from**.

That last part is the point of the whole thing. Someone who clicks "get a quote" from the power washing page carries "power washing" with them into the submission. So after a month or two you can answer a question the business could not answer before: *which services are actually bringing work in?* If power washing produced twelve quote requests and irrigation produced two, that tells you where the website's attention — and possibly the advertising budget — should go.

To look at the numbers:

1. Go to `analytics.google.com` and log in as `crossservicesgroup@gmail.com`. That password is not in Bitwarden yet — see [Accounts](/accounts), and get it added.
2. Choose the Cross Services Group property.
3. **Reports → Engagement → Events** shows the counts for `quote_submitted`, `contact_submitted` and `phone_click`.

Two things that will otherwise confuse you:

- **The numbers lag 24–48 hours.** An empty dashboard the morning after a change does not mean nothing happened. The Realtime report is instant if you want to check something works right now.
- **A handful of test events dated 13 Aug 2026 are not real leads.** They are from the setup and verification run.

A form event is only counted after the server accepts the submission, so a failed send never inflates the count. That also makes analytics a useful diagnostic: if Google Analytics shows quote submissions but nobody received the emails, the problem is the email service, not the website. See the runbook [Quote requests have stopped arriving](/runbooks/no-quote-requests).

There is no cookie consent banner on the site. For a US-only local business that is a normal and defensible choice, but it was a choice rather than an oversight, and it is worth knowing it was made.

<!-- TECHNICAL -->

**Repo**: `https://github.com/crossservicesgroup-ai/CrossServicesSite`, deploys from branch `main`.

**Repo ownership — resolved 13 Aug 2026.** This repo has been transferred from the personal `gkmestler` account to the Cross Services organisation `crossservicesgroup-ai`, which signs in as `crossservicesgroup@gmail.com`. The website's source code is no longer tied to one person's personal account.

Two follow-on details, neither urgent but both worth knowing:

- **The old URL still works.** GitHub redirects a transferred repo's old address to its new one indefinitely, so `gkmestler/CrossServicesSite` still resolves and old clones keep pushing successfully. That is convenient but it hides the change. Any local clone should have its remote repointed at the new address — `git remote set-url origin https://github.com/crossservicesgroup-ai/CrossServicesSite.git` — so that nobody is relying on a redirect they do not know exists.
- **Vercel's GitHub connection.** A repo transfer can break the deploy hook, because Vercel's integration is tied to the repo under its old owner. Since the transfer, confirm at least one deploy has actually gone out.

> [!TODO] Confirm Vercel still deploys from the transferred repo
> Push a trivial change to `main` and confirm it appears live. If it does not, reconnect the project to `crossservicesgroup-ai/CrossServicesSite` in Vercel → Settings → Git. Until this is verified, it is not certain that pushing to `main` still publishes the site.

All four CSG repositories now sit under this organisation — see [How This Was Built](/how-this-was-built) for the full list.

**Stack**: Next.js 15.5.21, React 19.1.0, Tailwind CSS v4, TypeScript. Hosted on Vercel. Key dependencies: `lucide-react`, `resend`, `zod`.

**Routes** (from `app/`): *Verified from the repository, 7 Aug 2026.*

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/about` | About page |
| `/services` | Services listing |
| `/services/[slug]` | Individual service detail page |
| `/careers` | Careers page |
| `/club` | Club page |
| `/contact` | Contact form |
| `/quote` | Quote request form |
| `/styleguide` | Internal design reference page. Deliberately excluded from search indexing via `app/robots.ts`. |

There are also two API routes behind the pages: `app/api/contact/route.ts` and `app/api/quote/route.ts`, which handle form submissions.

**Copy lives in code, not a CMS.** All site copy — service descriptions, team bios, reviews, brand list, company timeline, and general site settings — is in `/content/*.ts`: `services.ts`, `site.ts`, `team.ts`, `reviews.ts`, `brands.ts`, `timeline.ts`. These are TypeScript files, not markdown or a database. Editing a service description, for example, means editing `content/services.ts` directly and pushing the change — there is no separate content editor. The site's canonical URL (the `www.crossservicesgroup.com` address referenced above) is set in `content/site.ts` via `site.url`, consumed by `lib/seo.ts`.

**Environment variables**:

| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | API key for Resend, the email service used to send quote/contact form submissions. |
| `QUOTE_FROM_EMAIL` | The "from" address used when emailing quote/contact submissions. Must be on a domain verified in Resend. |

*Verified from the repository, 7 Aug 2026:* both `app/api/contact/route.ts` and `app/api/quote/route.ts` degrade gracefully if these are missing — the form still validates and returns success to the visitor, but the submission is only logged to the server console and never emailed. This means **if the Resend account lapses or the API key expires, quote and contact requests stop arriving with no visible error to the visitor or to CSG staff.** Since 13 Aug 2026 this is at least detectable: the analytics events fire on server acceptance, before the email is attempted, so Google Analytics showing submissions that nobody received is the signature of exactly this failure. The runbook [Quote requests have stopped arriving](/runbooks/no-quote-requests) uses that to tell a broken email service apart from a quiet week. Note that detectable is not the same as monitored — nothing alerts anyone; somebody still has to look. There is also a simple in-memory rate limit (5 submissions per IP per 10 minutes) on the quote endpoint; it resets whenever the serverless instance recycles, so treat it as a basic bot deterrent, not a hard limit.

**Resend ownership — resolved 13 Aug 2026.** The account signs in with the Cross Services Google account and its entry is in the vault, so it is not a personal account and does not need transferring. See [Accounts](/accounts).

**Analytics** *(added 13 Aug 2026, commit `80a1cb7`)*:

GA4, measurement ID `G-Y7VKHVK21W`. There is **no environment variable** — the ID is committed in the code, so there is nothing to set in Vercel and nothing to forget when a project moves. Search Console is set up against the same Google account but touches no code.

| Where | What it does |
|---|---|
| `lib/analytics.ts` | The measurement ID, the production gate, and the event helper. |
| `components/analytics/Analytics.tsx` | Loads the tag; also catches phone-number taps anywhere on the site. |
| `app/layout.tsx` | Mounts it site-wide. |
| The two form components | Fire their own events after a successful submit. |

Three custom events, all of which also record the page they happened on:

| Event | Fires when | Parameters |
|---|---|---|
| `quote_submitted` | The quote API accepts a submission | `source_service`, `services`, `property_type` |
| `contact_submitted` | The contact API accepts a submission | — |
| `phone_click` | Any phone number on the site is tapped | — |

`source_service` is the one that earns its keep. Service pages link to `/quote?service=landscaping`, and that slug rides along with the submission, so quote requests can be attributed to the service page that produced them. A value of `none` means the visitor found the quote form through the nav rather than from a service page — which is its own useful signal, not missing data.

Both form events fire only after the server accepts the submission, so a failed send is never counted as a lead.

Behaviour worth knowing:

- **Local development sends nothing.** Analytics is gated to production builds.
- **Vercel preview deploys do send data to the real property.** Harmless while all work goes straight to `main`, but it would quietly pollute the numbers if branching and preview URLs start being used. Worth revisiting at that point, not before.
- **Leave "Enhanced measurement" on** in the data stream settings. It is what makes navigation between pages count as pageviews in a Next.js app, where a normal page load does not happen.

> [!WARNING] Register the three custom dimensions in GA — this one is time-sensitive
> `source_service`, `services` and `property_type` are being collected right now, but until they are registered as custom dimensions they are invisible in every report, and **registering them is not retroactive**. Every day this waits is a day of attribution data that can never be recovered. In GA: Admin → Data display → Custom definitions → create three, scope Event, matching those parameter names exactly.

> [!TODO] Mark the three events as key events in GA
> Admin → Data display → Events, then toggle `quote_submitted`, `contact_submitted` and `phone_click` on as key events so they are reported as conversions rather than as ordinary events.

> [!TODO] Exclude internal team traffic from Google Analytics
> Optional but worth doing: Admin → Data Streams → Configure tag settings → Define internal traffic. Without it, staff and contractors browsing the site are counted alongside real visitors, which matters more the lower the traffic is.

Analytics and Search Console need no vault entry of their own: both are part of the Cross Services Google account, whose entry is on the [Accounts](/accounts) page. The two-factor question that goes with that account is tracked on [Start Here](/), because by now it governs far more than analytics.

> [!TODO] Confirm Search Console verification and sitemap
> Confirm how `www.crossservicesgroup.com` was verified in Search Console (domain-level DNS verification or the URL-prefix method), since a verification that depends on registrar DNS will break if the domain moves. Confirm whether the sitemap has been submitted.

**Running locally**:

- `npm run dev` — start the dev server (Next.js with Turbopack)
- `npm run build` — production build
- `npm run start` — run a production build locally
- `npm run lint` — run ESLint

> [!TODO] Site owner
> Confirm who owns this system going forward (day-to-day contact for content changes, form issues, and the domain connection) and record their name here.
