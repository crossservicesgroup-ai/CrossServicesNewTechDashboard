# CSG Systems Dashboard — Build Specification

Save this file into your project folder as `mainprompt.md`, then start Claude Code and say:

> Build this project based on the requirements in @mainprompt.md. Before you write any code, read the whole file, then give me your build plan and your design token plan and wait for my approval.

---

## 1. What you are building

An internal documentation and handoff dashboard for **Cross Services Group (CSG)**, a facility services company in Massachusetts. It runs multiple divisions: Landscaping, Irrigation, House Cleaning (operating as The Furies), Janitorial Cleaning, Car Detailing, Carpentry & Painting, AV Technology, Junk Removal, Property Management, New-View, plus a linen rental arm.

Over the past several months one person built a set of websites, automations and AI tools for this company. He is leaving. This dashboard is the handoff. Its single job is: **anyone who inherits this work can find every system, understand how it works, know what it costs, know who owns the account, and fix it when it breaks — without needing to talk to the person who built it.**

This is not a marketing site and not an admin panel. It is a living operations manual that happens to be a website.

### Two audiences, both first-class

Every system page serves two people:

| Reader | Wants | Stops reading at |
| --- | --- | --- |
| **Office** (owner, office manager) | What is this, does it still work, what does it cost, who do I call | The fold |
| **Operator** (one semi-technical person trained on the Claude Code workflow) | Repo, env vars, how to run it locally, what prompt to give Claude Code | The bottom |

Never make the office reader scroll through technical content to reach something they need. Never make the operator hunt for a repo URL.

---

## 2. Hard rules

Read these twice. Violating any one of them makes the deliverable worse than useless.

**2.1 — No secrets. Anywhere. Ever.**
No passwords, API keys, tokens, connection strings, recovery codes or 2FA seeds in this repository, in any content file, in any environment variable, in any comment. Not encrypted, not encoded, not "just for testing." The dashboard is a *map* to credentials, not a *vault* for them.

Every credential reference takes this exact form: which account you log in as, which vault entry holds the credential, and what breaks if it lapses. The vault is Bitwarden (a free two-person organization), which lives entirely outside this app.

The one exception is a single site-access password, handled in section 8, which is read from an environment variable and never committed.

**2.2 — Never invent a fact.**
Every URL, cost, account owner, config value and status in this dashboard will be used by someone making a real decision. If you do not know something, write it as a TODO block. Do not guess, do not fill in a plausible-looking placeholder, and do not smooth over a gap with vague language.

TODO convention — render these as a visually obvious amber block, not inline text:

```
> [!TODO] Repo URL
> Confirm with Gavin before handoff.
```

Build a `/todos` page that scans all content files at build time, collects every TODO block, and lists them with a link to the page each one came from. This is the punch list. It should be linked from the top-level nav with a count badge.

**2.3 — Anyone must be able to edit this without touching code.**
All content lives in markdown and JSON files under `/content`. Components render content; they never contain it. If someone wants to fix a sentence, they open a `.md` file and edit a sentence. If a future change requires editing a `.tsx` file to update a fact, you have built it wrong.

**2.4 — This must survive the site going down.**
Every page must print cleanly to PDF via the browser's print dialog: no clipped content, no dark backgrounds burning ink, navigation hidden, URLs of links shown in the printed output. Add a "Print this section" control and a "Print everything" route at `/print` that renders all content on one continuous page.

---

## 3. Stack

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS**
- **gray-matter** for frontmatter, **react-markdown** + **remark-gfm** for rendering (GFM is required — the content uses tables heavily)
- **Static generation.** No database, no Supabase, no API routes except the one auth check. Content is read from the filesystem at build time.
- **GitHub** for the repo, **Vercel** for hosting, deploying from `main`
- **Mobile first.** Build for a phone screen and scale up. Field staff will open this on a phone.

Do not add any other dependency without telling me what it is and why the project needs it.

---

## 4. Content architecture

```
/content
  /systems           one .md per system
    csg-website.md
    furies-scheduler.md
    linen-automation.md
    monday.md
  /runbooks          one .md per procedure
    site-is-down.md
    linen-stopped-working.md
    scheduler-bad-routes.md
    change-contact-info.md
    revoke-access.md
    vercel-build-failed.md
  /pages             singleton pages
    start-here.md
    how-this-was-built.md
    claude-for-teams.md
    roadmap.md
    resources.md
  /data
    accounts.json
    spend.json
```

### System file format

```markdown
---
title: The Furies Scheduler
slug: furies-scheduler
status: live          # live | in-progress | not-built | needs-owner
owner: TODO
liveUrl: https://...
repo: TODO
lastReviewed: 2026-08-07
summary: One sentence a non-technical person understands.
---

Plain English content. What it is, who uses it, what problem it
solved, what it costs, what to do if it breaks.

<!-- TECHNICAL -->

Everything below this marker is the operator view: repo, env vars,
running locally, config values, known gotchas.
```

Split each file on the literal string `<!-- TECHNICAL -->`. Render the first half always. Render the second half inside a collapsible section headed **Technical detail**, collapsed by default on mobile and expanded by default on desktop. Add a global toggle in the header — "Show technical detail" — that sets the default for every page and persists in a cookie (not localStorage).

### Status values

`live`, `in-progress`, `not-built`, `needs-owner`. Each gets a distinct signal colour and appears as a tag on the system card, the system page header, and the systems index.

### Data files

`accounts.json` — array of:
```json
{
  "service": "Vercel",
  "purpose": "Hosts the CSG website and the Furies scheduler",
  "accountOwner": "TODO — currently Gavin's personal account, must move to a CSG team",
  "loginAs": "TODO",
  "vaultEntry": "Bitwarden > CSG Systems > Vercel",
  "twoFactor": "TODO — confirm where codes go",
  "usedBy": ["csg-website", "furies-scheduler"],
  "ifThisLapses": "Both sites go offline.",
  "ownershipStatus": "at-risk"
}
```
`ownershipStatus` is one of `csg-owned`, `at-risk`, `unknown`. Render `at-risk` rows with a visible warning treatment — these are the items that will break when Gavin's accounts go away.

`spend.json` — array of:
```json
{
  "service": "Monday.com",
  "monthlyCost": null,
  "billing": "annual",
  "costType": "fixed",
  "attributedTo": ["monday"],
  "renewalDate": "TODO",
  "note": "Currently on a trial. See the Monday page for the plan decision.",
  "spendCap": null
}
```
`costType` is `fixed` or `variable`. Compute all three views from this one file: total monthly and annualised at the top, a by-service table, and a by-system rollup derived from `attributedTo`. Where `monthlyCost` is null, show "Not yet confirmed" rather than zero, and never let nulls silently deflate the total — show the total as "at least $X, plus N unconfirmed items."

Flag every `costType: "variable"` row and show whether a spend cap or billing alert exists. Uncapped usage-based billing is the thing that produces a surprise invoice.

---

## 5. Design direction

**First, check for a real brand.** If the CSG website repo is available locally, read its Tailwind config and global CSS and pull the actual brand colours and fonts. Use those. Consistency with the company's real site beats anything invented. Only if that is unavailable, use the direction below.

**Subject grounding.** This is a facility services company. Its world is service tags zip-tied to equipment, inspection stickers with a date and an initial, route sheets on clipboards, laminated procedure cards in a truck. The dashboard's core information *is* status: is this running, who owns it, when was it last checked. So the design should look like documentation you would trust in a mechanical room, not like a SaaS landing page.

**Signature element: the service tag.** Every system, account and runbook carries a tag block — monospace identifier, status signal, and a "last reviewed" date. It is the one element repeated everywhere and it is what the site is remembered by. Style it like a real equipment tag: a hard rule at the top, tight monospace, a solid signal block, no shadow, no gradient, no rounded corners above 2px. Spend your boldness here and keep everything around it quiet.

**Palette (fallback only).** Cool paper, not cream. Something in the range of `#F2F3F1` for the page, near-black `#16181A` for text, a mid-grey `#6E7478` for secondary. One identity accent: a deep utility green around `#1F4D3A`, chosen because landscaping and grounds work is the company's largest division. Signal colours used *only* for status and never decoratively: green `#2F7D4F`, amber `#B8791A`, red `#A83232`, grey for not-built. Do not use warm cream backgrounds with a terracotta accent — that reads as a template.

**Type.** Display: **Archivo**, tight tracking, used for page titles and section heads only. Body: **IBM Plex Sans**, generous line height, because people will read long passages here. Data and identifiers: **IBM Plex Mono** — every repo path, env var name, config value, URL and account name renders in mono. That mono-for-identifiers rule is doing real work: it tells the reader at a glance which strings are things they type or paste versus things they read.

**Layout.** Persistent left sidebar on desktop with the nine sections. On mobile, a top bar with a drawer. Content column capped around 70 characters. No hero section, no marketing flourish, no animated anything. This is a reference document; the fastest path to the answer is the entire design goal.

**Motion.** Effectively none. A collapsible expanding, and that's it. Respect `prefers-reduced-motion`.

**Quality floor, unannounced.** Responsive to 375px, visible keyboard focus rings, real heading hierarchy, sufficient contrast, working skip link.

---

## 6. Site map

1. `/` — **Start Here**
2. `/systems` — index, and `/systems/[slug]`
3. `/accounts` — accounts table + ownership audit
4. `/spend` — cost breakdown
5. `/how-this-was-built` — the Claude Code workflow guide
6. `/claude-for-teams` — Claude Team rollout
7. `/runbooks` — index, and `/runbooks/[slug]`
8. `/roadmap` — unfinished and unstarted work
9. `/resources` — AI presentation and learning material
10. `/todos` — auto-generated punch list
11. `/print` — everything on one page

Plus a global search: client-side, over titles and body text of all content, keyboard shortcut `/`, results grouped by section.

---

## 7. Content to seed

Everything in this section is verified. Use it as written. Anything not here becomes a TODO block.

### 7.1 Start Here

Write a page that orients someone who has never heard of any of this. It must cover, in this order:

1. **What exists** — a short list of the four live systems with one-line descriptions and status tags.
2. **What state it's in** — plainly. Two systems are live and running. The linen automation is built and tested but currently switched off. Monday.com is set up but not yet in real use.
3. **The three things that will break if nobody acts.** Give these their own block, high on the page:
   - Vercel projects sit on Gavin's personal account. If it goes away, the CSG website and the Furies scheduler both go offline. They need to move to a CSG-owned Vercel team.
   - The Google Maps API key is on Gavin's personal admin console. If it goes away, the scheduler starts producing bad routes with no obvious cause. A new key needs issuing from a CSG Google Cloud project.
   - The Monday.com account is on a trial. When it ends, the free plan allows 2 seats and 3 boards, and the twelve-folder structure collapses.
4. **Your first week** — read this page, read the accounts page, get into Bitwarden, walk the runbooks, check the TODO list.
5. **Who to call** — TODO.

### 7.2 CSG Website

- Live at `https://cross-services-site.vercel.app/`
- Next.js, hosted on Vercel, deploys automatically from `main` on GitHub
- The page's canonical URL is set to `www.crossservicesgroup.com`, but that domain is not connected yet. The domain is owned by Cross Services; access is pending. Once access arrives, connect the domain in Vercel. Until then the canonical points somewhere the site does not live, which will confuse search engines.
- Repo URL: TODO
- Content structure, page list, and where copy lives: TODO — read from the repo if available

### 7.3 The Furies Scheduler

- Live at `https://cross-services-schedule-agent1.vercel.app/`
- What it does: takes the weekly changeover export for the cleaning division and turns it into an optimised route plan, ordering jobs by distance between properties so crews drive less.
- Access: password-gated at `/login`. The site is set to `noindex, nofollow`, so it will not appear in search results. Password location: TODO.
- Depends on: Vercel (hosting), Supabase (data), Google Maps API (distances), Anthropic API (agent). Two of those four are on personal accounts — see the accounts page.
- Repo URL: TODO
- Environment variables: TODO — read from the repo or `vercel env ls` if available

### 7.4 Linen Order Automation

This is the most detailed page. It is also the one with the most ways to go quietly wrong.

**What it is.** The Furies rents linens on Cape Cod. Orders come in through the WooCommerce site and land as an order email in the `info@thefuriesonline.com` Gmail inbox. Previously an office person copied each one into a spreadsheet by hand and sent a confirmation email from a saved template, roughly a couple of minutes per order, heaviest on Monday mornings. This automation does the copying.

**Where it lives.** A Google Apps Script project inside the `info@thefuriesonline.com` Google account. Not a server, not a subscription, no API keys. It runs on Google's infrastructure. This is the one system whose ownership is already clean.

**How it works.**
1. A time-driven trigger fires every 5 minutes.
2. It searches Gmail for `subject:"got a new order"` within the last 7 days, excluding anything already labelled.
3. It parses the order email's HTML directly. There is no AI model in this path, deliberately — the fields are extracted with fixed selectors so the same email always produces the same result.
4. It appends a row to the Google Sheet across 13 columns.
5. It creates or sends a confirmation email, depending on the mode setting.
6. It applies the `linen-bot/done` label, which is what stops the same order being written twice.

**Current state.** `EMAIL_MODE` is set to `off`, meaning it writes spreadsheet rows and sends no email at all. It will be switched on later once it has been confirmed working. The sheet and email steps are separate switches and should never be flipped on the same day.

**Safety rails already built in.** A 7-day lookback so it can never reach back into the ~1,700 historical orders. A cap of 15 orders per run. A script lock so two runs cannot overlap. A check of the order number against column B before appending, so even a missing label will not produce a duplicate row.

**Two labels are the alert system.** `linen-bot/done` is what it handled. `linen-bot/needs-review` is what it refused to touch — an order missing an arrival date, a total, or line items. **Somebody has to check `needs-review` daily.** If nobody owns that, half-parsed orders sit there silently.

**The warning that matters most.** Render this as a prominent block, not a note:

> The automation only reads emails whose subject matches the new-order notification. When a customer *replies* to their order thread — "can you move my delivery to Thursday" — the script does not see it, does not flag it, and does not update anything. The sheet keeps saying Tuesday.
>
> The failure mode is subtle: once rows start appearing on their own, people stop reading the inbox as carefully, and that is exactly when the replies stop getting read.
>
> **The "Edits to Order" column is human-only, permanently.** The automation handles new orders. Changes stay manual.

**Functions you run by hand, from the Apps Script editor:**

| Function | What it does |
| --- | --- |
| `checkSetup` | Confirms the sheet, tab and column headers match |
| `testParseLatest` | Parses the 5 most recent orders and logs what it *would* write. Writes nothing. |
| `setupTrigger` | Starts the automation on its 5-minute cycle |
| `removeTriggers` | Stops it completely |
| `resetLabelsForTesting` | Clears the bot labels so you can re-run against the same emails |

**Open items — render each as a TODO block:**
- `EMAIL_MODE` needs turning on after verification, and the sheet step should go live at least a week before the email step.
- The confirmation email body may still contain draft placeholder copy rather than the office's real wording. Check `buildConfirmation()`.
- `PICKUP_LOCATION` was set from the email footer and never confirmed against the real office address.
- `REPLY_TO` is set to `info@thefuries.com`, but the account is `info@thefuriesonline.com`. Different domain. If the first is not a real mailbox, every confirmation goes out with a reply-to that bounces. Verify before switching email on.
- Which sheet is `SHEET_ID` pointed at — the test copy or the live one.
- 71 historical rows have the phone number and email address in swapped columns, starting around June 2026. The automation writes them correctly, so it will disagree with two months of history. Decide whether to fix the history.
- Confirm whether WooCommerce already sends customers its own order receipt. If it does and this switches to send, customers get two emails.
- The Furies Gmail password appeared in plaintext in a meeting-notes transcript. Confirm whether it has been rotated.

### 7.5 Monday.com

**Structure as built.** One Main workspace. A folder per division: Landscaping, Irrigation, New-View, Car Detailing, Carpentry & Painting, House Cleaning, Furies, AV Technology, Janitorial Cleaning, Junk Removal, Property Management. Each division folder holds a single board, currently named "Jobs" and likely being renamed "To Dos", grouped into New Jobs and Completed. A separate CSG Office folder holds Everyone Tasks, Sales Pipeline, Technology / Systems, and Marketing, in the same format. More boards may be added.

**The plan decision — render as a warning block.** The current structure is around sixteen boards. Monday's free plan allows 2 seats and 3 boards, with no automations or integrations, so this is running on a trial. When it ends, the structure collapses. Paid tiers are roughly $9/seat/month (Basic, no automations or integrations), $12/seat/month (Standard, adds automations, integrations and guest access), and $19/seat/month (Pro), all billed annually with a three-seat minimum. Standard is the realistic floor for a company rollout. Guest access on Standard is the cheap way to give field crews visibility without buying a seat each. Verify current pricing at monday.com/pricing before committing.

**Four structural issues to document as open decisions:**
1. A division task could belong on Everyone Tasks or on that division's board. Write down which, or the same task ends up on both within a month.
2. There are two sources of truth for "done" — the Completed group and the Status column, and some items sit in Completed with a blank status. Pick one. Status as the truth with an automation moving the item is cleanest, but automations require Standard.
3. Column names differ across boards: Everyone Tasks uses Assigned To / Date Added / Due Date, the division boards use People / Date of Entry / Customer. Cross-board reporting will not work until these match. Fix now while there is no real data.
4. Placeholder rows (Item 1 through Item 5, dated Sep 2025) are still on the boards and should be cleared before rollout.

### 7.6 Accounts and the ownership audit

Seed `accounts.json` with these, marking ownership status as given:

| Service | Ownership status |
| --- | --- |
| Anthropic API | csg-owned |
| Supabase | csg-owned |
| Google Workspace (Furies) | csg-owned |
| Domain registrar | csg-owned, access pending |
| GitHub | unknown — repos are *shared with* a CSG account, which is not the same as owned by a CSG organization. If they live under a personal username, deleting that account deletes the repos. Verify and transfer if needed. |
| Vercel | at-risk — personal account |
| Google Maps API | at-risk — personal admin console |
| Monday.com | unknown |
| Bitwarden | TODO — to be created |
| Claude Team | TODO |

Above the table, add a short explanation of the credential model: the vault is Bitwarden, a free two-person organization holding a CSG Systems collection. This dashboard stores no secrets. Note that Bitwarden's free tier does not include the built-in authenticator, so 2FA setup seeds and backup recovery codes are stored as secure notes and the authenticator app itself lives on a CSG-owned device rather than anyone's personal phone. Note also the break-glass envelope: owner-level credentials and recovery codes for the registrar and the Google admin account, printed once, sealed, and kept in the office safe.

### 7.7 How This Was Built

I have a separate document — "Building Apps with Claude Code" — plus an addendum covering working on existing projects and a CSG prompt library. Create the page with a clear structure matching the parts of that guide and a TODO block noting that the full text needs pasting in. Do not attempt to reconstruct the guide from memory.

The page must include, prominently: pushing to `main` on either CSG repo deploys to production immediately, with no review step. Test at localhost:3000 first.

### 7.8 Claude for Teams

Team plans require a minimum of two members and support up to 150 seats. Two seat types can be mixed in one organization: Standard at $20/seat/month billed annually ($25 monthly), and Premium at $100/seat/month annually ($125 monthly). **Claude Code is only available on Premium seats.** Weekly usage limits reset at a fixed time assigned to the account, and usage credits can be prepaid so people can keep working after hitting a limit.

Recommended shape for CSG: Standard seats for office staff, one Premium seat for whoever maintains these systems. Include a TODO for the actual seat count and a note to verify current pricing at claude.com/pricing.

### 7.9 Roadmap

Two items, both `not-built`. Give each honest status: what was scoped, what is blocking it, what finishing it would involve.

- **AI receptionist** — not started. Scope TODO.
- **Website chatbot** — not started. Scope TODO.

Plus the open decisions from the Monday page and any deferred scheduler work.

### 7.10 Runbooks

Write each as numbered plain-English steps ending with "if none of this worked, contact: TODO."

- **The website is down** — check Vercel deployments for a failed build, check the domain, check the last commit.
- **The linen automation stopped filing orders** — check the Apps Script trigger still exists, check the Executions log for errors, check the `linen-bot/needs-review` label, confirm `EMAIL_MODE` and `SHEET_ID`.
- **The scheduler is producing bad routes** — check the Google Maps API key is valid and billing is active, check Supabase is reachable, check the input export format has not changed.
- **You need to change a phone number, email or address on the website** — the Claude Code prompt, plus test locally, plus push.
- **Someone left and you need to revoke their access** — GitHub, Vercel, Google Workspace, Monday, Bitwarden, Claude Team, and rotating anything they had.
- **A Vercel build failed** — read the log, paste it into Claude Code, push the fix, or roll back from the Vercel Deployments page.

---

## 8. Site access

Gate the whole site behind a single shared password using Next.js middleware. No user accounts, no database.

- The password is read from `process.env.SITE_PASSWORD`. It is never hardcoded, never committed, and `.env.local` must be in `.gitignore`.
- On success, set an httpOnly, secure, sameSite cookie. Do not put the password in the cookie value — store a signed token derived from a second env var, `SESSION_SECRET`.
- Middleware protects every route except `/login` and static assets.
- The login page matches the design system and says what the site is, so someone who lands on it knows they are in the right place.

Also add a `README.md` at the repo root explaining, in plain English, how to run the project locally, how to edit content, and how to deploy. Assume the reader has never opened a repository before.

---

## 9. Build order

Do not build everything at once. Work in these stages and let me check each one.

1. Scaffold the Next.js project, Tailwind, fonts, and the design tokens. Show me one styled page with the service tag element before going further.
2. Content pipeline: filesystem reader, frontmatter parsing, the `<!-- TECHNICAL -->` split, markdown rendering with tables.
3. Layout, sidebar, mobile drawer, technical-detail toggle.
4. System pages and the systems index, seeded with the content in section 7.
5. Accounts and Spend, driven from JSON.
6. Runbooks, Roadmap, Resources, Claude for Teams, How This Was Built.
7. TODO aggregation page and search.
8. Auth middleware, print styles, README.

---

## 10. Before you tell me it's finished

Check every one of these yourself and report the result:

- [ ] `grep` the entire repo for anything resembling a key, token or password. Zero results.
- [ ] `.env.local` is in `.gitignore`.
- [ ] Every fact on every page traces to section 7 of this spec, or is a TODO block. Nothing invented.
- [ ] The `/todos` page finds every TODO block in the content directory.
- [ ] Every page renders at 375px wide with no horizontal scroll.
- [ ] Every page prints to PDF cleanly with navigation hidden and link URLs visible.
- [ ] Search returns results from every content section.
- [ ] Middleware blocks an unauthenticated request to `/systems/linen-automation`.
- [ ] Editing a sentence in `/content/systems/linen-automation.md` changes the live page and requires touching no `.tsx` file.
- [ ] The build passes cleanly for Vercel production, not just locally.
- [ ] Keyboard-only navigation reaches every link with a visible focus ring.

Then tell me exactly which environment variables I need to add in the Vercel dashboard, and what to put in each.