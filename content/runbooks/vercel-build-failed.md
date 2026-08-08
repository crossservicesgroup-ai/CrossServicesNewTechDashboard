---
title: A Vercel build failed
slug: vercel-build-failed
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: A push to main triggered a Vercel deployment that failed to build.
---

**Symptom:** You pushed a change (or someone else did) and Vercel shows a failed deployment, or you were told a build failed.

Good news first: a failed build usually does **not** take the live site down. Vercel keeps the previous successful deployment live until a new one finishes building and passes. So "build failed" and "site is down" are different problems — if visitors are also seeing an outage, check `site-is-down.md` as well.

## Step 1: Find the build log

1. Log in to the Vercel dashboard.
   > [!TODO] Vercel login
   > Confirm which account/email logs in to the Vercel dashboard for these projects.
2. Open the relevant project (CSG website or The Furies Scheduler).
3. Click the **Deployments** tab.
4. Click the deployment marked with a red "Error" or "Failed" status.
5. Click into the **Build Logs** (sometimes just shown directly on the deployment detail page).

A build log is the step-by-step output of the build process — dependency installs, compilation, type-checking, and so on — with the specific error that stopped the build usually near the bottom, often in red.

- **Good:** you can see a clear error message (e.g. a missing import, a type error, a failed dependency install).
- **If the log is very long and hard to parse:** copy the last 50-100 lines, which is usually where the actual failure is.

## Step 2: Paste the error into Claude Code

1. Copy the relevant part of the build log (the error and a few lines of context above it).
2. Open a terminal in your local clone of the affected repo (`CrossServicesSite` or `CrossServicesScheduleAgent1`).
3. Start Claude Code (`claude`).
4. Paste the log excerpt with a prompt like:

```
This Vercel build failed with the error below. Find the cause in this
repo and fix it. Show me the diff before committing anything.

[paste build log excerpt here]
```

5. Review the fix Claude Code proposes.

## Step 3: Test locally before pushing again

1. Run `npm run dev` (or the project's usual dev/build command).
2. Confirm the app runs at `localhost:3000` without the same error.
   - **Good:** it builds and runs cleanly locally.
   - **If it still fails locally:** keep working with Claude Code on the fix before pushing — do not push a change you have not confirmed locally, since `main` deploys to production immediately.

## Step 4: Push the fix

1. Commit and push to `main`.
2. Go back to the Vercel Deployments tab and watch the new deployment build.
   - **Good:** it shows a green "Ready" status.
   - **If it fails again:** repeat Steps 1-3 with the new error message.

## Alternative: roll back instead of fixing forward

If you need things stable right now and do not have time to debug, you can skip fixing the build entirely:

1. On the Deployments tab, find the most recent deployment marked "Ready" (this is already live, since Vercel does not promote a failed build).
2. There is nothing further to do to keep it live — a failed build does not replace it. Confirm by loading the production URL and checking it looks correct.
3. If you specifically need to force an older deployment back to production (for example, after some other manual change), use the three-dot menu next to that deployment and choose **Promote to Production**.

## Still stuck?

> [!TODO] Support contact
> Who to contact if a build keeps failing and Claude Code cannot resolve it.

If none of this worked, contact: TODO.
