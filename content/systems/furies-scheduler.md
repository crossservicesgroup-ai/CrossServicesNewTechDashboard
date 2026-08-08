---
title: The Furies Scheduler
slug: furies-scheduler
status: live
owner: TODO
liveUrl: https://cross-services-schedule-agent1.vercel.app/
repo: https://github.com/gkmestler/CrossServicesScheduleAgent1.git
lastReviewed: 2026-08-07
summary: Turns the weekly cleaning changeover export into an optimised driving route so crews spend less time on the road.
---

The Furies Scheduler takes the weekly changeover export for the cleaning division and turns it into an optimised route plan. It orders the week's jobs by the distance between properties, so crews drive less between stops. Less driving means lower fuel and labour cost and more jobs fit into a day.

The tool is live at `https://cross-services-schedule-agent1.vercel.app/`.

It is password-protected: anyone who visits is sent to a login page and needs the site password to get in. The site is also configured to stay out of Google and other search engines, so it will not turn up in a search — the password is the only way in.

> [!TODO] Where the site password is stored
> Find out where the current site password is kept and who has it, so access isn't lost when the current owner leaves. Ask the departing developer directly if needed.

**This system depends on four outside services to work**: Vercel (hosting), Supabase (stores the schedule data), Google Maps (calculates distances between properties), and Anthropic (powers the AI parsing of the changeover export). Two of these four — Vercel and the code's GitHub home — sit under a personal account rather than a Cross Services account. See the accounts page for details. Practically, this means the tool can stop working through no fault of anyone at CSG, if that personal account is closed, loses payment, or otherwise changes hands, and nobody at CSG would get a warning first.

<!-- TECHNICAL -->

**Repo**: `https://github.com/gkmestler/CrossServicesScheduleAgent1.git` (personal `gkmestler` GitHub account, same ownership note as the CSG website).

**Stack**: Next.js 15.5.21, React 19.1.0, Tailwind v4, TypeScript, Node 22.x. Key dependencies: `@anthropic-ai/sdk`, `drizzle-orm`, `postgres`, `xlsx`, `lucide-react`, `zod`.

**Routes** (from `app/`): *Verified from the repository, 7 Aug 2026.*

| Route | Purpose |
|---|---|
| `/` | Home / entry point |
| `/login` | Password gate |
| `/board/[id]` | Route board for a given schedule |
| `/review/[id]` | Review view for a given schedule |
| `/export/[id]` | Export view for a given schedule |
| `/api/auth/login`, `/api/auth/logout` | Session login/logout |
| `/api/upload` | Handles the changeover export upload |
| `/api/schedules`, `/api/schedules/[id]` | Schedule data endpoints |

**Password gate mechanism**: *Verified from the repository, 7 Aug 2026.* `middleware.ts` runs on Vercel's edge runtime and only does a cheap check — whether a session cookie (`furies_session`, defined in `lib/auth-constants.ts`) is present — because the edge runtime can't run the `node:crypto` verification needed to check it's genuine. If no cookie is present, the visitor is redirected to `/login`. The real check happens server-side via `requireSession()` in `lib/session.ts` on every page and route handler, which verifies the cookie's signature (HMAC, signed with `SESSION_SECRET`). A forged cookie can get past the middleware's redirect but is rejected once a real page or API route checks it.

**Environment variables**: *Names and purposes verified from `.env.example` in the repository, 7 Aug 2026 — no values were read.*

| Name | Purpose | If missing |
|---|---|---|
| `APP_PASSWORD` | Required. The single password gate for the whole site. Job notes behind it contain door codes and lockbox combinations, so this must always be set. | App is not safely usable. |
| `SESSION_SECRET` | Required. Signs/verifies the session cookie (at least 16 characters; the repo's own instructions suggest generating one with `openssl rand -base64 32`). | App is not safely usable. |
| `ANTHROPIC_API_KEY` | Powers AI parsing of the changeover export and team suggestions. | Falls back to deterministic rule-based parsing in `lib/parse/rules.ts`. |
| `ANTHROPIC_MODEL` | Optional. Overrides which Anthropic model is used. | Uses the build's default model. |
| `GOOGLE_MAPS_API_KEY` | Server-side only. Geocoding and Routes (distance matrix) APIs — this is what powers the actual route optimisation. Should be restricted to just those two APIs. | Falls back to straight-line distance estimates and town-centroid locations — routes become far less accurate. |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | Client-side only, exposed to the browser. Separate key from `GOOGLE_MAPS_API_KEY`, used for the Maps JavaScript API and should be restricted by HTTP referrer. | Map display in the browser breaks. |
| `DATABASE_URL` | Supabase Postgres connection string — use the pooled Supavisor connection in transaction mode (port 6543), since Vercel serverless functions need pooling. | Falls back to storing schedules in a local `.data/scheduler.json` file — not durable on Vercel. |

Only `APP_PASSWORD` and `SESSION_SECRET` are strictly required to start the app; without the others it still runs, in a degraded mode, and says so on screen.

**Database**: Drizzle ORM against Postgres, hosted on Supabase. Migrations live in `drizzle/`.

**Running locally and managing the database**:

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run a production build locally
- `npm run test` — run tests
- `npm run typecheck` — TypeScript check
- `npm run db:generate` — generate a Drizzle migration from schema changes (`drizzle-kit generate`)
- `npm run db:push` / `npm run db:migrate` — apply migrations to the database (both run `scripts/migrate.ts`)

> [!TODO] Owner
> Confirm who owns this system going forward — day-to-day contact for password resets, upload issues, and the underlying Vercel/Supabase/Google Maps/Anthropic accounts.

> [!TODO] Weekly changeover export format
> Document the exact format (file type, columns, source system) of the weekly changeover export this tool expects as input. Ask the departing developer, or inspect a real sample export against `app/api/upload/route.ts` and the parsing logic in `lib/parse/`.
