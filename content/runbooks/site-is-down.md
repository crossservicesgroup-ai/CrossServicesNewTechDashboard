---
title: The website is down
slug: site-is-down
status: live
owner: TODO
lastReviewed: 2026-08-13
summary: The CSG website is not loading, or visitors are seeing an error page.
---

**Symptom:** Someone tells you `www.crossservicesgroup.com` (or the Vercel URL) is not loading, is showing an error, or looks broken.

Before you do anything else, understand the difference between two problems that look similar:

- **The site is fully down** — nothing loads, or Vercel shows an error page. This runbook covers that.
- **A build failed but the site is still up** — Vercel keeps the last working version live even if a new deployment fails. If the site looks fine but you know a recent change did not go out, that is a build problem, not a "site is down" problem. See `vercel-build-failed.md` instead.

## Step 1: Confirm it is actually down, and find out which half is broken

The site now answers at two addresses: the real domain `https://www.crossservicesgroup.com`, and Vercel's built-in URL `https://cross-services-site.vercel.app/`. Open **both**. Which ones fail tells you where the fault is.

1. Open `https://www.crossservicesgroup.com`.
2. Open `https://cross-services-site.vercel.app/`.

- **Both fail** — the site itself is down. Continue to Step 2.
- **The Vercel URL works, the real domain does not** — the site is fine and the domain or its DNS is the problem. Skip to Step 4.
- **Both work** — whatever the person saw is not a site-wide outage. Ask them for the exact address and a screenshot; it may be one page, their browser cache, or their own connection.

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
5. Wait 1-2 minutes, then reload `https://www.crossservicesgroup.com`.
   - **Good:** the site loads the older, working version. The outage is resolved for now, even though the latest code change is no longer live.
   - **If it still does not load:** this is a bigger problem than a bad deploy. Contact support (see bottom of this page).

Once you have rolled back, whoever fixes the underlying code problem should test locally at `localhost:3000` before pushing to `main` again, since a push to `main` deploys straight to production with no review step.

## Step 4: The Vercel URL works but the real domain does not

This means the site is running and something between the domain and Vercel has broken. As of 13 Aug 2026 this combination is **not** normal — before that date the domain was simply not connected, and a failure here was expected. It no longer is.

1. In Vercel, open the CSG website project → **Settings → Domains**. Check whether `www.crossservicesgroup.com` is still listed and still shows as valid. Vercel flags a misconfiguration here directly.
2. Check whether the domain has expired. A lapsed registration takes the site off the internet just as effectively as a failed deploy, and it is the most likely cause if the site had been working for months with no changes. This is the failure nobody is currently watching for — see the warning on the [CSG Website](/systems/csg-website) page.
3. If neither of those explains it, the DNS records pointing the domain at Vercel have been changed or dropped. Fixing that needs the registrar login.

**Meanwhile:** the Vercel URL still works. If people need the site now, that address is a usable stopgap while the domain is sorted out.

   > [!TODO] Domain registrar access
   > Nobody has the login for the registrar holding `crossservicesgroup.com`. Since the domain went live on 13 Aug 2026 this is the step that blocks every fix in this section, and it also blocks checking the renewal date. Find out which registrar holds the domain, get access, and record it in [Accounts](/accounts).

## Step 5: Check the last commit

1. Open the GitHub repo: `https://github.com/crossservicesgroup-ai/CrossServicesSite`.
2. Look at the most recent commit on the `main` branch.
3. If a change was pushed shortly before the outage started, that is the likely cause. Roll back in Vercel (Step 3) first to restore service, then review the commit for the actual bug afterward.

## Still stuck?

> [!TODO] Support contact
> Who to contact if none of the steps above fix the outage.

If none of this worked, contact: TODO.
