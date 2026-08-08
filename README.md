# CSG Systems Dashboard

Internal handover documentation for Cross Services Group — what was built, what
it costs, who owns each account, and what to do when something breaks.

This README assumes you have never opened a code repository before. Nothing
below requires you to write any code.

---

## The one rule

**No passwords, API keys or recovery codes ever go in this project.** Not in a
file, not in a comment, not "just for testing". This dashboard is a *map* to
where credentials live, not a place to keep them. Credentials live in
Bitwarden.

The only exception is the single site password, which is stored in Vercel's
settings — never in a file that gets saved to GitHub. See
[Environment variables](#environment-variables).

---

## What this project is made of

| Folder | What is in it |
| --- | --- |
| `content/` | **All the words.** Every page's text lives here as a plain text file. |
| `app/` | The pages themselves — the code that decides layout and URLs. |
| `components/` | Reusable pieces of the design, like the status tag. |
| `lib/` | The plumbing that reads `content/` and turns it into pages. |

If you only ever want to fix a sentence, you only ever need `content/`.

---

## Editing the content

Every page is a file in `content/`. Find the one you want:

- `content/systems/` — one file per system (the website, the scheduler, etc.)
- `content/runbooks/` — one file per "something is broken" procedure
- `content/pages/` — the standalone pages (Start Here, Roadmap, and so on)
- `content/data/` — the accounts and spend tables

Open the file, change the words, save. That is the whole process. **You never
need to touch a file ending in `.tsx` to change what a page says.**

### The top of each file

Each file starts with a block between two `---` lines. It looks like this:

```
---
title: The Furies Scheduler
slug: furies-scheduler
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: One sentence a non-technical person understands.
---
```

- `status` must be one of `live`, `in-progress`, `not-built`, or `needs-owner`.
  It controls the coloured tag shown on the page.
- `lastReviewed` is the date somebody last checked the page was still true.
  **Update this whenever you review a page.** A stale date is a useful warning.
- `owner` is who is responsible. `TODO` means nobody is, which is a problem.

### Marking something you are unsure about

Never guess. If you do not know something, write this instead:

```
> [!TODO] What the thing is
> What needs confirming, and who to ask.
```

It renders as an amber block and is automatically collected onto the
**To do** page. That page is generated — you never edit it by hand. To close an
item, delete its `> [!TODO]` block from the file it lives in.

To flag a danger rather than an unknown, use `> [!WARNING]` the same way.

### The `<!-- TECHNICAL -->` line

Some files contain a line reading exactly `<!-- TECHNICAL -->`. Everything
above it is written for the office. Everything below it is for whoever
maintains the systems, and is collapsed behind a "Technical detail" toggle.
Keep office-facing content above that line.

---

## Running it on your own computer

You need [Node.js](https://nodejs.org) version 22 or newer, installed once.

Open Terminal, then:

```bash
cd "path/to/CrossServicesNewTechDashboard"
npm install
npm run dev
```

Then open <http://localhost:3000> in your browser. Changes you save to a file
in `content/` appear in the browser within a second or two.

Before it will let you in, create a file named `.env.local` in this folder
containing:

```
SITE_PASSWORD=pick-any-password-for-local-use
SESSION_SECRET=any-long-random-string
```

`.env.local` is deliberately excluded from GitHub and must stay that way.

Press `Ctrl+C` in Terminal to stop.

---

## Publishing your changes

This project deploys from GitHub to Vercel.

> **Pushing to the `main` branch publishes to the live site immediately.**
> There is no review step and no staging site. Check your change at
> <http://localhost:3000> first.

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Vercel picks it up and rebuilds within a minute or two. If the build fails,
the previously working version stays live — see the "A Vercel build failed"
runbook.

---

## Environment variables

These must be set in the Vercel dashboard under
**Project → Settings → Environment Variables**, for the Production,
Preview and Development environments.

| Name | What to put in it |
| --- | --- |
| `SITE_PASSWORD` | The shared password people type to read this dashboard. Choose a strong one, store it in Bitwarden, and share it with the office. |
| `SESSION_SECRET` | A long random string used to sign the login cookie. Generate with `openssl rand -hex 32`. It is not a password anyone types — nobody needs to remember it. Store it in Bitwarden anyway. |

Both are required. If either is missing, nobody can sign in — the site fails
closed on purpose, rather than letting everybody in.

Changing `SESSION_SECRET` signs everyone out. That is the fastest way to revoke
access if the password leaks: change both values and redeploy.

---

## Printing

Every page prints cleanly to PDF from the browser's own print dialog. Use
**Print this section** on any page, or **Print everything** (`/print`) for the
entire dashboard as one continuous document. Collapsed technical sections are
always expanded in print, and web addresses are printed next to their links, so
a paper copy stays usable if the site is unavailable.

---

## Getting help

Paste this into Claude Code, from inside this folder:

> Read the README and tell me how to change [the thing you want to change].

The **How This Was Built** page in the dashboard explains that workflow in
full.
