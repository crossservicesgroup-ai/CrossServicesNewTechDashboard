---
title: The linen automation stopped filing orders
slug: linen-stopped-working
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: New linen orders are not showing up in the Google Sheet or are missing labels.
---

**Symptom:** New linen orders that should be logged automatically are not appearing in the Google Sheet, or you notice a backlog of unlabeled emails in Gmail.

This automation lives inside the `info@thefuriesonline.com` Google account, as a Google Apps Script project. Every 5 minutes it searches Gmail for `subject:"got a new order"` from the last 7 days, writes matching orders to a Google Sheet, and labels the email either `linen-bot/done` (handled) or `linen-bot/needs-review` (something was missing).

## Step 1: Check the trigger still exists

The whole automation depends on a time-driven trigger. If it was deleted or expired, nothing runs at all.

1. Log in to the `info@thefuriesonline.com` Google account.
2. Open the Apps Script project for the linen automation.
3. In the left sidebar, click the clock icon (**Triggers**).
4. Look for a time-driven trigger set to run every 5 minutes.
   - **Good:** the trigger is listed and shows recent successful runs.
   - **If there is no trigger listed:** it was removed or never re-created. Run `setupTrigger` from the Apps Script editor (select the function from the dropdown, then click Run). Re-check the Triggers page to confirm it now appears.

## Step 2: Check the Executions log for errors

1. In the Apps Script editor, click the play-button-in-a-circle icon (**Executions**) in the left sidebar.
2. Look at the most recent executions.
   - **Good:** recent executions show a green "Completed" status.
   - **If you see red "Failed" entries:** click into one to read the error message. Common causes are a Gmail search quota issue, a change in the email format the parser expects, or a Sheet that was renamed, moved, or had its sharing permissions changed.

## Step 3: Run the safe diagnostic first

Before running anything that changes data, use `testParseLatest`. It reads the most recent matching email and reports what it *would* do, but writes nothing — no Sheet rows, no labels. This is the safest way to check whether the parser is working.

1. In the Apps Script editor, select `testParseLatest` from the function dropdown at the top.
2. Click **Run**.
3. Open the execution log (View > Logs, or the Executions panel) and read the output.
   - **Good:** it shows a parsed order with an arrival date, total, and line items, matching a real recent order.
   - **If it shows missing fields or an error:** the order emails may have changed format, or something upstream changed. Note exactly what field is missing or wrong before escalating.

Only after `testParseLatest` looks right should you consider running `checkSetup` (verifies configuration) or `resetLabelsForTesting` (this one does change label state — do not run it on production data unless you specifically intend to re-process orders).

## Step 4: Check the `linen-bot/needs-review` label

Orders missing an arrival date, total, or line items are deliberately not written to the Sheet. Instead they get labeled `linen-bot/needs-review` so a human can look at them.

1. In Gmail (on the `info@thefuriesonline.com` account), search `label:linen-bot/needs-review`.
2. Review any emails here — these are orders that were skipped on purpose, not a bug. Handle them manually and update the Sheet if needed.

## Step 5: Confirm `EMAIL_MODE` and `SHEET_ID`

1. In the Apps Script editor, open the project's script properties (Project Settings, or wherever `EMAIL_MODE` and `SHEET_ID` are configured in this project).
2. Confirm `EMAIL_MODE` is set to the value you expect. As of this writing it is normally `off`.
   - If order confirmation emails are supposed to be going out and are not, check whether `EMAIL_MODE` was accidentally left `off`.
3. Confirm `SHEET_ID` points to the correct, currently-used Google Sheet.
   - **Good:** opening that Sheet ID shows the sheet you expect, with recent rows.
   - **If it points to the wrong sheet, or the sheet cannot be opened:** the Sheet may have been moved, deleted, or had sharing permissions changed. Fix the `SHEET_ID` value or restore access.

## Still stuck?

> [!TODO] Support contact
> Who to contact if the trigger, Executions log, and `testParseLatest` all look fine but orders still are not being filed.

If none of this worked, contact: TODO.
