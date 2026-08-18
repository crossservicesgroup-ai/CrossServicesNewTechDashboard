---
title: The linen automation stopped filing orders
slug: linen-stopped-working
status: live
owner: TODO
lastReviewed: 2026-08-10
summary: New linen orders are not showing up in the Google Sheet or are missing labels.
---

**Symptom:** New linen orders that should be logged automatically are not appearing in the Google Sheet, or you notice a backlog of unlabeled emails in Gmail.

This automation lives inside the `info@thefuriesonline.com` Google account, as a Google Apps Script project. Every 5 minutes it searches Gmail for `subject:"got a new order"` from the last 7 days, writes matching orders to a Google Sheet, and labels the email either `linen-bot/done` (handled) or `linen-bot/needs-review` (something was missing).

**The order spreadsheet:** [Linen order spreadsheet](https://docs.google.com/spreadsheets/d/163KmRWhCMJob_XENNcaAAYsexCp1yg4oQLnOcbYqD1Q/edit). Open it first — if recent orders are in there, the automation is working and the problem is somewhere else.

**The Apps Script project:** [Linen automation script](https://script.google.com/home/projects/1WVcqTi2b0RrmMW8MLFt0Hd8OoNk1RhtjRKxOLPlboOfHfs4vTOtzHNVu/edit). Every step below happens here. Sign in as `info@thefuriesonline.com` first, or the link will not open.

## Step 1: Check the trigger still exists

The whole automation depends on a time-driven trigger. If it was deleted or expired, nothing runs at all.

1. Log in to the `info@thefuriesonline.com` Google account.
2. Open the [Apps Script project](https://script.google.com/home/projects/1WVcqTi2b0RrmMW8MLFt0Hd8OoNk1RhtjRKxOLPlboOfHfs4vTOtzHNVu/edit) for the linen automation.
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

Only after `testParseLatest` looks right should you consider running `checkSetup`, which verifies configuration and changes nothing.

> [!WARNING] Do not run resetLabelsForTesting to fix a problem
> It is the obvious-looking button when orders are missing, and it is the wrong one. It clears the labels that stop an order being handled twice, which makes the script treat the last 7 days as brand new.
>
> If `EMAIL_MODE` is `send`, that means every customer from the past week is emailed their confirmation a second time. There is no undo. Check `EMAIL_MODE` first (Step 5) and only run this if it is `off` and you specifically intend to re-process those orders.

## Step 4: Check the `linen-bot/needs-review` label

Orders missing an arrival date, total, or line items are deliberately not written to the Sheet. Instead they get labeled `linen-bot/needs-review` so a human can look at them.

1. In Gmail (on the `info@thefuriesonline.com` account), search `label:linen-bot/needs-review`.
2. Review any emails here — these are orders that were skipped on purpose, not a bug. Handle them manually and update the Sheet if needed.

## Step 5: Confirm `EMAIL_MODE` and `SHEET_ID`

1. In the Apps Script editor, open the project's script properties (Project Settings, or wherever `EMAIL_MODE` and `SHEET_ID` are configured in this project).
2. Confirm `EMAIL_MODE` is set to the value you expect. It has three settings: `off` (no email at all), `draft` (a draft is saved in Gmail but nothing goes out), and `send` (the customer is emailed automatically).
   - If confirmation emails are supposed to be going out and are not, check whether `EMAIL_MODE` is still `off` or `draft`. In `draft` mode the emails exist — look in the Gmail drafts folder before assuming they were lost.
   - If `HOLD_ORDERS_WITH_NOTES` is on, orders where the customer left a note become drafts even in `send` mode. A missing confirmation for one specific order may be this, not a fault.
3. Confirm `SHEET_ID` points to the correct, currently-used Google Sheet. The spreadsheet linked at the top of this page has the ID `163KmRWhCMJob_XENNcaAAYsexCp1yg4oQLnOcbYqD1Q` — compare it against what `SHEET_ID` is set to.
   - **Good:** opening that Sheet ID shows the sheet you expect, with recent rows.
   - **If it points to the wrong sheet, or the sheet cannot be opened:** the Sheet may have been moved, deleted, or had sharing permissions changed. Fix the `SHEET_ID` value or restore access.

## Still stuck?

> [!TODO] Support contact
> Who to contact if the trigger, Executions log, and `testParseLatest` all look fine but orders still are not being filed.

If none of this worked, contact: TODO.
