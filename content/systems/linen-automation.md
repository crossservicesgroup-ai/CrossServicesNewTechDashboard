---
title: Linen Order Automation
slug: linen-automation
status: in-progress
owner: TODO
liveUrl: TODO
repo: TODO
lastReviewed: 2026-08-07
summary: Copies new Furies linen orders out of email and into the order spreadsheet automatically, instead of someone typing each one in by hand.
---

## What this is

The Furies rents linens on Cape Cod. Orders come in through the WooCommerce website and arrive as an order email in the `info@thefuriesonline.com` Gmail inbox. Until now, someone in the office copied each order into a spreadsheet by hand and sent a confirmation email from a saved template — roughly a couple of minutes per order, worst on Monday mornings. This automation does that copying step for them.

There is no AI model involved in reading the orders. The order emails always look the same, so the automation pulls the fields out using fixed rules, not guesswork. The same email will always produce the same result.

## Where it lives

This runs as a Google Apps Script project inside the `info@thefuriesonline.com` Google account. It is not a separate website or app, it does not run on a server anyone has to maintain, and there is no subscription or API key attached to it — it runs on Google's own infrastructure, for free, as part of that Gmail/Google account. There is no live web address (`liveUrl`) because there is no site to visit, and no code repository (`repo`) because the code lives inside the Apps Script editor attached to that Google account, not on GitHub. Whoever has access to `info@thefuriesonline.com` already has full access to this system — ownership here is already clean.

## Is it working right now?

It is built and tested, but currently switched off for email. Right now it writes rows into the order spreadsheet and sends no confirmation email at all. Email sending will be turned on later, once someone has confirmed the spreadsheet step is working correctly. The spreadsheet step and the email step are two separate switches, and they should never both be flipped on the same day.

## What you have to do daily

**Someone has to check the `needs-review` label in Gmail every day.**

The automation puts one of two labels on every order email it looks at:

- `linen-bot/done` — it read the order and copied it in successfully.
- `linen-bot/needs-review` — it found something it couldn't safely handle (a missing arrival date, a missing total, or missing line items) and left it for a person to enter by hand.

If nobody is checking `needs-review`, orders sit there half-handled and nobody finds out until a customer calls asking where their linens are. This has to be someone's daily job, not an occasional one.

> [!TODO] Owner for the daily needs-review check
> Someone needs to be assigned responsibility for checking the `linen-bot/needs-review` label in the `info@thefuriesonline.com` inbox every day. Confirm who, and make sure they know how.

## The most important warning

> [!WARNING] A customer's reply to their order is never seen
> The automation only reads emails whose subject matches the new-order notification (`subject:"got a new order"`). When a customer *replies* to their order thread — "can you move my delivery to Thursday" — the script does not see it, does not flag it, and does not update anything. The sheet keeps saying Tuesday.
>
> The failure mode is subtle: once rows start appearing on their own, people stop reading the inbox as carefully, and that is exactly when the replies stop getting read.
>
> **The "Edits to Order" column is human-only, permanently.** The automation handles new orders. Changes stay manual.

<!-- TECHNICAL -->

## How it works

1. A time-driven trigger fires every 5 minutes.
2. It searches Gmail for `subject:"got a new order"` within the last 7 days, excluding anything already labelled.
3. It parses the order email's HTML directly, using fixed selectors — deliberately no AI model in this path, so the same email always produces the same result.
4. It appends a row to the Google Sheet across 13 columns.
5. It creates or sends a confirmation email, depending on the `EMAIL_MODE` setting.
6. It applies the `linen-bot/done` label, which is what stops the same order being written twice.

`EMAIL_MODE` is currently set to `off`: rows get written, no email goes out.

## Safety rails already built in

- A 7-day lookback window, so the script can never reach back into the roughly 1,700 historical orders already in the inbox.
- A cap of 15 orders processed per run.
- A script lock so two runs can never overlap.
- A check of the order number against column B before appending a row, so even if a label is somehow missing, it still won't produce a duplicate row.

## Functions (run by hand from the Apps Script editor)

| Function | What it does |
| --- | --- |
| `checkSetup` | Confirms the sheet, tab and column headers match |
| `testParseLatest` | Parses the 5 most recent orders and logs what it *would* write. Writes nothing. |
| `setupTrigger` | Starts the automation on its 5-minute cycle |
| `removeTriggers` | Stops it completely |
| `resetLabelsForTesting` | Clears the bot labels so you can re-run against the same emails |

## Open items

> [!TODO] Turn EMAIL_MODE on
> `EMAIL_MODE` needs turning on after verification. The sheet step should be live for at least a week before the email step is switched on.

> [!TODO] Confirm the confirmation email wording
> The confirmation email body may still contain draft placeholder copy rather than the office's real wording. Check `buildConfirmation()` before email sending goes live.

> [!TODO] Confirm PICKUP_LOCATION
> `PICKUP_LOCATION` was set from the email footer and has never been confirmed against the real office address.

> [!TODO] REPLY_TO domain mismatch
> `REPLY_TO` is set to `info@thefuries.com`, but the account this automation runs from is `info@thefuriesonline.com` — a different domain. If `info@thefuries.com` is not a real, monitored mailbox, every confirmation email will go out with a reply-to address that bounces. Verify this before switching email on.

> [!TODO] Confirm which sheet SHEET_ID points to
> Confirm whether `SHEET_ID` is currently pointed at the test copy of the spreadsheet or the live one.

> [!TODO] Decide what to do about 71 mismatched historical rows
> Starting around June 2026, 71 historical rows have the phone number and email address swapped into the wrong columns. The automation writes these two fields correctly, so it will disagree with about two months of existing history. Decide whether to correct the historical rows.

> [!TODO] Confirm whether WooCommerce sends its own order receipt
> Confirm whether WooCommerce already emails customers its own order receipt separately. If it does, and this automation's email step is switched on, customers will receive two emails for the same order.

> [!TODO] Security: confirm the Furies Gmail password has been rotated
> The Furies Gmail account password appeared in plaintext in a meeting-notes transcript. Confirm whether the password has since been rotated, and rotate it if not.
