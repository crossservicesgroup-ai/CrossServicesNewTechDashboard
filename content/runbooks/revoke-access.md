---
title: Someone left and you need to revoke their access
slug: revoke-access
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: Steps to remove a departing person's access across every CSG system, in a safe order.
---

**Symptom:** Someone with access to CSG's websites, automations, or accounts has left, and you need to shut off their access.

**Read this first — the order matters.** It is tempting to start by cutting off someone's email, since that feels like the "master switch." Do the opposite. Their Google Workspace / email login is often how they'd sign in to the other tools (GitHub, Vercel, and so on), and it is also where password-reset links land. If you kill email access first, you may lock yourself out of the very accounts you still need to clean up. Work through everything else first, and revoke identity/email last.

## Order of operations

Work top to bottom. Do not skip ahead to email/Workspace until everything above it is done.

| Order | Service | What to do | Done? |
|---|---|---|---|
| 1 | Monday.com | Remove the person from the workspace/board(s), or deactivate their user | ☐ |
| 2 | GitHub | Remove them as a collaborator from `CrossServicesSite` and `CrossServicesScheduleAgent1` (and any other repos), or remove from the org if applicable | ☐ |
| 3 | Vercel | Remove them from the Vercel team/project if they have separate access. Note: these projects are on a personal account — confirm who actually holds the account before assuming a "remove teammate" step is even needed | ☐ |
| 4 | Supabase | Remove them as a project member/collaborator | ☐ |
| 5 | Anthropic (API console) | Remove their access to the Anthropic console/API account, if they had any | ☐ |
| 6 | Claude (claude.ai) | There are no seats to remove — the whole team shares one account. Change the account password and re-share it with the people who should still have it. See step 8 | ☐ |
| 7 | Bitwarden | Remove them from the `CSG Systems` vault/organization | ☐ |
| 8 | Rotate shared credentials | See "What to rotate" below | ☐ |
| 9 | Google Workspace / email | Suspend or delete their account last | ☐ |

## What to rotate

Removing a person's login is not the same as rotating a shared secret they had access to. Anything they could have copied down (API keys, shared passwords) should be treated as compromised and rotated, not just "access removed."

1. Go through each Bitwarden entry under `Bitwarden > CSG Systems > <Service>` that this person could have viewed.
2. For each one, rotate the underlying credential where possible (generate a new API key, change the password) rather than only removing them from the vault.
3. Pay particular attention to:
   - `RESEND_API_KEY` and `QUOTE_FROM_EMAIL` (CSG website email sending)
   - `APP_PASSWORD`, `SESSION_SECRET`, `ANTHROPIC_API_KEY`, `GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`, `DATABASE_URL` (Scheduler)
   - The Google Maps API key specifically — it lives on a personal admin console, so confirm who controls that console before assuming it is covered by a Workspace offboarding
   - The shared Claude account password. There is one account for the whole team, so there is no seat to remove — changing the password is the only way to cut one person off, and it cuts everyone off until they are given the new one
   > [!TODO] Google Maps console owner
   > Confirm which account controls the Google Maps API key's admin console, and whether the departing person has (or had) access to it.
4. Update the rotated values in Vercel's environment variables for both projects, and in the Bitwarden vault entry, so the running sites keep working with the new credentials. Do not paste the new secret anywhere other than Vercel's environment variable fields and the Bitwarden entry.

## Step-by-step: Google Workspace / email (last step)

1. Confirm every item in the table above is checked off first.
2. Log in to the Google Workspace admin console.
3. Suspend the person's account rather than deleting it outright, at least initially — this preserves their mail and files in case something is needed from the account later, while immediately blocking sign-in.
   - **Good:** the person can no longer sign in to `info@thefuriesonline.com` or their own CSG email, and none of the earlier steps depended on their email still working.
4. Once you are confident nothing further is needed from the account, follow your organization's normal process for deleting it.
   > [!TODO] Workspace admin
   > Confirm who has Google Workspace admin rights to actually perform this suspension.

## Still stuck?

> [!TODO] Support contact
> Who to contact if you are not sure whether all access has actually been revoked, or if a step above is blocked (e.g. you do not have admin rights to one of these systems).

If none of this worked, contact: TODO.
