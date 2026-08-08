---
title: CSG Website
slug: csg-website
status: live
owner: TODO
liveUrl: https://cross-services-site.vercel.app/
repo: https://github.com/gkmestler/CrossServicesSite.git
lastReviewed: 2026-08-07
summary: The public Cross Services Group website — company info, services, and the online quote request form.
---

This is the Cross Services Group public website: the homepage, service pages, about, careers, club, and the contact/quote forms visitors use to request a quote.

The site is live and working today at `https://cross-services-site.vercel.app/`.

It updates itself. Whenever an approved change is pushed to the `main` branch of the website's code, the live site rebuilds and goes out automatically within a few minutes — nobody has to manually publish it.

**Important**: because publishing is automatic, there is no review step between "pushed to `main`" and "live on the internet." Anyone who can push to `main` can change the live site immediately, including by mistake. Any process for making changes should account for this.

**Domain situation**: the site is built to eventually live at `www.crossservicesgroup.com`, and its internal settings already say that is its address. But that domain is not actually connected to the site yet — Cross Services owns the domain, but access to configure it is still pending. Until someone connects the domain, the site's own metadata is telling search engines like Google it lives at an address it doesn't actually answer at, which can hurt how well the site is found in search. This should be fixed as soon as domain access is available.

<!-- TECHNICAL -->

**Repo**: `https://github.com/gkmestler/CrossServicesSite.git`, deploys from branch `main`.

> [!TODO] Repo ownership
> The repo lives under the personal GitHub account `gkmestler`, not a Cross Services organisation account. Confirm who should own this going forward and transfer it if appropriate.

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

*Verified from the repository, 7 Aug 2026:* both `app/api/contact/route.ts` and `app/api/quote/route.ts` degrade gracefully if these are missing — the form still validates and returns success to the visitor, but the submission is only logged to the server console and never emailed. This means **if the Resend account lapses or the API key expires, quote and contact requests stop arriving with no visible error to the visitor or to CSG staff.** There is also a simple in-memory rate limit (5 submissions per IP per 10 minutes) on the quote endpoint; it resets whenever the serverless instance recycles, so treat it as a basic bot deterrent, not a hard limit.

> [!TODO] Resend account ownership
> Confirm whether the Resend account (and the `RESEND_API_KEY` in use) is owned by Cross Services or by the departing developer personally. If personal, it needs to be transferred or replaced before departure.

**Running locally**:

- `npm run dev` — start the dev server (Next.js with Turbopack)
- `npm run build` — production build
- `npm run start` — run a production build locally
- `npm run lint` — run ESLint

> [!TODO] Site owner
> Confirm who owns this system going forward (day-to-day contact for content changes, form issues, and the domain connection) and record their name here.
