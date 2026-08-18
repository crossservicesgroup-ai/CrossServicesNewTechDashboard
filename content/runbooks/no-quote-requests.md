---
title: Quote requests have stopped arriving
slug: no-quote-requests
status: live
owner: TODO
lastReviewed: 2026-08-13
summary: Nobody is receiving quote or contact form emails from the website — how to tell a broken form from a quiet week.
---

**Symptom:** The quote or contact emails from the website have dried up. Either nothing has arrived for a while, or someone says they submitted the form and no email came.

This is the website's most dangerous failure mode, because **it is silent**. If the email service stops working, the visitor still sees a "thank you" message and nothing anywhere shows an error. The business simply stops receiving work and has no reason to suspect anything is wrong.

Until 13 Aug 2026 there was no way to tell that failure apart from a genuinely quiet week. There is now: Google Analytics counts every form submission the moment the server accepts it, before any email is sent. That splits the problem cleanly in two.

- **Analytics shows submissions, but no emails arrived** → the website is fine, the email service is broken. Go to Step 3.
- **Analytics shows no submissions either** → nobody is submitting the form. That is either a genuinely quiet period or a problem reaching the site at all. Go to Step 4.

## Step 1: Check what Google Analytics recorded

1. Go to `analytics.google.com`, log in as `crossservicesgroup@gmail.com`, and open the Cross Services Group property.
2. Go to **Reports → Engagement → Events**.
3. Set the date range to cover the period in question, and look for `quote_submitted` and `contact_submitted`.

Remember these reports **lag 24–48 hours**. If you are asking about today, they will show nothing regardless of what actually happened — that is not evidence of a fault. Use Step 2 instead.

## Step 2: Submit a test quote and watch it land

This is the fastest way to a definite answer, and it works in real time.

1. Open **Reports → Realtime** in Google Analytics and leave it open.
2. In another tab, go to `https://www.crossservicesgroup.com/quote` and submit a real-looking test request. Put "TEST" in the message so nobody mistakes it for a customer.
3. Watch the Realtime report for a `quote_submitted` event. It should appear within about thirty seconds.
   - **The event appears, but no email arrives within a few minutes** → the form works and the email service does not. Continue to Step 3.
   - **No event appears** → the submission is not being accepted by the server at all. Skip to Step 4.

If you are testing repeatedly, note that the quote endpoint rate-limits to **5 submissions per IP per 10 minutes**. A sixth test being rejected is the rate limit doing its job, not a fault.

## Step 3: The form works, the email does not — check Resend

The website sends its form emails through Resend. If the API key is missing, expired, or the account has lapsed, both form endpoints degrade quietly: the visitor still gets a success message, and the submission is only written to the server log.

1. Check the inbox that receives these emails, including its spam and junk folders. A deliverability change is more common than an outright outage.
2. Log in to Resend and check the account status and the recent sending activity — whether messages are being rejected, bounced, or not attempted at all. Sign in with the Cross Services Google account; the entry is on the [Accounts](/accounts) page.
3. In Vercel, open the CSG website project → **Settings → Environment Variables** and confirm `RESEND_API_KEY` and `QUOTE_FROM_EMAIL` are both present and not empty. The working key is in the vault as **Resend API (for Cross Services Website)** — compare against it rather than assuming what is deployed is correct.
4. Confirm the domain used in `QUOTE_FROM_EMAIL` is still verified in Resend. Sending from an unverified domain fails.
5. After any change, redeploy the site so the new values are picked up, then repeat Step 2.

**Recovering the lost submissions:** they are not lost entirely. Every submission was written to the Vercel function logs even when the email failed, so the details can be read back out of **Vercel → the project → Logs** for the affected period. Do this before the log retention window closes, and contact those people.

## Step 4: No submissions are being recorded at all

1. Check the site is actually reachable: open `https://www.crossservicesgroup.com/quote`. If it does not load, this is an outage, not a forms problem — go to [The website is down](/runbooks/site-is-down).
2. Check whether traffic has stopped as well as submissions. In Google Analytics, **Reports → Life cycle → Acquisition** shows visitor numbers. If visitors dropped to near zero at the same time, the problem is that people are not reaching the site, not that the form is broken — check Google Search Console for indexing or coverage errors.
3. If traffic looks normal and the form loads but the test submission in Step 2 recorded nothing, the form is failing before it reaches the server. Open the browser's developer console on the quote page, submit, and look for an error. That is a code problem and needs whoever maintains the site.
4. If traffic is normal, the form works when tested, and the numbers are simply low — nothing is broken. Compare against the same period last month before treating a quiet fortnight as a fault.

## Still stuck?

> [!TODO] Support contact
> Who to contact if quote requests are confirmed to be failing and none of the steps above resolve it. This one matters more than most — every hour it stays broken is lost work that nobody knows was lost.

If none of this worked, contact: TODO.
