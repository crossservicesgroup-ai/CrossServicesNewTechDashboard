---
title: BD Dashboard
slug: bd-dashboard
status: live
owner: Michael
lastReviewed: 2026-08-17
summary: Michael's business development dashboard — weekly outreach, leads, opportunities and campaign tracking, stored in a real database.
---

This is the business development dashboard: a private web app where Michael tracks weekly outreach numbers, leads, opportunities, campaigns, and activity across email, social and the website.

**Do not confuse it with this dashboard.** Its repository is called `Cross-Services-Group-Dashboard`, which is very close to the name of the handover dashboard you are reading right now. They are unrelated: this one is a read-only record of how the systems were built, and that one is a working tool with live business data in it that people type into every week.

It is a genuine application rather than a spreadsheet. The numbers live in a proper Postgres database, and edits save themselves roughly half a second after you stop typing — there is no save button, and the top bar shows a save indicator so you can tell the write went through.

Two design decisions in it are worth understanding, because they protect data that would otherwise be easy to lose:

- **Deleting a lead source or an outreach activity does not really delete it.** It is marked archived instead. This matters because historical weekly numbers point back at those records — a hard delete would silently corrupt past weeks. Anything removed can therefore be recovered.
- **Nobody's browser ever talks to the database directly.** Access goes through the app's own server, which holds the key. Combined with the database's own access rules, this means the data cannot be read even by someone who obtains the app's public configuration.

Access is a single shared username and password, the same pattern as this dashboard: one login that everyone who needs it uses, not individual accounts. That is fine for a small team, but it means access cannot be revoked from one person without changing the password for everybody.

> [!TODO] Record where the BD Dashboard is deployed
> This page is now marked live, so it is being used — but its address is not written down anywhere. Record the URL here, and add it to the `liveUrl` line at the top of this file so it appears as a link on the Systems page.
>
> If it turns out this is still running only on Michael's machine, the data itself is safe — it lives in hosted Supabase — but nobody else can reach the app and there is no second copy of it. Say so here if that is the case, because it changes what "live" means for this one.

> [!TODO] Confirm who else should have access to the BD Dashboard
> It is currently described as Michael's dashboard. Since it holds business development records rather than personal notes, confirm whether anyone else needs the login, and who inherits it if Michael is unavailable.

<!-- TECHNICAL -->

**Repo**: `Cross-Services-Group-Dashboard`, reported as transferred to the `crossservicesgroup-ai` organisation on 13 Aug 2026.

> [!TODO] Verify the BD Dashboard repo is actually on the CSG organisation
> Checked on 13 Aug 2026 and could not confirm it. The other three repositories resolve under `crossservicesgroup-ai`, including the private one for this dashboard, using working credentials — but `crossservicesgroup-ai/Cross-Services-Group-Dashboard` did not. That means either the transfer has not happened, the repository has a different name, or it is private and the account used to check has not been granted access to it. Open the organisation's repository list and confirm which. Until then, treat this repo's ownership as unverified.

**Stack**: Next.js (App Router), TypeScript, Tailwind. Supabase (Postgres) for storage. Migrations are managed with the Supabase CLI and the project is already linked — see `supabase/config.toml`.

- `npx supabase migration new <name>` — create a migration
- `npx supabase db push --linked` — apply pending migrations to the remote database

**Data model**: normalized tables under `supabase/migrations/` — `outreach_log`, `opportunities`, `campaigns`, `email_log`, `social_log`, `website_log`, `weeks` (plus per-week lead and outreach values), `lead_sources`, `outreach_activities`, `divisions`, `app_settings`. Real foreign keys, enum check constraints on the status/channel/platform fields, and join tables for the multi-select division tags. Soft delete via `archived = true` on lead sources and outreach activities, so historical weekly figures that reference them stay intact.

`lib/dashboardRepo.ts` assembles and decomposes those tables into the single `DashboardState` shape the UI already used, which is why the rebuild from the original prototype did not require changing the components.

**Security model**: every table has RLS enabled with **no policies**, so the anon key grants zero access — that is deliberate, not an oversight. The browser never queries Supabase directly. All reads and writes go through `app/api/dashboard/route.ts`, which uses the `service_role` key server-side only.

**Environment variables**:

| Name | Purpose |
|---|---|
| `SUPABASE_URL` | The Supabase project address. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database key. Bypasses RLS entirely — see the warning below. |
| `APP_USERNAME` | Shared login username. |
| `APP_PASSWORD` | Shared login password. |
| `SESSION_SECRET` | Any long random string; signs the session cookie. |

`.env.local.example` documents these; a filled-in `.env.local` already exists in the working copy pointing at the live Supabase project. If deployed, the same five must be set as Vercel project environment variables, ideally with a different `APP_PASSWORD` and `SESSION_SECRET` than local development uses.

> [!WARNING] The service_role key bypasses every database protection
> `SUPABASE_SERVICE_ROLE_KEY` is not an ordinary API key. It ignores RLS completely, so anyone holding it can read, change or delete every row in the database regardless of the policies described above. It must never appear in client-side code, in a `NEXT_PUBLIC_` variable, in a screenshot, or in a repository. If the repo was ever public, or if `.env.local` was ever committed, treat the key as exposed and rotate it in Supabase → Settings → API.

> [!TODO] Confirm whether this uses its own Supabase project or the scheduler's
> The accounts page lists one Supabase entry, attributed to the Furies Scheduler. This dashboard also runs on Supabase, and it is not recorded whether that is a second project (a second thing to own, and possibly a second bill) or the same one. Confirm, then correct the Supabase rows on [Accounts](/accounts) and [Spend](/spend).

> [!TODO] Add the BD Dashboard's remaining secrets to Bitwarden
> The shared app username and password are in the vault as of 13 Aug 2026 — see [Accounts](/accounts). What is still missing is `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET`, which exist only in a `.env.local` file on one machine. Of the two, the service role key is the one that matters: it is the most powerful credential in the whole system, and losing that laptop currently means losing it.

> [!TODO] Confirm the database is backed up
> This is the only system holding business data that was typed in by hand rather than derived from somewhere else — weekly outreach numbers, opportunities and campaign history cannot be reconstructed if the database is lost. Confirm what Supabase plan it is on and what backup retention that plan actually gives, because the free tier's guarantees are limited.

**Legacy file**: `index.html` at the repo root is the original single-file prototype. It is kept for reference and is not used by the app. Anyone opening the repo and finding it will reasonably assume it is live — it is not.
