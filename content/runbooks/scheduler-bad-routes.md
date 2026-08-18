---
title: The scheduler is producing bad routes
slug: scheduler-bad-routes
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: The Furies Scheduler is generating routes that look wrong, inefficient, or physically impossible.
---

**Symptom:** The Furies Scheduler is running without any error message, but the routes it produces do not make sense — stops out of order, unrealistic drive times, or distances that look clearly wrong.

**Read this first:** this failure mode is silent. The scheduler does not throw an error when its distance data is bad — it just produces a plausible-looking wrong answer. Nobody gets an alert. You have to check for this deliberately, on a schedule, not just wait for an error to show up. If routes "feel off," treat that as a real signal and work through this runbook rather than assuming it is a one-off glitch.

The scheduler depends on four things: Vercel (hosting), Supabase (Postgres data), the Google Maps API (distances), and the Anthropic API (the agent itself). Bad routes are almost always Google Maps or Supabase, not the AI agent.

## Step 1: Check the Google Maps API key and billing

The Google Maps API key that powers distance calculations is on a **personal admin console**, not a company one. If the key is revoked, restricted, or billing lapses on that account, the scheduler does not fail loudly — it silently falls back to bad or default distance data, which produces exactly this kind of wrong-looking route.

1. Log in to the Google Cloud console for the account that holds this API key.
   > [!TODO] Google Maps API console access
   > Confirm which personal Google account owns the Google Maps API key, and get access to it. Without this, nobody can check or fix billing/quota issues.
2. Go to **APIs & Services > Credentials** and confirm the key referenced by `GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` in the scheduler still exists and is enabled.
3. Go to **Billing** and confirm the linked billing account is active (not suspended, not over a hard cap, no expired card).
   - **Good:** billing is active and the key shows recent successful requests under APIs & Services > Metrics.
   - **If billing is suspended or the key is disabled:** this is very likely your cause. Restore billing or re-enable the key, then re-run a test route (Step 4) to confirm distances look correct again.

## Step 2: Check Supabase is reachable

1. Log in to the Supabase dashboard for the scheduler's project.
2. Check the project status on the dashboard home page.
   - **Good:** the project shows as active/healthy.
   - **If the project shows paused or unreachable:** a paused free-tier project is a common cause of this. Resume it from the dashboard.
3. Check that `DATABASE_URL` in the Vercel project's environment variables still matches this Supabase project (see Bitwarden entry `Bitwarden > CSG Systems > Supabase` for the correct value if you need to compare — do not paste the value anywhere outside the vault or Vercel's own environment variable field).
4. From the Supabase dashboard, open the Table Editor and spot-check that recent data (jobs, locations, whatever the scheduler reads) looks current and not empty or stale.
   - **Good:** data looks current.
   - **If data looks stale or missing:** something upstream stopped writing to Supabase. That is a separate problem from routing — note it and escalate.

## Step 3: Check the input export format has not changed

The scheduler expects its input (job list, addresses, whatever gets exported into it) in a specific format. If an upstream export changed column order, renamed a field, or changed how addresses are formatted, the scheduler may still run without erroring but will compute routes against the wrong data.

1. Compare a recent input export against a known-good one from before the routes started looking wrong.
   > [!TODO] Known-good input sample
   > Confirm where a known-good sample of the scheduler's input export is kept, so it can be diffed against a current export when routes look wrong.
2. Look specifically for: column order changes, renamed fields, address format changes (e.g. missing state/zip), or blank rows.
   - **Good:** the format matches.
   - **If the format changed:** this is your cause. Fix the export at the source, or adjust the scheduler's import handling to match — test locally at `localhost:3000` before pushing.

## Step 4: Run a known test route

1. Pick a route with a known-correct answer (a short, familiar set of stops you can sanity-check by eye or with a regular maps app).
2. Run it through the scheduler.
3. Compare the output to what you know is correct.
   - **Good:** distances and order match expectations.
   - **If it still looks wrong after Steps 1-3:** the problem may be in the scheduler's own logic rather than its dependencies. This needs a developer to look at the code in `https://github.com/crossservicesgroup-ai/CrossServicesScheduleAgent1`.

## Still stuck?

> [!TODO] Support contact
> Who to contact if the Maps key, Supabase, and input format all check out but routes are still wrong.

If none of this worked, contact: TODO.
