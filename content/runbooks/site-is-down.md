---
title: The website is down
slug: site-is-down
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: The CSG website is not loading, or visitors are seeing an error page.
---

**Symptom:** Someone tells you `www.crossservicesgroup.com` (or the Vercel URL) is not loading, is showing an error, or looks broken.

Before you do anything else, understand the difference between two problems that look similar:

- **The site is fully down** — nothing loads, or Vercel shows an error page. This runbook covers that.
- **A build failed but the site is still up** — Vercel keeps the last working version live even if a new deployment fails. If the site looks fine but you know a recent change did not go out, that is a build problem, not a "site is down" problem. See `vercel-build-failed.md` instead.

## Step 1: Confirm it is actually down

1. Open `https://cross-services-site.vercel.app/` in a browser.
   - **Good:** the site loads normally. If so, the problem may be specific to the custom domain — skip to Step 4.
   - **Stop and continue to Step 2** if this URL itself does not load or shows an error.

## Step 2: Check the Vercel deployment status

1. Log in to the Vercel dashboard (`vercel.com`) with the account that owns the CSG website project.
   > [!TODO] Vercel login
   > Confirm which email/account logs in to the Vercel dashboard that owns these two projects, and who has access. The projects are on a personal account.
2. Open the CSG website project.
3. Click the **Deployments** tab.
4. Look at the most recent deployment at the top of the list.
   - **Good:** it shows a green "Ready" status. This means the last deploy succeeded — the outage is likely something else (see Step 4 or contact support below).
   - **If it shows a red "Error" or "Failed" status:** the last push broke the build. Continue to Step 3.

## Step 3: Roll back to a previous working deployment

1. Still on the **Deployments** tab, scroll down past the failed deployment to find the most recent one marked "Ready" (this was working before).
2. Click the three-dot menu (`...`) next to that working deployment.
3. Click **Promote to Production** (or **Redeploy**, depending on the Vercel UI at the time).
4. Confirm the action when prompted.
5. Wait 1-2 minutes, then reload `https://cross-services-site.vercel.app/`.
   - **Good:** the site loads the older, working version. The outage is resolved for now, even though the latest code change is no longer live.
   - **If it still does not load:** this is a bigger problem than a bad deploy. Contact support (see bottom of this page).

Once you have rolled back, whoever fixes the underlying code problem should test locally at `localhost:3000` before pushing to `main` again, since a push to `main` deploys straight to production with no review step.

## Step 4: Check whether this is a domain problem, not a site problem

1. Try loading the Vercel-provided URL directly: `https://cross-services-site.vercel.app/`.
   - **If the Vercel URL works but `www.crossservicesgroup.com` does not:** this is expected right now. The custom domain is not connected yet — access to the domain registrar is pending.
   > [!TODO] Domain registrar access
   > Get access to the registrar for `crossservicesgroup.com` and confirm the domain is (or is not yet) pointed at Vercel. Confirm who owns/manages the registrar account.

## Step 5: Check the last commit

1. Open the GitHub repo: `https://github.com/gkmestler/CrossServicesSite.git`.
2. Look at the most recent commit on the `main` branch.
3. If a change was pushed shortly before the outage started, that is the likely cause. Roll back in Vercel (Step 3) first to restore service, then review the commit for the actual bug afterward.

## Still stuck?

> [!TODO] Support contact
> Who to contact if none of the steps above fix the outage.

If none of this worked, contact: TODO.
